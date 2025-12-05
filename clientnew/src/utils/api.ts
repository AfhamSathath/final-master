import axios, { AxiosInstance } from "axios";

// ✅ Create a reusable Axios instance
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000", // Backend URL
  withCredentials: true, // Include cookies if backend uses them
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get token from localStorage
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - redirecting to login...");
      localStorage.removeItem("token"); // Clear token
      window.location.href = "/login"; // Redirect to login
    } else if (error.response?.status === 403) {
      console.warn("Forbidden - you do not have access");
    }
    return Promise.reject(error);
  }
);

// ✅ Optional utility: fetch data with type safety
export const fetchData = async <T>(url: string): Promise<T> => {
  const response = await api.get<T>(url);
  return response.data;
};

// ✅ Default export
export default api;
