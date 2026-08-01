import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDashboard = () => {
    if (token && user) {
      const role = (user.dashboardRole || user.role || 'Student').toLowerCase();
      const dashboardRoutes = {
        'admin': '/admin-dashboard',
        'deputyheadteacher': '/deputy-dashboard',
        'teacher': '/teacher-dashboard',
        'formteacher': '/form-teacher-dashboard',
        'headofdepartment': '/hod-dashboard',
        'student': '/student-dashboard'
      };
      const route = dashboardRoutes[role] || '/student-dashboard';
      navigate(route);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              
              <span className="text-lg font-bold">Mkondezi School</span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {token && user ? (
              <>
                {/* Dashboard Link */}
                <button
                  onClick={handleDashboard}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Dashboard
                </button>
                
                {/* User Info */}
                <span className="text-sm text-blue-200 hidden sm:inline">
                  {user.name}
                </span>
                
                {/* Role Badge */}
                <span className="text-xs bg-blue-700 px-2 py-1 rounded-full hidden sm:inline">
                  {user.role || 'User'}
                </span>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-sm transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;