// src/api/timesheet.js
import { API_URL } from "../config/apiConfig";

function authHeaders() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found — please log in again");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function getOrganizationId() {
  const orgId = localStorage.getItem("organizationId");
  if (!orgId) throw new Error("No organization ID found — please log in again");
  return parseInt(orgId);
}

/* --------------------  GET WORKLOGS RANGE (NEW)  -------------------- */
export async function getWorklogsRange(filters = {}) {
  try {
    const organizationId = getOrganizationId();
    
    const params = new URLSearchParams({
      organization_id: organizationId,
      ...filters
    });

    const res = await fetch(`${API_URL}/timesheet/worklogs/range?${params}`, {
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to fetch worklogs range";
      throw new Error(msg);
    }

    // Defensive: ensure expected structure
    return {
      TWH: result.TWH || 0,
      TTT: result.TTT || 0,
      days: result.days || []
    };
  } catch (error) {
    console.error("❌ Error fetching worklogs range:", error);
    // Return safe defaults
    return { TWH: 0, TTT: 0, days: [] };
  }
}

/* --------------------  GET USER TASKS FOR WEEK (NEW)  -------------------- */
export async function getUserTasksForWeek(filters = {}) {
  try {
    const organizationId = getOrganizationId();
    
    // Default to current week if no week_start provided
    const defaultFilters = {
      week_start: getCurrentWeekStart(),
      ...filters
    };

    const params = new URLSearchParams({
      organization_id: organizationId,
      ...defaultFilters
    });

    const res = await fetch(`${API_URL}/timesheet/user-tasks?${params}`, {
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to fetch user tasks";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error fetching user tasks:", error);
    throw error;
  }
}

/* --------------------  GET USER TASKS WITH WORKLOGS (NEW)  -------------------- */
export async function getUserTasksWithWorklogs(filters = {}) {
  try {
    const organizationId = getOrganizationId();
    
    // Default to current week if no week_start provided
    const defaultFilters = {
      week_start: getCurrentWeekStart(),
      ...filters
    };

    const params = new URLSearchParams({
      organization_id: organizationId,
      ...defaultFilters
    });

    const res = await fetch(`${API_URL}/timesheet/user-worklogs?${params}`, {
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to fetch user tasks with worklogs";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error fetching user tasks with worklogs:", error);
    throw error;
  }
}

/* --------------------  GET TIMESHEETS WITH FILTERS  -------------------- */
export async function getTimesheets(filters = {}) {
  try {
    const organizationId = getOrganizationId();
    const params = new URLSearchParams({
      organization_id: organizationId,
      ...filters
    });

    const res = await fetch(`${API_URL}/timesheet/?${params}`, {
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to fetch timesheets";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error fetching timesheets:", error);
    throw error;
  }
}

/* --------------------  GET WEEKLY TIMESHEET SUMMARY  -------------------- */
export async function getTimesheetSummary(filters = {}) {
  try {
    const organizationId = getOrganizationId();
    const params = new URLSearchParams({
      organization_id: organizationId,
      ...filters
    });

    const res = await fetch(`${API_URL}/timesheet/summary?${params}`, {
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to fetch timesheet summary";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error fetching timesheet summary:", error);
    throw error;
  }
}

/* --------------------  CREATE TIMESHEET ENTRY  -------------------- */
export async function createTimesheet(timesheetData) {
  try {
    const organizationId = getOrganizationId();
    const dataWithOrg = {
      ...timesheetData,
      organization_id: organizationId
    };

    const res = await fetch(`${API_URL}/timesheet/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(dataWithOrg),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to create timesheet entry";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error creating timesheet:", error);
    throw error;
  }
}

/* --------------------  UPDATE TIMESHEET ENTRY  -------------------- */
export async function updateTimesheet(timesheetId, updateData) {
  try {
    const res = await fetch(`${API_URL}/timesheet/${timesheetId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(updateData),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to update timesheet entry";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error updating timesheet:", error);
    throw error;
  }
}

/* --------------------  DELETE TIMESHEET ENTRY  -------------------- */
export async function deleteTimesheet(timesheetId) {
  try {
    const res = await fetch(`${API_URL}/timesheet/${timesheetId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      
      const result = await res.json();
      throw new Error(result.detail || "Failed to delete timesheet entry");
    }
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("❌ Error deleting timesheet:", error);
    throw error;
  }
}

/* --------------------  CREATE BULK TIMESHEET ENTRIES  -------------------- */
export async function createBulkTimesheets(bulkData) {
  try {
    const organizationId = getOrganizationId();
    const dataWithOrg = {
      ...bulkData,
      organization_id: organizationId
    };

    const res = await fetch(`${API_URL}/timesheet/bulk`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(dataWithOrg),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to create bulk timesheet entries";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error creating bulk timesheets:", error);
    throw error;
  }
}

/* --------------------  AUTO-GENERATE TIMESHEETS FOR WEEK  -------------------- */
export async function autoGenerateTimesheets(weekStart) {
  try {
    const organizationId = getOrganizationId();
    const params = new URLSearchParams({
      organization_id: organizationId
    });

    const res = await fetch(`${API_URL}/timesheet/auto-generate/${weekStart}?${params}`, {
      method: "POST",
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to auto-generate timesheets";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error auto-generating timesheets:", error);
    throw error;
  }
}

/* --------------------  GET EMPLOYEES TIMESHEET DATA (Main Function)  -------------------- */
export async function getEmployeesTimesheet(filters = {}) {
  try {
    const organizationId = getOrganizationId();
    
    // Default to current week if no week_start provided
    const defaultFilters = {
      week_start: getCurrentWeekStart(),
      ...filters
    };

    const params = new URLSearchParams({
      organization_id: organizationId,
      ...defaultFilters
    });

    const res = await fetch(`${API_URL}/timesheet/summary?${params}`, {
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to fetch employees timesheet data";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error fetching employees timesheet:", error);
    throw error;
  }
}

/* --------------------  UPDATE DAILY TIMESHEET ENTRY  -------------------- */
export async function updateDailyTimesheet(userId, date, updateData) {
  try {
    // First get existing timesheet for this user and date
    const organizationId = getOrganizationId();
    const timesheets = await getTimesheets({
      user_id: userId,
      date: date,
      organization_id: organizationId
    });

    if (timesheets.length > 0) {
      // Update existing entry
      const timesheetId = timesheets[0].id;
      return await updateTimesheet(timesheetId, updateData);
    } else {
      // Create new entry
      return await createTimesheet({
        user_id: userId,
        date: date,
        ...updateData
      });
    }
  } catch (error) {
    console.error("❌ Error updating daily timesheet:", error);
    throw error;
  }
}

/* --------------------  NEW HELPER FUNCTIONS FOR TASK DATA  -------------------- */

// Format task data for display in timesheet
export function formatTaskDataForDisplay(taskData) {
  if (!taskData) return [];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const formattedData = [];
  
  Object.entries(taskData.daily_tasks || {}).forEach(([date, tasks]) => {
    const dayIndex = new Date(date).getDay();
    const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust for Monday start
    
    formattedData.push({
      date,
      dayName,
      tasks: tasks.map(task => ({
        id: task.task_id,
        title: task.task_title,
        description: task.task_description,
        project: task.project_name,
        status: task.status,
        priority: task.priority,
        loggedHours: task.logged_hours,
        estimatedHours: task.estimated_hours,
        isCompleted: task.is_completed
      })),
      totalHours: taskData.daily_totals?.[date] || 0
    });
  });
  
  return formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
}








// Calculate total hours for a user across all tasks
export function calculateTotalTaskHoursForUser(taskData) {
  if (!taskData || !taskData.daily_totals) return 0;
  
  return Object.values(taskData.daily_totals).reduce((total, hours) => total + hours, 0);
}

// Get task statistics for a user
export function getTaskStatistics(taskData) {
  if (!taskData) return { total: 0, completed: 0, inProgress: 0 };
  
  const allTasks = Object.values(taskData.daily_tasks || {}).flat();
  
  return {
    total: allTasks.length,
    completed: allTasks.filter(task => task.is_completed).length,
    inProgress: allTasks.filter(task => !task.is_completed).length
  };
}

// Filter tasks by project
export function filterTasksByProject(taskData, projectId) {
  if (!taskData) return [];
  
  const filteredTasks = {};
  
  Object.entries(taskData.daily_tasks || {}).forEach(([date, tasks]) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    if (projectTasks.length > 0) {
      filteredTasks[date] = projectTasks;
    }
  });
  
  return filteredTasks;
}

/* --------------------  EXISTING HELPER FUNCTIONS  -------------------- */

// Get current week start date (Monday)
export function getCurrentWeekStart() {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Get next week start date
export function getNextWeekStart(currentWeekStart) {
  const date = new Date(currentWeekStart);
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}

// Get previous week start date
export function getPreviousWeekStart(currentWeekStart) {
  const date = new Date(currentWeekStart);
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

// Format date for display
export function formatDateForDisplay(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
}

// Calculate total working hours for a user
export function calculateTotalWorkingHours(dailyEntries) {
  return dailyEntries.reduce((total, entry) => total + entry.working_hours, 0);
}

// Calculate total task hours for a user
export function calculateTotalTaskHours(dailyEntries) {
  return dailyEntries.reduce((total, entry) => total + entry.task_hours, 0);
}

// Get week date range for display
export function getWeekDateRange(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Monday to Sunday
  
  return {
    start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullRange: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  };
}

/* --------------------  NEW DATE RANGE HELPERS  -------------------- */

// Get week range from reference date (Monday to Sunday)
export function getWeekRange(referenceDate = new Date()) {
  const date = new Date(referenceDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  
  const start = new Date(date.setDate(diff));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

// Get previous week range
export function getPreviousWeekRange() {
  const today = new Date();
  today.setDate(today.getDate() - 7);
  return getWeekRange(today);
}

// Get next week range
export function getNextWeekRange() {
  const today = new Date();
  today.setDate(today.getDate() + 7);
  return getWeekRange(today);
}

// Validate custom date range
export function validateDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  if (startDate > endDate) {
    return { isValid: false, error: 'Start date must be before end date' };
  }
  
  const dayDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  if (dayDiff > 365) {
    return { isValid: false, error: 'Date range cannot exceed 365 days' };
  }
  
  return { isValid: true, error: null };
}

/* --------------------  GET WORKLOGS SUMMARY (TWH & TTT)  -------------------- */
// export async function getWorklogsSummary(filters = {}) {
//   try {
//     const organizationId = getOrganizationId();
    
//     const params = new URLSearchParams({
//       organization_id: organizationId,
//       ...filters
//     });

//     const res = await fetch(`${API_URL}/timesheet/worklogs/summary?${params}`, {
//       headers: authHeaders(),
//     });

//     const result = await res.json();
//     if (!res.ok) {
//       if (res.status === 401 || res.status === 403) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         localStorage.removeItem("organizationId");
//         window.location.href = "/login";
//       }
//       const msg = result.detail || result.message || "Failed to fetch worklogs summary";
//       throw new Error(msg);
//     }

//     return result;
//   } catch (error) {
//     console.error("❌ Error fetching worklogs summary:", error);
//     throw error;
//   }
// }

/* --------------------  GET DAILY TASKS  -------------------- */
export async function getDailyTasks(targetDate) {
  try {
    const organizationId = getOrganizationId();
    
    const params = new URLSearchParams({
      organization_id: organizationId,
      target_date: targetDate
    });

    const res = await fetch(`${API_URL}/timesheet/worklogs/daily-tasks?${params}`, {
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to fetch daily tasks";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error fetching daily tasks:", error);
    throw error;
  }
}




// Add to src/api/timesheet.js

/* --------------------  GET FILTERED USER TASKS (NEW)  -------------------- */
export async function getFilteredUserTasks(filters = {}) {
  try {
    const organizationId = getOrganizationId();
    
    const defaultFilters = {
      week_start: getCurrentWeekStart(),
      ...filters
    };

    const params = new URLSearchParams({
      organization_id: organizationId,
      ...defaultFilters
    });

    const res = await fetch(`${API_URL}/timesheet/filtered-tasks?${params}`, {
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to fetch filtered user tasks";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error fetching filtered user tasks:", error);
    throw error;
  }
}


// NEW: Helper function to normalize dates to midnight for comparison
function toDayStart(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}






/* --------------------  GET EMPLOYEE WORKLOGS SUMMARY (TWH & TTT)  -------------------- */
export async function getWorklogsSummary(filters = {}) {
  try {
    const organizationId = getOrganizationId();
    
    const params = new URLSearchParams({
      organization_id: organizationId,
      ...filters
    });

    const res = await fetch(`${API_URL}/timesheet/worklogs/employee-summary?${params}`, {
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organizationId");
        window.location.href = "/login";
      }
      const msg = result.detail || result.message || "Failed to fetch employee worklogs summary";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    console.error("❌ Error fetching employee worklogs summary:", error);
    throw error;
  }
}



/* --------------------  EXPORT ALL FUNCTIONS  -------------------- */
export default {
  // New range functions
  getWorklogsRange,
  getWeekRange,
  getPreviousWeekRange,
  getNextWeekRange,
  validateDateRange,
  
  
  // New task-related functions
  getUserTasksForWeek,
  getUserTasksWithWorklogs,
  formatTaskDataForDisplay,
  calculateTotalTaskHoursForUser,
  getTaskStatistics,
  filterTasksByProject,
  getFilteredUserTasks,
  getWorklogsSummary,
  
  // Existing timesheet functions
  getTimesheets,
  getTimesheetSummary,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
  createBulkTimesheets,
  autoGenerateTimesheets,
  getEmployeesTimesheet,
  updateDailyTimesheet,
  
  // Helper functions
  getCurrentWeekStart,
  getNextWeekStart,
  getPreviousWeekStart,
  formatDateForDisplay,
  calculateTotalWorkingHours,
  calculateTotalTaskHours,
  getWeekDateRange
};