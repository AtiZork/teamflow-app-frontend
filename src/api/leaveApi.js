// src/api/leaveApi.js
/**
 * Leave Management API Client
 * Handles all leave-related requests for both users and admins
 */

import apiClient from './apiClient';

const BASE_URL = '/leave';

// ==============================
// 👤 USER ENDPOINTS
// ==============================

/**
 * Get available leave types
 */
export const getLeaveTypes = async () => {
  return apiClient.get(`${BASE_URL}/types`);
};

/**
 * Get current user's leave balance
 */
export const getMyLeaveBalance = async () => {
  return apiClient.get(`${BASE_URL}/balance`);
};

/**
 * Get current user's leave requests
 */
export const getMyLeaveRequests = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.status) queryParams.append('status', params.status);
  if (params.year) queryParams.append('year', params.year);

  const queryString = queryParams.toString();
  return apiClient.get(`${BASE_URL}/my-requests${queryString ? `?${queryString}` : ''}`);
};

/**
 * Apply for leave
 */
export const applyForLeave = async (leaveData) => {
  return apiClient.post(`${BASE_URL}/apply`, leaveData);
};

/**
 * Cancel a leave request (user endpoint)
 */
export const cancelLeaveRequestUser = async (requestId) => {
  return apiClient.patch(`${BASE_URL}/requests/${requestId}/cancel`);
};

// ==============================
// 👑 ADMIN ENDPOINTS
// ==============================

/**
 * Get all leave requests (admin)
 */
export const getAllLeaveRequests = async (params = {}) => {
  const {
    status = null,
    employeeId = null,
    startDate = null,
    endDate = null,
    leaveTypeId = null,
    page = 1,
    limit = 50
  } = params;

  const queryParams = new URLSearchParams({
    page: page,
    limit: limit
  });

  if (status) queryParams.append('status', status);
  if (employeeId) queryParams.append('employee_id', employeeId);
  if (startDate) queryParams.append('start_date', startDate);
  if (endDate) queryParams.append('end_date', endDate);
  if (leaveTypeId) queryParams.append('leave_type_id', leaveTypeId);

  return apiClient.get(`${BASE_URL}/admin/requests?${queryParams.toString()}`);
};

/**
 * Get leave statistics (admin)
 */
export const getLeaveStats = async (params = {}) => {
  const { startDate = null, endDate = null } = params;

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('start_date', startDate);
  if (endDate) queryParams.append('end_date', endDate);

  return apiClient.get(`${BASE_URL}/admin/stats?${queryParams.toString()}`);
};

/**
 * Approve a leave request (admin)
 */
export const approveLeaveRequest = async (requestId, adminComments = "") => {
  return apiClient.patch(`${BASE_URL}/admin/requests/${requestId}/approve`, {
    admin_comments: adminComments
  });
};

/**
 * Reject a leave request (admin)
 */
export const rejectLeaveRequest = async (requestId, adminComments = "") => {
  return apiClient.patch(`${BASE_URL}/admin/requests/${requestId}/reject`, {
    admin_comments: adminComments
  });
};

/**
 * Get employee leave balance (admin)
 */
export const getEmployeeLeaveBalance = async (employeeId) => {
  return apiClient.get(`${BASE_URL}/admin/employee/${employeeId}/balance`);
};

/**
 * Manage employee leave balance (admin)
 * Supports: add, subtract, or set operations
 */
export const manageEmployeeLeaveBalance = async (employeeId, updateData) => {
  return apiClient.post(`${BASE_URL}/admin/employee/${employeeId}/balance/manage`, updateData);
};

/**
 * Reset employee leave balance (admin)
 */
export const resetEmployeeLeaveBalance = async (employeeId, leaveTypeId) => {
  return apiClient.post(`${BASE_URL}/admin/employee/${employeeId}/balance/reset`, {
    leave_type_id: leaveTypeId
  });
};

/**
 * Get employees balance summary (admin)
 */
export const getEmployeesBalanceSummary = async (params = {}) => {
  const { department = null, page = 1, limit = 20 } = params;

  const queryParams = new URLSearchParams({
    page: page,
    limit: limit
  });

  if (department) queryParams.append('department', department);

  return apiClient.get(`${BASE_URL}/admin/employees/balance-summary?${queryParams.toString()}`);
};

/**
 * Bulk update leave balances (admin)
 */
export const bulkUpdateLeaveBalances = async (bulkData) => {
  return apiClient.post(`${BASE_URL}/admin/balance/bulk-update`, bulkData);
};

/**
 * Get leave balance overview (admin)
 */
export const getLeaveBalanceOverview = async (department = null) => {
  const queryParams = new URLSearchParams();
  if (department) queryParams.append('department', department);

  return apiClient.get(`${BASE_URL}/admin/balance/overview?${queryParams.toString()}`);
};

// ==============================
// 📊 UTILITY FUNCTIONS
// ==============================

/**
 * Calculate working days between dates (excluding weekends)
 */
export const calculateWorkingDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) return 0;

  let days = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (day !== 0 && day !== 6) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
};

/**
 * Check for overlapping leave requests
 */
