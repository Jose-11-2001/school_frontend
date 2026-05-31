import React, { useState } from 'react';

function CreateUser() {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Student',
    phoneNumber: '',
    employeeId: '',
    qualification: ''
  });
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const generateEmail = async () => {
    if (!formData.name) {
      setMessage('Please enter name first');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const cleanName = formData.name.toLowerCase().replace(/\s/g, '');
    
    if (formData.role === 'Teacher') {
      const parts = formData.name.trim().split(' ');
      if (parts.length >= 2) {
        const firstNameInitial = parts[0].substring(0, 1);
        const lastName = parts[parts.length - 1];
        const email = `${firstNameInitial}${lastName}@gmail.com`.toLowerCase();
        setGeneratedEmail(email);
      } else {
        setGeneratedEmail(`${cleanName}@gmail.com`.toLowerCase());
      }
    } else {
      setGeneratedEmail(`${cleanName}@gmail.com`.toLowerCase());
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!generatedEmail || !generatedPassword) {
      setMessage('Please generate email and password first');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (formData.role === 'Teacher' && !generatedEmail.endsWith('@gmail.com')) {
      setMessage('Teacher email must end with @gmail.com');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: generatedEmail,
          password: generatedPassword,
          phoneNumber: formData.phoneNumber,
          employeeId: formData.employeeId,
          qualification: formData.qualification,
          hireDate: formData.hireDate,
          role: formData.role
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`User created successfully!\n\n Email: ${data.email}\n Password: ${data.password}\n\n User must change password on first login.`);
        setMessageType('success');
        setFormData({ name: '', role: 'Student', phoneNumber: '', employeeId: '', qualification: '', hireDate: '' });
        setGeneratedEmail('');
        setGeneratedPassword('');
      } else {
        setMessage(`❌ ${data.message}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error creating user');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
        <h2 className="text-2xl font-bold text-white">👤 Create New User</h2>
        <p className="text-purple-100 text-sm mt-1">Register teachers and students with auto-generated credentials</p>
      </div>
      
      <div className="p-6">
        {message && (
          <div className={`p-4 rounded-lg mb-4 whitespace-pre-line ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Joseph Mbukwa"
                required
                onBlur={() => {
                  if (formData.name) {
                    generateEmail();
                    generatePassword();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === 'Teacher' 
                  ? ' Teacher email format: first initial + lastname@gmail.com (e.g., jmbukwa@gmail.com)' 
                  : ' Student email format: fullname@gmail.com (e.g., josephmbukwa@gmail.com)'}
              </p>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  setFormData({...formData, role: e.target.value});
                  if (formData.name) {
                    generateEmail();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 0888765111"
              />
            </div>
            
            {formData.role === 'Teacher' && (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., TCH001"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Degree in Education"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Hire Date</label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Generated Email</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400"></span>
                <input
                  type="email"
                  value={generatedEmail}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  placeholder="Email will appear here"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Generated Password</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">🔑</span>
                <input
                  type="text"
                  value={generatedPassword}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono"
                  placeholder="Password will appear here"
                />
              </div>
              <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                <span></span> User will be required to change password on first login
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => {
                if (formData.name) {
                  generateEmail();
                  generatePassword();
                  setMessage(' Credentials generated successfully!');
                  setMessageType('success');
                  setTimeout(() => setMessage(''), 3000);
                } else {
                  setMessage(' Please enter name first');
                  setMessageType('error');
                  setTimeout(() => setMessage(''), 3000);
                }
              }}
              className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
            >
              <span>🔄</span> Generate Credentials
            </button>
            
            <button
              type="submit"
              disabled={loading || !generatedEmail || !generatedPassword}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin"></span> Creating...
                </>
              ) : (
                <>
                  <span></span> Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUser;