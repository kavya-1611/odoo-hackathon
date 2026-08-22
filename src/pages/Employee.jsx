import { useState } from "react";
import { Card, Button, Input, Select, Badge, SectionTitle, Avatar } from "../components/UI";

export function EmployeeDashboard({ user, setActive, myLeaves }) {
  const cards = [
    { key: "profile", label: "Profile", hint: "View & edit your details" },
    { key: "attendance", label: "Attendance", hint: "Check in / check out" },
    { key: "leave", label: "Leave Requests", hint: "Apply & track status" },
    { key: "payroll", label: "Payroll", hint: "View salary details" },
  ];
  const pendingLeave = myLeaves.find((l) => l.status === "Pending");

  return (
    <div>
      <SectionTitle title={`Welcome, ${user.name.split(" ")[0]}`} desc="Here's your workday at a glance." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <button key={c.key} onClick={() => setActive(c.key)} className="text-left">
            <Card className="p-5 h-full">
              <p className="font-display font-bold text-coffee-900 text-lg">{c.label}</p>
              <p className="text-xs text-coffee-500 mt-1">{c.hint}</p>
            </Card>
          </button>
        ))}
      </div>
      <Card className="p-5" pop={false}>
        <p className="font-semibold text-coffee-800 mb-2">Recent Activity</p>
        <ul className="text-sm text-coffee-500 space-y-2">
          {pendingLeave ? <li>• Your {pendingLeave.type} leave request is pending approval.</li> : <li>• No pending leave requests.</li>}
          <li>• Keep your attendance updated by checking in daily.</li>
        </ul>
      </Card>
    </div>
  );
}

