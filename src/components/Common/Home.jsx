import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/images/home.jpg';

function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
      // Redirect to appropriate dashboard based on role
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
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 text-center">
          <div className="animate-fade-in-down">
           
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold text-white">
              <span className="block">Mkondezi Secondary School</span>
              <span className="block text-blue-300 text-2xl sm:text-3xl md:text-4xl mt-2">School Management and Grading System</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-sm sm:text-base text-gray-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Manage student marks, track performance, and generate reports effortlessly.
              The complete solution for schools.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <button
                  onClick={handleGetStarted}
                  className="w-full flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  Go to Dashboard
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
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
            <div className="mt-4 max-w-2xl mx-auto">
              <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            </div>
          </div>

          <div className="mt-8 sm:mt-10">
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-6 md:gap-y-8">
              {/* Feature cards with hover effects */}
              {[
                {
                  icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
                  title: "Teacher Management",
                  desc: "Add and manage teachers, assign them to departments, and track their subject allocations."
                },
                {
                  icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                  title: "Teacher Subject Allocation",
                  desc: "Allocate teachers to subjects and classes. Ensure the right teachers are assigned to the right subjects."
                },
                {
                  icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                  title: "Head of Department",
                  desc: "Assign Heads of Departments to oversee subject areas. HODs can manage teachers and subjects within their department."
                },
                {
                  icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                  title: "Student Subject Allocation",
                  desc: "Form Teachers can allocate subjects to students. Admin can manage student subject selections and approvals."
                },
                {
                  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                  title: "Marks Entry & Grading",
                  desc: "Teachers can enter marks for their allocated subjects. Automatic grade calculation and approval workflow."
                },
                {
                  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "Performance Analytics",
                  desc: "View rankings, class performance, department reports, and individual student progress with detailed reports."
                }
              ].map((feature, index) => (
                <div key={index} className="relative group">
                  <div className="absolute flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white group-hover:bg-blue-600 transition-colors duration-300">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <div className="ml-14 sm:ml-16">
                    <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Section - Enhanced */}
          <div className="mt-12 sm:mt-16">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
              <p className="mt-2 text-2xl sm:text-3xl leading-8 font-extrabold tracking-tight text-gray-900">
                Complete Subject Allocation Workflow
              </p>
              <div className="mt-4 h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Admin Setup", desc: "Admin creates subjects, departments, and manages teachers. Assigns Form Teachers and Heads of Department." },
                { step: "2", title: "Teacher Allocation", desc: "Admin or HOD allocates teachers to subjects and classes. Teachers can view their assigned subjects." },
                { step: "3", title: "Student Allocation", desc: "Form Teachers allocate subjects to students. Admin can approve or modify student subject selections." },
                { step: "4", title: "Marks & Reports", desc: "Teachers enter marks, HODs and Admin approve results. Generate reports and track performance." }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold mb-4 shadow-lg">
                      {item.step}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Roles Section - Enhanced with better styling */}
          <div className="mt-12 sm:mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
              User Roles & Capabilities
              <div className="mt-2 h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            </h3>
            
            {/* Role Cards with better design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  role: "Admin",
                  color: "blue",
                  badge: "Full System Control",
                  icon: "",
                  capabilities: [
                    "Create & manage subjects and departments",
                    "Manage teachers and their roles",
                    "Allocate teachers to subjects and classes",
                    "Assign Form Teachers, HODs, Deputy Heads",
                    "Approve results published by teachers",
                    "Generate system-wide reports",
                    "Manage all users (create, edit, delete)",
                    "View all analytics and rankings",
                    "Can teach subjects if assigned"
                  ]
                },
                {
                  role: "Deputy Head Teacher",
                  color: "purple",
                  badge: "School Administration",
                  icon: "",
                  capabilities: [
                    "Manage teachers and students",
                    "Register new students",
                    "Allocate subjects to students",
                    "View and manage assignments",
                    "Generate school reports",
                    "Can teach subjects if assigned"
                  ]
                },
                {
                  role: "Head of Department",
                  color: "green",
                  badge: "Department Management",
                  icon: "",
                  capabilities: [
                    "Assign subjects to teachers in department",
                    "View department performance",
                    "Approve departmental subject results",
                    "Manage departmental subjects and teachers",
                    "View all teachers and students in department",
                    "Generate department reports",
                    "Can teach subjects if assigned"
                  ]
                },
                {
                  role: "Form Teacher",
                  color: "yellow",
                  badge: "Class Management",
                  icon: "",
                  capabilities: [
                    "Manage class students",
                    "Allocate subjects to students",
                    "View class performance",
                    "View all students in class",
                    "View teachers teaching in class with subjects",
                    "Can teach subjects if assigned"
                  ]
                },
                {
                  role: "Teacher",
                  color: "orange",
                  badge: "Subject Teaching",
                  icon: "",
                  capabilities: [
                    "View allocated subjects and classes",
                    "Enter student marks",
                    "Submit results for approval",
                    "See all students assigned to subjects",
                    "Generate subject reports",
                    "View timetable for classes"
                  ]
                },
                {
                  role: "Student",
                  color: "pink",
                  badge: "Learning & Performance",
                  icon: "",
                  capabilities: [
                    "View subjects and assigned teachers",
                    "View class and stream information",
                    "View results and performance",
                    "Download results as PDF",
                    "View timetable for classes",
                    "Select subjects (Form 3 & 4)"
                  ]
                }
              ].map((role, index) => {
                const colorClasses = {
                  blue: "border-blue-200 bg-blue-50",
                  purple: "border-purple-200 bg-purple-50",
                  green: "border-green-200 bg-green-50",
                  yellow: "border-yellow-200 bg-yellow-50",
                  orange: "border-orange-200 bg-orange-50",
                  pink: "border-pink-200 bg-pink-50"
                };
                const badgeColors = {
                  blue: "bg-blue-600",
                  purple: "bg-purple-600",
                  green: "bg-green-600",
                  yellow: "bg-yellow-600",
                  orange: "bg-orange-600",
                  pink: "bg-pink-600"
                };
                const textColors = {
                  blue: "text-blue-500",
                  purple: "text-purple-500",
                  green: "text-green-500",
                  yellow: "text-yellow-500",
                  orange: "text-orange-500",
                  pink: "text-pink-500"
                };
                
                return (
                  <div key={index} className={`bg-white rounded-xl p-6 shadow-lg border-2 ${colorClasses[role.color]} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{role.icon}</span>
                      <div>
                        <span className={`${badgeColors[role.color]} text-white px-3 py-1 rounded-full text-sm font-semibold inline-block`}>
                          {role.role}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">{role.badge}</span>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {role.capabilities.map((cap, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className={`${textColors[role.color]} font-bold mt-0.5`}>✓</span>
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report Generation Section - Enhanced */}
          <div className="mt-12 sm:mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border border-blue-200">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6">
               Report Generation
              <div className="mt-2 h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { role: "Admin", emoji: "", canGenerate: true },
                { role: "Deputy Head", emoji: "", canGenerate: true },
                { role: "HOD", emoji: "", canGenerate: true },
                { role: "Form Teacher", emoji: "", canGenerate: true },
                { role: "Teacher", emoji: "", canGenerate: true },
                { role: "Student", emoji: "", canGenerate: false }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-md text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-4xl mb-2">{item.emoji}</div>
                  <h4 className="font-semibold text-gray-800 text-sm">{item.role}</h4>
                  {item.canGenerate ? (
                    <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                       Can Generate Reports
                    </span>
                  ) : (
                    <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                       Can Download PDF
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timetable Section - Enhanced */}
          <div className="mt-12 sm:mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 sm:p-8 border border-indigo-200">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6">
               Timetable Access
              <div className="mt-2 h-1 w-20 bg-indigo-600 mx-auto rounded-full"></div>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { role: "Admin", view: "All timetables" },
                { role: "Deputy Head", view: "School timetables" },
                { role: "HOD", view: "Department timetables" },
                { role: "Form Teacher", view: "Class timetables" },
                { role: "Teacher", view: "Teaching timetables" },
                { role: "Student", view: "Class timetables" }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-md text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  
                  <h4 className="font-semibold text-gray-800 text-sm">{item.role}</h4>
                  <p className="text-xs text-gray-500 mt-1">{item.view}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 sm:mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 sm:p-12 shadow-xl">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Join Mkondezi Secondary School's Management and Grading System today and streamline your school's academic management.
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Go to Dashboard
                <svg className="inline-block ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 1s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Home;