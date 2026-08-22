import { useState } from "react";
import { Card, Button, Input, Badge, SectionTitle } from "../components/UI";

export function AdminDashboard({ employees, leaves, attendance }) {
  const pending = leaves.filter((l) => l.status === "Pending").length;
  const presentToday = attendance.filter((a) => a.status === "Present").length;
  return (
    <div>
      <SectionTitle title="Admin Overview" desc="Snapshot of your organization today." />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5"><p className="text-xs text-coffee-400">Total Employees</p><p className="font-display text-3xl font-bold text-coffee-900">{employees.length}</p></Card>
        <Card className="p-5"><p className="text-xs text-coffee-400">Pending Leave Approvals</p><p className="font-display text-3xl font-bold text-amber-600">{pending}</p></Card>
        <Card className="p-5"><p className="text-xs text-coffee-400">Present Records Logged</p><p className="font-display text-3xl font-bold text-emerald-600">{presentToday}</p></Card>
      </div>
      <Card className="p-0 overflow-hidden" pop={false}>
        <p className="font-display font-bold text-coffee-900 p-4 pb-0">Employees</p>
        <table className="w-full text-sm mt-3">
          <thead className="bg-coffee-50 text-coffee-500 text-left"><tr><th className="p-3">Name</th><th className="p-3">ID</th><th className="p-3">Dept</th><th className="p-3">Designation</th></tr></thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-t border-coffee-100">
                <td className="p-3">{e.name}</td><td className="p-3">{e.id}</td><td className="p-3">{e.dept}</td><td className="p-3">{e.designation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function AdminAttendance({ attendance, employees }) {
  const nameOf = (id) => employees.find((e) => e.id === id)?.name || id;
  return (
    <div>
      <SectionTitle title="Attendance Records" desc="View attendance across all employees." />
      <Card className="p-0 overflow-hidden" pop={false}>
        <table className="w-full text-sm">
          <thead className="bg-coffee-50 text-coffee-500 text-left"><tr><th className="p-3">Employee</th><th className="p-3">Date</th><th className="p-3">Check-in</th><th className="p-3">Check-out</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {attendance.slice().reverse().map((a) => (
              <tr key={a.id} className="border-t border-coffee-100">
                <td className="p-3">{nameOf(a.empId)}</td><td className="p-3">{a.date}</td><td className="p-3">{a.checkIn}</td><td className="p-3">{a.checkOut}</td>
                <td className="p-3"><Badge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function AdminLeaveApproval({ leaves, setLeaves }) {
  const setStatus = (id, status) => setLeaves(leaves.map((l) => (l.id === id ? { ...l, status } : l)));
  return (
    <div>
      <SectionTitle title="Leave Approvals" desc="Approve or reject employee leave requests." />
      <Card className="p-0 overflow-hidden" pop={false}>
        <table className="w-full text-sm">
          <thead className="bg-coffee-50 text-coffee-500 text-left"><tr><th className="p-3">Employee</th><th className="p-3">Type</th><th className="p-3">Dates</th><th className="p-3">Remarks</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} className="border-t border-coffee-100">
                <td className="p-3">{l.name}</td><td className="p-3">{l.type}</td><td className="p-3">{l.from} → {l.to}</td>
                <td className="p-3 text-coffee-500">{l.remarks || "-"}</td>
                <td className="p-3"><Badge status={l.status} /></td>
                <td className="p-3">
                  {l.status === "Pending" ? (
                    <div className="flex gap-2">
                      <Button variant="success" onClick={() => setStatus(l.id, "Approved")}>Approve</Button>
                      <Button variant="danger" onClick={() => setStatus(l.id, "Rejected")}>Reject</Button>
                    </div>
                  ) : <span className="text-coffee-400 text-xs">Reviewed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function AdminPayroll({ employees, updateEmployee }) {
  const [editingId, setEditingId] = useState(null);
  const [value, setValue] = useState("");
  return (
    <div>
      <SectionTitle title="Payroll Control" desc="View and update salary structure for employees." />
      <Card className="p-0 overflow-hidden" pop={false}>
        <table className="w-full text-sm">
          <thead className="bg-coffee-50 text-coffee-500 text-left"><tr><th className="p-3">Name</th><th className="p-3">ID</th><th className="p-3">Salary</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-t border-coffee-100">
                <td className="p-3">{e.name}</td><td className="p-3">{e.id}</td>
                <td className="p-3">
                  {editingId === e.id ? <Input type="number" value={value} onChange={(ev) => setValue(ev.target.value)} className="w-32" /> : `₹${e.salary.toLocaleString()}`}
                </td>
                <td className="p-3">
                  {editingId === e.id ? (
                    <div className="flex gap-2">
                      <Button variant="success" onClick={() => { updateEmployee({ ...e, salary: Number(value) }); setEditingId(null); }}>Save</Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  ) : <Button variant="ghost" onClick={() => { setEditingId(e.id); setValue(e.salary); }}>Update</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
