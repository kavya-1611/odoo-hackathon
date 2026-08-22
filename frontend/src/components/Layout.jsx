import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  Wallet,
  Users,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CopilotChat from "./CopilotChat";

const employeeLinks = [
  { to: "/employee", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employee/profile", label: "Profile", icon: User },
  { to: "/employee/attendance", label: "Attendance", icon: Clock },
  { to: "/employee/leave", label: "Leave", icon: CalendarDays },
  { to: "/employee/payroll", label: "Payroll", icon: Wallet },
];

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/attendance", label: "Attendance", icon: Clock },
  { to: "/admin/leave-approvals", label: "Leave Approvals", icon: CalendarDays },
  { to: "/admin/payroll", label: "Payroll", icon: Wallet },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "ADMIN" ? adminLinks : employeeLinks;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800">PulseHR</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-slate-800">{user?.fullName}</p>
            <p className="text-xs text-slate-400">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>

      {/* Persistent floating AI Copilot — visible on every screen */}
      <CopilotChat />
    </div>
  );
}
