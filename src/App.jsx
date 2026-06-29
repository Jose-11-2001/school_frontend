import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import ChangePassword from './components/Auth/ChangePassword';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔍 App - Token exists:', !!token);
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
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // ✅ DIRECT ROLE CHECK - NO UTILITY FUNCTIONS
  const getUserRole = () => {
    try {
      const data = localStorage.getItem('user');
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.role?.trim()?.toLowerCase() || null;
    } catch {
      return null;
    }
  };

  const role = getUserRole();
  
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  console.log('🔍 App - Role from localStorage:', role);
  console.log('🔍 App - Is Admin:', isAdmin);
  console.log('🔍 App - Is Teacher:', isTeacher);
  console.log('🔍 App - Is Student:', isStudent);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* Protected Routes */}
        <Route 
          path="/admin-dashboard" 
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/teacher-dashboard" 
          element={isTeacher ? <TeacherDashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/student-dashboard" 
          element={isStudent ? <StudentDashboard /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;