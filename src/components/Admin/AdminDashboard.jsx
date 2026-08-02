import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, hasRole, getUserName, hasTeacherAllocations } from '../../utils/roleUtils';
import Notifications from '../Common/Notifications';
import TeacherManagement from './TeacherManagement';
import ClassManagement from './ClassManagement';
import ResultsApproval from './ResultsApproval';
import StudentList from './StudentList';
import AdminUserManagement from './AdminUserManagement';
import Rankings from '../Common/Rankings';
import AdminSubjectAllocation from '../A/AdminSubjectAllocation';
import StudentRegistration from './StudentRegistration';
import SubjectAllocation from './SubjectAllocation';
import SubjectAssignment from './SubjectAssignment';
import SubjectsManagement from './SubjectsManagement';
import DepartmentManagement from './DepartmentManagement';
import FormTeacherAssignment from './FormTeacherAssignment';
import HeadOfDepartmentAssignment from './HeadOfDepartmentAssignment';
import DeputyAssignment from './DeputyAssignment';
import StudentDetailsModal from './StudentDetailsModal';
import TeacherMarksEntry from '../Teacher/TeacherMarksEntry';
import MySubjects from '../Teacher/MySubjects';
import MyStudents from '../Teacher/MyStudents';
import SchoolRankings from './SchoolRankings';
import DepartmentRankings from './DepartmentRankings';
import { Navigate } from 'react-router-dom';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshStudents, setRefreshStudents] = useState(false);
  const [hasTeacherAccess, setHasTeacherAccess] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalDepartments: 0,
    totalSubjects: 0,
    totalClasses: 0,
    pendingApprovals: 0,
    totalMarks: 0,
    totalNotifications: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      const userData = getCurrentUser();
      
      if (!token || !userData || !hasRole('Admin')) {
        navigate('/login');
        return;
      }
      
      setUser(userData);
      setHasTeacherAccess(hasTeacherAllocations());
      setIsLoading(false);
      loadStats();
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleStudentRegistered = () => {
    setRefreshStudents(prev => !prev);
  };

  const handleStudentClick = (studentId) => {
    setSelectedStudentId(studentId);
    setShowDetailsModal(true);
  };

  const goToTeacherDashboard = () => {
    navigate('/teacher-dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'teachers', label: 'Teacher Management' },
    { id: 'departments', label: 'Department Management' },
    { id: 'deputy-assignment', label: 'Deputy Head Teacher' },
    { id: 'form-teacher', label: 'Form Teacher Assignment' },
    { id: 'hod-assignment', label: 'Head of Department' },
    { id: 'student-registration', label: 'Register Students' },
    { id: 'students', label: 'Student List' },
    { id: 'users', label: 'Manage Users' },
    { id: 'classes', label: 'Class Management' },
    { id: 'school-rankings', label: 'School Rankings' },
    { id: 'department-rankings', label: 'Department Rankings' },
    { id: 'subject-assignment', label: 'Subject Assignment' },
    { id: 'allocation', label: 'Subject Allocation' },
    { id: 'student-subjects', label: 'Student Subject Allocation' },
    { id: 'subjects', label: 'Manage Subjects' },
    { id: 'secondary-roles', label: 'Secondary Roles' }, 
    { id: 'approval', label: 'Results Approval' },
    { id: 'rankings', label: 'View Rankings' },
  ];

  const teacherMenuItems = [
    { id: 'my-students', label: 'My Students' },
    { id: 'my-subjects', label: 'My Subjects' },
    { id: 'enter-marks', label: 'Enter Marks' },
  ];

  const allMenuItems = hasTeacherAccess 
    ? [...menuItems.slice(0, 1), ...teacherMenuItems, ...menuItems.slice(1)]
    : menuItems;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-md px-3 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1 rounded-lg hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h1 className="text-sm font-bold">Admin Portal</h1>
        </div>
        <div className="flex items-center gap-2">
          <Notifications role="Admin" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* ===== SIDEBAR ===== */}
      <div className={`
        fixed top-0 left-0 z-50
        transition-transform duration-300 ease-in-out
        w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-xl
        h-screen
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        flex flex-col
        overflow-hidden
      `}>
        <div className="flex-shrink-0 bg-gradient-to-b from-blue-800 to-blue-900 z-10">
          <div className="flex items-center gap-4 p-4 border-b border-blue-700">
            <button onClick={handleGoBack} className="hover:bg-blue-700 p-2 rounded-full transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <p className="text-xs text-blue-200">Secondary School</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 sidebar-scroll">
          {allMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-700 border-r-4 border-white text-white'
                  : 'hover:bg-blue-700 text-blue-100'
              }`}
            >
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex-shrink-0 bg-gradient-to-t from-blue-800 to-transparent p-4 border-t border-blue-700 space-y-2">
          <div className="lg:hidden px-2 py-1">
            <p className="text-xs text-blue-200">Welcome, {getUserName()}</p>
            <p className="text-xs text-blue-300 opacity-75">{user?.role || 'Admin'}</p>
          </div>
          
          {hasTeacherAccess && (
            <button
              onClick={goToTeacherDashboard}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Switch to Teacher Dashboard
            </button>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full lg:hidden bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="lg:ml-64 min-h-screen">
        {/* Desktop Navbar */}
        <nav className="hidden lg:flex fixed top-0 right-0 left-64 z-40 bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-md px-6 py-3 justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="bg-blue-700 px-3 py-1 rounded-full text-sm">Admin</span>
            {hasTeacherAccess && (
              <span className="bg-green-600 px-3 py-1 rounded-full text-sm">Teacher</span>
            )}
            <span className="text-sm text-blue-200">
              {stats.pendingApprovals || 0} Pending | {stats.totalStudents || 0} Students
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <Notifications role="Admin" />
            <div className="h-6 w-px bg-blue-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Welcome,</span>
              <span className="text-sm font-bold">{getUserName()}</span>
            </div>
            {hasTeacherAccess && (
              <button onClick={goToTeacherDashboard} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                Teacher Dashboard
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="pt-16 lg:pt-16 px-4 lg:px-6 py-4 lg:py-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 lg:p-6">
              <div className="lg:hidden mb-4">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {allMenuItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>

              {/* ===== DASHBOARD TAB ===== */}
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
                  {loadingStats ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <>
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-blue-600">Total Students</p>
                              <p className="text-2xl font-bold text-blue-700">{stats.totalStudents || 0}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-purple-600">Total Teachers</p>
                              <p className="text-2xl font-bold text-purple-700">{stats.totalTeachers || 0}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-green-600">Total Subjects</p>
                              <p className="text-2xl font-bold text-green-700">{stats.totalSubjects || 0}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-full">
                              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-orange-600">Pending Approvals</p>
                              <p className="text-2xl font-bold text-orange-700">{stats.pendingApprovals || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Second Row of Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-full">
                              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-indigo-600">Total Departments</p>
                              <p className="text-2xl font-bold text-indigo-700">{stats.totalDepartments || 0}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-teal-100 p-2 rounded-full">
                              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-teal-600">Total Classes</p>
                              <p className="text-2xl font-bold text-teal-700">{stats.totalClasses || 0}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-pink-100 p-2 rounded-full">
                              <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-pink-600">Notifications</p>
                              <p className="text-2xl font-bold text-pink-700">{stats.totalNotifications || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-semibold text-gray-700 mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <button 
                            onClick={() => setActiveTab('student-registration')}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Student
                          </button>
                          <button 
                            onClick={() => setActiveTab('teachers')}
                            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Teacher
                          </button>
                          <button 
                            onClick={() => setActiveTab('students')}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Students
                          </button>
                          <button 
                            onClick={() => setActiveTab('classes')}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Manage Classes
                          </button>
                        </div>
                      </div>

                      {/* Teacher Access Info */}
                      {hasTeacherAccess && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            You have teacher access. You can switch to teacher mode to enter marks and manage your students.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'teachers' && <TeacherManagement />}
              {activeTab === 'departments' && <DepartmentManagement />}
              {activeTab === 'deputy-assignment' && <DeputyAssignment />}
              {activeTab === 'form-teacher' && <FormTeacherAssignment />}
              {activeTab === 'hod-assignment' && <HeadOfDepartmentAssignment />}
              {activeTab === 'classes' && <ClassManagement />}
              {activeTab === 'school-rankings' && <SchoolRankings />}
              {activeTab === 'department-rankings' && <DepartmentRankings />}
              {activeTab === 'subject-assignment' && <SubjectAssignment />}
              {activeTab === 'allocation' && <SubjectAllocation />}
              {activeTab === 'student-subjects' && <AdminSubjectAllocation />}
              {activeTab === 'student-registration' && <StudentRegistration onStudentAdded={handleStudentRegistered} />}
              {activeTab === 'subjects' && <SubjectsManagement />}
              {activeTab === 'students' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800">Student Management</h3>
                    <p className="text-sm text-blue-600">View and manage all registered students</p>
                  </div>
                  <StudentList refreshTrigger={refreshStudents} onStudentClick={handleStudentClick} />
                </div>
              )}
              {activeTab === 'users' && <AdminUserManagement />}
              {activeTab === 'approval' && <ResultsApproval />}
              {activeTab === 'rankings' && <Rankings />}
              {activeTab === 'my-students' && <MyStudents />}
              {activeTab === 'my-subjects' && <MySubjects />}
              {activeTab === 'enter-marks' && <TeacherMarksEntry />}
            </div>
          </div>
        </div>
      </div>

      <StudentDetailsModal
        studentId={selectedStudentId}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedStudentId(null);
        }}
      />
    </div>
  );
}

export default AdminDashboard;