// src/components/DashboardStats.jsx
import { useState, useEffect } from "react";
import { getProjects } from "../../api/projects.js";
import { getCurrentUser } from "../../api/auth.js";
import { getAllUsers } from "../../api/users.js"
import { getTasks } from "../../api/tasks.js";
import toast from "react-hot-toast";

export default function DashboardStats() {
    const [stats, setStats] = useState({
        projects: 0,
        members: 0,
        tasks: 0,
        completedTasks: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check if user is authenticated
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                // Fetch data that the current user can access
                const [currentUser, projectsData, tasksData] = await Promise.all([
                    getAllUsers().catch(err => {
                        console.error("Current user fetch error:", err);
                        return null;
                    }),
                    getProjects().catch(err => {
                        console.error("Projects fetch error:", err);
                        return [];
                    }),
                    getTasks().catch(err => {
                        console.error("Tasks fetch error:", err);
                        return [];
                    }),
                ]);

                // Determine if user is admin
                const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";

                // Count projects
                const projectCount = Array.isArray(projectsData) ? projectsData.length : 0;

                // For members, show 1 (themselves), for admins show all members
                let memberCount = 1; // Default to 1 (current user)
                if (isAdmin) {
                    // Try to get all users if admin (but handle 403 gracefully)
                    try {
                        const usersModule = await import("../../api/users.js");
                        const usersData = await usersModule.getAllUsers().catch(() => []); // ✅ Use getAllUsers function
                        memberCount = Array.isArray(usersData)
                            ? usersData.filter((user) => user.role === "member").length
                            : 1;
                    } catch (usersError) {
                        console.warn("Could not fetch all users, using default count");
                        memberCount = 1;
                    }
                }

                // Count tasks
                const taskCount = Array.isArray(tasksData) ? tasksData.length : 0;

                // Count completed tasks
                const completedTaskCount = Array.isArray(tasksData)
                    ? tasksData.filter(task => task.status === 'Done').length
                    : 0;

                setStats({
                    projects: projectCount,
                    members: memberCount,
                    tasks: taskCount,
                    completedTasks: completedTaskCount,
                });

            } catch (error) {
                console.error("Failed to load dashboard stats:", error);
                setError(error.message);

                // More specific error messages
                if (error.message.includes("401") || error.message.includes("Unauthorized")) {
                    toast.error("Authentication expired. Please log in again.");
                } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
                    // This is expected for members trying to access admin endpoints
                    console.log("User doesn't have admin permissions (this is normal for members)");
                } else if (error.message.includes("token")) {
                    toast.error("Authentication error. Please log in again.");
                } else {
                    console.error("Dashboard stats error:", error.message);
                }

                // Reset to 0 on error
                setStats({
                    projects: 0,
                    members: 0,
                    tasks: 0,
                    completedTasks: 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Set up polling for real-time updates (but less frequently)
        const interval = setInterval(() => {
            fetchStats();
        }, 60000); // Poll every minute

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="rounded-full bg-blue-100 p-3 mr-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Projects</p>
                        <p className="text-2xl font-bold">{stats.projects}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="rounded-full bg-green-100 p-3 mr-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Team Members</p>
                        <p className="text-2xl font-bold">{stats.members}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="rounded-full bg-yellow-100 p-3 mr-4">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Tasks</p>
                        <p className="text-2xl font-bold">{stats.tasks}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="rounded-full bg-purple-100 p-3 mr-4">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Completed</p>
                        <p className="text-2xl font-bold">{stats.completedTasks}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
