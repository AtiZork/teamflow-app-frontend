// // src/api/tasks.js 
import { API_URL } from "../config/apiConfig";

function authHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("⚠️ No token found in localStorage");
    throw new Error("No token found — please log in again");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* --------------------  GET ALL TASKS  -------------------- */
export async function getTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks/`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
        return [];
      }
      const result = await res.json();
      throw new Error(result.detail || "Failed to load tasks");
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("getTasks error:", error);
    throw error;
  }
}

/* --------------------  GET SINGLE TASK  -------------------- */
export async function getTask(id) {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      headers: authHeaders(),
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const result = await res.json();
      throw new Error(result.detail || "Failed to load task");
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("getTask error:", error);
    throw error;
  }
}

/* --------------------  CREATE TASK  -------------------- */
export async function createTask(data) {
  try {
    const taskData = {
      ...data,
    };

    const res = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(taskData),
    });

    const result = await res.json();

    if (!res.ok) {
      let errorMessage = 'Create failed';
      if (typeof result === 'object') {
        if (Array.isArray(result.detail)) errorMessage = result.detail[0].msg;
        else if (result.detail) errorMessage = result.detail;
        else if (result.message) errorMessage = result.message;
        else errorMessage = Object.values(result).join(', ');
      } else {
        errorMessage = result;
      }

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('organizationId');
        window.location.href = '/login';
      }
      throw new Error(errorMessage);
    }
    return result;
  } catch (error) {
    console.error("createTask error:", error);
    throw error;
  }
}

// In tasks.js - Update updateTask function
export async function updateTask(id, data) {
  try {
    if (!id && id !== 0) {
      throw new Error("updateTask: missing task id");
    }

    // Format start_date and due_date if provided
    let start = data?.start_date;
    let due = data?.due_date;
    
    if (start && typeof start === "string" && !start.includes("T")) {
      start = `${start}T00:00:00Z`;
    }
    if (due && typeof due === "string" && !due.includes("T")) {
      due = `${due}T00:00:00Z`;
    }

    // Build body with only allowed keys
    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "start_date",  // ✅ NEW FIELD
      "due_date",
      "project_id",
      "member_ids",
      "allow_member_edit",
    ];
    const body = {};
    for (const k of allowedFields) {
      if (k in data && data[k] !== undefined) body[k] = data[k];
    }
    if (body.start_date) body.start_date = start;
    if (body.due_date) body.due_date = due;

    console.log("🔄 Updating task:", { id, body });

    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let result;
    try { 
      result = text ? JSON.parse(text) : null; 
    } catch { 
      result = text; 
    }

    if (!res.ok) {
      let msg = "Update failed";
      if (result && typeof result === "object") {
        if (Array.isArray(result.detail)) msg = result.detail[0]?.msg || msg;
        else if (result.detail) msg = result.detail;
        else if (result.message) msg = result.message;
        else msg = Object.values(result).join(", ") || msg;
      } else if (result) {
        msg = String(result);
      }

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }

      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("updateTask error:", error);
    throw error;
  }
}

/* --------------------  DELETE TASK  -------------------- */
export async function deleteTask(id) {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) {
      const result = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('organizationId');
        window.location.href = '/login';
      }
      throw new Error(result.detail || 'Delete failed');
    }
    return true;
  } catch (error) {
    console.error("deleteTask error:", error);
    throw error;
  }
}

/* --------------------  UPDATE TASK STATUS ONLY  -------------------- */
export async function updateTaskStatusOnly(id, status) {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
      headers: authHeaders(),
    });

    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      let msg = result.detail || result.message || "Status update failed";
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      throw new Error(msg);
    }
    return res.json();
  } catch (error) {
    console.error("updateTaskStatusOnly error:", error);
    throw error;
  }
}

/* --------------------  ASSIGN MEMBERS TO TASK  -------------------- */
export async function assignMembersToTask(taskId, memberIds) {
  try {
    // ✅ FIXED: Use proper JSON body instead of query params
    const res = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ member_ids: memberIds }),
    });

    const result = await res.json();

    if (!res.ok) {
      let errorMessage = 'Member assignment failed';
      if (typeof result === 'object') {
        if (Array.isArray(result.detail)) errorMessage = result.detail[0].msg;
        else if (result.detail) errorMessage = result.detail;
        else if (result.message) errorMessage = result.message;
        else errorMessage = Object.values(result).join(', ');
      } else {
        errorMessage = result;
      }

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('organizationId');
        window.location.href = '/login';
      }

      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error("assignMembersToTask error:", error);
    throw error;
  }
}

/* --------------------  ADVANCED TASK SEARCH  -------------------- */
export async function searchTasks(filters = {}) {
  try {
    // Remove empty filters and convert dates
    const processedFilters = {};
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] != null) {
        // Convert date fields to ISO strings
        if (key === 'fromDate' || key === 'toDate') {
          if (filters[key]) {
            processedFilters[key] = new Date(filters[key]).toISOString();
          }
        } else {
          processedFilters[key] = filters[key];
        }
      }
    });

    console.log('🔍 Searching tasks with filters:', processedFilters);

    const res = await fetch(`${API_URL}/tasks/search`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(processedFilters),
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('organizationId');
        window.location.href = '/login';
        return [];
      }
      const result = await res.json();
      throw new Error(result.detail || 'Search failed');
    }
    
    const data = await res.json();
    
    // ✅ Optional: Log the new member_names field for verification
    console.log('✅ Search successful. Tasks with member names:', 
      data.map(task => ({
        id: task.id,
        title: task.title,
        member_ids: task.member_ids,
        member_names: task.member_names // ✅ Now available from backend
      }))
    );
    
    return data;
  } catch (error) {
    console.error('searchTasks error:', error);
    throw error;
  }
}

/* --------------------  GET USER TASK LOGS  -------------------- */
/**
 * Fetch all tasks assigned to a user with project info and logs
 * @param {number} userId - User ID to fetch tasks for
 * @param {number} weeksBack - Number of weeks to fetch logs for
 * @returns {Promise<Object>} API response containing user info, tasks, logs, and weekly data
 */
export const getUserTaskLogs = async (userId, weeksBack = 12) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const url = `${API_URL}/tasks/user/${userId}/task-logs?weeks_back=${weeksBack}`;
    
    console.log('🔍 Fetching user task logs from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(),
    });

    // Check if response is HTML (error page)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      console.error('❌ Server returned HTML instead of JSON:', text.substring(0, 500));
      throw new Error('Server error - received HTML response instead of JSON');
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }
      throw new Error(errorData.detail || `Failed to fetch user task logs: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ User task logs response:', data);

    // Map tasks for frontend display with proper error handling
    const mappedTasks = (data.tasks || []).map(task => ({
      taskId: task.task_id || task.id,
      title: task.task_title || task.title || 'Untitled Task',
      projectName: task.project_name || 'No Project',
      startDate: task.start_date,
      dueDate: task.due_date,
      status: task.status || 'No Status',
      priority: task.priority || 'No Priority',
      estimatedHours: task.estimated_hours || 0,
      totalLoggedHours: task.total_logged_hours || 0,
      logs: (task.time_logs || []).map(log => ({
        logId: log.log_id || log.id,
        date: log.date,
        hours: log.hours || 0,
        description: log.description || '',
      })),
    }));

    return {
      userId: data.user_id || userId,
      userName: data.user_name,
      summary: data.summary || {
        total_tasks: mappedTasks.length,
        total_logged_hours: mappedTasks.reduce((sum, task) => sum + (task.totalLoggedHours || 0), 0),
        total_work_logs: mappedTasks.reduce((sum, task) => sum + (task.logs?.length || 0), 0),
        weeks_with_data: Object.keys(data.weekly_aggregation || {}).length
      },
      tasks: mappedTasks,
      weeklyAggregation: data.weekly_aggregation || {},
      dateRange: data.date_range || {
        start_date: new Date(Date.now() - (weeksBack * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      }
    };
  } catch (error) {
    console.error('❌ Error fetching user task logs:', error);
    throw error;
  }
};

/* --------------------  REACT HOOK FOR USER TASK LOGS  -------------------- */
import { useState, useEffect, useCallback } from 'react';

/**
 * React hook for fetching user tasks with logs and project info
 */
export const useUserTaskLogs = (userId, weeksBack = 12) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await getUserTaskLogs(userId, weeksBack);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, weeksBack]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};