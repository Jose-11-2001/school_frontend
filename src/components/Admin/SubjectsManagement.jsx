import React, { useState, useEffect } from 'react';
import { subjectAPI } from '../../services/api';

function SubjectsManagement() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const loadSubjects = async () => {
    try {
      const response = await subjectAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (!name.trim() || !code.trim()) {
      setMessage('Please enter both name and code');
      setMessageType('error');
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    try {
      const response = await subjectAPI.create({
        name: name.trim(),
        code: code.trim().toUpperCase()
      });
      
      setMessage(`Subject "${response.data.name}" added successfully!`);
      setMessageType('success');
      setName('');
      setCode('');
      loadSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add subject';
      setMessage(`Error: ${errorMessage}`);
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Subjects</h2>
          <p className="text-sm text-gray-500 mt-1">Add and manage all subjects in the system</p>
        </div>
        <div className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Total: {subjects.length} subjects
        </div>
      </div>
      
      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleAddSubject} className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Subject Name (e.g., Mathematics)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <input
            type="text"
            placeholder="Subject Code (e.g., MATH101)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : (
            '+ Add Subject'
          )}
        </button>
      </form>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                  No subjects found. Add your first subject above.
                </td>
              </tr>
            ) : (
              subjects.map(subject => (
                <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">{subject.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-mono">
                      {subject.code}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubjectsManagement;