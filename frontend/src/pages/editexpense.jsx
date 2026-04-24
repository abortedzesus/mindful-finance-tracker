import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

function EditExpense() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    amount: "",
    payment_method: "upi",
    expense_date: "",
    note: "",
    is_recurring: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");

        const [expenseRes, categoriesRes] = await Promise.all([
          api.get(`/expenses/${id}`),
          api.get("/categories/"),
        ]);

        const expense = expenseRes.data;

        setFormData({
          category_id: String(expense.category_id),
          title: expense.title || "",
          amount: expense.amount || "",
          payment_method: expense.payment_method || "upi",
          expense_date: expense.expense_date || "",
          note: expense.note || "",
          is_recurring: expense.is_recurring || false,
        });

        setCategories(categoriesRes.data);
      } catch (err) {
        console.log(err);
        setError("Failed to load expense details");
      } finally {
        setLoadingPage(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.put(`/expenses/${id}`, formData);

      toast.success("Expense updated successfully!");
      localStorage.setItem("refreshDashboard", "true");
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.error || "Failed to update expense";
      toast.error(message);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading expense...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Edit Expense</h1>
          <p className="text-slate-400 mt-2">Update your expense details</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          {error && (
            <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div className="md:col-span-2">
              <label className="block text-slate-300 mb-2 text-sm">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Burger, Auto fare, Shopping"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">Date</label>
              <input
                type="date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                Payment Method
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-indigo-500"
              >
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 mb-2 text-sm">Note</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Optional note"
                rows="4"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleChange}
                className="h-4 w-4 accent-indigo-500"
              />
              <label className="text-slate-300 text-sm">Recurring expense</label>
            </div>

            <div className="md:col-span-2 flex gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-6 py-3 font-semibold disabled:opacity-70"
              >
                {submitting ? "Updating..." : "Update Expense"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/expenses")}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 transition px-6 py-3 font-semibold border border-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditExpense;