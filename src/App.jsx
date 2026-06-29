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
    console.log('🔍 ====== APP MOUNTED ======');
    
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔍 App - Token exists:', !!token);
    console.log('🔍 App - Token value:', token);
    console.log('🔍 App - User data raw:', userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('🔍 App - Parsed user:', parsedUser);
        console.log('🔍 App - Role:', parsedUser.role);
        console.log('🔍 App - Role type:', typeof parsedUser.role);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ App - Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('🔍 App - No token or user data found');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // ✅ DIRECT CHECK FROM LOCALSTORAGE
  const getRoleFromStorage = () => {
    try {
      const data = localStorage.getItem('user');
      console.log('🔍 getRoleFromStorage - Raw data:', data);
      if (!data) return null;
      const parsed = JSON.parse(data);
      console.log('🔍 getRoleFromStorage - Parsed:', parsed);
      console.log('🔍 getRoleFromStorage - Role:', parsed.role);
      return parsed.role?.trim()?.toLowerCase() || null;
    } catch (error) {
      console.error('❌ getRoleFromStorage - Error:', error);
      return null;
    }
  };

  const role = getRoleFromStorage();
  
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  console.log('🔍 ====== APP STATE ======');
  console.log('🔍 App - Role from localStorage:', role);
  console.log('🔍 App - Is Admin:', isAdmin);
  console.log('🔍 App - Is Teacher:', isTeacher);
  console.log('🔍 App - Is Student:', isStudent);
  console.log('🔍 =========================');

  // ✅ IF NO ROLE, SHOW LOGIN
  if (!role) {
    console.log('🔍 No role found, showing login');
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
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