// frontend/src/utils/Auth.js

// Save token in localStorage
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

// Get token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Remove token
export const removeToken = () => {
  localStorage.removeItem("token");
};

// Save user data in localStorage
export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Get user data
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Remove user
export const removeUser = () => {
  localStorage.removeItem("user");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Logout function
export const logout = () => {
  removeToken();
  removeUser();
};
