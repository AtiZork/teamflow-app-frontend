// // src/components/Sidebar.jsx
// import { useNavigate, useLocation } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { useAuth } from "../../hooks/useAuth";
// import "../../styles/Sidebar.module.css";
// import "../../styles/ProfileMenu.css";
// import {
//     FiHome,
//     FiFolder,
//     FiCheckSquare,
//     FiBarChart2,
//     FiUsers,
//     FiMenu,
//     FiX,
//     FiClock,
//     FiLogIn,
//     FiCalendar
// } from "react-icons/fi";

// import ProfileMenu from "../profile/ProfileMenu";

// export default function Sidebar() {
//     const nav = useNavigate();
//     const location = useLocation();
//     const { user } = useAuth();
//     const [isMobileOpen, setIsMobileOpen] = useState(false);

//     const userRole = user?.role || localStorage.getItem("userRole") || "";

//     const isActive = (path) => (location.pathname === path ? "active" : "");
//     const isAdminUser = userRole === "admin" || userRole === "super_admin";

//     const closeMobileSidebar = () => {
//         setIsMobileOpen(false);
//     };

//     const toggleMobileSidebar = () => {
//         setIsMobileOpen(!isMobileOpen);
//     };

//     return (
//         <>
//             {/* Mobile Header */}
//             <header className="mobile-header">
//                 <div className="mobile-header-left">
//                     <button
//                         className="mobile-menu-toggle"
//                         onClick={toggleMobileSidebar}
//                     >
//                         {isMobileOpen ? <FiX /> : <FiMenu />}
//                     </button>
//                     <div>
//                         <div className="mobile-header-logo">TeamFlow</div>
//                         <div className="mobile-header-tagline">
//                             {isAdminUser ? "Admin Panel" : "Member Panel"}
//                         </div>
//                     </div>
//                 </div>
//                 <ProfileMenu />
//             </header>

//             {/* Overlay for mobile */}
//             <div
//                 className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
//                 onClick={closeMobileSidebar}
//             ></div>

//             <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
//                 <div className="sidebar-header">
//                     <h2 className="logo">TeamFlow</h2>
//                     <p className="tagline">
//                         {isAdminUser ? "Admin Panel" : "Member Panel"}
//                     </p>
//                 </div>

//                 <nav className="sidebar-nav">
//                     {isAdminUser ? (
//                         <>
//                             <button
//                                 className={`sidebar-btn ${isActive("/admin")}`}
//                                 onClick={() => { nav("/admin"); closeMobileSidebar(); }}
//                             >
//                                 <FiHome className="sidebar-icon" />
//                                 <span className="sidebar-text">Dashboard</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/attendance")}`}
//                                 onClick={() => { nav("/attendance"); closeMobileSidebar(); }}
//                             >
//                                 <FiUsers className="sidebar-icon" />
//                                 <span className="sidebar-text">Team Attendance</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/my-attendance")}`}
//                                 onClick={() => { nav("/my-attendance"); closeMobileSidebar(); }}
//                             >
//                                 <FiLogIn className="sidebar-icon" />
//                                 <span className="sidebar-text">Check In/Out</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/projects")}`}
//                                 onClick={() => { nav("/projects"); closeMobileSidebar(); }}
//                             >
//                                 <FiFolder className="sidebar-icon" />
//                                 <span className="sidebar-text">Projects</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/create-task")}`}
//                                 onClick={() => { nav("/create-task"); closeMobileSidebar(); }}
//                             >
//                                 <FiCheckSquare className="sidebar-icon" />
//                                 <span className="sidebar-text">Tasks</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/timesheet")}`}
//                                 onClick={() => { nav("/timesheet"); closeMobileSidebar(); }}
//                             >
//                                 <FiClock className="sidebar-icon" />
//                                 <span className="sidebar-text">Time Sheet</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/leave")}`}
//                                 onClick={() => { nav("/leave"); closeMobileSidebar(); }}
//                             >
//                                 <FiCalendar className="sidebar-icon" />
//                                 <span className="sidebar-text">Leave</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/invite-user")}`}
//                                 onClick={() => { nav("/invite-user"); closeMobileSidebar(); }}
//                             >
//                                 <FiUsers className="sidebar-icon" />
//                                 <span className="sidebar-text">Invite Users</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/reports")}`}
//                                 onClick={() => { nav("/reports"); closeMobileSidebar(); }}
//                             >
//                                 <FiBarChart2 className="sidebar-icon" />
//                                 <span className="sidebar-text">Reports</span>
//                             </button>
//                         </>
//                     ) : (
//                         <>
//                             <button
//                                 className={`sidebar-btn ${isActive("/member")}`}
//                                 onClick={() => { nav("/member"); closeMobileSidebar(); }}
//                             >
//                                 <FiHome className="sidebar-icon" />
//                                 <span className="sidebar-text">Dashboard</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/my-attendance")}`}
//                                 onClick={() => { nav("/my-attendance"); closeMobileSidebar(); }}
//                             >
//                                 <FiLogIn className="sidebar-icon" />
//                                 <span className="sidebar-text">My Attendance</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/timesheet")}`}
//                                 onClick={() => { nav("/timesheet"); closeMobileSidebar(); }}
//                             >
//                                 <FiClock className="sidebar-icon" />
//                                 <span className="sidebar-text">Time Sheet</span>
//                             </button>

//                             <button
//                                 className={`sidebar-btn ${isActive("/leave")}`}
//                                 onClick={() => { nav("/leave"); closeMobileSidebar(); }}
//                             >
//                                 <FiCalendar className="sidebar-icon" />
//                                 <span className="sidebar-text">Leave</span>
//                             </button>
//                         </>
//                     )}

//                     <div className="sidebar-divider"></div>
//                 </nav>

//                 {/* Updated Footer with Profile Icon */}
//                 <div className="sidebar-footer">
//                     <div className="flex items-center justify-center py-4 border-t border-slate-700">
//                         <ProfileMenu />
//                     </div>
//                 </div>
//             </aside>
//         </>
//     );
// }



















import React, { useState, createContext, useContext, useEffect } from 'react';

// Create context for sidebar state
const SidebarContext = createContext();

// Provider component
export const SidebarProvider = ({ children }) => {
  // Initialize theme from localStorage, default to false (light mode)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('sidebarTheme');
    return saved === 'dark';
  });

  const [activeItem, setActiveItem] = useState('Dashboard');

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  // Persist theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isDarkMode,
      activeItem,
      toggleSidebar,
      toggleTheme,
      setActiveItem
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook for sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

// Main Sidebar Component
import styles from "../../styles/Sidebar.module.css";
import SidebarContent from "./SidebarContent";

const SidebarInner = () => {
  const { isCollapsed, isDarkMode } = useSidebar();

  return (
    <aside className={`${styles.sidebarContainer} ${isDarkMode ? styles.darkMode : styles.lightMode} ${isCollapsed ? styles.collapsed : styles.expanded}`}>
      <SidebarContent />
    </aside>
  );
};

const Sidebar = () => {
  return (
    <SidebarProvider>
      <SidebarInner />
    </SidebarProvider>
  );
};

export default Sidebar;