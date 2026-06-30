import React, { useState, useEffect } from 'react';
import Notifications from '../Common/Notifications';

function HodDashboard() {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalSubjects: 0,
    totalStudents: 0,
    pendingApprovals: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get department stats
      const deptResponse = await fetch('https://school-yathu.onrender.com/api/HeadOfDepartment/my-department', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const deptData = await deptResponse.json();
      
      // Get teachers
      const teachersResponse = await fetch('https://school-yathu.onrender.com/api/HeadOfDepartment/department-teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const teachers = await teachersResponse.json();
      
      // Get subjects
      const subjectsResponse = await fetch('https://school-yathu.onrender.com/api/HeadOfDepartment/department-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subjects = await subjectsResponse.json();

      setStats({
        totalTeachers: deptData.teacherCount || 0,
        totalSubjects: deptData.subjectCount || 0,
        totalStudents: teachers.reduce((sum, t) => sum + (t.studentCount || 0), 0),
        pendingApprovals: 0,
        recentActivities: []
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📊 Department Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">👨‍🏫 Teachers</p>
          <p className="text-2xl font-bold text-blue-700">{stats.totalTeachers}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">📚 Subjects</p>
          <p className="text-2xl font-bold text-green-700">{stats.totalSubjects}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600">👨‍🎓 Students</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.totalStudents}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600">⏳ Pending</p>
          <p className="text-2xl font-bold text-purple-700">{stats.pendingApprovals}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-700 mb-3">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
            👨‍🏫 Manage Teachers
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
            📚 Manage Subjects
          </button>
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm">
            📈 View Results
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
            📊 Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default HodDashboard;