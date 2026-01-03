// src/api/organizations.js
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

/**
 * Get current user's organization
 * Accessible by all authenticated users
 */
export async function getOrganization() {
  const res = await fetch(`${API_URL}/organizations/my-organization`, {
    headers: authHeaders(),
  });

  const result = await res.json();
  if (!res.ok) {
    // Handle authentication errors
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("organizationId");
      window.location.href = "/login";
    }
    throw new Error(result.detail || "Failed to load organization");
  }
  
  // Update organization context in localStorage
  if (result.id) {
    localStorage.setItem("organizationId", result.id.toString());
  }
  
  return result;
}

/**
 * Update current user's organization
 * Only admins can call this
 */
export async function updateOrganization(data) {
  const res = await fetch(`${API_URL}/organizations/my-organization`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    // Handle authentication/authorization errors
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("organizationId");
      window.location.href = "/login";
    }
    throw new Error(result.detail || "Update failed");
  }
  return result;
}

/**
 * Get all organizations (admin only)
 * Only admins can call this
 */
export async function getAllOrganizations() {
  const res = await fetch(`${API_URL}/organizations/`, {
    headers: authHeaders(),
  });

  const result = await res.json();
  if (!res.ok) {
    // Handle authentication/authorization errors
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("organizationId");
      window.location.href = "/login";
    }
    throw new Error(result.detail || "Failed to load organizations");
  }
  return result;
}

/**
 * Get a specific organization (admin only)
 * Only admins can call this
 */
export async function getOrganizationById(organizationId) {
  const res = await fetch(`${API_URL}/organizations/${organizationId}`, {
    headers: authHeaders(),
  });

  const result = await res.json();
  if (!res.ok) {
    // Handle authentication/authorization errors
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("organizationId");
      window.location.href = "/login";
    }
    throw new Error(result.detail || "Failed to load organization");
  }
  return result;
}

/**
 * Create a new organization (admin only)
 * Only admins can call this
 */
export async function createOrganization(data) {
  const res = await fetch(`${API_URL}/organizations/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("organizationId");
      window.location.href = "/login";
    }
    throw new Error(result.detail || "Failed to create organization");
  }
  return result;
}

/**
 * Delete an organization (admin only)
 * Only admins can call this
 */
export async function deleteOrganization(organizationId) {
  const res = await fetch(`${API_URL}/organizations/${organizationId}`, {
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
    throw new Error(result.detail || "Failed to delete organization");
  }
  return true;
}

/**
 * Get organization statistics (admin only)
 * Only admins can call this
 */
export async function getOrganizationStats(organizationId) {
  const res = await fetch(`${API_URL}/organizations/${organizationId}/stats`, {
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
    throw new Error(result.detail || "Failed to load organization stats");
  }
  return result;
}

/**
 * Get organization members (admin only)
 * Only admins can call this
 */
export async function getOrganizationMembers(organizationId) {
  const res = await fetch(`${API_URL}/organizations/${organizationId}/members`, {
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
    throw new Error(result.detail || "Failed to load organization members");
  }
  return result;
}

/**
 * Transfer organization ownership (admin only)
 * Only admins can call this
 */
export async function transferOrganizationOwnership(organizationId, newOwnerId) {
  const res = await fetch(`${API_URL}/organizations/${organizationId}/transfer-ownership`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ new_owner_id: newOwnerId }),
  });

  const result = await res.json();
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("organizationId");
      window.location.href = "/login";
    }
    throw new Error(result.detail || "Failed to transfer ownership");
  }
  return result;
}