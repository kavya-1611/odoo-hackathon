import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/client";

const statusColors = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT: "bg-red-100 text-red-700",
  HALF_DAY: "bg-amber-100 text-amber-700",
  LEAVE: "bg-slate-200 text-slate-600",
};

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get("/attendance/all").then((res) => setRecords(res.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800">Attendance Records</h1>
      <p className="text-slate-500 mt-1">Recent attendance across all employees.</p>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="py-2">Employee</th>
              <th className="py-2">Date</th>
              <th className="py-2">Check In</th>
              <th className="py-2">Check Out</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-slate-50">
                <td className="py-2 font-medium text-slate-800">{r.user?.profile?.fullName}</td>
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
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  No attendance records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
