import { useEffect, useState } from "react";
import { Sparkles, Check, X } from "lucide-react";
import Layout from "../../components/Layout";
import api from "../../api/client";

const statusColors = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggestion, setLoadingSuggestion] = useState({});

  async function load() {
    const res = await api.get("/leave/all");
    setLeaves(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function fetchSuggestion(id) {
    setLoadingSuggestion((s) => ({ ...s, [id]: true }));
    try {
      const res = await api.get(`/leave/${id}/suggest`);
      setSuggestions((s) => ({ ...s, [id]: res.data.suggestion }));
    } finally {
      setLoadingSuggestion((s) => ({ ...s, [id]: false }));
    }
  }

  async function decide(id, decision) {
    await api.patch(`/leave/${id}/decision`, { decision });
    load();
  }

  const pending = leaves.filter((l) => l.status === "PENDING");
  const resolved = leaves.filter((l) => l.status !== "PENDING");

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800">Leave Approvals</h1>
      <p className="text-slate-500 mt-1">Review pending requests, with AI-assisted recommendations.</p>

      <div className="space-y-4 mt-6">
        {pending.map((l) => (
          <div key={l.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">{l.user?.profile?.fullName}</p>
                <p className="text-sm text-slate-500">
                  {l.leaveType} · {new Date(l.startDate).toLocaleDateString()} –{" "}
                  {new Date(l.endDate).toLocaleDateString()}
                </p>
                {l.remarks && <p className="text-sm text-slate-500 mt-1 italic">"{l.remarks}"</p>}
              </div>
              <span className={`badge ${statusColors[l.status]}`}>{l.status}</span>
            </div>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <button onClick={() => decide(l.id, "APPROVED")} className="btn-primary flex items-center gap-1">
                <Check size={16} /> Approve
              </button>
              <button
                onClick={() => decide(l.id, "REJECTED")}
                className="btn-secondary flex items-center gap-1"
              >
                <X size={16} /> Reject
              </button>
              {!suggestions[l.id] && (
                <button
                  onClick={() => fetchSuggestion(l.id)}
                  disabled={loadingSuggestion[l.id]}
                  className="text-sm text-brand-600 font-medium flex items-center gap-1 ml-auto"
                >
                  <Sparkles size={14} />
                  {loadingSuggestion[l.id] ? "Thinking…" : "Get AI Suggestion"}
                </button>
              )}
            </div>

            {suggestions[l.id] && (
              <div className="mt-3 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 text-sm text-brand-800 flex items-start gap-2">
                <Sparkles size={14} className="mt-0.5 shrink-0" />
                <span>{suggestions[l.id]}</span>
              </div>
            )}
          </div>
        ))}
        {pending.length === 0 && <p className="text-slate-400">No pending leave requests. 🎉</p>}
      </div>

      {resolved.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-slate-700 mt-8 mb-3">Past Decisions</h2>
          <div className="space-y-2">
            {resolved.map((l) => (
              <div key={l.id} className="card flex items-center justify-between py-3">
                <p className="text-sm text-slate-600">
                  {l.user?.profile?.fullName} · {l.leaveType} ·{" "}
                  {new Date(l.startDate).toLocaleDateString()}
                </p>
                <span className={`badge ${statusColors[l.status]}`}>{l.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
