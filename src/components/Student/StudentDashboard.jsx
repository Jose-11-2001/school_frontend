import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import { generateGradePDF } from './PDFGenerator';
import SubjectRegistration from './Student/SubjectRegistration';

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [marks, setMarks] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [activeTab, setActiveTab] = useState('subjects');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'Student') {
        navigate('/login');
      }
      setUser(parsedUser);
      loadNotifications();
      loadUnreadCount();
      if (activeTab === 'results') {
        fetchStudentData(parsedUser.id);
      }
    }
  }, [navigate, activeTab]);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/StudentNotifications/my-notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/StudentNotifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5123/api/StudentNotifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5123/api/StudentNotifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const fetchStudentData = async (studentId) => {
    try {
      setLoading(true);
      const [marksResponse, rankResponse] = await Promise.all([
        studentAPI.getStudentMarks(studentId, selectedYear, selectedTerm),
        studentAPI.getStudentRank(studentId, selectedYear, selectedTerm)
      ]);
      
      setMarks(marksResponse.data);
      setRanking(rankResponse.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (user && marks.length > 0 && ranking) {
      const studentData = {
        name: user.name,
        admissionNumber: user.email?.split('@')[0] || 'N/A',
        class: ranking.class || 'N/A',
        stream: ranking.stream || 'N/A',
        term: selectedTerm,
        year: selectedYear
      };
      generateGradePDF(studentData, marks, ranking);
    }
  };

  const handleFilterChange = async () => {
    if (user) {
      setLoading(true);
      await fetchStudentData(user.id);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'results') {
      fetchStudentData(user.id);
    }
  }, [selectedYear, selectedTerm, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'ExamResults': return '📢';
      case 'Success': return '✅';
      case 'Warning': return '⚠️';
      default: return '🔔';
    }
  };

  const calculateGrade = (score) => {
    if (score >= 90) return { grade: 'A+', remark: 'Excellent' };
    if (score >= 80) return { grade: 'A', remark: 'Very Good' };
    if (score >= 75) return { grade: 'A-', remark: 'Good' };
    if (score >= 70) return { grade: 'B+', remark: 'Above Average' };
    if (score >= 65) return { grade: 'B', remark: 'Satisfactory' };
    if (score >= 60) return { grade: 'B-', remark: 'Average' };
    if (score >= 55) return { grade: 'C+', remark: 'Fair' };
    if (score >= 50) return { grade: 'C', remark: 'Pass' };
    if (score >= 45) return { grade: 'C-', remark: 'Below Average' };
    if (score >= 40) return { grade: 'D', remark: 'Needs Improvement' };
    return { grade: 'E', remark: 'Fail' };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">School Marks System - Student Portal</h1>
            <p className="text-sm opacity-90">Student Access</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative focus:outline-none"
              >
                <span className="text-2xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
                  <div className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-500 text-center">No notifications</p>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${
                            !notif.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-800">{notif.title}</div>
                              <div className="text-xs text-gray-600 mt-1">{notif.message}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </div>
                            </div>
                            {!notif.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'subjects' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📚 Subject Registration
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'results' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 My Results
          </button>
        </div>

        {activeTab === 'subjects' && <SubjectRegistration />}

        {activeTab === 'results' && (
          <>
            {loading ? (
              <div className="text-center py-8">Loading your data...</div>
            ) : (
              <>
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="flex gap-4 items-end flex-wrap">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-3 py-2 border rounded-lg"
                      >
                        <option value={2023}>2023</option>
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Term</label>
                      <select
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      >
                        <option>Term 1</option>
                        <option>Term 2</option>
                        <option>Term 3</option>
                      </select>
                    </div>
                    <div>
                      <button onClick={handleFilterChange} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Apply Filter
                      </button>
                    </div>
                    {marks.length > 0 && ranking && (
                      <div>
                        <button onClick={handleDownloadPDF} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                          📄 Download PDF Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Summary */}
                {ranking && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Total Marks</p>
                        <p className="text-2xl font-bold text-blue-700">{ranking.totalMarks || 0}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Average Score</p>
                        <p className="text-2xl font-bold text-green-700">{ranking.average || 0}%</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-600">Position</p>
                        <p className="text-2xl font-bold text-yellow-700">#{ranking.position || 'N/A'}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">Grade</p>
                        <p className="text-2xl font-bold text-purple-700">{ranking.grade || 'N/A'}</p>
                      </div>
                    </div>
                    {ranking.remarks && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700"><strong>Remarks:</strong> {ranking.remarks}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Marks Table */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">My Marks</h2>
                  {marks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No marks available yet.</p>
                      <p className="text-sm text-gray-400 mt-2">Check back later when teachers publish results.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remark</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {marks.map((mark, index) => {
                            const gradeInfo = calculateGrade(mark.score);
                            return (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.subjectName || mark.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{mark.score}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                                    mark.grade === 'A+' || gradeInfo.grade === 'A+' ? 'bg-green-100 text-green-800' :
                                    mark.grade === 'A' || gradeInfo.grade === 'A' ? 'bg-green-50 text-green-700' :
                                    mark.grade === 'E' || gradeInfo.grade === 'E' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {mark.grade || gradeInfo.grade}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {mark.remark || gradeInfo.remark}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.term || selectedTerm}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.year || selectedYear}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;