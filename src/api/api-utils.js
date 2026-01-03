// src/api/api-utils.js
import { API_URL } from "../config/apiConfig";
console.log(API_URL);
/**
 * Get authentication headers with JWT token
 */
export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found — please log in again");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Get current user's organization ID
 */
export function getCurrentOrganizationId() {
  const orgId = localStorage.getItem("organizationId");
  if (!orgId) throw new Error("No organization ID found — please log in again");
  return parseInt(orgId);
}

/**
 * Get current user data from localStorage
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

/**
 * Update organization context in localStorage
 */
export function updateOrganizationContext(organizationId, userData = null) {
  if (organizationId) {
    localStorage.setItem("organizationId", organizationId.toString());
  }
  if (userData) {
    localStorage.setItem("user", JSON.stringify(userData));
  }
}

/**
 * Clear all authentication and organization data
 */
export function clearAuthData() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("organizationId");
}

/**
 * Handle API response errors consistently
 */
export function handleApiError(response, result) {
  // Handle authentication/authorization errors
  if (response.status === 401 || response.status === 403) {
    clearAuthData();
    window.location.href = "/login";
    throw new Error("Authentication failed - please log in again");
  }
  
  // Handle other errors
  const errorMessage = result?.detail || result?.message || "Request failed";
  throw new Error(errorMessage);
}

/**
 * Build URL with organization context
 */
export function buildUrl(endpoint, params = {}) {
  const url = new URL(`${API_URL}${endpoint}`);
  
  // Add organization_id to all requests if available
  try {
    const orgId = getCurrentOrganizationId();
    if (orgId) {
      url.searchParams.set('organization_id', orgId.toString());
    }
  } catch (error) {
    // Organization ID not available, continue without it
    console.warn("Organization ID not available for request");
  }
  
  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value.toString());
    }
  });
  
  return url.toString();
}

/**
 * Make authenticated API request with organization context
 */
export async function apiRequest(endpoint, options = {}) {
  const url = buildUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  
  const config = {
    ...options,
    headers,
  };
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    handleApiError(response, result);
  }
  
  return response;
}

/**
 * Check if user has admin role
 */
export function isAdmin() {
  const user = getCurrentUser();
  return user && (user.role === 'admin' || user.role === 'super_admin');
}

/**
 * Check if user has super admin role
 */
export function isSuperAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'super_admin';
}

/**
 * Validate organization access for a resource
 */
export function validateOrganizationAccess(resourceOrgId) {
  const currentOrgId = getCurrentOrganizationId();
  if (!currentOrgId || !resourceOrgId) {
    return false;
  }
  return currentOrgId === resourceOrgId;
}

/**
 * Format error messages for display
 */
export function formatErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }
  if (error.message) {
    return error.message;
  }
  if (error.detail) {
    return typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
  }
  return "An unknown error occurred";
}

/**
 * Debounce function for search inputs
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate unique ID for frontend operations
 */
export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Export all utility functions
 */
export default {
  getAuthHeaders,
  getCurrentOrganizationId,
  getCurrentUser,
  updateOrganizationContext,
  clearAuthData,
  handleApiError,
  buildUrl,
  apiRequest,
  isAdmin,
  isSuperAdmin,
  validateOrganizationAccess,
  formatErrorMessage,
  debounce,
  generateUniqueId,
};