import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/home.jpg';

function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      {/* Content */}
      <div className="relative z-20">
        {/* Header with Login Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-end">
            <button
              onClick={handleLogin}
              className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Login
            </button>
          </div>
        </div>
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold text-white">
              <span className="block">Mkondezi Secondary School</span>
              <span className="block text-blue-300 text-2xl sm:text-3xl md:text-4xl mt-2">Grading System</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-sm sm:text-base text-gray-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Manage student marks, track performance, and generate reports effortlessly.
              The complete solution for schools.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-8 sm:py-12 bg-white bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-2xl sm:text-3xl leading-8 font-extrabold tracking-tight text-gray-900">
              Everything you need
            </p>
          </div>

          <div className="mt-8 sm:mt-10">
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-8">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Student Management</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    Easily manage student profiles, classes, and streams.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Marks Entry & Grading</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    Enter marks with automatic grade calculation. Weighted scoring for tests and exams.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Performance Analytics</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    View rankings, class performance, and individual student progress with detailed reports.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">PDF Reports</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    Generate and download professional PDF reports for students and parents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-6 sm:py-8 bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs sm:text-sm">
          <span>&copy; {new Date().getFullYear()} Mkondezi Secondary School. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;