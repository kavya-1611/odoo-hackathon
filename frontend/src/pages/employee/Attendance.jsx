import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/client";

const statusColors = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT: "bg-red-100 text-red-700",
  HALF_DAY: "bg-amber-100 text-amber-700",
  LEAVE: "bg-slate-200 text-slate-600",
};

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [range, setRange] = useState("weekly");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await api.get(`/attendance/me?range=${range}`);
    setRecords(res.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  async function handleCheckIn() {
    try {
      await api.post("/attendance/check-in");
      setMessage("Checked in successfully.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || "Check-in failed.");
    }
  }

  async function handleCheckOut() {
    try {
      await api.post("/attendance/check-out");
      setMessage("Checked out successfully.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || "Check-out failed.");
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="text-slate-500 mt-1">Track your daily check-ins and history.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCheckIn} className="btn-primary">
            Check In
          </button>
          <button onClick={handleCheckOut} className="btn-secondary">
            Check Out
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-brand-600 mt-3">{message}</p>}

      <div className="card mt-6">
        <div className="flex gap-2 mb-4">
          {["daily", "weekly"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                range === r ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {r === "daily" ? "Today" : "This Week"}
            </button>
          ))}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="py-2">Date</th>
              <th className="py-2">Check In</th>
              <th className="py-2">Check Out</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-slate-50">
                <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                <td className="py-2">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "—"}</td>
                <td className="py-2">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "—"}</td>
                <td className="py-2">
                  <span className={`badge ${statusColors[r.status]}`}>{r.status.replace("_", " ")}</span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  No records found for this range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
