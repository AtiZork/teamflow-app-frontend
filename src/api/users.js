
// src/api/users.js
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

/* --------------------  GET CURRENT USER PROFILE  -------------------- */
export async function getCurrentUser() {
  const res = await fetch(`${API_URL}/auth/me`, {
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
    const msg = result.detail || result.message || "Failed to fetch current user";
    throw new Error(msg);
  }

  return result;
}

/* -----------  GET ORG-SCOPED USERS (ADMIN DASHBOARD)  ----------- */
export async function getUsers() {
  const res = await fetch(`${API_URL}/users/`, {
    headers: authHeaders(),
  });

  const result = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      // Unauthorized → clear login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("organizationId");
      window.location.href = "/login";
    } else if (res.status === 403) {
      // Forbidden → member not allowed to access this resource
      if (import.meta.env.DEV || import.meta.env.NODE_ENV === "development") {
        console.info("Member access restricted (403) — skipping users fetch.");
      }
      return [];
    }
    throw new Error(result.detail || `Unexpected response: ${res.status}`);
  }
  return result;
}

/* --------------------  GET USER BY ID  -------------------- */
export async function getUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
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
    
    // Handle specific forbidden case for members trying to access others
    if (res.status === 403) {
      throw new Error("You can only view users from your organization.");
    }
    const msg = result.detail || result.message || "Failed to load user";
    throw new Error(msg);
  }
  return result;
}

/* --------------------  UPDATE USER  -------------------- */
export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
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
    throw new Error(result.detail || "Update failed");
  }
  return result;
}

/* --------------------  DELETE USER  -------------------- */
// Add to src/api/users.js

/* --------------------  DELETE USER (Super Admin Only)  -------------------- */
export async function deleteUser(userId) {
  const res = await fetch(`${API_URL}/users/${userId}/permanent`, {
    
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
    throw new Error(result.detail || "Failed to delete user");
  }
  
  const result = await res.json();
  return result;
}

/* --------------------  REMOVE MEMBER FROM ORGANIZATION  -------------------- */
// In your API file (users.js or similar)
export const removeMemberFromOrganization = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/auth/members/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to remove member");
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error deleting member ${userId}:`, error);
    throw error;
  }
};


// In your API function that handles member deletion
export const deleteOrganizationMember = async (memberId) => {
  try {
    const token = localStorage.getItem('token');
    const currentUserId = parseInt(localStorage.getItem('userId'));
    
    // Prevent user from deleting themselves
    if (memberId === currentUserId) {
      throw new Error("You cannot delete your own account");
    }

    const response = await fetch(`${API_URL}/auth/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle specific error cases
      if (response.status === 400) {
        throw new Error(errorData.detail || "Cannot delete this user. They may be the organization owner.");
      } else if (response.status === 404) {
        throw new Error("User not found or already deleted");
      } else if (response.status === 500) {
        throw new Error("Cannot delete user who owns projects. Please transfer project ownership first.");
      } else {
        throw new Error(errorData.detail || `Failed to delete member: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error deleting member ${memberId}:`, error);
    throw error;
  }
};

/* --------------------  UPDATE CURRENT USER PROFILE  -------------------- */
export async function updateCurrentUserProfile(data) {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "PUT",
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
    throw new Error(result.detail || "Profile update failed");
  }
  return result;
}

/* --------------------  GET ORGANIZATION MEMBERS  -------------------- */
export async function getOrganizationMembers() {
  const res = await fetch(`${API_URL}/users/organization/members`, {
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

/* --------------------  GET USERS (Member-Safe Version)  -------------------- */
export async function getUsersSafe() {
  try {
    const res = await fetch(`${API_URL}/users/`, {
      headers: authHeaders(),
    });

    if (res.status === 403) {
      // Member not allowed to access full user list
      return [];
    }

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.detail || "Failed to load users");
    }
    return result;
  } catch (error) {
    console.warn("⚠️ Member-safe getUsers failed:", error.message);
    return [];
  }
}