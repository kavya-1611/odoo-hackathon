import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@pulsehr.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(loggedInUser.role === "ADMIN" ? "/admin" : "/employee");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-slate-800">PulseHR</span>
        </div>

        <div className="card">
          <h1 className="text-xl font-semibold text-slate-800 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-6">Sign in to your HR workspace.</p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                className="input mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                className="input mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Demo: admin@pulsehr.com / Password123! (or emp-1002@pulsehr.com)
          </p>
        </div>

        <p className="text-sm text-center text-slate-500 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand-600 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
