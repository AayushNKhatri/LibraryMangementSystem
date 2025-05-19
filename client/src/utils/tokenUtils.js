import { jwtDecode } from "jwt-decode";

// Get token from localStorage
export const getToken = () => localStorage.getItem('authToken');

// Decode token and handle errors
export const tokenDecoder = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('authToken');
      return null;
    }
    return decoded;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem('authToken');
    return null;
  }
};

// Get user roles from token
export const getUserRoles = () => {
  const decoded = tokenDecoder();
  if (!decoded) return [];

  // Get roles from .NET Identity claim
  let roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  // Fallback to other formats if needed
  if (!roles) {
    roles = decoded.role || decoded.roles || [];
  }

  // Normalize to array
  return Array.isArray(roles) ? roles : [roles];
};

// Check if user has admin role
export const isAdmin = () => {
  const roles = getUserRoles();
  return roles.includes('Admin');
};

// Check if user has a specific role
export const hasRole = (role) => {
  const roles = getUserRoles();
  return roles.includes(role);
};

// Get current user information
export const getCurrentUser = () => {
  return tokenDecoder();
};

// Logout user by removing token
export const logout = () => {
  localStorage.removeItem('authToken');
};

// Check if user is authenticated (token exists and is valid)
export const isAuthenticated = () => {
  return tokenDecoder() !== null;
};

// Set authentication token
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};
