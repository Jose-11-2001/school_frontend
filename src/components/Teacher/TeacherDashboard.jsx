import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MyStudents from './Teacher/MyStudents';
import TeacherMarksEntry from './Teacher/TeacherMarksEntry';
import MySubjects from './MySubjects';
import AddStudent from '../AddStudent';
import Rankings from '../Rankings';
import StudentList from './StudentList';

function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'Teacher') {
        navigate('/login');
      }
      setUser(parsedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">School Marks System - Teacher Panel</h1>
            <p className="text-sm opacity-90">Teacher Access</p>
          </div>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 border-b flex-wrap">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'students' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 My Registered Students
          </button>
          <button
            onClick={() => setActiveTab('all-students')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'all-students' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 All Students
          </button>
          <button
            onClick={() => setActiveTab('my-subjects')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'my-subjects' 
                ? 'border-b-2 border-purple-600 text-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📚 My Subjects
          </button>
          <button
            onClick={() => setActiveTab('add-student')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'add-student' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ➕ Add Student
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'marks' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ✍️ Enter Marks
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'rankings' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏆 Rankings
          </button>
        </div>

        <div>
          {activeTab === 'students' && <MyStudents />}
          {activeTab === 'all-students' && <StudentList />}
          {activeTab === 'my-subjects' && <MySubjects />}
          {activeTab === 'add-student' && <AddStudent />}
          {activeTab === 'marks' && <TeacherMarksEntry />}
          {activeTab === 'rankings' && <Rankings />}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
