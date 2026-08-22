import { useState } from "react";
import { store } from "./data/store";
import { SignIn, SignUp } from "./pages/Auth";
import { Shell } from "./pages/Shell";
import { EmployeeDashboard, ProfilePage, AttendancePage, ApplyLeavePage, PayrollView } from "./pages/Employee";
import { AdminDashboard, AdminAttendance, AdminLeaveApproval, AdminPayroll } from "./pages/Admin";

export default function App() {
  const [screen, setScreen] = useState("signin"); // signin | signup
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");

  const [users, setUsers] = useState(store.getUsers());
  const [employees, setEmployees] = useState(store.getEmployees());
  const [attendance, setAttendance] = useState(store.getAttendance());
  const [leaves, setLeaves] = useState(store.getLeaves());

  const persistUsers = (v) => { setUsers(v); store.saveUsers(v); };
  const persistEmployees = (v) => { setEmployees(v); store.saveEmployees(v); };
  const persistAttendance = (v) => { setAttendance(v); store.saveAttendance(v); };
  const persistLeaves = (v) => { setLeaves(v); store.saveLeaves(v); };

  const updateEmployee = (updated) => persistEmployees(employees.map((e) => (e.id === updated.id ? updated : e)));
  const addAttendance = (rec) => persistAttendance([...attendance, rec]);
  const addLeave = (rec) => persistLeaves([...leaves, rec]);

  const handleRegister = (newUser) => {
    persistUsers([...users, newUser]);
    // Employees who register also get an employee profile record so Admin can see/manage them
    if (newUser.role === "Employee" && !employees.some((e) => e.id === newUser.empId)) {
      persistEmployees([
        ...employees,
        { id: newUser.empId, name: newUser.name, email: newUser.email, designation: "New Hire", dept: "Unassigned", phone: "", address: "", salary: 0, joined: new Date().toISOString().slice(0, 10) },
      ]);
    }
  };

  if (!user) {
    return screen === "signin"
      ? <SignIn users={users} onLogin={(u) => { setUser(u); setActive("dashboard"); }} goSignUp={() => setScreen("signup")} />
      : <SignUp users={users} onRegister={handleRegister} goSignIn={() => setScreen("signin")} />;
  }

  const logout = () => { setUser(null); setScreen("signin"); };

  if (user.role === "Employee") {
    const employee = employees.find((e) => e.id === user.empId) || employees[0];
    const myLeaves = leaves.filter((l) => l.empId === user.empId);
    const tabs = [
      { key: "dashboard", label: "Dashboard" },
      { key: "profile", label: "Profile" },
      { key: "attendance", label: "Attendance" },
      { key: "leave", label: "Leave Requests" },
      { key: "payroll", label: "Payroll" },
    ];
    return (
      <Shell user={user} onLogout={logout} active={active} setActive={setActive} tabs={tabs}>
        {active === "dashboard" && <EmployeeDashboard user={user} setActive={setActive} myLeaves={myLeaves} />}
        {active === "profile" && <ProfilePage employee={employee} updateEmployee={updateEmployee} />}
        {active === "attendance" && <AttendancePage empId={user.empId} attendance={attendance} addAttendance={addAttendance} />}
        {active === "leave" && <ApplyLeavePage user={user} leaves={leaves} addLeave={addLeave} />}
        {active === "payroll" && <PayrollView employee={employee} />}
      </Shell>
    );
  }

  // Admin
  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "attendance", label: "Attendance" },
    { key: "leave", label: "Leave Approvals" },
    { key: "payroll", label: "Payroll Control" },
  ];
  return (
    <Shell user={user} onLogout={logout} active={active} setActive={setActive} tabs={tabs}>
      {active === "dashboard" && <AdminDashboard employees={employees} leaves={leaves} attendance={attendance} />}
      {active === "attendance" && <AdminAttendance attendance={attendance} employees={employees} />}
      {active === "leave" && <AdminLeaveApproval leaves={leaves} setLeaves={persistLeaves} />}
      {active === "payroll" && <AdminPayroll employees={employees} updateEmployee={updateEmployee} />}
    </Shell>
  );
}
