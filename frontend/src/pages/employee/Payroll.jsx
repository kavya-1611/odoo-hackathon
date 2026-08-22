import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/client";

export default function Payroll() {
  const [payroll, setPayroll] = useState(null);

  useEffect(() => {
    api.get("/payroll/me").then((res) => setPayroll(res.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
      <p className="text-slate-500 mt-1">Read-only view of your current salary structure.</p>

      {payroll ? (
        <div className="card max-w-md mt-6">
          <div className="space-y-3 text-sm">
            <Row label="Basic Salary" value={payroll.basicSalary} />
            <Row label="Allowances" value={payroll.allowances} />
            <Row label="Deductions" value={-payroll.deductions} />
            <div className="border-t border-slate-100 pt-3 flex justify-between font-semibold text-slate-800">
              <span>Net Pay</span>
              <span>₹{payroll.netPay.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Last updated: {new Date(payroll.updatedAt).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p className="text-slate-400 mt-6">Loading payroll…</p>
      )}
    </Layout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">₹{value.toLocaleString()}</span>
    </div>
  );
}
