import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="Auth/login" element={<Login setUser={setUser} />} />
        <Route path="Auth/register" element={<Register />} />
        
        <Route 
          path="Admin/AdminDashboard" 
          element={user?.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="Teacher/TeacherDashboard" 
          element={user?.role === 'Teacher' ? <TeacherDashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="Student/StudentDashboard" 
          element={user?.role === 'Student' ? <StudentDashboard /> : <Navigate to="/login" />} 
        />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;