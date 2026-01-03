// src/App.jsx

import "./index.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "react-hot-toast";
import axios from "axios";

// 🔹 Pages
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CreateTasks from "./pages/CreateTasks";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import CreateProjects from "./pages/CreateProjects";
import AcceptInvitation from "./pages/AcceptInvitation";
import InviteUser from "./pages/InviteUser";
import Reports from "./pages/Reports";
import ProfilePage from './components/profile/ProfilePage';
import HelpSupport from './pages/HelpSupport';
import TimeSheet from './pages/TimeSheet';
import CheckInOut from './pages/CheckInOut';
import ManagerAttendance from './pages/ManagerAttendance';
import TeamManagement from './pages/TeamManagement';
import Leave from './pages/Leave'; // ✅ Added Leave import
import LandingPage from './pages/LandingPage'; // ✅ Added Landing Page import


import PlansPage from './pages/PlansPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import AdminNotifications from './pages/AdminNotifications'; // ✅ Added Admin Notifications


// =========================================
// ✅ Axios Interceptor for Token Auth
// =========================================
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================================
// ✅ Protected Route Component
// =========================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");

  if (loading) return <div>Loading...</div>;

  if (!token) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/member'} />;
  }

  return children;
};

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            padding: '12px 16px',
            fontSize: '0.875rem',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/member" element={<MemberDashboard />} />
        <Route path="/projects" element={<CreateProjects />} />
        <Route path="/create-task" element={<CreateTasks />} />
        <Route path="/invite-user" element={<InviteUser />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/support" element={<HelpSupport />} />
        <Route path="/timesheet" element={<TimeSheet />} />

        {/* Role-based Attendance Routes */}
        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <ManagerAttendance />
          </ProtectedRoute>
        } />

        {/* Team Management - Admin Only */}
        <Route path="/team-management" element={
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <TeamManagement />
          </ProtectedRoute>
        } />

        {/* Admin Notifications */}
        <Route path="/admin/notifications" element={
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <AdminNotifications />
          </ProtectedRoute>
        } />

        <Route path="/my-attendance" element={
          <ProtectedRoute>
            <CheckInOut />
          </ProtectedRoute>
        } />

        {/* Legacy route alias */}
        <Route path="/check-in-out" element={<CheckInOut />} />
        <Route path="/leave" element={<Leave />} /> {/* ✅ Added Leave route */}

        {/* 🔥 FIX: Update these routes to match Stripe redirect URLs */}
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* 🔹 Default Redirects */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;