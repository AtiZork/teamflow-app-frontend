// src/api/taskExtras.js 
import { API_URL } from "../config/apiConfig";

function authHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("⚠️ No token found in localStorage");
    throw new Error("No token found");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* --------------------  TASK COMMENTS  -------------------- */
export async function fetchTaskComments(taskId) {
  try {
    const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      if (res.status === 401) {
        const theme = localStorage.getItem('sidebarTheme');
        const collapsed = localStorage.getItem('sidebarCollapsed');
        localStorage.clear();
        if (theme) localStorage.setItem('sidebarTheme', theme);
        if (collapsed) localStorage.setItem('sidebarCollapsed', collapsed);
        window.location.href = "/login";
      }
      const result = await res.json();
      return { ok: false, error: result.detail || "Failed to fetch comments" };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message || "Failed to fetch comments" };
  }
}

export async function postTaskComment(taskId, message) {
  try {
    const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        const theme = localStorage.getItem('sidebarTheme');
        const collapsed = localStorage.getItem('sidebarCollapsed');
        localStorage.clear();
        if (theme) localStorage.setItem('sidebarTheme', theme);
        if (collapsed) localStorage.setItem('sidebarCollapsed', collapsed);
        window.location.href = "/login";
      }
      const result = await res.json();
      return { ok: false, error: result.detail || "Failed to post comment" };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message || "Failed to post comment" };
  }
}

/* --------------------  TASK WORK LOGS  -------------------- */
export async function fetchTaskWorkLogs(taskId) {
  try {
    const res = await fetch(`${API_URL}/tasks/${taskId}/worklogs`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      if (res.status === 401) {
        const theme = localStorage.getItem('sidebarTheme');
        const collapsed = localStorage.getItem('sidebarCollapsed');
        localStorage.clear();
        if (theme) localStorage.setItem('sidebarTheme', theme);
        if (collapsed) localStorage.setItem('sidebarCollapsed', collapsed);
        window.location.href = "/login";
      }
      const result = await res.json();
      return { ok: false, error: result.detail || "Failed to fetch work logs" };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message || "Failed to fetch work logs" };
  }
}

export async function postTaskWorkLog(taskId, logData) {
  try {
    const payload = {
      hours: parseFloat(logData.hours),
      description: logData.description || "",
    };

    // Handle date - only include if provided and valid
    if (logData.date && logData.date !== "") {
      const dateObj = new Date(logData.date);
      if (!isNaN(dateObj.getTime())) {
        payload.date = dateObj.toISOString();
      }
    }

    console.log("📤 Sending worklog payload:", payload);

    const res = await fetch(`${API_URL}/tasks/${taskId}/worklogs`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("❌ Worklog API Error Details:", result);

      let errorMessage = 'Failed to log work';
      if (result && typeof result === 'object') {
        if (Array.isArray(result.detail)) {
          errorMessage = result.detail.map(err => {
            const field = err.loc?.join('.') || 'unknown';
            return `${field}: ${err.msg}`;
          }).join(', ');
        } else if (result.detail) {
          errorMessage = result.detail;
        } else {
          errorMessage = JSON.stringify(result);
        }
      }

      if (res.status === 401) {
        const theme = localStorage.getItem('sidebarTheme');
        const collapsed = localStorage.getItem('sidebarCollapsed');
        localStorage.clear();
        if (theme) localStorage.setItem('sidebarTheme', theme);
        if (collapsed) localStorage.setItem('sidebarCollapsed', collapsed);
        window.location.href = "/login";
      }

      return { ok: false, error: errorMessage };
    }

    return { ok: true, data: result };
  } catch (error) {
    console.error("❌ Worklog fetch error:", error);
    return { ok: false, error: error.message || "Failed to log work" };
  }
}

/* --------------------  DELETE TASK WORK LOG  -------------------- */
export async function deleteTaskWorkLog(worklogId) {
  try {
    // ✅ FIXED: Correct endpoint path
    const res = await fetch(`${API_URL}/tasks/worklogs/${worklogId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) {
      if (res.status === 401) {
        const theme = localStorage.getItem('sidebarTheme');
        const collapsed = localStorage.getItem('sidebarCollapsed');
        localStorage.clear();
        if (theme) localStorage.setItem('sidebarTheme', theme);
        if (collapsed) localStorage.setItem('sidebarCollapsed', collapsed);
        window.location.href = "/login";
      }
      const result = await res.json();
      return { ok: false, error: result.detail || "Failed to delete work log" };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Failed to delete work log" };
  }
}