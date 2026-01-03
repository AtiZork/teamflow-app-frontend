
// src/api/auth.js 
import { API_URL } from "../config/apiConfig";
console.log(API_URL);

/* --------------------  SignUp  -------------------- */
export async function signupUser(data) {
  const signupData = {
    full_name: data.full_name || data.fullName,
    email: data.email,
    password: data.password,
  };

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signupData),
  });

  const result = await res.json();

  if (!res.ok) {
    if (res.status === 422 && result.detail && Array.isArray(result.detail)) {
      throw new Error(result.detail[0].msg || "Validation error");
    }
    
    let errorMessage = "Signup failed";
    if (typeof result === 'object') {
      if (result.detail) {
        errorMessage = Array.isArray(result.detail) 
          ? result.detail[0].msg 
          : result.detail;
      } else if (result.message) {
        errorMessage = result.message;
      } else {
        errorMessage = Object.values(result).join(', ');
      }
    } else {
      errorMessage = result;
    }
    
    throw new Error(errorMessage);
  }

  // Store token and user data
  if (result.access_token) {
    localStorage.setItem("token", result.access_token);
  }
  if (result.user) {
    localStorage.setItem("user", JSON.stringify(result.user));
    if (result.user.organization_id) {
      localStorage.setItem("organizationId", result.user.organization_id.toString());
    }
  }

  return result;
}

/* --------------------  SignIn  -------------------- */
export async function loginUser(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    if (res.status === 422 && result.detail && Array.isArray(result.detail)) {
      throw new Error(result.detail[0].msg || "Validation error");
    }
    const errorDetail = result.detail || result.message || "Login failed";
    throw new Error(errorDetail);
  }

  // Store token and user data
  if (result.access_token) {
    localStorage.setItem("token", result.access_token);
  }
  if (result.user) {
    localStorage.setItem("user", JSON.stringify(result.user));
    if (result.user.organization_id) {
      localStorage.setItem("organizationId", result.user.organization_id.toString());
    }
  }

  return result;
}

/* --------------------  Get Current User  -------------------- */
export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("organizationId");
    throw new Error("Authentication failed");
  }

  const result = await res.json();
  if (!res.ok) throw new Error(result.detail || "Failed to get user data");
  
  return result;
}

/* --------------------  Logout  -------------------- */
export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("organizationId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");
  window.location.href = "/login";
}

// Export aliases for backwards compatibility
export const login = loginUser;
export const signup = signupUser;
export const logout = logoutUser;