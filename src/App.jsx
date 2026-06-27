import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import ChangePassword from './components/Auth/ChangePassword';
import { getCurrentUser } from './utils/roleUtils';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = getCurrentUser();
    console.log('🔍 App - User data:', userData);
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // ✅ Exact match with backend roles (Admin, Teacher, Student)
  const isAdmin = user?.role === 'Admin';
  const isTeacher = user?.role === 'Teacher';
  const isStudent = user?.role === 'Student';

  console.log('🔍 App - User role:', user?.role);
  console.log('🔍 App - Is Admin:', isAdmin);

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