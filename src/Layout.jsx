import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, getUserName } from '../utils/roleUtils';

function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = getCurrentUser();
    
    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    
    const role = user.role?.toLowerCase() || 'student';
    const routes = {
      'admin': '/admin-dashboard',
      'deputyheadteacher': '/deputy-dashboard',
      'teacher': '/teacher-dashboard',
      'formteacher': '/form-teacher-dashboard',
      'headofdepartment': '/hod-dashboard',
      'student': '/student-dashboard'
    };
    return routes[role] || '/student-dashboard';
  };

  const getRoleLabel = () => {
    if (!user) return '';
    return user.role || 'Student';
  };

  // Don't show layout on login page
  if (location.pathname === '/login' || location.pathname === '/change-password') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ===== NAVBAR ===== */}
      <nav className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg sm:text-xl font-bold">M</span>
              </div>
              <div>
                <span className="text-sm sm:text-lg font-bold hidden xs:inline">Mkondezi</span>
                <span className="text-sm sm:text-lg font-bold"> School</span>
                <span className="hidden sm:inline text-xs text-blue-200 ml-1">Grading System</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3 lg:gap-6">
              <Link to="/" className="text-sm hover:text-blue-200 transition-colors">Home</Link>
              
              {isAuthenticated && user && (
                <>
                  <Link to={getDashboardLink()} className="text-sm hover:text-blue-200 transition-colors">
                    Dashboard
                  </Link>
                  <span className="text-xs bg-blue-700 px-2 py-1 rounded-full">
                    {getRoleLabel()}
                  </span>
                </>
              )}
              
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-blue-200 hidden lg:inline">
                    Welcome, {getUserName()}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        <div className={`md:hidden ${mobileMenuOpen ? 'max-h-96' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out bg-blue-900`}>
          <div className="px-4 py-3 space-y-2 border-t border-blue-700">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Home
            </Link>
            
            {isAuthenticated && user && (
              <>
                <Link 
                  to={getDashboardLink()} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Dashboard
                </Link>
                <div className="px-3 py-1">
                  <span className="text-xs bg-blue-700 px-2 py-1 rounded-full">
                    {getRoleLabel()}
                  </span>
                </div>
              </>
            )}
            
            <div className="pt-2 border-t border-blue-700">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-1 text-sm text-blue-200">
                    Welcome, {getUserName()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm text-red-200 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-800 text-gray-300 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* School Info */}
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-2">Mkondezi Secondary</h3>
              <p className="text-xs sm:text-sm text-gray-400">Excellence in Education</p>
              <p className="text-xs text-gray-500 mt-1">Grading System v1.0</p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-sm sm:text-base mb-2">Quick Links</h4>
              <ul className="space-y-1 text-xs sm:text-sm">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                {isAuthenticated && (
                  <li><Link to={getDashboardLink()} className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                )}
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold text-sm sm:text-base mb-2">Resources</h4>
              <ul className="space-y-1 text-xs sm:text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm sm:text-base mb-2">Contact</h4>
              <ul className="space-y-1 text-xs sm:text-sm text-gray-400">
                <li>Email: info@mkondezi.edu</li>
                <li>Phone: +265 999 999 999</li>
                <li>Location: Malawi</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Mkondezi Secondary School. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;