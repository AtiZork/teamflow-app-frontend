// src/api/analytics.js
import { API_URL } from "../config/apiConfig";
console.log(API_URL);

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

/**
 * Get comprehensive analytics data for the current organization
 * Only admins can call this endpoint
 */
export async function getAnalyticsData() {
  const organizationId = getOrganizationId();
  
  const res = await fetch(`${API_URL}/analytics/?organization_id=${organizationId}`, {
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
    throw new Error(result.detail || "Failed to load analytics data");
  }
  return result;
}

/**
 * Get organization dashboard statistics
 * Only admins can call this endpoint
 */
export async function getDashboardStats() {
  const organizationId = getOrganizationId();
  
  const res = await fetch(`${API_URL}/analytics/dashboard?organization_id=${organizationId}`, {
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
    throw new Error(result.detail || "Failed to load dashboard stats");
  }
  return result;
}

/**
 * Get project analytics for the organization
 * Only admins can call this endpoint
 */
export async function getProjectAnalytics() {
  const organizationId = getOrganizationId();
  
  const res = await fetch(`${API_URL}/analytics/projects?organization_id=${organizationId}`, {
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
    throw new Error(result.detail || "Failed to load project analytics");
  }
  return result;
}

/**
 * Get task analytics for the organization
 * Only admins can call this endpoint
 */
export async function getTaskAnalytics() {
  const organizationId = getOrganizationId();
  
  const res = await fetch(`${API_URL}/analytics/tasks?organization_id=${organizationId}`, {
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
    throw new Error(result.detail || "Failed to load task analytics");
  }
  return result;
}

/**
 * Get user analytics for the organization
 * Only admins can call this endpoint
 */
export async function getUserAnalytics() {
  const organizationId = getOrganizationId();
  
  const res = await fetch(`${API_URL}/analytics/users?organization_id=${organizationId}`, {
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
    throw new Error(result.detail || "Failed to load user analytics");
  }
  return result;
}

/**
 * Get time-based analytics for the organization
 * Only admins can call this endpoint
 */
export async function getTimeBasedAnalytics(timeframe = '7d') {
  const organizationId = getOrganizationId();
  
  const res = await fetch(`${API_URL}/analytics/time-based?organization_id=${organizationId}&timeframe=${timeframe}`, {
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
    throw new Error(result.detail || "Failed to load time-based analytics");
  }
  return result;
}

/**
 * Export organization analytics data
 * Only admins can call this endpoint
 */
export async function exportAnalyticsData(format = 'json') {
  const organizationId = getOrganizationId();
  
  const res = await fetch(`${API_URL}/analytics/export?organization_id=${organizationId}&format=${format}`, {
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
    throw new Error(result.detail || "Failed to export analytics data");
  }
  
  if (format === 'csv') {
    return await res.text();
  }
  return await res.json();
}