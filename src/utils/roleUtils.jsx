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
  if (!user) return false;
  
  // Check primary role
  if (user.role?.trim().toLowerCase() === requiredRole.toLowerCase()) {
    return true;
  }
  
  // Check allRoles array
  if (user.allRoles && Array.isArray(user.allRoles)) {
    return user.allRoles.some(role => 
      role.trim().toLowerCase() === requiredRole.toLowerCase()
    );
  }
  
  // Check dashboardRole
  if (user.dashboardRole?.trim().toLowerCase() === requiredRole.toLowerCase()) {
    return true;
  }
  
  // Check secondary roles
  if (user.secondaryRoles && Array.isArray(user.secondaryRoles)) {
    return user.secondaryRoles.some(role => 
      role.trim().toLowerCase() === requiredRole.toLowerCase()
    );
  }
  
  return false;
};

export const getAllRoles = () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  if (user.allRoles && Array.isArray(user.allRoles)) {
    return user.allRoles;
  }
  
  const roles = [user.role];
  if (user.secondaryRoles && Array.isArray(user.secondaryRoles)) {
    roles.push(...user.secondaryRoles);
  }
  if (user.dashboardRole && !roles.includes(user.dashboardRole)) {
    roles.push(user.dashboardRole);
  }
  
  return roles.filter(Boolean);
};

export const isFormTeacher = () => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.isFormTeacher === true || hasRole('FormTeacher');
};

export const canAccessTeacherDashboard = () => {
  const user = getCurrentUser();
  if (!user) return false;
  return hasRole('Teacher') || isFormTeacher();
};

export const getDashboardRole = () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  if (isFormTeacher()) {
    return 'FormTeacher';
  }
  
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
  return hasRole('Teacher') || isFormTeacher();
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
  return hasRole('Teacher') || isFormTeacher();
};

export const isHeadOfDepartment = () => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.isHeadOfDepartment === true || hasRole('HeadOfDepartment');
};

export const isDeputyHeadTeacher = () => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.isDeputyHeadTeacher === true || hasRole('DeputyHeadTeacher');
};

export const isAdmin = () => {
  return hasRole('Admin');
};

export const isTeacher = () => {
  return hasRole('Teacher');
};

export const isStudent = () => {
  return hasRole('Student');
};