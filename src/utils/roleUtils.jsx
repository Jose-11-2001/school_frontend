// src/utils/roleUtils.js

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  // Case-insensitive comparison with trim
  return user.role.trim().toLowerCase() === requiredRole.toLowerCase();
};

// Check dashboard role (for redirection)
export const getDashboardRole = () => {
  const user = getCurrentUser();
  if (!user) return null;
  return user.dashboardRole || user.role || 'Student';
};

export const getUserRole = () => {
  const user = getCurrentUser();
  if (!user || !user.role) return null;
  return user.role.trim();
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token') && !!getCurrentUser();
};

export const getUserName = () => {
  const user = getCurrentUser();
  return user?.name || 'User';
};

export const mustChangePassword = () => {
  const user = getCurrentUser();
  return user?.mustChangePassword === true;
};

export const hasTeacherAllocations = () => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.hasTeacherAllocations !== undefined) {
    return user.hasTeacherAllocations;
  }
  return hasRole('Teacher') || hasRole('FormTeacher');
};

export const setTeacherAllocations = (hasAllocations) => {
  const user = getCurrentUser();
  if (user) {
    user.hasTeacherAllocations = hasAllocations;
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const canSwitchToTeacherMode = () => {
  const user = getCurrentUser();
  if (!user) return false;
  const isAdminOrDeputy = hasRole('Admin') || hasRole('DeputyHeadTeacher');
  return isAdminOrDeputy && hasTeacherAllocations();
};

// Check if user is a Head of Department
export const isHeadOfDepartment = () => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.isHeadOfDepartment === true || hasRole('HeadOfDepartment');
};

// Check if user is a Form Teacher
export const isFormTeacher = () => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.isFormTeacher === true || hasRole('FormTeacher');
};