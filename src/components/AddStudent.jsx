cat > src/components/AddStudent.jsx << 'EOF'
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
    
    try {
      const token = localStorage.getItem('token');
      console.log('=== Adding Student ===');
      console.log('Token:', token);
      console.log('Data:', formData);
      
      const response = await fetch('http://localhost:5123/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      console.log('Response status:', response.status);
      
      // Get the response as text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (response.ok) {
        setMessage(`✅ Student "${formData.fullName}" added successfully!`);
        setMessageType('success');
        setFormData({ admissionNumber: '', fullName: '', class: '', stream: '' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Try to parse as JSON if possible
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        setMessage(`❌ ${errorMessage}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage(`❌ Network error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Add New Student</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
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
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding Student...' : 'Add Student'}
        </button>
      </form>
    </div>
  );
}

export default AddStudent;