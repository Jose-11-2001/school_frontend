
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
      const response = await fetch('http://localhost:5123/api/auth/register', {
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
        setMessage(`✅ User created successfully!\n\nEmail: ${data.email}\nPassword: ${data.password}\n\n⚠️ User must change password on first login.`);
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
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Create New User</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 whitespace-pre-line ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                ? 'Teacher email format: first initial + lastname@gmail.com (e.g., jmbukwa@gmail.com)' 
                : 'Student email format: fullname@gmail.com (e.g., josephmbukwa@gmail.com)'}
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => {
                setFormData({...formData, role: e.target.value});
                if (formData.name) {
                  generateEmail();
                }
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 0888765111"
            />
          </div>
          
          {formData.role === 'Teacher' && (
            <>
              <div>
                <label className="block text-gray-700 mb-2">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TCH001"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Qualification</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Degree in Education"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Hire Date</label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
          
          <div className="col-span-2">
            <label className="block text-gray-700 mb-2">Generated Email</label>
            <input
              type="email"
              value={generatedEmail}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              placeholder="Email will appear here"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-gray-700 mb-2">Generated Password</label>
            <input
              type="text"
              value={generatedPassword}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              placeholder="Password will appear here"
            />
            <p className="text-xs text-yellow-600 mt-1">⚠️ User will be required to change password on first login</p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={() => {
              if (formData.name) {
                generateEmail();
                generatePassword();
              } else {
                setMessage('Please enter name first');
                setMessageType('error');
                setTimeout(() => setMessage(''), 3000);
              }
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Generate Credentials
          </button>
          
          <button
            type="submit"
            disabled={loading || !generatedEmail || !generatedPassword}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📝 Important Notes:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>Teacher Email Format:</strong> first initial + lastname@gmail.com</li>
          <li><strong>Student Email Format:</strong> fullname@gmail.com</li>
          <li><strong>Default Password:</strong> Random 8-character password shown above</li>
          <li><strong>First Login:</strong> User must change their password</li>
          <li><strong>Save credentials:</strong> Copy the password before closing this form</li>
        </ul>
      </div>
    </div>
  );
}

export default CreateUser;