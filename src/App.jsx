import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
        
        {/* Default redirect - keep this as a fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;