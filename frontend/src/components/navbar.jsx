import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `px-4 py-2 text-sm rounded-full transition ${
      isActive
        ? "bg-[#a3e635] text-black"
        : "text-slate-400 hover:text-white"
    }`;

  return (
    <nav className="w-full border-b border-[#161b22] bg-[#040404]">
      <div className="w-full px-10 py-5 flex items-center justify-between">
        
        {/* Logo */}
        <div className="leading-tight">
          <h1
            className="text-4xl text-white tracking-tight"
            style={{ fontFamily: "The Seasons, serif" }}
          >
            Kakeibo
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            家計簿 • Mindful Finance Tracker
          </p>
        </div>

        {/* Nav */}
        <div className="flex items-center gap-4">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/expenses" className={linkClass}>
            Expenses
          </NavLink>

          <NavLink to="/add-expense" className={linkClass}>
            Add Expense
          </NavLink>

          <NavLink to="/bills" className={linkClass}>
            Bills
          </NavLink>

          <NavLink to="/savings" className={linkClass}>
            Savings
          </NavLink>

          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>

          <button
            onClick={handleLogout}
            className="ml-3 px-5 py-2 text-sm rounded-full bg-[#ff3b45] hover:bg-[#ff525b] text-white transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;