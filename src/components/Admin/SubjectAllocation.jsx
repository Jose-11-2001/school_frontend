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
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('⚠️ Please login first');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // ✅ Load classes using AdminSubjectAllocation endpoint
      const classesRes = await fetch('https://school-yathu.onrender.com/api/AdminSubjectAllocation/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      } else {
        console.error('Failed to load classes:', classesRes.status);
      }
      
      // ✅ Load teachers using AdminSubjectAllocation endpoint
      const teachersRes = await fetch('https://school-yathu.onrender.com/api/AdminSubjectAllocation/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData);
      } else {
        console.error('Failed to load teachers:', teachersRes.status);
      }
      
      // ✅ Load subjects using AdminSubjectAllocation endpoint
      const subjectsRes = await fetch('https://school-yathu.onrender.com/api/AdminSubjectAllocation/available-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
      } else {
        console.error('Failed to load subjects:', subjectsRes.status);
      }
      
      // Check if any data was loaded
      if (classes.length === 0 && teachers.length === 0 && subjects.length === 0) {
        // Try alternative endpoints if the first ones failed
        await loadDataAlternative();
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('❌ Error loading data. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Alternative endpoints if the first ones fail
  const loadDataAlternative = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try admin endpoints as fallback
      const [classesRes, teachersRes, subjectsRes] = await Promise.all([
        fetch('https://school-yathu.onrender.com/api/admin/classes', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://school-yathu.onrender.com/api/admin/teachers', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://school-yathu.onrender.com/api/subjects', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (classesRes.ok) {
        const data = await classesRes.json();
        if (data.length > 0) setClasses(data);
      }
      
      if (teachersRes.ok) {
        const data = await teachersRes.json();
        if (data.length > 0) setTeachers(data);
      }
      
      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        if (data.length > 0) setSubjects(data);
      }
      
    } catch (error) {
      console.error('Error loading alternative data:', error);
    }
  };

  // ✅ Load allocations using AdminSubjectAllocation endpoint
  const loadAllocations = async (classId) => {
    if (!classId) {
      setAllocations([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/AdminSubjectAllocation/student-allocations?classId=${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllocations(data);
      } else {
        console.error('Failed to load allocations:', response.status);
        setAllocations([]);
      }
    } catch (error) {
      console.error('Error loading allocations:', error);
      setAllocations([]);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setFormData({ ...formData, classId });
    if (classId) {
      loadAllocations(classId);
    }
  };

  // ✅ Allocate using AdminSubjectAllocation endpoint
  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!formData.classId || !formData.subjectId || !formData.teacherId) {
      setMessage('⚠️ Please select Class, Subject, and Teacher');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://school-yathu.onrender.com/api/AdminSubjectAllocation/allocate-teacher-to-subject', {
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
        setMessage(`✅ ${data.message || 'Teacher allocated successfully!'}`);
        setMessageType('success');
        setFormData({ ...formData, subjectId: '', teacherId: '' });
        loadAllocations(formData.classId);
      } else {
        setMessage(`❌ ${data.message || 'Allocation failed'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error allocating teacher. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // ✅ Remove using AdminSubjectAllocation endpoint
  const handleRemoveAllocation = async (id, subjectName) => {
    if (!confirm(` Remove allocation for "${subjectName}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://school-yathu.onrender.com/api/AdminSubjectAllocation/remove-allocation/${id}`, {
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

  if (loading && classes.length === 0 && teachers.length === 0 && subjects.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  // Check if we have any data
  const hasData = classes.length > 0 || teachers.length > 0 || subjects.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800"> Allocate Teachers to Subjects</h2>
          <p className="text-sm text-gray-500 mt-1">Assign teachers to subjects for each class</p>
        </div>
        <button
          onClick={loadData}
          className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
        >
           Refresh
        </button>
      </div>
      
      {message && (
        <div className={`p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : messageType === 'warning'
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      {!hasData && !loading && (
        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-semibold text-yellow-800">No Data Available</h3>
          <p className="text-yellow-700 mt-2">
            Please add the following before allocating teachers:
          </p>
          <ul className="mt-3 space-y-1 text-sm text-yellow-700">
            {classes.length === 0 && <li>• Add classes in <strong>Class Management</strong></li>}
            {teachers.length === 0 && <li>• Add teachers in <strong>Teacher Management</strong></li>}
            {subjects.length === 0 && <li>• Add subjects in <strong>Subjects</strong> section</li>}
          </ul>
        </div>
      )}
      
      {hasData && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <h3 className="text-lg font-semibold text-gray-800"> New Allocation</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleAllocate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Select Class</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.classId}
                    onChange={handleClassChange}
                    required
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.stream || ''}
                      </option>
                    ))}
                  </select>
                  {classes.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">⚠️ No classes available</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Select Subject</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                    required
                    disabled={!formData.classId || subjects.length === 0}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                  {subjects.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">⚠️ No subjects available</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Select Teacher</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                    required
                    disabled={!formData.classId || teachers.length === 0}
                  >
                    <option value="">-- Select Teacher --</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                  {teachers.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">⚠️ No teachers available</p>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !formData.classId || !formData.subjectId || !formData.teacherId}
                  className="md:col-span-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Allocating...
                    </span>
                  ) : (
                    ' Allocate Teacher'
                  )}
                </button>
              </form>
            </div>
          </div>
          
          {formData.classId && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <h3 className="text-xl font-semibold text-gray-800">Current Allocations</h3>
                <p className="text-sm text-gray-600">
                  {classes.find(c => c.id == formData.classId)?.name} {classes.find(c => c.id == formData.classId)?.stream || ''}
                </p>
              </div>
              
              {allocations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No allocations yet. Use the form above to allocate teachers to subjects.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allocations.map((alloc) => (
                        <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{alloc.subjectName || getSubjectName(alloc.subjectId)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              👨‍🏫 {alloc.teacherName || getTeacherName(alloc.teacherId)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleRemoveAllocation(alloc.id, alloc.subjectName || getSubjectName(alloc.subjectId))}
                              className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                            >
                              🗑️ Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SubjectAllocation;