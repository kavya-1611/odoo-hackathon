import { useEffect, useState } from "react";
import { Clock, CalendarDays, Wallet, User } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    api.get("/attendance/me?range=weekly").then((res) => setAttendance(res.data));
    api.get("/leave/me").then((res) => setLeaves(res.data));
  }, []);

  const presentDays = attendance.filter((a) => a.status === "PRESENT").length;
  const pendingLeaves = leaves.filter((l) => l.status === "PENDING").length;

  const cards = [
    { to: "/employee/profile", label: "Profile", icon: User, desc: "View & edit your details" },
    { to: "/employee/attendance", label: "Attendance", icon: Clock, desc: `${presentDays} present this week` },
    { to: "/employee/leave", label: "Leave Requests", icon: CalendarDays, desc: `${pendingLeaves} pending` },
    { to: "/employee/payroll", label: "Payroll", icon: Wallet, desc: "View salary details" },
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.fullName?.split(" ")[0]} 👋</h1>
      <p className="text-slate-500 mt-1">Here's a quick overview of your workspace.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {cards.map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to} className="card hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
              <Icon size={20} className="text-brand-600" />
            </div>
            <p className="font-semibold text-slate-800">{label}</p>
            <p className="text-sm text-slate-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="card mt-6">
        <p className="font-semibold text-slate-800 mb-2">Tip</p>
        <p className="text-sm text-slate-500">
          Try the Copilot chat in the bottom-right corner — you can apply for leave or check your
          attendance just by typing naturally, e.g. "Apply 1 day paid leave tomorrow."
        </p>
      </div>
    </Layout>
  );
}
