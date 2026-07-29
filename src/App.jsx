import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Home from './components/Home';
import AdminDashboard from './components/Admin/AdminDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import HeadOfDepartmentDashboard from './components/HeadOfDepartment/HeadOfDepartmentDashboard';
import FormTeacherDashboard from './components/FormTeacher/FormTeacherDashboard';
import DeputyDashboard from './components/Deputy/DeputyDashboard';
import ChangePassword from './components/Auth/ChangePassword';
import { getCurrentUser, hasRole } from './utils/roleUtils';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  
  console.log('🔒 ProtectedRoute Check:', { token: !!token, user, allowedRoles });
  
  if (!token || !user) {
    console.log('🔒 No token or user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Ensure user has a role
  if (!user.role) {
    console.log('🔒 User has no role, redirecting to login');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Use hasRole for case-insensitive comparison
  const hasAllowedRole = allowedRoles.some(role => hasRole(role));
  
  console.log('🔒 User role:', user?.role);
  console.log('🔒 Has allowed role?', hasAllowedRole);
  
  if (!hasAllowedRole) {
    console.log('🔒 Invalid role, redirecting to login');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  console.log('🔒 Access granted!');
  return children;
};

// Wrapper component to handle navigation
function AppContent() {
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = getCurrentUser();
    
    console.log('========================================');
    console.log('🔍 App.js - Initialization Check');
    console.log('  Token exists:', !!token);
    console.log('  User data:', userData);
    console.log('  User role:', userData?.role);
    console.log('  Current path:', window.location.pathname);
    console.log('========================================');
    
    if (token && userData) {
      console.log('✅ App - User found in localStorage:', userData);
      setUser(userData);
    } else {
      console.log('❌ App - No valid user data found');
      // Clear invalid state if not on public pages
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  }, [navigate]);

  console.log('App - Current user state:', user);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/change-password" element={<ChangePassword />} />
      
      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Deputy Head Teacher Routes */}
      <Route path="/deputy-dashboard" element={
        <ProtectedRoute allowedRoles={['DeputyHeadTeacher']}>
          <DeputyDashboard />
        </ProtectedRoute>
      } />
      
      {/* Teacher Routes */}
      <Route path="/teacher-dashboard" element={
        <ProtectedRoute allowedRoles={['Teacher', 'FormTeacher']}>
          <TeacherDashboard />
        </ProtectedRoute>
      } />
      
      {/* Student Routes */}
      <Route path="/student-dashboard" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      
      {/* Head of Department Routes */}
      <Route path="/hod-dashboard" element={
        <ProtectedRoute allowedRoles={['HeadOfDepartment']}>
          <HeadOfDepartmentDashboard />
        </ProtectedRoute>
      } />
      
      {/* Form Teacher Routes */}
      <Route path="/form-teacher-dashboard" element={
        <ProtectedRoute allowedRoles={['FormTeacher']}>
          <FormTeacherDashboard />
        </ProtectedRoute>
      } />
      
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;