import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin, hasRole } from './tokenUtils';

/**
 * Admin-only route
 * - Only allows admin users
 * - Redirects to login if not authenticated
 * - Redirects to home if authenticated but not admin
 */
export const AdminRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/**
 * Admin-restricted route
 * - Prevents admins from accessing non-admin pages
 * - Redirects admins to admin panel
 * - Allows non-admin users to access the page
 */
export const AdminRestrictedRoute = () => {
  if (isAuthenticated() && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

/**
 * Authenticated user route
 * - Requires authentication
 * - Redirects to login if not authenticated
 * - Allows any authenticated user (including admins)
 */
export const AuthenticatedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

/**
 * Public route
 * - Accessible to everyone, including non-authenticated users
 */
export const PublicRoute = () => {
  return <Outlet />;
};

/**
 * Guest-only route
 * - Only accessible to non-authenticated users
 * - Redirects authenticated users to home page
 * - Useful for login/register pages
 */
export const GuestOnlyRoute = () => {
  const location = useLocation();
  
  if (isAuthenticated()) {
    // Redirect admins to admin panel, others to home
    if (isAdmin()) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
// Legacy alias for backward compatibility
export const UserRoute = AuthenticatedRoute;
export const ProtectedRoute = AuthenticatedRoute;

// Public route is already defined above, so this is removed to avoid duplication

/**
 * Role-based protection for wrapping components directly
 */
export const RoleProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const hasAllowedRole = allowedRoles.some(role => hasRole(role));

  if (!hasAllowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};
