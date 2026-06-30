import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, hasRole, getUserName } from '../../utils/roleUtils';
import Notifications from '../Common/Notifications';
import SubjectSelection from './SubjectSelection';
import ContactInfo from '../Common/ContactInfo';

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [activeTab, setActiveTab] = useState('my-subjects');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = getCurrentUser();
    
    if (!userData || !hasRole('Student')) {
      navigate('/login');
      return;
    }

    setUser(userData);
    loadStudentData(userData);
  }, [navigate]);

  useEffect(() => {
    if (studentData) {
      if (activeTab === 'my-subjects') {
        loadStudentSubjects();
      } else if (activeTab === 'results') {
        fetchStudentResults();
      } else if (activeTab === 'subject-selection') {
        // Subject selection is handled in its own component
      }
    }
  }, [studentData, activeTab, selectedYear, selectedTerm]);

  const loadStudentData = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://school-yathu.onrender.com/api/Student/student-by-email?email=${encodeURIComponent(userData.email)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
      } else {
        const altResponse = await fetch(`https://school-yathu.onrender.com/api/Student/student-by-name?name=${encodeURIComponent(userData.name)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (altResponse.ok) {
          const data = await altResponse.json();
          setStudentData(data);
        } else {
          setStudentData({
            admissionNumber: userData.email?.split('@')[0] || 'N/A',
            fullName: userData.name,
            class: userData.class || 'N/A',
            stream: userData.stream || 'N/A'
          });
        }
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      setStudentData({
        admissionNumber: userData.email?.split('@')[0] || 'N/A',
        fullName: userData.name,
        class: userData.class || 'N/A',
        stream: userData.stream || 'N/A'
      });
    }
  };

  const loadStudentSubjects = async () => {
    if (!studentData) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `https://school-yathu.onrender.com/api/StudentRegistration/student-subjects?class=${encodeURIComponent(studentData.class)}&stream=${encodeURIComponent(studentData.stream)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      } else {
        const altResponse = await fetch(
          `https://school-yathu.onrender.com/api/AdminSubjectAllocation/class-subjects?class=${encodeURIComponent(studentData.class)}&stream=${encodeURIComponent(studentData.stream)}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        if (altResponse.ok) {
          const data = await altResponse.json();
          setSubjects(data.subjects || []);
        } else {
          setSubjects(user.subjects || []);
        }
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentResults = async () => {
    if (!studentData) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `https://school-yathu.onrender.com/api/Results/student-results?admissionNumber=${studentData.admissionNumber}&year=${selectedYear}&term=${selectedTerm}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMarks(data.results || []);
        setRanking(data.ranking || null);
      } else {
        const altResponse = await fetch(
          `https://school-yathu.onrender.com/api/StudentMarks/student-marks?admissionNumber=${studentData.admissionNumber}&year=${selectedYear}&term=${selectedTerm}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        if (altResponse.ok) {
          const data = await altResponse.json();
          setMarks(data.marks || []);
          setRanking(data.ranking || null);
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentClassLevel = () => {
    if (!studentData) return null;
    const className = studentData.class || '';
    if (className.includes('Form 1') || className.includes('Form1')) return 'form1';
    if (className.includes('Form 2') || className.includes('Form2')) return 'form2';
    if (className.includes('Form 3') || className.includes('Form3')) return 'form3';
    if (className.includes('Form 4') || className.includes('Form4')) return 'form4';
    return null;
  };

  const getLetterGrade = (percentage) => {
    if (percentage >= 80) return { grade: 'A', label: 'Excellent' };
    if (percentage >= 65) return { grade: 'B', label: 'Good' };
    if (percentage >= 50) return { grade: 'C', label: 'Average' };
    if (percentage >= 45) return { grade: 'D', label: 'Below Average' };
    if (percentage >= 40) return { grade: 'E', label: 'Poor' };
    return { grade: 'F', label: 'Fail' };
  };

  const getPoints = (percentage) => {
    if (percentage >= 85) return 1;
    if (percentage >= 80) return 2;
    if (percentage >= 65) return 3;
    if (percentage >= 60) return 4;
    if (percentage >= 55) return 5;
    if (percentage >= 50) return 6;
    if (percentage >= 45) return 7;
    if (percentage >= 40) return 8;
    return 9;
  };

  const calculateStudentGrade = (percentage) => {
    const classLevel = getStudentClassLevel();
    const isUpperForm = (classLevel === 'form3' || classLevel === 'form4');
    
    if (isUpperForm) {
      const points = getPoints(percentage);
      return { 
        grade: `${points} point${points !== 1 ? 's' : ''}`, 
        remark: getPointsRemark(points),
        points: points,
        isUpperForm: true
      };
    } else {
      const { grade, label } = getLetterGrade(percentage);
      return { 
        grade: grade, 
        remark: label,
        points: null,
        isUpperForm: false
      };
    }
  };

  const getPointsRemark = (points) => {
    const remarks = {
      1: 'Excellent performance!',
      2: 'Very good performance!',
      3: 'Good performance!',
      4: 'Above average performance!',
      5: 'Average performance.',
      6: 'Satisfactory performance.',
      7: 'Below average. Needs improvement!',
      8: 'Poor performance!',
      9: 'Failed. Must work harder!'
    };
    return remarks[points] || 'Performance needs improvement.';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'text-green-600 bg-green-100 border-green-200',
      'B': 'text-blue-600 bg-blue-100 border-blue-200',
      'C': 'text-yellow-600 bg-yellow-100 border-yellow-200',
      'D': 'text-orange-600 bg-orange-100 border-orange-200',
      'E': 'text-red-600 bg-red-100 border-red-200',
      'F': 'text-red-700 bg-red-200 border-red-300',
      '1 point': 'text-green-600 bg-green-100 border-green-200',
      '2 points': 'text-green-600 bg-green-100 border-green-200',
      '3 points': 'text-blue-600 bg-blue-100 border-blue-200',
      '4 points': 'text-blue-600 bg-blue-100 border-blue-200',
      '5 points': 'text-yellow-600 bg-yellow-100 border-yellow-200',
      '6 points': 'text-yellow-600 bg-yellow-100 border-yellow-200',
      '7 points': 'text-orange-600 bg-orange-100 border-orange-200',
      '8 points': 'text-red-600 bg-red-100 border-red-200',
      '9 points': 'text-red-700 bg-red-200 border-red-300'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const classLevel = getStudentClassLevel();
  const isUpperForm = (classLevel === 'form3' || classLevel === 'form4');

  const menuItems = [
    { id: 'my-subjects', label: '📚 My Subjects' },
    { id: 'results', label: '📊 My Results' },
    { id: 'contacts', label: '📞 Contacts' },  // ✅ Added Contacts tab
  ];

  // ✅ Add Subject Selection for Form 3 and Form 4 students
  if (isUpperForm) {
    menuItems.push({ id: 'subject-selection', label: '📝 Select Subjects' });
  }

  const renderMySubjects = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading your subjects...</p>
        </div>
      );
    }

    return (
      <div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Admission Number</p>
              <p className="font-semibold">{studentData?.admissionNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-semibold">{studentData?.fullName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-semibold">{studentData?.class || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stream</p>
              <p className="font-semibold">{studentData?.stream || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">My Subjects</h2>
              <p className="text-gray-600 mt-1">Total Subjects: {subjects.length}</p>
            </div>
            <button
              onClick={loadStudentSubjects}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Refresh
            </button>
          </div>
          
          {subjects.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No subjects allocated yet.</p>
              <p className="text-sm text-gray-400 mt-2">Please contact the administrator to assign subjects to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjects.map((subject, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <div className="text-lg font-semibold text-blue-800">{subject.name}</div>
                  {subject.code && (
                    <div className="text-sm text-blue-600 mt-1">Code: {subject.code}</div>
                  )}
                  {subject.teacherName && (
                    <div className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Teacher:</span> {subject.teacherName}
                    </div>
                  )}
                  {subject.type && (
                    <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {subject.type}
                    </span>
                  )}
                  {subject.className && (
                    <div className="text-xs text-gray-500 mt-2">
                      Class: {subject.className} {subject.stream}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      );
    }

    return (
      <div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-700">Grading System:</span>
              <span className="ml-2 text-blue-600 font-medium">
                {isUpperForm ? 'Points System (1-9 points)' : 'Letter Grades (A-F)'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {isUpperForm ? '85-100% = 1 point (Best)' : '80-100% = A (Excellent)'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Term 3</option>
              </select>
            </div>
            <div>
              <button 
                onClick={fetchStudentResults} 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {ranking && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border">
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
                <p className="text-sm text-purple-600">Overall Grade</p>
                <p className="text-2xl font-bold text-purple-700">
                  {isUpperForm ? (
                    ranking.grade?.includes('point') ? ranking.grade : `${getPoints(ranking.average || 0)} points`
                  ) : (
                    ranking.grade || getLetterGrade(ranking.average || 0).grade
                  )}
                </p>
              </div>
            </div>
            {ranking.remarks && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700"><strong>Remarks:</strong> {ranking.remarks}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 border">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Marks</h2>
          {marks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No marks available yet.</p>
              <p className="text-sm text-gray-400 mt-2">Check back later when teachers publish results.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test 1 (20%)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test 2 (20%)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Term (60%)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {isUpperForm ? 'Points' : 'Grade'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remark</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marks.map((mark, index) => {
                    const percentage = mark.overallPercentage || 
                      ((mark.test1 || 0) * 0.2 + (mark.test2 || 0) * 0.2 + (mark.endTerm || 0) * 0.6);
                    const gradeInfo = calculateStudentGrade(percentage);
                    const gradeColor = getGradeColor(gradeInfo.grade);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {mark.subjectName || mark.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {mark.test1 !== undefined ? mark.test1 : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {mark.test2 !== undefined ? mark.test2 : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {mark.endTerm !== undefined ? mark.endTerm : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {percentage !== undefined ? percentage.toFixed(1) + '%' : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1 rounded-full font-semibold ${gradeColor}`}>
                            {gradeInfo.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {gradeInfo.remark}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-bold mb-2">
            {isUpperForm ? 'Points Grading Guide (Form 3 & Form 4):' : 'Letter Grade Guide (Form 1 & Form 2):'}
          </h3>
          {isUpperForm ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="bg-green-100 p-2 rounded">85-100% → 1 point (Excellent)</div>
              <div className="bg-green-50 p-2 rounded">80-84% → 2 points (Very Good)</div>
              <div className="bg-blue-50 p-2 rounded">65-79% → 3 points (Good)</div>
              <div className="bg-blue-50 p-2 rounded">60-64% → 4 points (Above Average)</div>
              <div className="bg-yellow-50 p-2 rounded">55-59% → 5 points (Average)</div>
              <div className="bg-yellow-50 p-2 rounded">50-54% → 6 points (Satisfactory)</div>
              <div className="bg-orange-50 p-2 rounded">45-49% → 7 points (Below Average)</div>
              <div className="bg-orange-50 p-2 rounded">40-44% → 8 points (Poor)</div>
              <div className="bg-red-100 p-2 rounded">0-39% → 9 points (Fail)</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="bg-green-100 p-2 rounded">80-100% → A (Excellent)</div>
              <div className="bg-blue-100 p-2 rounded">65-79% → B (Good)</div>
              <div className="bg-yellow-100 p-2 rounded">50-64% → C (Average)</div>
              <div className="bg-orange-100 p-2 rounded">45-49% → D (Below Average)</div>
              <div className="bg-red-100 p-2 rounded">40-44% → E (Poor)</div>
              <div className="bg-red-200 p-2 rounded">0-39% → F (Fail)</div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Note: Test1(20%) + Test2(20%) + End Term(60%) = Overall Percentage
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Hamburger Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-md px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="p-1 rounded-lg hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h1 className="text-sm font-bold">Student Portal</h1>
          <p className="text-xs text-blue-200">Mkondezi Secondary</p>
        </div>
        <div className="flex items-center gap-2">
          <StudentNotifications />
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:fixed z-50
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out
        w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-xl
        h-screen overflow-y-auto
        ${!mobileOpen && 'lg:block'}
      `}>
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-gradient-to-b from-blue-800 to-blue-900 z-10">
          <div className="flex items-center gap-4 p-4 border-b border-blue-700">
            <button
              onClick={handleGoBack}
              className="hover:bg-blue-700 p-2 rounded-full transition-colors flex-shrink-0"
              title="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">Student Portal</h1>
              <p className="text-xs text-blue-200">Mkondezi Secondary</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-700 border-r-4 border-white text-white'
                  : 'hover:bg-blue-700 text-blue-100'
              }`}
            >
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-blue-800 to-transparent p-4 border-t border-blue-700">
          <div className="px-4 py-2 text-sm text-blue-200">
            <p className="font-semibold">{user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-colors mt-2"
          >
            <span className="font-bold text-white">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Desktop Navbar */}
        <nav className="hidden lg:flex fixed top-0 right-0 left-64 z-40 bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-md px-6 py-3 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {classLevel ? classLevel.toUpperCase() : ''}
              {isUpperForm && ' • Points System'}
              {!isUpperForm && classLevel && ' • Letter Grades'}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <StudentNotifications />
            <div className="h-6 w-px bg-blue-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Welcome,</span>
              <span className="text-sm font-bold">{user?.name}</span>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 mt-16 lg:mt-16">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 lg:p-6">
              {activeTab === 'my-subjects' && renderMySubjects()}
              {activeTab === 'results' && renderResults()}
              {activeTab === 'contacts' && <ContactInfo role="Student" />}
              {activeTab === 'subject-selection' && isUpperForm && (
                <SubjectSelection studentData={studentData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;