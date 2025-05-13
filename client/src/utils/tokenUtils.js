import { jwtDecode } from "jwt-decode";

export const getToken = () => localStorage.getItem('authToken');

export const tokenDecoder = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
};

export const isAdmin = () => {
  const decoded = tokenDecoder();
  if (!decoded) return false;

  const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  return role;
};

export const getCurrentUser = () => {
  const decoded = tokenDecoder();
  return decoded;
};

export const logout = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};
