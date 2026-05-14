import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherManagement from './Admin/TeacherManagement';
import ClassManagement from './Admin/ClassManagement';
import SubjectAllocation from './Admin/SubjectAllocation';
import ResultsApproval from './Admin/ResultsApproval';
import StudentList from './StudentList';
import UserManagement from './UserManagement';
import Rankings from './Rankings';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('teachers');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'Admin') {
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
      <nav className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">School Marks System - Admin Panel</h1>
            <p className="text-sm opacity-90">Administrator Access</p>
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
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'teachers' 
                ? 'border-b-2 border-red-600 text-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👨‍🏫 Teacher Management
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'classes' 
                ? 'border-b-2 border-red-600 text-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📚 Class Management
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'allocation' 
                ? 'border-b-2 border-red-600 text-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎯 Subject Allocation
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'students' 
                ? 'border-b-2 border-red-600 text-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👨‍🎓 Manage Students
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users' 
                ? 'border-b-2 border-red-600 text-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👤 Manage Users
          </button>
          <button
            onClick={() => setActiveTab('approval')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'approval' 
                ? 'border-b-2 border-red-600 text-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ✅ Results Approval
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'rankings' 
                ? 'border-b-2 border-red-600 text-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏆 View Rankings
          </button>
        </div>

        <div>
          {activeTab === 'teachers' && <TeacherManagement />}
          {activeTab === 'classes' && <ClassManagement />}
          {activeTab === 'allocation' && <SubjectAllocation />}
          {activeTab === 'students' && <StudentList />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'approval' && <ResultsApproval />}
          {activeTab === 'rankings' && <Rankings />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;