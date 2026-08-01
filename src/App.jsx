import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './components/common/Home';
import Login from './components/Auth/Login';
import ChangePassword from './components/Auth/ChangePassword';
import AdminDashboard from './components/Admin/AdminDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import HeadOfDepartmentDashboard from './components/HeadOfDepartment/HeadOfDepartmentDashboard';
import FormTeacherDashboard from './components/FormTeacher/FormTeacherDashboard';
import DeputyDashboard from './components/Deputy/DeputyDashboard';
import { getCurrentUser, hasRole, getDashboardRole } from './utils/roleUtils';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the allowed roles (case-insensitive)
  const hasAllowedRole = allowedRoles.some(role => hasRole(role));
  
  if (!hasAllowedRole) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = getCurrentUser();
    if (token && userData) {
      setUser(userData);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login setUser={setUser} />} />
          <Route path="change-password" element={<ChangePassword />} />
          
          {/* Admin Routes */}
          <Route path="admin-dashboard" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Deputy Head Teacher Routes */}
          <Route path="deputy-dashboard" element={
            <ProtectedRoute allowedRoles={['DeputyHeadTeacher']}>
              <DeputyDashboard />
            </ProtectedRoute>
          } />
          
          {/* Teacher Routes */}
          <Route path="teacher-dashboard" element={
            <ProtectedRoute allowedRoles={['Teacher', 'FormTeacher', 'HeadOfDepartment']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="student-dashboard" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          {/* Head of Department Routes */}
          <Route path="hod-dashboard" element={
            <ProtectedRoute allowedRoles={['HeadOfDepartment']}>
              <HeadOfDepartmentDashboard />
            </ProtectedRoute>
          } />
          
          {/* Form Teacher Routes */}
          <Route path="form-teacher-dashboard" element={
            <ProtectedRoute allowedRoles={['FormTeacher']}>
              <FormTeacherDashboard />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;