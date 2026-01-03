import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Header from "../components/layout/Header";
import { getMyNotifications, markNotificationAsRead } from "../api/notifications";
import NotificationItem from "../components/notifications/NotificationItem";
import { BellOff } from "lucide-react";
import styles from "./AdminNotifications.module.css";

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            // Fetch more items for the full page view
            const data = await getMyNotifications(100, 0);
            if (data && Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ));
        await markNotificationAsRead(id);
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "all") return true;
        if (filter === "task") return n.entity_type === "task";
        if (filter === "leave") return n.entity_type === "leave";
        if (filter === "attendance") return n.entity_type === "attendance";
        return true;
    });

    return (
        <Layout>
            <Header
                title="Team Activity Notifications"
                subtitle="Detailed log of all automated team events and updates."
            />

            <div className={styles.container}>
                <div className={styles.card}>
                    {/* Filter Tabs */}
                    <div className={styles.filterBar}>
                        <button
                            onClick={() => setFilter("all")}
                            className={`${styles.tab} ${filter === "all" ? styles.tabActive : styles.tabInactive}`}
                        >
                            All Activity
                        </button>
                        <button
                            onClick={() => setFilter("leave")}
                            className={`${styles.tab} ${filter === "leave" ? styles.tabActive : styles.tabInactive}`}
                        >
                            Leaves
                        </button>
                        <button
                            onClick={() => setFilter("attendance")}
                            className={`${styles.tab} ${filter === "attendance" ? styles.tabActive : styles.tabInactive}`}
                        >
                            Attendance
                        </button>
                        <button
                            onClick={() => setFilter("task")}
                            className={`${styles.tab} ${filter === "task" ? styles.tabActive : styles.tabInactive}`}
                        >
                            Tasks
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className={styles.content}>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className="animate-pulse">Loading activity history...</div>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className={styles.empty}>
                                <BellOff size={48} className={styles.emptyIcon} strokeWidth={1.5} />
                                <p>No notifications found matching this filter.</p>
                            </div>
                        ) : (
                            <div className={styles.list}>
                                {filteredNotifications.map(notification => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onRead={handleMarkAsRead}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
