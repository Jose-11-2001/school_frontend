import React, { useState, useEffect } from 'react';

function HodSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    loadDepartmentAndSubjects();
  }, []);

  const loadDepartmentAndSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get HOD's department
      const deptResponse = await fetch('https://school-yathu.onrender.com/api/HeadOfDepartment/my-department', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const deptData = await deptResponse.json();
      setDepartment(deptData);

      // Get subjects for this department
      const response = await fetch('https://school-yathu.onrender.com/api/HeadOfDepartment/department-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading subjects...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Department Subjects</h2>
          <p className="text-sm text-gray-500">
            {department?.name || 'Your'} Department - All subjects offered
          </p>
        </div>
        <button
          onClick={loadDepartmentAndSubjects}
          className="text-blue-500 hover:text-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-4">
          {error}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No subjects in this department.</p>
          <p className="text-sm text-gray-400 mt-1">Contact admin to add subjects to your department.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            // Find allocated teachers for this subject
            const allocatedTeachers = subject.teachers || [];
            
            return (
              <div key={subject.id} className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{subject.name}</h3>
                    {subject.code && (
                      <p className="text-sm text-gray-500">Code: {subject.code}</p>
                    )}
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {allocatedTeachers.length} Teachers
                  </span>
                </div>
                
                {/* Show allocated teachers */}
                {allocatedTeachers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold">Allocated Teachers:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {allocatedTeachers.map((teacher, idx) => (
                        <span key={idx} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded">
                          {teacher.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HodSubjects;