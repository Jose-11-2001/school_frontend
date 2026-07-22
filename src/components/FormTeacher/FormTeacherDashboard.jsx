import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, hasRole, getUserName } from '../../utils/roleUtils';
import FormTeacherClasses from './FormTeacherClasses';
import FormTeacherStudents from './FormTeacherStudents';
import SubjectApprovals from './SubjectApprovals';
import ClassResults from './ClassResults';

function FormTeacherDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('classes');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = getCurrentUser();
    
    // ✅ Use hasRole for case-insensitive check
    if (!userData || !hasRole('FormTeacher')) {
      navigate('/login');
      return;
    }
    
    setUser(userData);
  }, [navigate]);

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

  const menuItems = [
    { id: 'classes', label: '📚 My Classes' },
    { id: 'students', label: '👨‍🎓 My Students' },
    { id: 'approvals', label: '✅ Subject Approvals' },
    { id: 'results', label: '📊 Class Results' },
  ];

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
          <h1 className="text-sm font-bold">Form Teacher</h1>
          <p className="text-xs text-blue-200">Mkondezi Secondary</p>
        </div>
        <div className="flex items-center gap-2">
          <FormTeacherNotifications />
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
              <h1 className="text-xl font-bold">Form Teacher</h1>
              <p className="text-xs text-blue-200">Portal</p>
            </div>
          </div>
        </div>

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

        <div className="sticky bottom-0 bg-gradient-to-t from-blue-800 to-transparent p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <span className="text-white font-bold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Desktop Navbar */}
        <nav className="hidden lg:flex fixed top-0 right-0 left-64 z-40 bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-md px-6 py-3 justify-between items-center">
          <div className="flex items-center gap-4" />
          <div className="flex items-center gap-6">
            <FormTeacherNotifications />
            <div className="h-6 w-px bg-blue-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Welcome,</span>
              <span className="text-sm font-bold">{getUserName()}</span>
            </div>
          </div>
        </nav>

        <div className="flex-1 p-4 lg:p-6 mt-16 lg:mt-16">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            {activeTab === 'classes' && <FormTeacherClasses />}
            {activeTab === 'students' && <FormTeacherStudents />}
            {activeTab === 'approvals' && <SubjectApprovals />}
            {activeTab === 'results' && <ClassResults />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormTeacherDashboard;