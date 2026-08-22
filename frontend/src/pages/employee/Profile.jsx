import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/client";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/profile/me").then((res) => setProfile(res.data));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await api.patch("/profile/me", {
        phone: profile.phone || "",
        address: profile.address || "",
      });
      setProfile(res.data);
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <Layout>
        <p className="text-slate-400">Loading profile…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
      <p className="text-slate-500 mt-1">Personal, job, and contact details.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-3xl">
        <div className="card">
          <p className="text-sm font-semibold text-slate-400 uppercase mb-4">Job Details (read-only)</p>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Full Name</dt>
              <dd className="font-medium text-slate-800">{profile.fullName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Department</dt>
              <dd className="font-medium text-slate-800">{profile.department || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Designation</dt>
              <dd className="font-medium text-slate-800">{profile.designation || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Joining Date</dt>
              <dd className="font-medium text-slate-800">
                {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "—"}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-slate-400 mt-4">Only your Admin/HR can update job details.</p>
        </div>

        <form onSubmit={handleSave} className="card">
          <p className="text-sm font-semibold text-slate-400 uppercase mb-4">Editable Details</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input
                className="input mt-1"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Address</label>
              <textarea
                className="input mt-1"
                rows={3}
                value={profile.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {message && <p className="text-sm text-slate-500 mt-2">{message}</p>}
          </div>
        </form>
      </div>
    </Layout>
  );
}
