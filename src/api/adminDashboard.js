// src/api/adminDashboard.js
/**
 * Admin Dashboard API Client
 * Handles all attendance tracking and team management requests
 */

import apiClient from './apiClient';

const BASE_URL = '/admin';

/**
 * Get complete dashboard data (stats + records + summaries)
 * OPTIMIZED: Single request for all data
 */
export const getFullDashboard = async (date = null) => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  
  return apiClient.get(`${BASE_URL}/dashboard/full?${params.toString()}`);
};

/**
 * Get today's attendance records
 */
export const getTodayAttendance = async (sortBy = 'employee.name') => {
  return apiClient.get(`${BASE_URL}/attendance/today?sort_by=${sortBy}`);
};

/**
 * Get attendance records for a date range
 * Supports pagination and employee filtering
 */
export const getAttendanceDateRange = async (startDate, endDate, options = {}) => {
  const {
    employeeId = null,
    sortBy = 'date',
    page = 1,
    pageSize = 50
  } = options;

  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    sort_by: sortBy,
    page: page,
    page_size: pageSize
  });

  if (employeeId) {
    params.append('employee_id', employeeId);
  }

  return apiClient.get(`${BASE_URL}/attendance/date-range?${params.toString()}`);
};

/**
 * Get team-wide attendance statistics
 */
export const getTeamStats = async (date = null) => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  
  return apiClient.get(`${BASE_URL}/team/stats?${params.toString()}`);
};

/**
 * Get list of team members
 */
export const getTeamMembers = async (options = {}) => {
  const {
    isActive = true,
    role = null
  } = options;

  const params = new URLSearchParams({
    is_active: isActive
  });

  if (role) {
    params.append('role', role);
  }

  return apiClient.get(`${BASE_URL}/team/members?${params.toString()}`);
};

/**
 * Get attendance history for a specific employee
 */
export const getEmployeeHistory = async (employeeId, daysBack = 30) => {
  return apiClient.get(
    `${BASE_URL}/attendance/employee/${employeeId}?days_back=${daysBack}`
  );
};

/**
 * Get weekly summary for a specific employee
 */
export const getEmployeeWeeklySummary = async (employeeId, weekDate = null) => {
  const params = new URLSearchParams();
  if (weekDate) params.append('week_date', weekDate);
  
  return apiClient.get(
    `${BASE_URL}/attendance/employee/${employeeId}/weekly?${params.toString()}`
  );
};

/**
 * Get monthly attendance statistics
 */
export const getMonthlyStats = async (year, month) => {
  if (!year || !month || month < 1 || month > 12) {
    throw new Error('Invalid year or month');
  }

  return apiClient.get(
    `${BASE_URL}/attendance/stats/monthly?year=${year}&month=${month}`
  );
};

/**
 * Export all methods as a single object for convenience
 */
export const adminDashboardAPI = {
  getFullDashboard,
  getTodayAttendance,
  getAttendanceDateRange,
  getTeamStats,
  getTeamMembers,
  getEmployeeHistory,
  getEmployeeWeeklySummary,
  getMonthlyStats
};

export default adminDashboardAPI;
