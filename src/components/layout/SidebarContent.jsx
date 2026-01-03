import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    FiHome,
    FiUsers,
    FiLogIn,
    FiFolder,
    FiCheckSquare,
    FiClock,
    FiCalendar,
    FiBarChart2
} from "react-icons/fi";
import {
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon
} from 'lucide-react';
import styles from '../../styles/Sidebar.module.css';
import { useSidebar } from './Sidebar';
import ProfileMenu from "../profile/ProfileMenu";

const SidebarContent = () => {
    const {
        isCollapsed,
        isDarkMode,
        toggleSidebar,
        toggleTheme
    } = useSidebar();

    const nav = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const userRole = user?.role || localStorage.getItem("userRole") || "";
    const isAdminUser = userRole === "admin" || userRole === "super_admin";

    const isActive = (path) => location.pathname === path;

    const MenuItem = ({ to, icon: Icon, label }) => (
        <div
            className={`${styles.menuItem} ${isActive(to) ? styles.active : ''}`}
            onClick={() => nav(to)}
            title={isCollapsed ? label : ''}
        >
            <div className={styles.menuIcon}>
                <Icon size={20} />
            </div>
            {!isCollapsed && (
                <span className={styles.menuLabel}>{label}</span>
            )}
        </div>
    );

    // Get user initials
    const getUserInitials = () => {
        // Fallback or use real user name if available in user object
        const name = user?.name || "Anna Taylor";
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <>
            {/* Header Section */}
            <div className={styles.header}>
                {!isCollapsed && (
                    <div className={styles.logoSection}>
                        <h1 className={styles.logo}>TeamFlow</h1>
                        <div className={styles.themeToggle} onClick={toggleTheme} title="Toggle theme">
                            <div className={styles.themeToggleInner}>
                                <Sun size={14} className={`${styles.themeIcon} ${styles.sunIcon}`} />
                                <div className={`${styles.toggleSwitch} ${isDarkMode ? styles.dark : styles.light}`}>
                                    <div className={styles.toggleHandle} />
                                </div>
                                <Moon size={14} className={`${styles.themeIcon} ${styles.moonIcon}`} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Collapse Toggle Button */}
                <button
                    className={styles.collapseButton}
                    onClick={toggleSidebar}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation Sections */}
            <nav className={styles.navigation}>
                <div className={styles.menuSection}>
                    {isAdminUser ? (
                        <>
                            <MenuItem to="/admin" icon={FiHome} label="Dashboard" />
                            <MenuItem to="/my-attendance" icon={FiLogIn} label="Check In/Out" />
                            <MenuItem to="/team-management" icon={FiUsers} label="Team Management" />
                            <MenuItem to="/projects" icon={FiFolder} label="Projects" />
                            <MenuItem to="/create-task" icon={FiCheckSquare} label="Tasks" />
                            <MenuItem to="/timesheet" icon={FiClock} label="Time Sheet" />
                            <MenuItem to="/invite-user" icon={FiUsers} label="Invite Users" />
                            <MenuItem to="/leave" icon={FiCalendar} label="Apply Leave" />
                            <MenuItem to="/reports" icon={FiBarChart2} label="Reports" />
                        </>
                    ) : (
                        <>
                            <MenuItem to="/member" icon={FiHome} label="Dashboard" />
                            <MenuItem to="/my-attendance" icon={FiLogIn} label="Check In/Out" />
                            <MenuItem to="/timesheet" icon={FiClock} label="Time Sheet" />
                            <MenuItem to="/leave" icon={FiCalendar} label="Apply Leave" />
                        </>
                    )}
                </div>
            </nav>

            {/* User Profile Section */}
            <div className={styles.profileSection}>
                <ProfileMenu />
            </div>
        </>
    );
};

export default SidebarContent;