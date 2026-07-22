import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import HeadOfDepartmentDashboard from './pages/HeadOfDepartmentDashboard';
import FormTeacherDashboard from './pages/FormTeacherDashboard';
import ChangePassword from './pages/ChangePassword';
import { getCurrentUser, hasRole } from './utils/roleUtils';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => hasRole(role));
  
  if (!hasAllowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    const userData = getCurrentUser();
    if (token && userData) {
      setUser(userData);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;