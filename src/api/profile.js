// src/api/profile.js
import { API_URL } from "../config/apiConfig";
console.log(API_URL);

/* ============================================================
   ✅ Get My Profile
   Endpoint: GET /profile/me
   Auth: Bearer Token
   ============================================================ */
export async function getMyProfile() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_URL}/profile/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.detail || "Failed to fetch profile");

  // ✅ Normalize snake_case → camelCase for frontend
  return {
    id: result.id,
    fullName: result.full_name ?? "",
    email: result.email ?? "",
    username: result.username ?? "",
    role: result.role ?? "",
    isActive: result.is_active ?? true,
    department: result.department ?? "",
    jobTitle: result.job_title ?? "",
    phoneNumber: result.phone_number ?? "",
    timeZone: result.time_zone ?? "UTC",
    bio: result.bio ?? "",
    skills: result.skills
      ? Array.isArray(result.skills)
        ? result.skills
        : typeof result.skills === 'string' 
          ? result.skills.split(",").map((s) => s.trim()).filter(s => s)
          : []
      : [],
    profilePicture: result.profile_picture 
      ? result.profile_picture.startsWith('http') 
        ? result.profile_picture 
        : `${API_URL}${result.profile_picture}`
      : null,
    organizationId: result.organization_id ?? null,
    createdAt: result.created_at ?? "",
    dateJoined: result.date_joined ?? "",
  };
}

/* ============================================================
   ✅ Update My Profile
   Endpoint: PUT /profile/me
   Body: multipart/form-data (text fields + file)
   Auth: Bearer Token
   ============================================================ */
export async function updateMyProfile(data, file = null) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const formData = new FormData();
  
  // ✅ FIX: Send skills as comma-separated string (backend expectation)
  const snakeData = {
    full_name: data.fullName,
    department: data.department,
    job_title: data.jobTitle,
    phone_number: data.phoneNumber,
    time_zone: data.timeZone,
    bio: data.bio,
    skills: Array.isArray(data.skills) ? data.skills.join(",") : data.skills || "",
  };

  for (const [key, value] of Object.entries(snakeData)) {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  }

  if (file) formData.append("file", file);

  const res = await fetch(`${API_URL}/profile/me`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.detail || "Failed to update profile");

  // ✅ Always return complete normalized user data
  return {
    id: result.id,
    fullName: result.full_name ?? "",
    email: result.email ?? "",
    username: result.username ?? "",
    role: result.role ?? "",
    isActive: result.is_active ?? true,
    department: result.department ?? "",
    jobTitle: result.job_title ?? "",
    phoneNumber: result.phone_number ?? "",
    timeZone: result.time_zone ?? "UTC",
    bio: result.bio ?? "",
    skills: result.skills
      ? Array.isArray(result.skills)
        ? result.skills
        : typeof result.skills === 'string'
          ? result.skills.split(",").map((s) => s.trim()).filter(s => s)
          : []
      : [],
    profilePicture: result.profile_picture 
      ? result.profile_picture.startsWith('http') 
        ? result.profile_picture 
        : `${API_URL}${result.profile_picture}`
      : null,
    organizationId: result.organization_id ?? null,
    createdAt: result.created_at ?? "",
    dateJoined: result.date_joined ?? "",
  };
}

/* ============================================================
   ✅ Get Organization Members' Profiles
   Endpoint: GET /profile/organization/members
   Auth: Bearer Token
   ============================================================ */
export async function getOrganizationProfiles() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_URL}/profile/organization/members`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.detail || "Failed to fetch organization members");

  // ✅ Normalize array results
  return result.map((user) => ({
    id: user.id,
    fullName: user.full_name ?? "",
    email: user.email ?? "",
    role: user.role ?? "",
    department: user.department ?? "",
    jobTitle: user.job_title ?? "",
    phoneNumber: user.phone_number ?? "",
    timeZone: user.time_zone ?? "UTC",
    bio: user.bio ?? "",
    skills: user.skills
      ? Array.isArray(user.skills)
        ? user.skills
        : typeof user.skills === 'string'
          ? user.skills.split(",").map((s) => s.trim()).filter(s => s)
          : []
      : [],
    profilePicture: user.profile_picture 
      ? user.profile_picture.startsWith('http') 
        ? user.profile_picture 
        : `${API_URL}${user.profile_picture}`
      : null,
    organizationId: user.organization_id ?? null,
  }));
}