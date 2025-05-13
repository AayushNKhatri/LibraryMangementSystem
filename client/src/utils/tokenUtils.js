/**
 * Utility functions for handling JWT tokens
 */

import { jwtDecode } from 'jwt-decode';

/**
 * Decodes a JWT token using jwt-decode library
 * @param {string} token - The JWT token
 * @returns {object|null} The decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};

/**
 * Checks if the token is valid and not expired
 * @returns {boolean} Whether the token is valid
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  try {
    const decoded = decodeToken(token);
    const expirationTime = decoded.exp * 1000;
    return Date.now() < expirationTime;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

/**
 * Gets the current user's details from the token
 * @returns {object} User details
 */
export const getCurrentUser = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  const decodedToken = decodeToken(token);
  if (!decodedToken) return null;

  const userId = decodedToken.sub || '';
  const email = decodedToken.email || '';
  const username = decodedToken.name || email.split('@')[0] || 'User';
  const roles = getUserRoles();

  return { id: userId, email, username, roles };
};

/**
 * Gets the roles from the JWT token
 * @returns {string[]} Array of user roles
 */
export const getUserRoles = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return [];

  try {
    const decodedToken = decodeToken(token);
    const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role || decodedToken.roles || [];
    return Array.isArray(roles) ? roles : [roles];
  } catch {
    return [];
  }
};

/**
 * Checks if the current user is an admin
 * @returns {boolean} Whether the user is an admin
 */
export const isAdmin = () => getUserRoles().includes('Admin');

/**
 * Sets the authentication token
 * @param {string} token - The JWT token to store
 */
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
  window.dispatchEvent(new Event('tokenUpdated'));
};

/**
 * Logs out the user by removing the token
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  window.dispatchEvent(new Event('tokenUpdated'));
};
export const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    if(token){
        return true;
    }
    else {
        return false
    }
}
