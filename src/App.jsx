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
  
  console.log('🔒 ProtectedRoute Check:', { token: !!token, user, allowedRoles });
  
  if (!token || !user) {
    console.log('🔒 No token or user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Case-insensitive role check
  const userRole = user.role || '';
  const hasAllowedRole = allowedRoles.some(role => 
    userRole.toLowerCase() === role.toLowerCase()
  );
  
  console.log('🔒 User role:', userRole);
  console.log('🔒 Has allowed role?', hasAllowedRole);
  
  if (!hasAllowedRole) {
    console.log('🔒 Invalid role, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔒 Access granted!');
  return children;
};

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = getCurrentUser();
    if (token && userData) {
      console.log('App - User found in localStorage:', userData);
      setUser(userData);
    }
  }, []);

  console.log('App - Current user state:', user);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Deputy Head Teacher Routes */}
        <Route path="/deputy-dashboard" element={
          <ProtectedRoute allowedRoles={['deputyheadteacher']}>
            <DeputyDashboard />
          </ProtectedRoute>
        } />
        
        {/* Teacher Routes */}
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute allowedRoles={['teacher', 'formteacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student-dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        {/* Head of Department Routes */}
        <Route path="/hod-dashboard" element={
          <ProtectedRoute allowedRoles={['headofdepartment']}>
            <HeadOfDepartmentDashboard />
          </ProtectedRoute>
        } />
        
        {/* Form Teacher Routes */}
        <Route path="/form-teacher-dashboard" element={
          <ProtectedRoute allowedRoles={['formteacher']}>
            <FormTeacherDashboard />
          </ProtectedRoute>
        } />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;