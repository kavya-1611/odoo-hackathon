import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signup(form);
      navigate(user.role === "ADMIN" ? "/admin" : "/employee");
    } catch (err) {
      setError(
        err.response?.data?.issues?.join(", ") ||
          err.response?.data?.error ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-slate-800">PulseHR</span>
        </div>

        <div className="card">
          <h1 className="text-xl font-semibold text-slate-800 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-6">Register as an employee or HR admin.</p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input
                required
                className="input mt-1"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Employee ID</label>
              <input
                required
                className="input mt-1"
                placeholder="EMP-1006"
                value={form.employeeId}
                onChange={(e) => update("employeeId", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                className="input mt-1"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                className="input mt-1"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Role</label>
              <select
                className="input mt-1"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin / HR Officer</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating account…" : "Sign Up"}
            </button>
          </form>
        </div>

        <p className="text-sm text-center text-slate-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
