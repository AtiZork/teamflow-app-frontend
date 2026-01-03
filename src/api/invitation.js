// src/api/invitation.js
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
 * Send an invitation email (admin only)
 */
export async function sendInvitation(data) {
  try {
    const organizationId = getOrganizationId();
    const invitationData = { 
      ...data, 
      organization_id: organizationId 
    };

    const res = await fetch(`${API_URL}/auth/invitations`, { // ✅ Correct endpoint
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(invitationData),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.detail || "Failed to send invitation");
    }

    return result;
  } catch (error) {
    console.error('Send invitation error:', error);
    throw error;
  }
}

/**
 * Resend an invitation to a user by email.
 * Only admins can call this.
 */
export async function resendInvitation(email) {
  try {
    const organizationId = getOrganizationId();
    
    const res = await fetch(`${API_URL}/auth/invitations/resend/${email}?organization_id=${organizationId}`, {
      method: "POST",
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      const msg = result.detail || result.message || "Failed to resend invitation";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Failed to resend invitation");
  }
}

/**
 * Accept invitation
 */
export async function acceptInvitation(data) {
  const res = await fetch(`${API_URL}/auth/invitations/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Failed to accept invitation");
  }

  if (result.user) {
    localStorage.setItem("user", JSON.stringify(result.user));
    if (result.user.organization_id) {
      localStorage.setItem("organizationId", result.user.organization_id.toString());
    }
  }

  return result;
}

/**
 * Validate an invitation token before showing the registration form.
 * Used in /accept-invitation page.
 */
export async function validateInvitation(token) {
  try {
    const res = await fetch(`${API_URL}/auth/invitations/validate/${token}`);
    
    if (!res.ok) {
      const errorResult = await res.json();
      const msg = errorResult.detail || errorResult.message || "Invalid or expired invitation token";
      throw new Error(msg);
    }

    const result = await res.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Failed to validate invitation");
  }
}

/**
 * Get all invitations sent by the current admin (including accepted ones).
 * Organization-scoped to only show invitations from user's organization.
 */
export async function getMyInvitations() {
  try {
    const organizationId = getOrganizationId();
    
    const res = await fetch(`${API_URL}/auth/my-invitations?organization_id=${organizationId}`, {
      headers: authHeaders(),
    });

    const result = await res.json();

    if (!res.ok) {
      const msg = result.detail || result.message || "Failed to fetch invitations";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Failed to fetch invitations");
  }
}

/**
 * Revoke an invitation by invitation ID.
 * Only admins can call this.
 */
export async function revokeInvitation(invitationId) {
  try {
    const organizationId = getOrganizationId();
    
    const res = await fetch(`${API_URL}/auth/invitations/${invitationId}?organization_id=${organizationId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      const result = await res.json();
      const msg = result.detail || result.message || "Failed to revoke invitation";
      throw new Error(msg);
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Failed to revoke invitation");
  }
}

/**
 * Get invitation statistics for the current organization.
 * Only admins can call this.
 */
export async function getInvitationStats() {
  try {
    const organizationId = getOrganizationId();
    
    const res = await fetch(`${API_URL}/auth/invitations/stats?organization_id=${organizationId}`, {
      headers: authHeaders(),
    });

    const result = await res.json();
    if (!res.ok) {
      const msg = result.detail || result.message || "Failed to fetch invitation stats";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Failed to fetch invitation stats");
  }
}

/**
 * Bulk send invitations to multiple users.
 * Only admins can call this.
 */
export async function bulkSendInvitations(emails, role = "member") {
  try {
    const organizationId = getOrganizationId();
    
    const invitationData = {
      emails: emails,
      role: role,
      organization_id: organizationId
    };

    const res = await fetch(`${API_URL}/auth/invitations/bulk`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(invitationData),
    });

    const result = await res.json();
    if (!res.ok) {
      const msg = result.detail || result.message || "Failed to send bulk invitations";
      throw new Error(msg);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Failed to send bulk invitations");
  }
}

// src/api/invitation.js
export const getOrganizationMembers = async () => {
  try {
    const orgId = localStorage.getItem("organization_id");
    if (!orgId) {
      console.warn("No organization ID found in localStorage");
      return [];
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/organizations/${orgId}/members`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });

    if (!res.ok) throw new Error("Failed to fetch organization members");
    return await res.json();
  } catch (error) {
    console.error("Error fetching organization members:", error);
    throw error;
  }
};

/* -------------------------------------------------- */
/* Re-export aliases so both names work everywhere    */
/* -------------------------------------------------- */
export { validateInvitation as validateInvitationToken };