// src/utils/roleUtils.jsx

/**
 * Get the current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if the current user has a specific role (case insensitive)
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  return user.role.trim().toLowerCase() === role.toLowerCase();
};

/**
 * Get the current user's role (normalized)
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  if (!user || !user.role) return null;
  return user.role.trim();
};

/**
 * Check if user is authenticated (has token)
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get user name
 */
export const getUserName = () => {
  const user = getCurrentUser();
  return user?.name || 'User';
};

/**
 * Check if user must change password
 */
export const mustChangePassword = () => {
  const user = getCurrentUser();
  return user?.mustChangePassword === true;
};