import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiHelpCircle,
  FiLogOut,
  FiChevronDown,
  FiCreditCard,
  FiSettings
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useSidebar } from "../layout/Sidebar";
import styles from "../../styles/ProfileMenu.module.css";

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    initials: "",
    role: "",
    isSuperAdmin: false
  });
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Safely get sidebar context - may be undefined if used outside SidebarProvider
  let isCollapsed = false;
  let isDarkMode = false;

  try {
    const sidebarContext = useSidebar();
    isCollapsed = sidebarContext?.isCollapsed || false;
    isDarkMode = sidebarContext?.isDarkMode || false;
  } catch (error) {
    // ProfileMenu is being used outside of SidebarProvider, use defaults
    console.log('ProfileMenu used outside SidebarProvider, using default values');
  }

  // Get user data from localStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const userObj = storedUser ? JSON.parse(storedUser) : {};

        const userRole = userObj.role || localStorage.getItem("userRole") || "";
        const userName = userObj.full_name || userObj.name || localStorage.getItem("userName") || "User";
        const userEmail = userObj.email || localStorage.getItem("userEmail") || "user@example.com";

        // Strict check - only "super_admin" can see Upgrade Plan
        const isSuperAdmin = userRole === "super_admin";

        // Generate initials from full name
        const getInitials = (name) => {
          if (!name) return "U";
          return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
        };

        setUserData({
          fullName: userName,
          email: userEmail,
          initials: getInitials(userName),
          role: userRole || "User",
          isSuperAdmin: isSuperAdmin
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserData({
          fullName: "User",
          email: "user@example.com",
          initials: "U",
          role: "User",
          isSuperAdmin: false
        });
      }
    };

    getUserData();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  const handleUpgradeClick = () => {
    navigate("/plans");
    setIsOpen(false);
  };

  const handleHelpClick = () => {
    navigate("/support");
    setIsOpen(false);
  };

  const handleLogout = () => {
    // Preserve sidebar settings
    const theme = localStorage.getItem('sidebarTheme');
    const collapsed = localStorage.getItem('sidebarCollapsed');

    // Clear all data
    localStorage.clear();

    // Restore sidebar settings if they existed
    if (theme) localStorage.setItem('sidebarTheme', theme);
    if (collapsed) localStorage.setItem('sidebarCollapsed', collapsed);

    toast.success("Logged out successfully");
    navigate("/login");
    setIsOpen(false);
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 }
  };

  return (
    <div className={`${styles.profileMenuContainer} ${isCollapsed ? styles.collapsed : ''} ${isDarkMode ? styles.dark : styles.light}`} ref={menuRef}>
      {/* Profile Button - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.profileButton}
        title={isCollapsed ? userData.fullName : ""}
      >
        <div className={styles.profileAvatar}>
          <span className={styles.avatarInitials}>
            {userData.initials}
          </span>
        </div>

        {!isCollapsed && (
          <>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>{userData.fullName}</div>
              <div className={styles.profileRole}>{userData.role}</div>
            </div>

            <motion.div
              className={styles.profileArrow}
              variants={iconVariants}
              animate={isOpen ? "open" : "closed"}
              transition={{ duration: 0.2 }}
            >
              <FiChevronDown size={16} />
            </motion.div>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.profileDropdown}
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{
              transformOrigin: isCollapsed ? "bottom right" : "bottom left",
              position: 'fixed',
              left: isCollapsed ? '80px' : '260px',
              bottom: '20px',
              zIndex: 1000
            }}
          >
            {/* User Info Header */}
            <div className={styles.dropdownHeader}>
              <div className={styles.userInfo}>
                <div className={styles.dropdownAvatar}>
                  <span className={styles.dropdownInitials}>
                    {userData.initials}
                  </span>
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>{userData.fullName}</div>
                  <div className={styles.userRole}>
                    {userData.role}
                    {userData.isSuperAdmin && (
                      <span className={styles.adminBadge}>Admin</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className={styles.dropdownItems}>
              <button onClick={handleProfileClick} className={styles.dropdownItem}>
                <FiUser size={16} className={styles.itemIcon} />
                <span>Profile Settings</span>
              </button>

              {userData.isSuperAdmin && (
                <button onClick={handleUpgradeClick} className={styles.dropdownItem}>
                  <FiCreditCard size={16} className={styles.itemIcon} />
                  <span>Upgrade Plan</span>
                </button>
              )}

              <button onClick={handleHelpClick} className={styles.dropdownItem}>
                <FiHelpCircle size={16} className={styles.itemIcon} />
                <span>Help & Support</span>
              </button>

              <div className={styles.dropdownDivider}></div>

              <button
                onClick={handleLogout}
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
              >
                <FiLogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}