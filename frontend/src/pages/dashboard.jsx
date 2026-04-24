import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  PiggyBank,
  ReceiptText,
  TrendingUp,
  Layers,
  BarChart3,
} from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/navbar";
import {
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const categoryGradients = [
  ["#7c3aed", "#a78bfa"],
  ["#84cc16", "#bef264"],
  ["#f97316", "#fdba74"],
  ["#06b6d4", "#67e8f9"],
  ["#eab308", "#fde047"],
];

function Dashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [summary, setSummary] = useState({
    total_expenses: 0,
    total_savings: 0,
    unpaid_bills: 0,
    monthly_expense: 0,
    recent_expenses: [],
    upcoming_bills: [],
    trend: [],
    categories: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setError("");
      setLoading(true);

      const summaryRes = await api.get("/analytics/summary");

      let monthlyData = [];
      let categoryData = [];
      let upcomingBills = [];

      try {
        const monthlyRes = await api.get("/analytics/monthly");
        monthlyData = monthlyRes.data.map((item) => ({
          date: getMonthName(item.month),
          amount: Number(item.amount) || 0,
        }));
      } catch (err) {
        console.log("Monthly analytics error:", err);
      }

      try {
        const categoryRes = await api.get("/analytics/category-breakdown");
        categoryData = categoryRes.data.map((item) => ({
          name: item.category,
          value: Number(item.amount) || 0,
        }));
      } catch (err) {
        console.log("Category analytics error:", err);
      }

      try {
        const billsRes = await api.get("/bills/");
        upcomingBills = billsRes.data
          .filter((bill) => !bill.is_paid)
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .slice(0, 5);
      } catch (err) {
        console.log("Bills fetch error:", err);
      }

      const totalExpenses = Number(summaryRes.data.total_expenses) || 0;

      const trendData =
        monthlyData.length > 1
          ? monthlyData
          : [
              { date: "May 1", amount: Math.max(40, Math.round(totalExpenses * 0.22)) },
              { date: "May 8", amount: Math.max(80, Math.round(totalExpenses * 0.47)) },
              { date: "May 15", amount: totalExpenses || 277 },
              { date: "May 22", amount: Math.max(80, Math.round(totalExpenses * 0.47)) },
              { date: "May 29", amount: Math.max(120, Math.round(totalExpenses * 0.72)) },
            ];

      const currentMonthTotal =
        monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].amount : totalExpenses;

      setSummary({
        total_expenses: totalExpenses,
        total_savings: Number(summaryRes.data.total_savings) || 0,
        unpaid_bills: Number(summaryRes.data.unpaid_bills) || 0,
        monthly_expense: currentMonthTotal,
        recent_expenses: summaryRes.data.recent_expenses || [],
        upcoming_bills: upcomingBills,
        trend: trendData,
        categories: categoryData,
      });

      localStorage.removeItem("refreshDashboard");
    } catch (err) {
      console.log("Dashboard fetch error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleFocus = () => {
      if (localStorage.getItem("refreshDashboard") === "true") {
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const markAsPaid = async (id) => {
    try {
      await api.put(`/bills/${id}`, { is_paid: true });
      localStorage.setItem("refreshDashboard", "true");
      fetchData();
    } catch (err) {
      console.log("Error marking bill as paid:", err);
    }
  };

  const topCategory = useMemo(() => {
    if (!summary.categories.length) return null;
    return [...summary.categories].sort((a, b) => b.value - a.value)[0];
  }, [summary.categories]);

  const averageExpense = useMemo(() => {
    if (!summary.recent_expenses.length) return 0;

    const total = summary.recent_expenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    return Math.round(total / summary.recent_expenses.length);
  }, [summary.recent_expenses]);

  const totalCategoryAmount = summary.categories.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <Navbar />

      <main className="max-w-[1450px] mx-auto px-8 py-6">
        <section className="mb-6">
          <h1
            className="text-4xl md:text-5xl tracking-tight text-white"
            style={{
              fontFamily:
                '"The Seasons", "Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            Dashboard
          </h1>

          <p
            className="text-slate-400 mt-1 text-base"
            style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
          >
            Welcome back, {user?.full_name || "User"}
          </p>
        </section>

        {loading ? (
          <p className="text-slate-400">Loading dashboard...</p>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300">
            {error}
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              <StatCard
                icon={<Wallet size={24} />}
                iconColor="text-violet-400"
                glow="from-violet-500"
                title="Total Expenses"
                value={`₹${summary.total_expenses}`}
                subtitle="This Month"
              />

              <StatCard
                icon={<PiggyBank size={24} />}
                iconColor="text-lime-300"
                glow="from-lime-400"
                title="Total Savings"
                value={`₹${summary.total_savings}`}
                subtitle="All Time"
              />

              <StatCard
                icon={<ReceiptText size={24} />}
                iconColor="text-orange-400"
                glow="from-orange-400"
                title="Unpaid Bills"
                value={summary.unpaid_bills}
                subtitle="Pending"
              />

              <StatCard
                icon={<TrendingUp size={24} />}
                iconColor="text-cyan-300"
                glow="from-cyan-400"
                title="This Month"
                value={`₹${summary.monthly_expense}`}
                subtitle="Total Spent"
              />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
              <InsightCard
                icon={<Layers size={24} />}
                title="Top Category"
                value={topCategory ? topCategory.name : "No data"}
                subtitle={
                  topCategory
                    ? `₹${topCategory.value} spent`
                    : "Add expenses to see trends"
                }
                color="text-lime-300"
              />

              <InsightCard
                icon={<BarChart3 size={24} />}
                title="Average Recent Expense"
                value={`₹${averageExpense}`}
                subtitle={
                  summary.recent_expenses.length
                    ? `${summary.recent_expenses.length} recent transactions`
                    : "No recent transactions yet"
                }
                color="text-violet-400"
              />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
              <Panel>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-xl text-white"
                    style={{
                      fontFamily:
                        '"The Seasons", "Cormorant Garamond", "Times New Roman", serif',
                    }}
                  >
                    Spending Trend
                  </h2>

                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                    Monthly
                  </span>
                </div>

                <ResponsiveContainer width="100%" height={245}>
                  <LineChart
                    data={summary.trend}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="date"
                      stroke="#8b949e"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#8b949e"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip prefix="₹" />} />

                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="none"
                      fill="url(#trendGradient)"
                    />

                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#7c3aed"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#8b5cf6",
                        stroke: "#ddd6fe",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Panel>

              <Panel>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-xl text-white"
                    style={{
                      fontFamily:
                        '"The Seasons", "Cormorant Garamond", "Times New Roman", serif',
                    }}
                  >
                    Category Breakdown
                  </h2>

                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                    Spending split
                  </span>
                </div>

                {summary.categories.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4 items-center">
                    <ResponsiveContainer width="100%" height={245}>
                      <PieChart>
                        <defs>
                          {categoryGradients.map(([start, end], index) => (
                            <linearGradient
                              key={index}
                              id={`categoryGradient${index}`}
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="1"
                            >
                              <stop offset="0%" stopColor={start} />
                              <stop offset="100%" stopColor={end} />
                            </linearGradient>
                          ))}
                        </defs>

                        <Pie
                          data={summary.categories}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={82}
                          innerRadius={52}
                          paddingAngle={4}
                        >
                          {summary.categories.map((_, index) => (
                            <Cell
                              key={index}
                              fill={`url(#categoryGradient${
                                index % categoryGradients.length
                              })`}
                            />
                          ))}
                        </Pie>

                        <Tooltip content={<CustomTooltip prefix="₹" />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-3">
                      {summary.categories.map((item, index) => {
                        const percent = totalCategoryAmount
                          ? Math.round((Number(item.value) / totalCategoryAmount) * 100)
                          : 0;

                        return (
                          <div
                            key={item.name}
                            className="flex items-center justify-between gap-4 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  background: `linear-gradient(135deg, ${
                                    categoryGradients[index % categoryGradients.length][0]
                                  }, ${
                                    categoryGradients[index % categoryGradients.length][1]
                                  })`,
                                }}
                              />
                              <span className="text-slate-300">{item.name}</span>
                            </div>

                            <div className="flex items-center gap-5">
                              <span className="text-white font-semibold">
                                ₹{item.value}
                              </span>
                              <span className="text-slate-400 w-9 text-right">
                                {percent}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-[245px] flex items-center justify-center text-slate-500">
                    No category data yet.
                  </div>
                )}
              </Panel>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
              <Panel>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-xl"
                    style={{
                      fontFamily:
                        '"The Seasons", "Cormorant Garamond", "Times New Roman", serif',
                    }}
                  >
                    Upcoming Bills
                  </h2>
                  <span className="text-xs text-slate-400">
                    {summary.upcoming_bills.length} unpaid
                  </span>
                </div>

                {summary.upcoming_bills.length > 0 ? (
                  <div className="space-y-2">
                    {summary.upcoming_bills.map((bill) => (
                      <div
                        key={bill.id}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                          bill.is_overdue
                            ? "border-red-500/30 bg-red-500/10"
                            : "border-slate-800 bg-white/[0.03]"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-white">{bill.title}</p>
                          <p className="text-xs text-slate-500">
                            Due: {new Date(bill.due_date).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <p className="font-semibold">₹{bill.amount}</p>
                            <p
                              className={`text-xs ${
                                bill.is_overdue ? "text-red-400" : "text-lime-300"
                              }`}
                            >
                              {bill.is_overdue ? "Overdue" : "Pending"}
                            </p>
                          </div>

                          <button
                            onClick={() => markAsPaid(bill.id)}
                            className="rounded-full bg-lime-400 px-4 py-1.5 text-xs text-black"
                          >
                            Paid
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No upcoming unpaid bills.</p>
                )}
              </Panel>

              <Panel>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-xl"
                    style={{
                      fontFamily:
                        '"The Seasons", "Cormorant Garamond", "Times New Roman", serif',
                    }}
                  >
                    Recent Expenses
                  </h2>
                  <span className="text-xs text-slate-400">
                    {summary.recent_expenses.length} items
                  </span>
                </div>

                {summary.recent_expenses.length > 0 ? (
                  <div className="space-y-2">
                    {summary.recent_expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-800 bg-white/[0.03] px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-white">{expense.title}</p>
                          <p className="text-xs text-slate-500">
                            {expense.expense_date}
                          </p>
                        </div>

                        <p className="font-semibold text-white">₹{expense.amount}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No recent expenses found.</p>
                )}
              </Panel>
            </section>

            <p className="text-xs text-slate-600 mt-6">
              Inspired by the Japanese Kakeibo method — spend with intention.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, iconColor, title, value, subtitle, glow }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl border border-[#252a30] bg-[#111417] p-4 shadow-xl"
    >
      <div
        className={`absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r ${glow} to-transparent`}
      />

      <div className="flex items-center gap-4">
        <div className={`rounded-full bg-white/[0.04] p-3 ${iconColor}`}>
          {icon}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}

function InsightCard({ icon, title, value, subtitle, color }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-[#252a30] bg-[#111417] p-4 shadow-xl"
    >
      <div className="flex items-center gap-4">
        <div className={`rounded-full bg-white/[0.04] p-3 ${color}`}>
          {icon}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}

function Panel({ children }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-[#252a30] bg-[#111417] p-5 shadow-xl"
    >
      {children}
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label, prefix = "" }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl border border-slate-700 bg-[#111417] px-4 py-3 shadow-xl">
      <p className="text-slate-400 text-sm mb-1">{label || payload[0].name}</p>
      <p className="text-white font-semibold">
        {prefix}
        {payload[0].value}
      </p>
    </div>
  );
}

function getMonthName(monthNumber) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return monthNames[monthNumber - 1] || "Month";
}

export default Dashboard;