import React, { useEffect, useRef } from "react";
import styles from "./Notifications.module.css";
import NotificationItem from "./NotificationItem";
import { BellOff } from "lucide-react";

/**
 * Dropdown list of notifications
 */
const NotificationDropdown = ({ notifications, onMarkAsRead, onClose }) => {
    const dropdownRef = useRef(null);

    // Component now relies on Bell parent for outside click management

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <div className={styles.dropdownHeader}>
                <span className={styles.dropdownTitle}>Notifications</span>
                {/* Future feature: Mark all read */}
            </div>

            <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                    <div className={styles.emptyState}>
                        <BellOff size={32} strokeWidth={1.5} />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={onMarkAsRead}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
