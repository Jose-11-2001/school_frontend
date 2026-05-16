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

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
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
      setMessage('Admission Number and Full Name are required');
      setMessageType('error');
      setLoading(false);
      return;
    }
    
    const password = generateRandomPassword();
    const email = generateEmail(formData.fullName);
    
    try {
      const token = localStorage.getItem('token');
      
      // First, create Student record
      const studentResponse = await fetch('http://localhost:5123/api/Student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          admissionNumber: formData.admissionNumber,
          fullName: formData.fullName,
          class: formData.class,
          stream: formData.stream
        })
      });
      
      const studentData = await studentResponse.json();
      
      if (!studentResponse.ok) {
        setMessage(`❌ ${studentData.message || 'Error adding student'}`);
        setMessageType('error');
        setLoading(false);
        return;
      }
      
      // Then, create User account for the student
      const userResponse = await fetch('http://localhost:5123/api/auth/register', {
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
        setMessage(`✅ Student "${formData.fullName}" added successfully!\n\n📧 Login Email: ${email}\n🔑 Temporary Password: ${password}\n\n⚠️ Student must change password on first login.`);
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Add New Student</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 whitespace-pre-line ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : messageType === 'warning'
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Admission Number *</label>
            <input
              type="text"
              value={formData.admissionNumber}
              onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., STU001"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Jose Mbukwa"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Class</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({...formData, class: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Form 3"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Stream</label>
            <input
              type="text"
              value={formData.stream}
              onChange={(e) => setFormData({...formData, stream: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., East"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Adding Student...' : 'Add Student'}
        </button>
      </form>
    </div>
  );
}

export default AddStudent;