export function ProfilePage({ employee, updateEmployee }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(employee);

  const save = () => { updateEmployee(form); setEdit(false); };

  return (
    <div>
      <SectionTitle title="My Profile" desc="View your details. You can edit address, phone, and photo." />
      <Card className="p-6 max-w-2xl" pop={false}>
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={form.name} size={16} />
          <div>
            <p className="font-display font-bold text-coffee-900 text-lg">{form.name}</p>
            <p className="text-sm text-coffee-500">{form.designation} · {form.dept}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 text-sm">
          <div><p className="text-coffee-400 text-xs mb-1">Employee ID</p><p className="text-coffee-800">{form.id}</p></div>
          <div><p className="text-coffee-400 text-xs mb-1">Email</p><p className="text-coffee-800">{form.email}</p></div>
          <div>
            <p className="text-coffee-400 text-xs mb-1">Phone</p>
            {edit ? <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /> : <p className="text-coffee-800">{form.phone}</p>}
          </div>
          <div>
            <p className="text-coffee-400 text-xs mb-1">Address</p>
            {edit ? <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /> : <p className="text-coffee-800">{form.address}</p>}
          </div>
          <div><p className="text-coffee-400 text-xs mb-1">Joined</p><p className="text-coffee-800">{form.joined}</p></div>
          <div><p className="text-coffee-400 text-xs mb-1">Salary (read-only)</p><p className="text-coffee-800">₹{form.salary.toLocaleString()}</p></div>
        </div>
        <div className="mt-6">
          {edit ? (
            <div className="flex gap-2">
              <Button onClick={save} variant="success">Save Changes</Button>
              <Button onClick={() => { setForm(employee); setEdit(false); }} variant="ghost">Cancel</Button>
            </div>
          ) : (
            <Button onClick={() => setEdit(true)} variant="ghost">Edit Profile</Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export function AttendancePage({ empId, attendance, addAttendance }) {
  const [view, setView] = useState("weekly");
  const [checkedIn, setCheckedIn] = useState(false);
  const mine = attendance.filter((a) => a.empId === empId);

  const doCheckIn = () => {
    const now = new Date();
    addAttendance({ id: Date.now(), empId, date: now.toISOString().slice(0, 10), status: "Present", checkIn: now.toTimeString().slice(0, 5), checkOut: "-" });
    setCheckedIn(true);
  };

  return (
    <div>
      <SectionTitle title="My Attendance" desc="Track your daily check-ins and view your history." />
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button variant={view === "daily" ? "primary" : "ghost"} onClick={() => setView("daily")}>Daily</Button>
          <Button variant={view === "weekly" ? "primary" : "ghost"} onClick={() => setView("weekly")}>Weekly</Button>
        </div>
        <Button onClick={doCheckIn} variant={checkedIn ? "ghost" : "success"}>{checkedIn ? "Checked In ✓" : "Check In"}</Button>
      </div>
      <Card className="p-0 overflow-hidden" pop={false}>
        <table className="w-full text-sm">
          <thead className="bg-coffee-50 text-coffee-500 text-left">
            <tr><th className="p-3">Date</th><th className="p-3">Check-in</th><th className="p-3">Check-out</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {mine.slice().reverse().map((a) => (
              <tr key={a.id} className="border-t border-coffee-100">
                <td className="p-3">{a.date}</td>
                <td className="p-3">{a.checkIn}</td>
                <td className="p-3">{a.checkOut}</td>
                <td className="p-3"><Badge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function ApplyLeavePage({ user, leaves, addLeave }) {
  const [type, setType] = useState("Paid");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [remarks, setRemarks] = useState("");
  const mine = leaves.filter((l) => l.empId === user.empId);

  const submit = (e) => {
    e.preventDefault();
    if (!from || !to) return;
    addLeave({ id: Date.now(), empId: user.empId, name: user.name, type, from, to, remarks, status: "Pending" });
    setFrom(""); setTo(""); setRemarks("");
  };

  return (
    <div>
      <SectionTitle title="Leave Requests" desc="Apply for leave and track approval status." />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6" pop={false}>
          <p className="font-display font-bold text-coffee-900 mb-4">Apply for Leave</p>
          <form onSubmit={submit} className="space-y-3">
            <div><label className="text-xs font-semibold text-coffee-600">Leave Type</label><Select options={["Paid", "Sick", "Unpaid"]} value={type} onChange={(e) => setType(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-coffee-600">From</label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required /></div>
              <div><label className="text-xs font-semibold text-coffee-600">To</label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} required /></div>
            </div>
            <div><label className="text-xs font-semibold text-coffee-600">Remarks</label><Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Reason (optional)" /></div>
            <Button type="submit" className="w-full">Submit Request</Button>
          </form>
        </Card>
        <Card className="p-0 overflow-hidden h-fit" pop={false}>
          <p className="font-display font-bold text-coffee-900 p-4 pb-0">My Requests</p>
          <table className="w-full text-sm mt-3">
            <thead className="bg-coffee-50 text-coffee-500 text-left"><tr><th className="p-3">Type</th><th className="p-3">Dates</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {mine.slice().reverse().map((l) => (
                <tr key={l.id} className="border-t border-coffee-100">
                  <td className="p-3">{l.type}</td>
                  <td className="p-3">{l.from} → {l.to}</td>
                  <td className="p-3"><Badge status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

export function PayrollView({ employee }) {
  return (
    <div>
      <SectionTitle title="Payroll" desc="Your salary details (read-only)." />
      <Card className="p-6 max-w-md" pop={false}>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-coffee-500">Base Salary</span><span className="font-semibold text-coffee-900">₹{employee.salary.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-coffee-500">Department</span><span className="text-coffee-800">{employee.dept}</span></div>
          <div className="flex justify-between"><span className="text-coffee-500">Designation</span><span className="text-coffee-800">{employee.designation}</span></div>
          <div className="border-t border-coffee-100 pt-3 flex justify-between font-semibold text-coffee-900"><span>Net Pay (monthly)</span><span>₹{employee.salary.toLocaleString()}</span></div>
        </div>
      </Card>
    </div>
  );
}
