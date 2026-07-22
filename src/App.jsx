import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import HeadOfDepartmentDashboard from './components/HeadOfDepartment/HeadOfDepartmentDashboard';
import FormTeacherDashboard from './components/FormTeacher/FormTeacherDashboard';
import DeputyDashboard from './components/Deputy/DeputyDashboard';
import ChangePassword from './components//Auth/ChangePassword';
import { getCurrentUser, hasRole } from './utils/roleUtils';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  
  if (!token || !user) {
    return <Navigate to="/components/Auth/Login" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => hasRole(role));
  
  if (!hasAllowedRole) {
    return <Navigate to="/components/Auth/Login" replace />;
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
        <Route path="/components/Auth/Login" element={<Login setUser={setUser} />} />
        <Route path="/components/Auth/ChangePassword" element={<ChangePassword />} />
        
        {/* Admin Routes */}
        <Route path="/components/Admin/AdminDashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Deputy Head Teacher Routes */}
        <Route path="/components/Deputy/DeputyDashboard" element={
          <ProtectedRoute allowedRoles={['DeputyHeadTeacher']}>
            <DeputyDashboard />
          </ProtectedRoute>
        } />
        
        {/* Teacher Routes */}
        <Route path="/components/Teacher/TeacherDashboard" element={
          <ProtectedRoute allowedRoles={['Teacher', 'FormTeacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/components/Student/StudentDashboard" element={
          <ProtectedRoute allowedRoles={['Student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        {/* Head of Department Routes */}
        <Route path="/components/HeadOfDepartment/HeadOfDepartmentDashboard" element={
          <ProtectedRoute allowedRoles={['HeadOfDepartment']}>
            <HeadOfDepartmentDashboard />
          </ProtectedRoute>
        } />
        
        {/* Form Teacher Routes */}
        <Route path="/components/Teacher/FormTeacherDashboard" element={
          <ProtectedRoute allowedRoles={['FormTeacher']}>
            <FormTeacherDashboard />
          </ProtectedRoute>
        } />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/components/Auth/Login" replace />} />
        <Route path="*" element={<Navigate to="/components/Auth/Login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;