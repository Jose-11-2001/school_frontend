import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherManagement from './TeacherManagement';
import ClassManagement from './ClassManagement';
import ResultsApproval from './ResultsApproval';
import StudentList from '../StudentList';
import AddStudent from './AddStudent';
import AdminUserManagement from './AdminUserManagement';
import Rankings from '../Rankings';
import AdminNotifications from './AdminNotifications';
import AdminSubjectAllocation from './AdminSubjectAllocation';
import StudentRegistration from './StudentRegistration';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('teachers');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const handleGoBack = () => {
    navigate(-1);
  };

  const menuItems = [
    { id: 'teachers', label: 'Teacher Management', icon: '' },
    { id: 'student-registration', label: 'Register Students', icon: '' },
    { id: 'students', label: 'Manage Students', icon: '' },
    { id: 'users', label: 'Manage Users', icon: '' },
    { id: 'classes', label: 'Class Management', icon: '' },
    { id: 'allocation', label: 'Subject Allocation (Teachers)', icon: '' },
    { id: 'student-subjects', label: 'Student Subject Allocation', icon: '' },
    { id: 'subjects', label: 'Manage Subjects', icon: '' }, 
    { id: 'approval', label: 'Results Approval', icon: '' },
    { id: 'rankings', label: 'View Rankings', icon: '' },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
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
          <h1 className="text-sm font-bold">Admin  portal</h1>
          <p className="text-xs text-blue-200">Mkondezi Secondary</p>
        </div>
        <div className="flex items-center gap-2">
          <AdminNotifications />
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

      {/* Sidebar - Fixed position with independent scrolling */}
      <div className={`
        fixed lg:fixed z-50
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out
        w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-xl
        h-screen overflow-y-auto
        ${!mobileOpen && 'lg:block'}
      `}>
        {/* Sidebar Header - Sticky */}
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
              <h1 className="text-xl font-bold">Mkondezi Admin</h1>
              <p className="text-xs text-blue-200">Secondary School</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation - Scrollable */}
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
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer - Sticky at bottom */}
        <div className="sticky bottom-0 bg-gradient-to-t from-blue-800 to-transparent p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <span className="text-xl"></span>
            <span  className="text-white bold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Desktop Navbar - Fixed */}
        <nav className="hidden lg:flex fixed top-0 right-0 left-64 z-40 bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-md px-6 py-3 justify-between items-center">
          {/* Left side - empty or can add other items */}
          <div className="flex items-center gap-4">
            {/* Add any header items here if needed */}
          </div>
          
          {/* Right side - Welcome message and notifications */}
          <div className="flex items-center gap-6">
            <AdminNotifications />
            <div className="h-6 w-px bg-blue-600"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Welcome,</span>
              <span className="text-sm font-bold">{user?.name || 'Headteacher'}</span>
            </div>
          </div>
        </nav>

        {/* Content Area - With padding for fixed navbar */}
        <div className="flex-1 p-4 lg:p-6 mt-16 lg:mt-16">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 lg:p-6">
              {activeTab === 'teachers' && <TeacherManagement />}
              {activeTab === 'classes' && <ClassManagement />}
              {activeTab === 'allocation' && <SubjectAllocation />}
              {activeTab === 'student-subjects' && <AdminSubjectAllocation />}
              {activeTab === 'student-registration' && <StudentRegistration />}
              {activeTab === 'subjects' && <SubjectsManagement />}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  <AddStudent />
                  <div className="mt-8">
                    <StudentList />
                  </div>
                </div>
              )}
              {activeTab === 'users' && <AdminUserManagement />}
              {activeTab === 'approval' && <ResultsApproval />}
              {activeTab === 'rankings' && <Rankings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;