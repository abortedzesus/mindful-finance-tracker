import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/navbar";
import toast from "react-hot-toast";

function Savings() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    title: "",
    target_amount: "",
    current_amount: "",
    deadline: "",
  });

  const fetchGoals = async () => {
    try {
      const res = await api.get("/savings/");
      setGoals(res.data);
    } catch {
      toast.error("Failed to load goals");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const addGoal = async () => {
    if (!form.title || !form.target_amount) {
      toast.error("Goal title and target amount are required");
      return;
    }

    try {
      await api.post("/savings/", {
        ...form,
        target_amount: Number(form.target_amount),
        current_amount: Number(form.current_amount || 0),
      });

      toast.success("Goal added");
      setForm({
        title: "",
        target_amount: "",
        current_amount: "",
        deadline: "",
      });

      localStorage.setItem("refreshDashboard", "true");
      fetchGoals();
    } catch {
      toast.error("Error adding goal");
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <Navbar />

      <main className="max-w-[1450px] mx-auto px-8 py-6">
        <h1 className="text-4xl font-bold mb-2">Savings</h1>
        <p className="text-slate-400 mb-6">Track your financial goals</p>

        <div className="bg-[#0f1419] border border-[#1f242a] rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <Input
              placeholder="Goal"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Target"
              value={form.target_amount}
              onChange={(e) =>
                setForm({ ...form, target_amount: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Saved"
              value={form.current_amount}
              onChange={(e) =>
                setForm({ ...form, current_amount: e.target.value })
              }
            />

            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />

            <button
              onClick={addGoal}
              className="h-[46px] rounded-xl bg-lime-400 hover:bg-lime-300 text-black px-5 font-semibold transition"
            >
              Add Goal
            </button>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-2xl border border-[#252a30] bg-[#111417] p-6 text-slate-500">
            No savings goals yet.
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((g) => {
              const percent = Math.min(
                (Number(g.current_amount) / Number(g.target_amount)) * 100,
                100
              );

              return (
                <div
                  key={g.id}
                  className="bg-[#111417] border border-[#252a30] p-5 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-lg">{g.title}</p>
                      <p className="text-sm text-slate-400">
                        ₹{g.current_amount} / ₹{g.target_amount}
                      </p>
                    </div>

                    <p className="text-lime-300 font-semibold">
                      {percent.toFixed(1)}%
                    </p>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-lime-400 to-emerald-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {g.deadline && (
                    <p className="text-xs text-slate-500 mt-3">
                      Deadline: {g.deadline}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function Input({ type = "text", value, onChange, placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-[46px] rounded-xl bg-slate-800 border border-slate-700 px-4 text-sm text-white outline-none focus:border-lime-400"
    />
  );
}

export default Savings;