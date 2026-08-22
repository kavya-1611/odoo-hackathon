import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeAttendance from "./pages/employee/Attendance";
import EmployeeLeave from "./pages/employee/Leave";
import EmployeePayroll from "./pages/employee/Payroll";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminEmployees from "./pages/admin/Employees";
import AdminAttendance from "./pages/admin/Attendance";
import AdminLeaveApprovals from "./pages/admin/LeaveApprovals";
import AdminPayroll from "./pages/admin/Payroll";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin" : "/employee"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Employee routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN"]}>
            <EmployeeProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN"]}>
            <EmployeeAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/leave"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN"]}>
            <EmployeeLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/payroll"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN"]}>
            <EmployeePayroll />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminEmployees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leave-approvals"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLeaveApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payroll"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminPayroll />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
