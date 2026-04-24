import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValid =
    formData.password.length >= 8 &&
    /[A-Z]/.test(formData.password) &&
    /[0-9]/.test(formData.password) &&
    /[!@#$%^&*]/.test(formData.password);

  const emailValid =
    formData.email.endsWith("@gmail.com") ||
    formData.email.endsWith("@yahoo.com");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailValid) {
      toast.error("Use a Gmail or Yahoo email");
      return;
    }

    if (!passwordValid) {
      toast.error(
        "Password must be 8+ characters with 1 uppercase letter, 1 number, and 1 special character"
      );
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        dob: formData.dob,
        password: formData.password,
      });

      toast.success("Account created!");
      navigate("/login");
    } catch (err) {
      console.log(err.response?.data || err);
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center px-4 py-10 text-white">
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
          Create your mindful finance account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="first_name"
            placeholder="First name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />

          <Input
            name="middle_name"
            placeholder="Middle name (optional)"
            value={formData.middle_name}
            onChange={handleChange}
          />

          <Input
            name="last_name"
            placeholder="Last name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />

          <Input
            name="email"
            type="email"
            placeholder="Gmail or Yahoo email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            name="phone"
            type="tel"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <Input
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <PasswordInput
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            show={showPassword}
            setShow={setShowPassword}
          />

          <PasswordInput
            name="confirm_password"
            placeholder="Confirm password"
            value={formData.confirm_password}
            onChange={handleChange}
            show={showConfirmPassword}
            setShow={setShowConfirmPassword}
          />

          <p
            className={`text-xs ${
              formData.password && !passwordValid
                ? "text-red-300"
                : "text-slate-500"
            }`}
          >
            Password must be 8+ characters, 1 uppercase letter, 1 number, and 1
            special character.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-lime-400 hover:bg-lime-300 transition px-4 py-3 text-black font-semibold disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-lime-300 hover:text-lime-200">
            Login
          </Link>
        </p>

        <p className="text-center text-slate-500 text-xs mt-4">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
}

function Input({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-lime-400"
    />
  );
}

function PasswordInput({ name, value, onChange, placeholder, show, setShow }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 pr-16 text-white outline-none focus:border-lime-400"
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export default Signup;