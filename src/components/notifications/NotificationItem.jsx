import React from "react";
import { formatDistanceToNow } from "date-fns";
import { CircleCheck, ClipboardList, Info, CalendarDays, Clock, LogOut, Coffee } from "lucide-react";
import styles from "./Notifications.module.css";
import { useNavigate } from "react-router-dom";

const NotificationItem = ({ notification, onRead }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.stopPropagation();
        onRead(notification.id);

        const userRole = localStorage.getItem("userRole");
        const isAdmin = userRole === "admin" || userRole === "super_admin";

        // Navigate based on entity type and user role
        if (notification.entity_type === "task") {
            if (isAdmin) {
                navigate('/create-task');
            } else {
                navigate('/member');
            }
        } else if (notification.entity_type === "leave") {
            if (isAdmin) {
                navigate('/team-management?tab=leave');
            } else {
                navigate('/leave');
            }
        } else if (notification.entity_type === "attendance") {
            if (isAdmin) {
                navigate('/attendance');
            } else {
                navigate('/my-attendance');
            }
        }
    };

    const getIcon = () => {
        switch (notification.type) {
            case "TASK_ASSIGNED":
                return <ClipboardList size={16} />;
            case "TASK_STATUS_CHANGED":
                return <CircleCheck size={16} />;
            case "LEAVE_APPLIED":
                return <CalendarDays size={16} />;
            case "CHECK_IN":
                return <Clock size={16} />;
            case "CHECK_OUT":
                return <LogOut size={16} />;
            case "BREAK_START":
            case "BREAK_END":
                return <Coffee size={16} />;
            default:
                return <Info size={16} />;
        }
    };

    const getIconClass = () => {
        switch (notification.type) {
            case "TASK_ASSIGNED":
                return styles.iconTask;
            case "TASK_STATUS_CHANGED":
            case "CHECK_IN":
            case "CHECK_OUT":
                return styles.iconStatus;
            case "LEAVE_APPLIED":
                return styles.iconLeave;
            case "BREAK_START":
            case "BREAK_END":
                return styles.iconWarning;
            default:
                return "";
        }
    };

    return (
        <div
            className={`${styles.item} ${!notification.is_read ? styles.itemUnread : ""}`}
            onClick={handleClick}
        >
            <div className={`${styles.iconWrapper} ${getIconClass()}`}>
                {getIcon()}
            </div>

            <div className={styles.content}>
                <h4 className={styles.itemTitle}>{notification.title}</h4>
                <p className={styles.itemMessage}>{notification.message}</p>
                <span className={styles.itemTime}>
                    {/* ✅ Fix: Ensure UTC parsing by appending Z if missing to avoid "5 hours ago" timezone offsets */}
                    {notification.created_at ? formatDistanceToNow(new Date(notification.created_at.endsWith("Z") ? notification.created_at : notification.created_at + "Z"), { addSuffix: true }) : "just now"}
                </span>
            </div>

            {!notification.is_read && <div className={styles.unreadDot} />}
        </div>
    );
};

export default NotificationItem;
