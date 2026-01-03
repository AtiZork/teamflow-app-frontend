// src/api/apiClient.js
import axios from "axios";

import { API_URL } from "../config/apiConfig";
console.log(API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // keep if you use cookies; else false
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000,
});

// Add request interceptor to include Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Automatically return data for cleaner API calls
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("organizationId");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

