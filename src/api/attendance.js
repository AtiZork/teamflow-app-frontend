// src/api/attendance.js
import { API_URL } from "../config/apiConfig";
console.log(API_URL);

// ============================================================
// ✅ AUTH UTILS (matching your existing pattern)
// ============================================================

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

function handleAuthError(response, result) {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("organizationId");
    window.location.href = "/login";
    throw new Error("Authentication failed - please log in again");
  }

  const errorMessage = result?.detail || result?.message || "Request failed";
  throw new Error(errorMessage);
}

// ============================================================
// ✅ CHECK IN/OUT ENDPOINTS (For all users)
// ============================================================

/**
 * Check in for the day
 * @param {Object} checkInData - Check in data
 * @param {string} checkInData.location - Work location (Office, Remote, etc.)
 * @param {string} checkInData.notes - Optional notes
 * @param {number} checkInData.latitude - Optional latitude
 * @param {number} checkInData.longitude - Optional longitude
 * @param {string} checkInData.address - Optional address
 */
export async function checkIn(checkInData) {
  const res = await fetch(`${API_URL}/attendance/check-in`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(checkInData),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

/**
 * Check out for the day
 * @param {Object} checkOutData - Check out data
 * @param {string} checkOutData.notes - Optional notes
 */
export async function checkOut(checkOutData = {}) {
  const res = await fetch(`${API_URL}/attendance/check-out`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(checkOutData),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

/**
 * Get today's attendance status for current user
 */
export async function getTodayStatus() {
  const res = await fetch(`${API_URL}/attendance/today-status`, {
    headers: authHeaders(),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

// ============================================================
// ✅ BREAK MANAGEMENT ENDPOINTS
// ============================================================

/**
 * Start a break
 * @param {Object} breakData - Break data
 * @param {string} breakData.break_type - Break type (lunch, namaz, tea, etc.)
 * @param {string} breakData.notes - Optional notes
 */
export async function startBreak(breakData) {
  const res = await fetch(`${API_URL}/attendance/start-break`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(breakData),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

/**
 * End current break
 */
export async function endBreak() {
  const res = await fetch(`${API_URL}/attendance/end-break`, {
    method: "POST",
    headers: authHeaders(),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

// ============================================================
// ✅ ATTENDANCE MANAGEMENT ENDPOINTS (Admin/Super Admin only)
// ============================================================

/**
 * Get attendance statistics for organization
 * @param {Date} dateFilter - Optional date for stats (default: today)
 */
export async function getAttendanceStats(dateFilter = null) {
  const params = new URLSearchParams();
  if (dateFilter) {
    params.set('date_filter', dateFilter.toISOString().split('T')[0]);
  }

  const res = await fetch(`${API_URL}/attendance/stats?${params.toString()}`, {
    headers: authHeaders(),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

/**
 * Get attendance records with filters
 * @param {Object} filters - Filter options
 * @param {Date} filters.startDate - Start date for filter
 * @param {Date} filters.endDate - End date for filter
 * @param {number} filters.userId - Filter by user ID
 * @param {string} filters.status - Filter by status
 * @param {string} filters.location - Filter by location
 */
export async function getAttendanceRecords(filters = {}) {
  const params = new URLSearchParams();

  if (filters.startDate) {
    params.set('start_date', filters.startDate.toISOString().split('T')[0]);
  }
  if (filters.endDate) {
    params.set('end_date', filters.endDate.toISOString().split('T')[0]);
  }
  if (filters.userId) {
    params.set('user_id', filters.userId);
  }
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.location) {
    params.set('location', filters.location);
  }

  const res = await fetch(`${API_URL}/attendance/?${params.toString()}`, {
    headers: authHeaders(),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

/**
 * Get attendance summary for all users
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 */
export async function getAttendanceSummary(month = null, year = null) {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (year) params.set('year', year);

  const res = await fetch(`${API_URL}/attendance/summary?${params.toString()}`, {
    headers: authHeaders(),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

/**
 * Create manual attendance record
 * @param {number} userId - User ID to create attendance for
 * @param {Object} attendanceData - Attendance data
 */
export async function createManualAttendance(userId, attendanceData) {
  const params = new URLSearchParams();
  params.set('user_id', userId);

  const res = await fetch(`${API_URL}/attendance/manual?${params.toString()}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(attendanceData),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

/**
 * Update attendance record
 * @param {number} attendanceId - Attendance record ID
 * @param {Object} attendanceData - Updated attendance data
 */
export async function updateAttendance(attendanceId, attendanceData) {
  const res = await fetch(`${API_URL}/attendance/${attendanceId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(attendanceData),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

/**
 * Delete attendance record
 * @param {number} attendanceId - Attendance record ID
 */
export async function deleteAttendance(attendanceId) {
  const res = await fetch(`${API_URL}/attendance/${attendanceId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const result = await res.json();
    handleAuthError(res, result);
  }

  const result = await res.json();
  return result;
}

// ============================================================
// ✅ EXPORT ENDPOINTS
// ============================================================

/**
 * Export attendance data as CSV
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
export async function exportAttendance(startDate, endDate) {
  const params = new URLSearchParams();
  params.set('start_date', startDate.toISOString().split('T')[0]);
  params.set('end_date', endDate.toISOString().split('T')[0]);

  const res = await fetch(`${API_URL}/attendance/export?${params.toString()}`, {
    headers: authHeaders(),
  });

  const result = await res.json();
  if (!res.ok) {
    handleAuthError(res, result);
  }

  return result;
}

// ============================================================
// ✅ UTILITY FUNCTIONS (Client-side helpers)
// ============================================================

/**
 * Download CSV data as a file
 * @param {Object} exportData - Export data from API
 */
export function downloadAttendanceCSV(exportData) {
  const { filename, headers, data } = exportData;

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Format time string to display format
 * @param {string} timeString - Time string (HH:MM) or ISO Date string
 */
export function formatAttendanceTime(timeString) {
  if (!timeString) return '--:--';

  let date;
  // Check if it's an ISO string (has 'T' or 'Z' or separators like 2024-...)
  if (timeString.includes('T') || timeString.includes('Z') || (timeString.includes('-') && timeString.length > 10)) {
    date = new Date(timeString);
    if (isNaN(date.getTime())) return '--:--'; // Invalid date
  } else if (timeString.includes(':')) {
    // Legacy HH:MM format (assume local time for display purposes if just time is given)
    const [hours, minutes] = timeString.split(':').map(Number);
    date = new Date();
    date.setHours(hours, minutes, 0, 0);
  } else {
    return '--:--';
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculate productive hours
 * @param {string} totalHours - Total hours (HH:MM)
 * @param {string} breakTime - Break time (HH:MM)
 */
export function calculateProductiveHours(totalHours, breakTime) {
  if (!totalHours || totalHours === '00:00') return '00:00';

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const totalMinutes = parseTime(totalHours);
  const breakMinutes = breakTime ? parseTime(breakTime) : 0;

  const productiveMinutes = Math.max(0, totalMinutes - breakMinutes);
  const hours = Math.floor(productiveMinutes / 60);
  const minutes = productiveMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get work location options
 */
export function getWorkLocationOptions() {
  return [
    { value: 'Office', label: 'Office' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Client Site', label: 'Client Site' },
    { value: 'Field Work', label: 'Field Work' },
  ];
}

/**
 * Get break type options
 */
export function getBreakTypeOptions() {
  return [
    { id: 'break', name: 'Break', color: '#3B82F6', description: 'Short break' },
    { id: 'namaz', name: 'Namaz', color: '#10B981', description: 'Prayer time' },
    { id: 'lunch', name: 'Lunch', color: '#F59E0B', description: 'Meal break' },
    { id: 'tea', name: 'Tea/Coffee', color: '#8B5CF6', description: 'Refreshment' },
    { id: 'personal', name: 'Personal', color: '#EC4899', description: 'Personal time' },
  ];
}

/**
 * Get attendance status options
 */
export function getAttendanceStatusOptions() {
  return [
    { value: 'present', label: 'Present', color: '#10B981' },
    { value: 'absent', label: 'Absent', color: '#EF4444' },
    { value: 'leave', label: 'Leave', color: '#F59E0B' },
    { value: 'half_day', label: 'Half Day', color: '#8B5CF6' },
    { value: 'late', label: 'Late', color: '#EC4899' },
  ];
}

/**
 * Get status badge color
 * @param {string} status - Attendance status
 */
export function getAttendanceStatusColor(status) {
  const colors = {
    present: '#10B981',
    absent: '#EF4444',
    leave: '#F59E0B',
    half_day: '#8B5CF6',
    late: '#EC4899',
  };

  return colors[status] || '#6B7280';
}

/**
 * Parse date string to display format
 * @param {string} dateString - Date string (YYYY-MM-DD)
 */
export function formatAttendanceDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate total hours from check in and check out times
 * @param {string} checkIn - Check in time (HH:MM) or ISO string
 * @param {string} checkOut - Check out time (HH:MM) or ISO string
 */
export function calculateTotalHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '00:00';

  let totalMinutes = 0;

  // Check if inputs are ISO strings
  const isIso = (str) => str.includes('T') || str.includes('Z') || (str.includes('-') && str.length > 10);

  if (isIso(checkIn) && isIso(checkOut)) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffMs = d2 - d1;
    totalMinutes = Math.floor(diffMs / 60000);
  } else {
    // Legacy HH:MM format
    const parseTime = (timeStr) => {
      if (!timeStr.includes(':')) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const checkInMinutes = parseTime(checkIn);
    const checkOutMinutes = parseTime(checkOut);
    totalMinutes = checkOutMinutes - checkInMinutes;
    
    // ✅ FIX: Handle overnight shifts (negative result)
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Add 24 hours
    }
  }

  // ✅ FIX: Changed from <= to < (allow 0 to pass through for edge cases, but return 00:00 for negative)
  if (totalMinutes < 0) return '00:00';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// ============================================================
// ✅ MOCK DATA FOR DEVELOPMENT (Optional)
// ============================================================

/**
 * Get mock attendance data for development
 */
export function getMockAttendanceData() {
  return [
    {
      id: 1,
      employee: { id: 101, name: "Alex Johnson", role: "Senior Developer", avatar: "AJ" },
      date: new Date().toISOString().split('T')[0],
      checkIn: "09:05",
      checkOut: "18:30",
      totalHours: "9:25",
      location: "Office",
      status: "present",
      isLate: true,
      overtime: "1:30",
      breaks: [
        { type: "lunch", start: "13:00", end: "14:00", duration: "1:00" }
      ]
    },
    {
      id: 2,
      employee: { id: 102, name: "Sarah Miller", role: "Product Manager", avatar: "SM" },
      date: new Date().toISOString().split('T')[0],
      checkIn: "08:45",
      checkOut: "17:15",
      totalHours: "8:30",
      location: "Remote",
      status: "present",
      isLate: false,
      overtime: "0:00",
      breaks: [
        { type: "lunch", start: "12:30", end: "13:30", duration: "1:00" }
      ]
    },
  ];
}

/**
 * Get mock attendance stats for development
 */
export function getMockAttendanceStats() {
  return {
    total_employees: 5,
    present_today: 3,
    on_leave: 1,
    average_hours: 8.5,
    late_arrivals: 1,
    remote_workers: 1,
    office_workers: 2
  };
}

// ============================================================
// ✅ DEFAULT EXPORT (for backward compatibility)
// ============================================================

export default {
  checkIn,
  checkOut,
  getTodayStatus,
  startBreak,
  endBreak,
  getAttendanceStats,
  getAttendanceRecords,
  getAttendanceSummary,
  createManualAttendance,
  updateAttendance,
  deleteAttendance,
  exportAttendance,
  downloadAttendanceCSV,
  formatAttendanceTime,
  calculateProductiveHours,
  getWorkLocationOptions,
  getBreakTypeOptions,
  getAttendanceStatusOptions,
  getAttendanceStatusColor,
  formatAttendanceDate,
  calculateTotalHours,
  getMockAttendanceData,
  getMockAttendanceStats,
};