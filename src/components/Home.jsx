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
      
      {/* Hero Section */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 text-center">
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
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-6 md:gap-y-8">
              {/* Feature 1: Teacher Management */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Teacher Management</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    Add and manage teachers, assign them to departments, and track their subject allocations.
                  </p>
                </div>
              </div>

              {/* Feature 2: Subject Allocation */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Teacher Subject Allocation</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    Allocate teachers to subjects and classes. Ensure the right teachers are assigned to the right subjects.
                  </p>
                </div>
              </div>

              {/* Feature 3: Head of Department */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Head of Department</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    Assign Heads of Departments to oversee subject areas. HODs can manage teachers and subjects within their department.
                  </p>
                </div>
              </div>

              {/* Feature 4: Student Subject Allocation */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Student Subject Allocation</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    Form Teachers can allocate subjects to students. Admin can manage student subject selections and approvals.
                  </p>
                </div>
              </div>

              {/* Feature 5: Marks Entry & Grading */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Marks Entry & Grading</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    Teachers can enter marks for their allocated subjects. Automatic grade calculation and approval workflow.
                  </p>
                </div>
              </div>

              {/* Feature 6: Performance Analytics */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-14 sm:ml-16">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">Performance Analytics</h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    View rankings, class performance, department reports, and individual student progress with detailed reports.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Section */}
          <div className="mt-12 sm:mt-16">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
              <p className="mt-2 text-2xl sm:text-3xl leading-8 font-extrabold tracking-tight text-gray-900">
                Complete Subject Allocation Workflow
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-3">1</div>
                  <h4 className="text-lg font-semibold text-gray-900">Admin Setup</h4>
                  <p className="text-sm text-gray-500 mt-2">
                    Admin creates subjects, departments, and manages teachers. Assigns Form Teachers and Heads of Department.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-3">2</div>
                  <h4 className="text-lg font-semibold text-gray-900">Teacher Allocation</h4>
                  <p className="text-sm text-gray-500 mt-2">
                    Admin or HOD allocates teachers to subjects and classes. Teachers can view their assigned subjects.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-3">3</div>
                  <h4 className="text-lg font-semibold text-gray-900">Student Allocation</h4>
                  <p className="text-sm text-gray-500 mt-2">
                    Form Teachers allocate subjects to students. Admin can approve or modify student subject selections.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-3">4</div>
                  <h4 className="text-lg font-semibold text-gray-900">Marks & Reports</h4>
                  <p className="text-sm text-gray-500 mt-2">
                    Teachers enter marks, HODs and Admin approve results. Generate reports and track performance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role-Based Access Section */}
          <div className="mt-12 sm:mt-16 bg-gray-50 rounded-lg p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-6">Who Can Do What</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-blue-600">Admin</h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Create subjects & departments</li>
                  <li>• Manage teachers</li>
                  <li>• Allocate teachers to subjects</li>
                  <li>• Assign Form Teachers</li>
                  <li>• Assign Heads of Department</li>
                  <li>• Approve results</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-green-600">Head of Department</h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Manage department subjects</li>
                  <li>• Allocate teachers to subjects</li>
                  <li>• View department performance</li>
                  <li>• Approve department results</li>
                  <li>• Generate reports</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-purple-600">Form Teacher</h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Manage class students</li>
                  <li>• Allocate subjects to students</li>
                  <li>• Approve student selections</li>
                  <li>• View class performance</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-orange-600">Teacher</h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• View allocated subjects</li>
                  <li>• Enter student marks</li>
                  <li>• View assigned students</li>
                  <li>• Submit results for approval</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;