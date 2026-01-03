// src/context/DashboardContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getProjects } from "../api/projects";
import { getTasks } from "../api/tasks";
import { getOrganizationMembers } from "../api/getMembers";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [dashboardData, setDashboardData] = useState({
    projects: 0,
    tasks: 0,
    completedTasks: 0,
    members: 0,
  });

  const [loading, setLoading] = useState(false);

  // ✅ useCallback ensures same function reference — no re-renders loop
  const refreshDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [projects, tasks, members] = await Promise.all([
        getProjects(),
        getTasks(),
        getOrganizationMembers(),
      ]);

      setDashboardData({
        projects: projects?.length || 0,
        tasks: tasks?.length || 0,
        completedTasks: tasks?.filter(t => t.status === "Done")?.length || 0,
        members: members?.length || 0,
      });
    } catch (err) {
      console.error("Dashboard refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ no dependencies — stable

  // ✅ Run once when the app loads
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return (
    <DashboardContext.Provider value={{ dashboardData, refreshDashboard, loading }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

