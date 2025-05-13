import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Check if token exists and is valid
const isTokenValid = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const decoded = jwtDecode(token);

    // Check expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('authToken');
      return false;
    }

    return true;
  } catch (error) {
    localStorage.removeItem('authToken');
    return false;
  }
};

// Get user roles from token
const getUserRoles = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return [];

    const decoded = jwtDecode(token);

    // Get roles from .NET Identity claim
    let roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    // Fallback to other formats if needed
    if (!roles) {
      roles = decoded.role || decoded.roles || [];
    }

    // Normalize to array
    return Array.isArray(roles) ? roles : [roles];
  } catch {
    return [];
  }
};

// Check if user has specific role
const hasRole = (role) => {
  const roles = getUserRoles();
  return roles.includes(role);
};

/**
 * Admin-only route (using Outlet pattern)
 */
export const AdminRoute = () => {
  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('Admin')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/**
 * User-only route - any authenticated user (using Outlet pattern)
 */
export const UserRoute = () => {
  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Alias for backward compatibility
export const ProtectedRoute = UserRoute;

/**
 * Public route (using Outlet pattern)
 */
export const PublicRoute = () => {
  return <Outlet />;
};

/**
 * Role-based protection for wrapping components directly
 */
export const RoleProtectedRoute = ({ children, allowedRoles }) => {
  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = getUserRoles();
  const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};
