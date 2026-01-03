// src/components/ProtectedRoute.jsx - NEW COMPONENT
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !(user.role === "admin" || user.role === "super_admin")) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}
