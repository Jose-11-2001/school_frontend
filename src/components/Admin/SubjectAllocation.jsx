
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
    setTeachers(teachersData);
    
    // Load subjects
    const subjectsRes = await fetch('http://localhost:5123/api/subjects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const subjectsData = await subjectsRes.json();
    setSubjects(subjectsData);
  };

  const loadAllocations = async (classId) => {
    if (!classId) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5123/api/admin/class-allocations/${classId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setAllocations(data);
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5123/api/admin/allocate-teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    if (response.ok) {
      setMessage('✅ Teacher allocated successfully!');
      loadAllocations(formData.classId);
      setFormData({ classId: formData.classId, subjectId: '', teacherId: '' });
    } else {
      setMessage(`❌ ${data.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRemoveAllocation = async (id) => {
    if (!confirm('Remove this allocation?')) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5123/api/admin/allocations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      setMessage('✅ Allocation removed!');
      loadAllocations(formData.classId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Allocate Teachers to Subjects</h2>
        
        {message && (
          <div className={`p-3 rounded mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleAllocate} className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Select Class</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.classId}
              onChange={(e) => {
                setFormData({...formData, classId: e.target.value});
                loadAllocations(parseInt(e.target.value));
              }}
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name} {cls.stream}</option>
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
          
          <button type="submit" className="col-span-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Allocate Teacher
          </button>
        </form>
      </div>
      
      {allocations.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-xl font-bold p-4 border-b">Current Allocations</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map(alloc => (
                <tr key={alloc.id}>
                  <td className="px-6 py-4">{alloc.subjectName}</td>
                  <td className="px-6 py-4">{alloc.teacherName}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemoveAllocation(alloc.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SubjectAllocation;