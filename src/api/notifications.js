import apiClient from "./apiClient";

export const getMyNotifications = async (limit = 20, offset = 0) => {
    try {
        const response = await apiClient.get("/notifications/", {
            params: { limit, offset }
        });
        return response;
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        // Return empty array to avoid crashing UI
        return [];
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        await apiClient.patch(`/notifications/${notificationId}/read`);
        return true;
    } catch (error) {
        console.error(`Failed to mark notification ${notificationId} as read:`, error);
        return false;
    }
};
