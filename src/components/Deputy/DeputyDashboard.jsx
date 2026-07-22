import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, hasRole, getUserName, hasTeacherAllocations } from '../../utils/roleUtils';
import Notifications from '../Common/Notifications';
import StudentList from '../Admin/StudentList';
import TeacherManagement from '../Admin/TeacherManagement';
import AdminUserManagement from '../Admin/AdminUserManagement';
import StudentRegistration from '../Admin/StudentRegistration';
import MyAssignments from './MyAssignments';
import SubjectAllocation from '../Admin/SubjectAllocation';
import StudentDetailsModal from '../Admin/StudentDetailsModal';
import TeacherMarksEntry from '../Teacher/TeacherMarksEntry';
import MySubjects from '../Teacher/MySubjects';
import MyStudents from '../Teacher/MyStudents';

function DeputyDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshStudents, setRefreshStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hasTeacherAccess, setHasTeacherAccess] = useState(false);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingAssignments: 0,
    inProgressAssignments: 0,
    completedAssignments: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = getCurrentUser();
    
    if (!userData || !hasRole('DeputyHeadTeacher')) {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    setHasTeacherAccess(hasTeacherAllocations());
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Deputy/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
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

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'assignments', label: 'My Assignments' },
    { id: 'students', label: 'Student List' },
    { id: 'student-registration', label: 'Register Students' },
    { id: 'teachers', label: 'Teacher Management' },
    { id: 'users', label: 'Manage Users' },
    { id: 'subjects', label: 'Subject Allocation' },
  ];

  // Teacher-specific tabs
  const teacherMenuItems = [
    { id: 'my-students', label: 'My Students' },
    { id: 'my-subjects', label: 'My Subjects' },
    { id: 'enter-marks', label: 'Enter Marks' },
  ];

  const allMenuItems = hasTeacherAccess 
    ? [...menuItems.slice(0, 2), ...teacherMenuItems, ...menuItems.slice(2)]
    : menuItems;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Header */}
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
          <h1 className="text-sm font-bold">Deputy Head Teacher</h1>
          <p className="text-xs text-blue-200">Mkondezi Secondary</p>
        </div>
        <div className="flex items-center gap-2">
          <Notifications role="DeputyHeadTeacher" />
          {hasTeacherAccess && (
            <button
              onClick={goToTeacherDashboard}
              className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 text-xs"
            >
              Teacher Mode
            </button>
          )}
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
      `}>
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
              <h1 className="text-xl font-bold">Deputy Portal</h1>
              <p className="text-xs text-blue-200">Mkondezi Secondary</p>
              {hasTeacherAccess && (
                <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">+ Teacher</span>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {allMenuItems.map((item) => (
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

        <div className="sticky bottom-0 bg-gradient-to-t from-blue-800 to-transparent p-4 border-t border-blue-700">
          <div className="px-4 py-2 text-sm text-blue-200">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs opacity-75">Deputy Head Teacher</p>
          </div>
          {hasTeacherAccess && (
            <button
              onClick={goToTeacherDashboard}
              className="w-full mb-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Switch to Teacher Dashboard
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-colors mt-2"
          >
            <span className="text-white font-bold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <nav className="hidden lg:flex fixed top-0 right-0 left-64 z-40 bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-md px-6 py-3 justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="bg-blue-700 px-3 py-1 rounded-full text-sm">
              Deputy Head Teacher
            </span>
            <span className="text-sm text-blue-200">
              {stats.pendingAssignments} Pending | {stats.totalAssignments} Total
            </span>
            {hasTeacherAccess && (
              <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                Teacher
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <Notifications role="DeputyHeadTeacher" />
            <div className="h-6 w-px bg-blue-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Welcome,</span>
              <span className="text-sm font-bold">{getUserName()}</span>
            </div>
            {hasTeacherAccess && (
              <button
                onClick={goToTeacherDashboard}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              >
                Teacher Dashboard
              </button>
            )}
          </div>
        </nav>

        <div className="flex-1 p-4 lg:p-6 mt-16 lg:mt-16">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600">Total Assignments</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalAssignments}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.pendingAssignments}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-600">In Progress</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.inProgressAssignments}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600">Completed</p>
                    <p className="text-2xl font-bold text-green-700">{stats.completedAssignments}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-700 mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                      onClick={() => setActiveTab('assignments')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      View Assignments
                    </button>
                    <button 
                      onClick={() => setActiveTab('student-registration')}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      Add Student
                    </button>
                    <button 
                      onClick={() => setActiveTab('teachers')}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                    >
                      Add Teacher
                    </button>
                    <button 
                      onClick={() => setActiveTab('students')}
                      className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                    >
                      View Students
                    </button>
                  </div>
                </div>
                {hasTeacherAccess && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                      You have teacher access. You can switch to teacher mode to enter marks and manage your students.
                    </p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'assignments' && <MyAssignments />}
            {activeTab === 'students' && (
              <StudentList 
                refreshTrigger={refreshStudents} 
                onStudentClick={handleStudentClick}
              />
            )}
            {activeTab === 'student-registration' && (
              <StudentRegistration onStudentAdded={handleStudentRegistered} />
            )}
            {activeTab === 'teachers' && <TeacherManagement />}
            {activeTab === 'users' && <AdminUserManagement />}
            {activeTab === 'subjects' && <SubjectAllocation />}
            {activeTab === 'my-students' && <MyStudents />}
            {activeTab === 'my-subjects' && <MySubjects />}
            {activeTab === 'enter-marks' && <TeacherMarksEntry />}
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

export default DeputyDashboard;