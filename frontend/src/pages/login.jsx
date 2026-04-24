import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/dashboard";
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-md rounded-3xl bg-[#111417] p-8 shadow-2xl border border-[#252a30]">
        <h1
          className="text-5xl text-center mb-2"
          style={{
            fontFamily:
              '"The Seasons", "Cormorant Garamond", "Times New Roman", serif',
          }}
        >
          Kakeibo
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Login to your mindful finance tracker
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 mb-2 text-sm">
              Email or Phone Number
            </label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter email or phone number"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-lime-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-lime-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-lime-400 hover:bg-lime-300 transition px-4 py-3 text-black font-semibold disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          New to Kakeibo?{" "}
          <Link to="/signup" className="text-lime-300 hover:text-lime-200">
            Create an account
          </Link>
        </p>

        <p className="text-center text-slate-500 text-xs mt-4">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;