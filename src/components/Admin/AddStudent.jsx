import React, { useState } from 'react';

function AddStudent() {
  const [formData, setFormData] = useState({
    admissionNumber: '',
    fullName: '',
    class: '',
    stream: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateEmail = (name) => {
    const cleanName = name.toLowerCase().replace(/\s/g, '');
    return `${cleanName}@gmail.com`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (!formData.admissionNumber || !formData.fullName) {
      setMessage('⚠️ Admission Number and Full Name are required');
      setMessageType('error');
      setLoading(false);
      return;
    }
    
    const password = generateRandomPassword();
    const email = generateEmail(formData.fullName);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('⚠️ Please login first');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // Step 1: Create the student
      const studentResponse = await fetch('https://school-yathu.onrender.com/api/Student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          admissionNumber: formData.admissionNumber,
          fullName: formData.fullName,
          class: formData.class || '',
          stream: formData.stream || ''
        })
      });
      
      const studentData = await studentResponse.json();
      
      if (!studentResponse.ok) {
        setMessage(`❌ ${studentData.message || 'Error adding student'}`);
        setMessageType('error');
        setLoading(false);
        return;
      }
      
      // Step 2: Create user account for the student
      const userResponse = await fetch('https://school-yathu.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          name: formData.fullName,
          password: password,
          role: 'Student'
        })
      });
      
      const userData = await userResponse.json();
      
      if (userResponse.ok) {
        setMessage(
          `✅ Student "${formData.fullName}" added successfully!\n\n` +
          `📧 Login Email: ${email}\n` +
          `🔑 Temporary Password: ${password}\n\n` +
          `⚠️ Student must change password on first login.`
        );
        setMessageType('success');
        setFormData({ admissionNumber: '', fullName: '', class: '', stream: '' });
        window.dispatchEvent(new Event('studentAdded'));
      } else {
        setMessage(`⚠️ Student added but user account creation failed: ${userData.message}`);
        setMessageType('warning');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`❌ ${error.message || 'Network error'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ admissionNumber: '', fullName: '', class: '', stream: '' });
    setMessage('');
    setMessageType('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">📝 Add New Student</h2>
        <div className="text-sm text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </div>
      </div>
      
      {message && (
        <div className={`p-4 rounded-lg mb-4 whitespace-pre-line border ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : messageType === 'warning'
            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Admission Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.admissionNumber}
              onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., STU001"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Unique identifier for the student</p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Jose Mbukwa"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Class</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({...formData, class: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Form 3"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Stream</label>
            <input
              type="text"
              value={formData.stream}
              onChange={(e) => setFormData({...formData, stream: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., East"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Student...
              </>
            ) : (
              '➕ Add Student'
            )}
          </button>
          
          <button 
            type="button"
            onClick={handleClear}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Info</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Student will receive auto-generated email and password</li>
          <li>• Password: 10 characters with special characters</li>
          <li>• Student must change password on first login</li>
          <li>• Student will appear in the "Student List" after creation</li>
        </ul>
      </div>
    </div>
  );
}

export default AddStudent;