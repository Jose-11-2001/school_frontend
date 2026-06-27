import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home.jsx';
import Login from './components/Auth/Login.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import TeacherDashboard from './components/Teacher/TeacherDashboard.jsx';
import StudentDashboard from './components/Student/StudentDashboard.jsx';
import ChangePassword from './components/Auth/ChangePassword.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔍 App - Token:', !!token);
    console.log('🔍 App - User data:', userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('🔍 App - Parsed user:', parsedUser);
        console.log('🔍 App - Role:', parsedUser.role);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ App - Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // ✅ Helper function for case-insensitive role check
  const hasRole = (role) => {
    if (!user?.role) return false;
    return user.role.trim().toLowerCase() === role.toLowerCase();
  };

  console.log('🔍 App - Current user role:', user?.role);
  console.log('🔍 App - Is Admin:', hasRole('Admin'));
  console.log('🔍 App - Is Teacher:', hasRole('Teacher'));
  console.log('🔍 App - Is Student:', hasRole('Student'));

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* Protected Routes - Using case-insensitive check */}
        <Route 
          path="/admin-dashboard" 
          element={hasRole('Admin') ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/teacher-dashboard" 
          element={hasRole('Teacher') ? <TeacherDashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/student-dashboard" 
          element={hasRole('Student') ? <StudentDashboard /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;