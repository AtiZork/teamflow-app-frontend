// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getCurrentUser } from "../api/auth";
import { getMySubscription } from "../api/payment";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("🔑 No token found — user not authenticated");
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Checking authentication status...");
      const userData = await getCurrentUser();

      if (userData) {
        console.log("✅ Authenticated user:", userData);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        // ✅ ENHANCED: Ensure role is properly stored for ProfileMenu access
        if (userData.role) {
          localStorage.setItem("userRole", userData.role);
        }

        if (userData.full_name) {
          localStorage.setItem("userName", userData.full_name);
        }

        if (userData.email) {
          localStorage.setItem("userEmail", userData.email);
        }

        if (userData.organization_id) {
          localStorage.setItem("organizationId", userData.organization_id);
        }

        // 🔄 Also refresh subscription on app load
        try {
          const sub = await getMySubscription();
          if (sub) localStorage.setItem("subscription", JSON.stringify(sub));
        } catch (e) {
          console.warn("⚠️ Could not refresh subscription info:", e);
        }
      } else {
        console.warn("⚠️ No user data returned from getCurrentUser()");
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);

      if (
        (error?.response?.status === 401) ||
        (error?.status === 401) ||
        (error?.status === 403 && error.message?.includes("Invalid token"))
      ) {
        // Preserve sidebar settings
        const theme = localStorage.getItem('sidebarTheme');
        const collapsed = localStorage.getItem('sidebarCollapsed');

        localStorage.clear();

        // Restore sidebar settings
        if (theme) localStorage.setItem('sidebarTheme', theme);
        if (collapsed) localStorage.setItem('sidebarCollapsed', collapsed);

        setUser(null);
        toast.error("Session expired, please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (loginResponse) => {
    if (!loginResponse) {
      console.error("Login failed: empty response");
      toast.error("Login failed: no server response.");
      return;
    }

    const access_token =
      loginResponse.access_token ?? loginResponse.token ?? null;
    const userObj = loginResponse.user ?? loginResponse.data ?? null;

    if (!userObj) {
      console.error("Login failed: user data missing", loginResponse);
      toast.error("Login failed: invalid response format.");
      return;
    }

    if (access_token) localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(userObj));

    // ✅ ENHANCED: Ensure all user data is properly stored
    localStorage.setItem(
      "userName",
      userObj.full_name ?? userObj.name ?? userObj.email?.split("@")[0] ?? "User"
    );

    if (userObj.role) {
      localStorage.setItem("userRole", userObj.role);
    }

    if (userObj.email) {
      localStorage.setItem("userEmail", userObj.email);
    }

    if (userObj.organization_id) {
      localStorage.setItem("organizationId", userObj.organization_id);
    }

    // 🔄 Fetch user's current subscription after login
    (async () => {
      try {
        const sub = await getMySubscription();
        if (sub) {
          console.log("✅ Active subscription after login:", sub);
          localStorage.setItem("subscription", JSON.stringify(sub));
        } else {
          console.warn("⚠️ No active subscription found after login");
          localStorage.removeItem("subscription");
        }
      } catch (e) {
        console.error("❌ Failed to fetch subscription:", e);
      }
    })();

    setUser(userObj);
  };

  const logout = () => {
    console.log("🚪 Logging out...");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("organizationId");
  };

  const isSuperAdmin = () => user?.role === "super_admin";
  const isAdmin = () => ["admin", "super_admin"].includes(user?.role);
  const isMember = () => user?.role === "member";
  const isAuthenticated = () => !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        isMember,
      }}
    >
      {loading ? (
        <div className="loading-screen">
          <p>Authenticating...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};