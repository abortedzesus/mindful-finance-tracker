import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import AddExpense from "./pages/AddExpense";
import Expense from "./pages/Expense";
import EditExpense from "./pages/editexpense";
import Bills from "./pages/bills";
import Savings from "./pages/savings";
import Profile from "./pages/profile";

function App() {
  const token = !!localStorage.getItem("access_token");

  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/signup"
          element={token ? <Navigate to="/dashboard" /> : <Signup />}
        />

        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/add-expense"
          element={token ? <AddExpense /> : <Navigate to="/login" />}
        />
        <Route
          path="/expenses"
          element={token ? <Expense /> : <Navigate to="/login" />}
        />
        <Route
         path="/profile"
        element={token ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/savings"
          element={token ? <Savings /> : <Navigate to="/login" />}
        />
        <Route
          path="/edit-expense/:id"
          element={token ? <EditExpense /> : <Navigate to="/login" />}
        />
        <Route
          path="/bills"
          element={token ? <Bills /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;