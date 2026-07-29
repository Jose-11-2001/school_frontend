import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, hasRole, getUserName, hasTeacherAllocations } from '../../utils/roleUtils';
import Notifications from '../Common/Notifications';
import TeacherManagement from './TeacherManagement';
import ClassManagement from './ClassManagement';
import ResultsApproval from './ResultsApproval';
import StudentList from './StudentList';
import AdminUserManagement from './AdminUserManagement';
import Rankings from '../Rankings';
import AdminSubjectAllocation from './AdminSubjectAllocation';
import StudentRegistration from './StudentRegistration';
import SubjectAllocation from './SubjectAllocation';
import SubjectsManagement from './SubjectsManagement';
import DepartmentManagement from './DepartmentManagement';
import FormTeacherAssignment from './FormTeacherAssignment';
import HeadOfDepartmentAssignment from './HeadOfDepartmentAssignment';
import DeputyAssignment from './DeputyAssignment';
import StudentDetailsModal from './StudentDetailsModal';
import TeacherMarksEntry from '../Teacher/TeacherMarksEntry';
import MySubjects from '../Teacher/MySubjects';
import MyStudents from '../Teacher/MyStudents';
import { Navigate } from 'react-router-dom';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teachers');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshStudents, setRefreshStudents] = useState(false);
  const [hasTeacherAccess, setHasTeacherAccess] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

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
    { id: 'teachers', label: 'Teacher Management' },
    { id: 'departments', label: 'Department Management' },
    { id: 'deputy-assignment', label: 'Deputy Head Teacher' },
    { id: 'form-teacher', label: 'Form Teacher Assignment' },
    { id: 'hod-assignment', label: 'Head of Department' },
    { id: 'student-registration', label: 'Register Students' },
    { id: 'students', label: 'Student List' },
    { id: 'users', label: 'Manage Users' },
    { id: 'classes', label: 'Class Management' },
    { id: 'allocation', label: 'Subject Allocation (Teachers)' },
    { id: 'student-subjects', label: 'Student Subject Allocation' },
    { id: 'subjects', label: 'Manage Subjects' },
    { id: 'approval', label: 'Results Approval' },
    { id: 'rankings', label: 'View Rankings' },
  ];

  const teacherMenuItems = [
    { id: 'my-students', label: 'My Students' },
    { id: 'my-subjects', label: 'My Subjects' },
    { id: 'enter-marks', label: 'Enter Marks' },
  ];

  const allMenuItems = hasTeacherAccess 
    ? [...menuItems.slice(0, 4), ...teacherMenuItems, ...menuItems.slice(4)]
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
          {/* Logout removed from mobile header - moved to sidebar */}
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
        h-screen overflow-hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        flex flex-col
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

        <nav className="flex-1 overflow-y-auto py-2">
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

        {/* Sidebar Footer - Logout at bottom for mobile */}
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
          
          {/* Logout button - visible on mobile only in sidebar */}
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
            {/* Logout button - visible on desktop only in navbar */}
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

              {activeTab === 'teachers' && <TeacherManagement />}
              {activeTab === 'departments' && <DepartmentManagement />}
              {activeTab === 'deputy-assignment' && <DeputyAssignment />}
              {activeTab === 'form-teacher' && <FormTeacherAssignment />}
              {activeTab === 'hod-assignment' && <HeadOfDepartmentAssignment />}
              {activeTab === 'classes' && <ClassManagement />}
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