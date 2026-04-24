import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import Navbar from "../components/navbar";

function AddExpense() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category_id: "",
    expense_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    note: "",
    is_recurring: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories/");
        setCategories(res.data);
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/expenses/", {
        ...formData,
        amount: Number(formData.amount),
        category_id: Number(formData.category_id),
      });

      toast.success("Expense added!");
      localStorage.setItem("refreshDashboard", "true");
      navigate("/expenses");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <Navbar />

      <main className="max-w-[1450px] mx-auto px-8 py-6">
        <h1 className="text-4xl font-bold mb-2">Add Expense</h1>
        <p className="text-slate-400 mb-6">
          Record a new expense into your tracker
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0f1419] border border-[#1f242a] rounded-2xl p-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <Input
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <Input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />

            <Input
              type="date"
              name="expense_date"
              value={formData.expense_date}
              onChange={handleChange}
              required
            />

            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              disabled={loadingCategories}
              required
              className="h-[46px] rounded-xl bg-slate-800 border border-slate-700 px-4 text-sm text-white outline-none focus:border-lime-400"
            >
              <option value="">Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="h-[46px] rounded-xl bg-slate-800 border border-slate-700 px-4 text-sm text-white outline-none focus:border-lime-400"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 mt-4 items-center">
            <input
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Optional note"
              className="h-[46px] rounded-xl bg-slate-800 border border-slate-700 px-4 text-sm text-white outline-none focus:border-lime-400"
            />

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleChange}
                className="h-4 w-4 accent-lime-400"
              />
              Recurring
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="h-[46px] rounded-xl bg-lime-400 hover:bg-lime-300 text-black px-6 font-semibold transition disabled:opacity-70"
            >
              {submitting ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Input({ type = "text", name, value, onChange, placeholder, required }) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="h-[46px] rounded-xl bg-slate-800 border border-slate-700 px-4 text-sm text-white outline-none focus:border-lime-400"
    />
  );
}

export default AddExpense;