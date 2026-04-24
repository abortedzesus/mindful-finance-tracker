import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/navbar";
import toast from "react-hot-toast";

function Bills() {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    due_date: "",
  });

  const fetchBills = async () => {
    try {
      const res = await api.get("/bills/");
      setBills(res.data);
    } catch {
      toast.error("Failed to load bills");
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const addBill = async () => {
    if (!form.title || !form.amount || !form.due_date) {
      toast.error("Fill all fields");
      return;
    }

    try {
      await api.post("/bills/", {
        ...form,
        amount: Number(form.amount),
      });

      toast.success("Bill added");
      setForm({ title: "", amount: "", due_date: "" });
      localStorage.setItem("refreshDashboard", "true");
      fetchBills();
    } catch {
      toast.error("Failed to add bill");
    }
  };

  const deleteBill = async (id) => {
    if (!confirm("Delete this bill?")) return;

    try {
      await api.delete(`/bills/${id}`);
      toast.success("Bill deleted");
      localStorage.setItem("refreshDashboard", "true");
      fetchBills();
    } catch {
      toast.error("Error deleting bill");
    }
  };

  const markAsPaid = async (id) => {
    try {
      await api.put(`/bills/${id}`, { is_paid: true });
      toast.success("Marked as paid");
      localStorage.setItem("refreshDashboard", "true");
      fetchBills();
    } catch {
      toast.error("Error updating bill");
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <Navbar />

      <main className="max-w-[1450px] mx-auto px-8 py-6">
        <h1 className="text-4xl font-bold mb-2">Bills</h1>
        <p className="text-slate-400 mb-6">
          Track upcoming payments and reminders
        </p>

        <div className="bg-[#0f1419] border border-[#1f242a] rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <Input
              placeholder="Bill name"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />

            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />

            <button
              onClick={addBill}
              className="h-[46px] rounded-xl bg-lime-400 hover:bg-lime-300 text-black px-5 font-semibold transition"
            >
              Add Bill
            </button>
          </div>
        </div>

        {bills.length === 0 ? (
          <div className="rounded-2xl border border-[#252a30] bg-[#111417] p-6 text-slate-500">
            No bills yet.
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((b) => (
              <div
                key={b.id}
                className="bg-[#111417] border border-[#252a30] p-4 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-sm text-slate-400">
                    ₹{b.amount} • {b.due_date}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      b.is_paid ? "text-lime-300" : "text-orange-300"
                    }`}
                  >
                    {b.is_paid ? "Paid" : "Pending"}
                  </p>
                </div>

                <div className="flex gap-3">
                  {!b.is_paid && (
                    <button
                      onClick={() => markAsPaid(b.id)}
                      className="rounded-full border border-lime-400/40 px-4 py-2 text-sm text-lime-300 hover:bg-lime-400 hover:text-black transition"
                    >
                      Paid
                    </button>
                  )}

                  <button
                    onClick={() => deleteBill(b.id)}
                    className="rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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

export default Bills;