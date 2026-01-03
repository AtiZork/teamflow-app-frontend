
// src/pages/AdminDashboard.jsx
import Layout from "../components/layout/Layout";
import Header from "../components/layout/Header.jsx";
import MembersList from "../components/dashboard/MembersList";
import SearchBlock from "../components/search/SearchBlock";
import SearchResultsBlock from "../components/search/SearchResults.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getProjects } from "../api/projects.js";
import { getTasks } from "../api/tasks.js";
import { getOrganizationMembers } from "../api/users.js";
import { searchTasks } from "../api/tasks.js";
import "../styles/AdminDashboard.module.css";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    projects: 0,
    members: 0,
    tasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);


  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");

    if (role !== "admin" && role !== "super_admin") {
      toast.error("Access denied");
      nav("/login");
      return;
    }

    setUserName(name || "Admin");
    loadDashboardStats();

    // Reset search results when component mounts (page refresh/navigation)
    setShowSearchResults(false);
    setSearchResults([]);

  }, [nav]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      const [projectsData, tasksData, membersData] = await Promise.all([
        getProjects(),
        getTasks(),
        getOrganizationMembers(),
      ]);

      const projectCount = Array.isArray(projectsData) ? projectsData.length : 0;
      const taskCount = Array.isArray(tasksData) ? tasksData.length : 0;
      const completedTaskCount = Array.isArray(tasksData)
        ? tasksData.filter((task) => task.status?.toLowerCase() === "done" || task.status?.toLowerCase() === "completed").length
        : 0;
      const memberCount = Array.isArray(membersData) ? membersData.length : 0;

      setStats({
        projects: projectCount,
        members: memberCount,
        tasks: taskCount,
        completedTasks: completedTaskCount,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      toast.error(error.message || "Failed to load dashboard stats");
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

  const handleSearch = async (searchData) => {
    console.log("Search initiated with:", searchData);

    setSearchLoading(true);
    setShowSearchResults(true);

    try {
      // Remove empty values before sending to API
      const apiFilters = Object.fromEntries(
        Object.entries(searchData).filter(([_, value]) => value !== '')
      );

      console.log('📤 Sending API filters:', apiFilters);
      const results = await searchTasks(apiFilters);
      console.log('📥 Received results:', results);

      setSearchResults(results);


      toast.success(`Found ${results.length} results`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.message || 'Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
    setSearchResults([]);

    toast.success("Search results closed");
  };

  return (
    <Layout>
      <Header
        title="Admin Dashboard"
        subtitle={`Welcome, ${userName}! Manage your organization and projects.`}
        showSuperAdminBadge={localStorage.getItem("userRole") === "super_admin"}
      />

      <div className="admin-dashboard-content">
        {/* Search Block - Always visible */}
        <div className="dashboard-block">
          <SearchBlock onSubmit={handleSearch} loading={searchLoading} />
        </div>

        {/* Conditional Rendering: Search Results OR Normal Dashboard Blocks */}
        {showSearchResults ? (
          /* Search Results Block - Only shown when searching */
          <div className="dashboard-block">
            <SearchResultsBlock
              searchResults={searchResults}
              onClose={handleCloseSearchResults}
            />
          </div>
        ) : (
          /* Normal Dashboard Blocks - Shown when not searching */
          <>
            {/* Stats Grid Block */}
            <div className="dashboard-block">
              {loading ? (
                <div className="loading">Loading dashboard statistics...</div>
              ) : (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon projects">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          ></path>
                        </svg>
                      </div>
                      <div className="stat-content">
                        <h3>{stats.projects}</h3>
                        <p>Projects</p>
                      </div>
                    </div>
                    <div className="stat-footer">Active projects in your organization</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon members">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          ></path>
                        </svg>
                      </div>
                      <div className="stat-content">
                        <h3>{stats.members}</h3>
                        <p>Team Members</p>
                      </div>
                    </div>
                    <div className="stat-footer">Members in your organization</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon tasks">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          ></path>
                        </svg>
                      </div>
                      <div className="stat-content">
                        <h3>{stats.tasks}</h3>
                        <p>Total Tasks</p>
                      </div>
                    </div>
                    <div className="stat-footer">Tasks across all projects</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon completed">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      </div>
                      <div className="stat-content">
                        <h3>{stats.completedTasks}</h3>
                        <p>Completed</p>
                      </div>
                    </div>
                    <div className="stat-footer">Tasks finished this period</div>
                  </div>
                </div>
              )}
            </div>

            {/* Members List Block */}
            <div className="dashboard-block">
              <MembersList />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}