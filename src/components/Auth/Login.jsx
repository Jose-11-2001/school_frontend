import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import schoolLogo from '../../assets/images/logoo.jpg';
import backgroundImage from '../../assets/images/home.jpg';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Attempting login with:', { email, password: '***' });
      
      const response = await authAPI.login({ email, password });
      const data = response.data;

      console.log('🔍 ====== FULL LOGIN RESPONSE ======');
      console.log('🔍 Raw response:', response);
      console.log('🔍 Response data:', JSON.stringify(data, null, 2));
      console.log('🔍 ================================');
      console.log('🔍 token:', data.token);
      console.log('🔍 id:', data.id);
      console.log('🔍 name:', data.name);
      console.log('🔍 email:', data.email);
      console.log('🔍 role:', data.role);
      console.log('🔍 role type:', typeof data.role);
      console.log('🔍 mustChangePassword:', data.mustChangePassword);

      const { token, id, name, email: userEmail, role, mustChangePassword } = data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // ✅ Use the role from backend, trim it
      let finalRole = role?.trim() || 'Student';
      if (!role) {
        console.warn('⚠️ ROLE IS MISSING! Setting to "Student" as default');
        finalRole = 'Student';
      }

      console.log('🔍 Final role to save:', finalRole);

      const userData = {
        id,
        name,
        email: userEmail,
        role: finalRole,
        mustChangePassword: mustChangePassword || false
      };

      console.log('🔍 User data to save:', userData);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('✅ Stored user:', localStorage.getItem('user'));

      // ✅ IMPORTANT: Update the user state in App.jsx
      if (setUser) {
        console.log('🔍 Setting user in App state:', userData);
        setUser(userData);
      }

      if (mustChangePassword === true) {
        console.log('🔍 Redirecting to change-password');
        navigate('/change-password');
        return;
      }

      // ✅ NAVIGATE BASED ON ROLE
      const roleLower = finalRole.toLowerCase();
      console.log(`🔍 Navigating to dashboard for role: "${roleLower}"`);

      if (roleLower === 'admin') {
        navigate('/admin-dashboard');
      } else if (roleLower === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (roleLower === 'student') {
        navigate('/student-dashboard');
      } else {
        console.error('❌ Unknown role:', finalRole);
        setError(`Unknown user role: "${finalRole}". Please contact support.`);
        setLoading(false);
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Invalid email or password. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 bg-white p-8 rounded-xl shadow-2xl w-96">
        <button
          onClick={handleGoBack}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
          title="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-lg bg-white">
            <img
              src={schoolLogo}
              alt="School Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://img.icons8.com/color/96/school--v1.png";
              }}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Mkondezi Secondary School</h2>
          <p className="text-gray-600 mt-2">Grading System</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Mkondezi Secondary School</p>
        </div>
      </div>
    </div>
  );
}

export default Login;