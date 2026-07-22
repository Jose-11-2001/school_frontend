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

/**
 * Check if the current user has teacher allocations
 * (can be used as a teacher)
 */
export const hasTeacherAllocations = () => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Check if user has teacherAllocations property
  if (user.hasTeacherAllocations !== undefined) {
    return user.hasTeacherAllocations;
  }
  
  // Check if role is Teacher or FormTeacher
  return hasRole('Teacher') || hasRole('FormTeacher');
};

/**
 * Set teacher allocation status for the current user
 */
export const setTeacherAllocations = (hasAllocations) => {
  const user = getCurrentUser();
  if (user) {
    user.hasTeacherAllocations = hasAllocations;
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * Check if user can switch to teacher mode
 * (Admin or DeputyHeadTeacher with teacher allocations)
 */
export const canSwitchToTeacherMode = () => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const isAdminOrDeputy = hasRole('Admin') || hasRole('DeputyHeadTeacher');
  return isAdminOrDeputy && hasTeacherAllocations();
};