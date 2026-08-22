import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/client";

export default function AdminPayroll() {
  const [leaves, setLeaves] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [payroll, setPayroll] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/leave/all").then((res) => setLeaves(res.data));
  }, []);

  const employees = Array.from(new Map(leaves.map((l) => [l.user.id, l.user])).values());

  async function selectEmployee(user) {
    setSelectedUser(user);
    setMessage("");
    const res = await api.get(`/payroll/${user.id}`);
    setPayroll(res.data);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.patch(`/payroll/${selectedUser.id}`, {
        basicSalary: Number(payroll.basicSalary),
        allowances: Number(payroll.allowances),
        deductions: Number(payroll.deductions),
      });
      setPayroll(res.data);
      setMessage("Payroll updated successfully.");
    } catch {
      setMessage("Could not update payroll.");
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800">Payroll Management</h1>
      <p className="text-slate-500 mt-1">Select an employee to view or update their salary structure.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="card lg:col-span-1">
          <p className="font-semibold text-slate-800 mb-3">Employees</p>
          <div className="space-y-1">
            {employees.map((u) => (
              <button
                key={u.id}
                onClick={() => selectEmployee(u)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
                  selectedUser?.id === u.id ? "bg-brand-50 text-brand-700" : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                {u.profile?.fullName}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {payroll ? (
            <form onSubmit={handleSave} className="card max-w-md">
              <p className="font-semibold text-slate-800 mb-4">{selectedUser.profile?.fullName}</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Basic Salary</label>
                  <input
                    type="number"
                    className="input mt-1"
                    value={payroll.basicSalary}
                    onChange={(e) => setPayroll({ ...payroll, basicSalary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Allowances</label>
                  <input
                    type="number"
                    className="input mt-1"
                    value={payroll.allowances}
                    onChange={(e) => setPayroll({ ...payroll, allowances: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Deductions</label>
                  <input
                    type="number"
                    className="input mt-1"
                    value={payroll.deductions}
                    onChange={(e) => setPayroll({ ...payroll, deductions: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Save Payroll
                </button>
                {message && <p className="text-sm text-slate-500 mt-2">{message}</p>}
              </div>
            </form>
          ) : (
            <p className="text-slate-400">Select an employee to manage payroll.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
