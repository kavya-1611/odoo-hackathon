import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/client";

export default function Employees() {
  const [leaves, setLeaves] = useState([]);

  // We don't have a dedicated "list all users" endpoint in the MVP API, so
  // we derive a distinct employee list from the leave/attendance data the
  // admin already has access to. In a fuller build, add GET /api/users.
  useEffect(() => {
    api.get("/leave/all").then((res) => setLeaves(res.data));
  }, []);

  const employees = Array.from(
    new Map(leaves.map((l) => [l.user.id, l.user])).values()
  );

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
      <p className="text-slate-500 mt-1">
        Employees who appear in leave records. Add a <code>/api/users</code> endpoint for a full directory.
      </p>

      <div className="card mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="py-2">Name</th>
              <th className="py-2">Employee ID</th>
              <th className="py-2">Department</th>
              <th className="py-2">Designation</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((u) => (
              <tr key={u.id} className="border-b border-slate-50">
                <td className="py-2 font-medium text-slate-800">{u.profile?.fullName}</td>
                <td className="py-2 text-slate-500">{u.employeeId}</td>
                <td className="py-2 text-slate-500">{u.profile?.department || "—"}</td>
                <td className="py-2 text-slate-500">{u.profile?.designation || "—"}</td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  No employee data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
