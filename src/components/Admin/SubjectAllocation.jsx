import React, { useState, useEffect } from 'react';

function SubjectAllocation() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load classes
      const classesRes = await fetch('http://localhost:5123/api/admin/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const classesData = await classesRes.json();
      setClasses(classesData);
      
      // Load teachers
      const teachersRes = await fetch('http://localhost:5123/api/admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const teachersData = await teachersRes.json();
      setTeachers(teachersData.filter(t => t.isActive !== false));
      
      // Load subjects
      const subjectsRes = await fetch('http://localhost:5123/api/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subjectsData = await subjectsRes.json();
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const loadAllocations = async (classId) => {
    if (!classId) {
      setAllocations([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5123/api/admin/class-allocations/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAllocations(data);
    } catch (error) {
      console.error('Error loading allocations:', error);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setFormData({ ...formData, classId });
    if (classId) {
      loadAllocations(classId);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!formData.classId || !formData.subjectId || !formData.teacherId) {
      setMessage('Please select Class, Subject, and Teacher');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/admin/allocate-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          classId: parseInt(formData.classId),
          subjectId: parseInt(formData.subjectId),
          teacherId: parseInt(formData.teacherId)
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Teacher allocated successfully!`);
        setMessageType('success');
        setFormData({ ...formData, subjectId: '', teacherId: '' });
        loadAllocations(formData.classId);
      } else {
        setMessage(`❌ ${data.message || 'Allocation failed'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error allocating teacher');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveAllocation = async (id, subjectName) => {
    if (!confirm(`Remove allocation for ${subjectName}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5123/api/admin/allocations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setMessage(`✅ Allocation removed successfully`);
        setMessageType('success');
        loadAllocations(formData.classId);
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.message || 'Failed to remove'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error removing allocation');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown';
  };

  if (loading && classes.length === 0) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Allocate Teachers to Subjects</h2>
      
      {message && (
        <div className={`p-3 rounded ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleAllocate} className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Select Class</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.classId}
              onChange={handleClassChange}
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.stream || ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Select Subject</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.subjectId}
              onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Select Teacher</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.teacherId}
              onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="col-span-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Allocating...' : 'Allocate Teacher'}
          </button>
        </form>
      </div>
      
      {formData.classId && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-xl font-semibold">Current Allocations</h3>
            <p className="text-sm text-gray-600">
              {classes.find(c => c.id == formData.classId)?.name} {classes.find(c => c.id == formData.classId)?.stream || ''}
            </p>
          </div>
          
          {allocations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No allocations yet. Use the form above to allocate teachers to subjects.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map((alloc) => (
                  <tr key={alloc.id}>
                    <td className="px-6 py-4">{getSubjectName(alloc.subjectId)}</td>
                    <td className="px-6 py-4">{getTeacherName(alloc.teacherId)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRemoveAllocation(alloc.id, getSubjectName(alloc.subjectId))}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {teachers.length === 0 && (
        <div className="p-3 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">⚠️ No teachers available. Please add teachers first in Teacher Management tab.</p>
        </div>
      )}
      
      {subjects.length === 0 && (
        <div className="p-3 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">⚠️ No subjects available. Please add subjects first.</p>
        </div>
      )}
    </div>
  );
}

export default SubjectAllocation;