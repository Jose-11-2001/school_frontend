// src/utils/roleUtils.js

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

export const hasRole = (role) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  return user.role.trim().toLowerCase() === role.toLowerCase();
};

export const getUserRole = () => {
  const user = getCurrentUser();
  if (!user || !user.role) return null;
  return user.role.trim();
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
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