export const checkLeaveOverlap = (existingLeaves, newStartDate, newEndDate, excludeId = null) => {
  const newStart = new Date(newStartDate);
  const newEnd = new Date(newEndDate);

  return existingLeaves.some(leave => {
    if (excludeId && leave.id === excludeId) return false;
    if (!['pending', 'approved'].includes(leave.status)) return false;
    
    const existingStart = new Date(leave.start_date);
    const existingEnd = new Date(leave.end_date);
    
    return (
      (newStart <= existingEnd && newEnd >= existingStart) ||
      (existingStart <= newEnd && existingEnd >= newStart)
    );
  });
};

/**
 * Format date for display
 */
export const formatLeaveDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Get status color styling
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return { bg: '#10b98115', text: '#10b981', border: '#10b98130' };
    case 'pending':
      return { bg: '#f59e0b15', text: '#f59e0b', border: '#f59e0b30' };
    case 'rejected':
      return { bg: '#ef444415', text: '#ef4444', border: '#ef444430' };
    case 'cancelled':
      return { bg: '#6b728015', text: '#6b7280', border: '#6b728030' };
    default:
      return { bg: '#6b728015', text: '#6b7280', border: '#6b728030' };
  }
};

/**
 * Get leave type color
 */
export const getLeaveTypeColor = (typeName) => {
  const name = typeName?.toLowerCase() || '';
  if (name.includes('annual')) {
    return { bg: '#3b82f615', text: '#3b82f6', border: '#3b82f630' };
  }
  if (name.includes('sick')) {
    return { bg: '#10b98115', text: '#10b981', border: '#10b98130' };
  }
  if (name.includes('personal')) {
    return { bg: '#8b5cf615', text: '#8b5cf6', border: '#8b5cf630' };
  }
  if (name.includes('unpaid')) {
    return { bg: '#6b728015', text: '#6b7280', border: '#6b728030' };
  }
  return { bg: '#6b728015', text: '#6b7280', border: '#6b728030' };
};

/**
 * Calculate unpaid leave eligibility
 */
export const checkUnpaidLeaveEligibility = (paidBalances, unpaidBalance) => {
  const totalPaidRemaining = paidBalances.reduce((sum, balance) => sum + (balance.remaining_days || 0), 0);
  const canApplyUnpaid = totalPaidRemaining === 0;
  
  return {
    canApplyUnpaid,
    totalPaidRemaining,
    message: canApplyUnpaid 
      ? "All paid leaves exhausted. Can apply for unpaid leave."
      : `Cannot apply for unpaid leave. You have ${totalPaidRemaining} paid leave days remaining.`
  };
};

/**
 * Validate leave application
 */
export const validateLeaveApplication = (leaveData, userBalances, existingLeaves) => {
  const errors = [];
  const warnings = [];
  
  // Validate dates
  const startDate = new Date(leaveData.start_date);
  const endDate = new Date(leaveData.end_date);
  
  if (startDate > endDate) {
    errors.push("End date must be after start date");
  }
  
  if (startDate < new Date()) {
    warnings.push("Leave start date is in the past");
  }
  
  // Check for overlaps
  const hasOverlap = checkLeaveOverlap(existingLeaves, leaveData.start_date, leaveData.end_date);
  if (hasOverlap) {
    errors.push("You have overlapping leave requests");
  }
  
  // Check balance
  const leaveTypeBalance = userBalances.find(b => b.leave_type_id === leaveData.leave_type_id);
  if (leaveTypeBalance) {
    const isUnpaid = leaveTypeBalance.leave_type && !leaveTypeBalance.leave_type.is_paid;
    
    if (isUnpaid) {
      const paidBalances = userBalances.filter(b => b.leave_type && b.leave_type.is_paid);
      const unpaidEligibility = checkUnpaidLeaveEligibility(paidBalances, leaveTypeBalance);
      
      if (!unpaidEligibility.canApplyUnpaid) {
        errors.push(unpaidEligibility.message);
      } else if (leaveTypeBalance.remaining_days < leaveData.duration_days) {
        errors.push(`Insufficient unpaid leave balance. You have ${leaveTypeBalance.remaining_days} days remaining, need ${leaveData.duration_days}`);
      }
    } else {
      // For paid leave
      if (leaveTypeBalance.remaining_days < leaveData.duration_days) {
        errors.push(`Insufficient balance. You have ${leaveTypeBalance.remaining_days} days remaining, need ${leaveData.duration_days}`);
      }
    }
  } else {
    // No balance record found
    warnings.push("No leave balance record found for this type");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ==============================
// 📦 EXPORT ALL METHODS
// ==============================

export const leaveAPI = {
  // User endpoints
  getLeaveTypes,
  getMyLeaveBalance,
  getMyLeaveRequests,
  applyForLeave,
  cancelLeaveRequest: cancelLeaveRequestUser,
  
  // Admin endpoints
  getAllLeaveRequests,
  getLeaveStats,
  approveLeaveRequest,
  rejectLeaveRequest,
  getEmployeeLeaveBalance,
  manageEmployeeLeaveBalance,
  resetEmployeeLeaveBalance,
  getEmployeesBalanceSummary,
  bulkUpdateLeaveBalances,
  getLeaveBalanceOverview,
  
  // Utility functions
  calculateWorkingDays,
  checkLeaveOverlap,
  formatLeaveDate,
  getStatusColor,
  getLeaveTypeColor,
  checkUnpaidLeaveEligibility,
  validateLeaveApplication
};

export default leaveAPI;