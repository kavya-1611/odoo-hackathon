import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/client";

const statusColors = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ leaveType: "PAID", startDate: "", endDate: "", remarks: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await api.get("/leave/me");
    setLeaves(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/leave/apply", form);
      setForm({ leaveType: "PAID", startDate: "", endDate: "", remarks: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit leave request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800">Leave & Time-Off</h1>
      <p className="text-slate-500 mt-1">Apply for leave and track request status.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <form onSubmit={handleSubmit} className="card lg:col-span-1 h-fit">
          <p className="font-semibold text-slate-800 mb-4">Apply for Leave</p>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Leave Type</label>
              <select
                className="input mt-1"
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              >
                <option value="PAID">Paid</option>
                <option value="SICK">Sick</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Start Date</label>
              <input
                type="date"
                required
                className="input mt-1"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">End Date</label>
              <input
                type="date"
                required
                className="input mt-1"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Remarks</label>
              <textarea
                className="input mt-1"
                rows={3}
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {leaves.map((l) => (
            <div key={l.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">
                  {l.leaveType} · {new Date(l.startDate).toLocaleDateString()} –{" "}
                  {new Date(l.endDate).toLocaleDateString()}
                </p>
                {l.remarks && <p className="text-sm text-slate-500 mt-1">{l.remarks}</p>}
                {l.adminComment && (
                  <p className="text-sm text-slate-400 mt-1 italic">Admin: {l.adminComment}</p>
                )}
              </div>
              <span className={`badge ${statusColors[l.status]}`}>{l.status}</span>
            </div>
          ))}
          {leaves.length === 0 && <p className="text-slate-400">No leave requests yet.</p>}
        </div>
      </div>
    </Layout>
  );
}
