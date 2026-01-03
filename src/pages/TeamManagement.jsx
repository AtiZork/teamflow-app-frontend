// src/pages/TeamManagement.jsx
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiUsers,
  FiMail,
  FiCalendar,
  FiClock,
  FiShield,
  FiSearch,
  FiFilter,
  FiUserPlus,
  FiDownload,
  FiBarChart2
} from "react-icons/fi";
import Layout from "../components/layout/Layout";
import Header from "../components/layout/Header";
import TeamOverview from "../components/teams/TeamOverview";
import LeaveManagement from "../components/teams/LeaveManagement";
import AttendanceTracking from "../components/teams/AttendanceTracking";
import PermissionsManager from "../components/teams/PermissionsManager";
import styles from "../styles/TeamManagement.module.css";

const TeamManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get initial tab from query param
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Update tab if query param changes
  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const isAdmin = user.role === "admin" || user.role === "super_admin";
    if (!isAdmin) {
      navigate("/unauthorized");
      return;
    }

    setLoading(false);
  }, [user, navigate]);

  const tabs = [
    {
      id: "overview",
      label: "Team Overview",
      icon: <FiUsers />,
      component: <TeamOverview />
    },
    {
      id: "attendance",
      label: "Attendance Tracking",
      icon: <FiClock />,
      component: <AttendanceTracking />
    },
    {
      id: "leave",
      label: "Leave Management",
      icon: <FiCalendar />,
      component: <LeaveManagement />
    },
    {
      id: "permissions",
      label: "Permissions",
      icon: <FiShield />,
      component: <PermissionsManager />
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading Team Management...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        title="Team Management"
        subtitle="Manage your team members, permissions, and activities"
        actionButtonText={activeTab === "invite" ? "+ Invite Members" : activeTab === "overview" ? "+ Add Member" : ""}
        onActionClick={() => {
          if (activeTab === "overview") {
            navigate("/invite-user");
          }
        }}
      />

      <div className={styles.teamManagementContainer}>
        {/* Tab Navigation */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </Layout>
  );
};

export default TeamManagement;