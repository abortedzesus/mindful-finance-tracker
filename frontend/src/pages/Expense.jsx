import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/navbar";
import toast from "react-hot-toast";

function Expense() {
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses/");
      setExpenses(res.data);
    } catch {
      toast.error("Failed to load expenses");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <Navbar />

      <main className="max-w-[1450px] mx-auto px-8 py-6">
        <h1 className="text-4xl font-bold mb-2">Expenses</h1>
        <p className="text-slate-400 mb-6">
          View and manage all your recorded expenses
        </p>

        {expenses.length === 0 ? (
          <p className="text-slate-500">No expenses found.</p>
        ) : (
          <div className="space-y-3">
            {expenses.map((e) => (
              <div
                key={e.id}
                className="bg-[#111417] border border-[#252a30] p-4 rounded-2xl"
              >
                {e.title} - ₹{e.amount}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Expense;