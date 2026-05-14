import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import { generateGradePDF } from './PDFGenerator';

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [marks, setMarks] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
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
      fetchStudentData(parsedUser.id);
    }
  }, [navigate]);

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
        admissionNumber: user.email.split('@')[0],
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
    if (user) {
      fetchStudentData(user.id);
    }
  }, [selectedYear, selectedTerm]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading your data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">School Marks System - Student Portal</h1>
            <p className="text-sm opacity-90">Student Access</p>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4 items-end">
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
              <button
                onClick={handleFilterChange}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Apply Filter
              </button>
            </div>
            {marks.length > 0 && ranking && (
              <div>
                <button
                  onClick={handleDownloadPDF}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Download PDF Report
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
            <p className="text-gray-500 text-center py-8">No marks available yet.</p>
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
                  {marks.map((mark, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.subjectName || mark.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{mark.score}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          mark.grade === 'A+' ? 'bg-green-100 text-green-800' :
                          mark.grade === 'A' ? 'bg-green-50 text-green-700' :
                          mark.grade === 'E' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {mark.grade || calculateGrade(mark.score).grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {mark.remark || calculateGrade(mark.score).remark}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.term}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

export default StudentDashboard;