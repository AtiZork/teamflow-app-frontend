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
import Leave from './pages/Leave';
import LandingPage from './pages/LandingPage';

import PlansPage from './pages/PlansPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import AdminNotifications from './pages/AdminNotifications';
import SalesMarketing from './pages/SalesMarketing';


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

const ADMIN_ROLES = ["super_admin", "admin"];

// =========================================
// ✅ Protected Route Component
// =========================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");

  if (loading) return <div>Loading...</div>;

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const fallback = ADMIN_ROLES.includes(user?.role) ? "/admin" : "/member";
    return <Navigate to={fallback} replace />;
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
        <Route path="/accept-invitation" element={<AcceptInvitation />} />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/member" element={
          <ProtectedRoute>
            <MemberDashboard />
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <CreateProjects />
          </ProtectedRoute>
        } />
        <Route path="/create-task" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <CreateTasks />
          </ProtectedRoute>
        } />
        <Route path="/invite-user" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <InviteUser />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <HelpSupport />
          </ProtectedRoute>
        } />
        <Route path="/timesheet" element={
          <ProtectedRoute>
            <TimeSheet />
          </ProtectedRoute>
        } />

        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <ManagerAttendance />
          </ProtectedRoute>
        } />

        <Route path="/team-management" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <TeamManagement />
          </ProtectedRoute>
        } />

        <Route path="/admin/notifications" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <AdminNotifications />
          </ProtectedRoute>
        } />

        <Route path="/my-attendance" element={
          <ProtectedRoute>
            <CheckInOut />
          </ProtectedRoute>
        } />

        <Route path="/check-in-out" element={
          <ProtectedRoute>
            <CheckInOut />
          </ProtectedRoute>
        } />
        <Route path="/leave" element={
          <ProtectedRoute>
            <Leave />
          </ProtectedRoute>
        } />

        <Route path="/sales-marketing" element={
          <ProtectedRoute>
            <SalesMarketing />
          </ProtectedRoute>
        } />

        <Route path="/plans" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <PlansPage />
          </ProtectedRoute>
        } />
        <Route path="/payment/success" element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        <Route path="/payment/cancel" element={
          <ProtectedRoute>
            <PaymentCancel />
          </ProtectedRoute>
        } />

        <Route path="/unauthorized" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
