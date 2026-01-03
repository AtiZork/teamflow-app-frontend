import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { getMyNotifications, markNotificationAsRead } from "../../api/notifications";
import NotificationDropdown from "./NotificationDropdown";
import styles from "./Notifications.module.css";
import { toast } from "react-hot-toast";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Ref to prevent closing when clicking the bell itself
    // (Note: The dropdown has its own "click outside" logic, but we need to coordinate)
    const bellRef = useRef(null);

    // Track IDs we've already seen to avoid duplicate toasts
    const seenIdsRef = useRef(new Set());
    const isInitialLoad = useRef(true);

    const playNotificationSound = (text) => {
        try {
            // 1. Play professional chime
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio play blocked"));

            // 2. Voice the notification (TTS)
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech to avoid overlap confusion
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.9; // Slightly slower for clarity
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                // Fetch voices and try to find a natural one
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v => v.lang.includes('en-US') && (v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Natural')));
                if (preferredVoice) utterance.voice = preferredVoice;

                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error("Audio error:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const data = await getMyNotifications();
            console.log("DEBUG: Fetched notifications:", data?.length);
            if (data && Array.isArray(data)) {
                // Find new unread notifications that appeared since last fetch
                if (!isInitialLoad.current) {
                    const newUnread = data.filter(n => !n.is_read && !seenIdsRef.current.has(n.id));

                    // Show a toast and play sound/voice for each new notification
                    newUnread.forEach((n, index) => {
                        setTimeout(() => {
                            toast(n.message, {
                                icon: '🔔',
                                id: `notif-${n.id}`,
                            });
                            playNotificationSound(n.message);
                        }, index * 2500); // Stagger for clear speech
                    });
                }

                // Update seen IDs
                data.forEach(n => seenIdsRef.current.add(n.id));
                isInitialLoad.current = false;

                setNotifications(data);
                // Calculate unread count
                const count = data.filter(n => !n.is_read).length;
                setUnreadCount(count);
            }
        } catch (error) {
            console.error("Fetch notifications failed:", error);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchNotifications();

        // Poll every 10 seconds for a more responsive real-time feel
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = (e) => {
        setIsOpen((prev) => !prev);
    };

    const handlMarkAsRead = async (id) => {
        // Optimistic update
        const updated = notifications.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        );
        setNotifications(updated);

        // Update badge count
        setUnreadCount(updated.filter(n => !n.is_read).length);

        // API Call
        const success = await markNotificationAsRead(id);
        if (!success) {
            // Revert if failed (optional, but good UX)
            // For now, silently fail or toast
            console.error("Failed to mark as read");
        }
    };

    // Close dropdown handler passed to child
    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div className={styles.bellContainer} ref={bellRef} onClick={toggleDropdown}>
            <Bell className={styles.bellIcon} strokeWidth={2} />

            {unreadCount > 0 && (
                <div key={unreadCount} className={styles.badge}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                </div>
            )}

            {isOpen && (
                <NotificationDropdown
                    notifications={notifications}
                    onMarkAsRead={handlMarkAsRead}
                    onClose={handleClose}
                />
            )}
        </div>
    );
};

export default NotificationBell;
