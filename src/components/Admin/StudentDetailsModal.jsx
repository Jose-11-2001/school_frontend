import React, { useState, useEffect } from 'react';

function StudentDetailsModal({ studentId, isOpen, onClose }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && studentId) {
      loadStudentDetails();
    }
  }, [isOpen, studentId]);

  const loadStudentDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/Student/student-details/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      } else {
        setError('Failed to load student details');
      }
    } catch (error) {
      console.error('Error loading student details:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade.includes('A')) return 'bg-green-100 text-green-800';
    if (grade.includes('B')) return 'bg-blue-100 text-blue-800';
    if (grade.includes('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade.includes('D')) return 'bg-orange-100 text-orange-800';
    if (grade.includes('E') || grade.includes('F')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading student details...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : student ? (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-lg text-blue-800 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold">{student.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Admission Number</p>
                    <p className="font-semibold font-mono">{student.admissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-semibold">{student.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-semibold">{student.class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stream</p>
                    <p className="font-semibold">{student.stream || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold">{student.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold">{student.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-semibold">
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registered On</p>
                    <p className="font-semibold">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-lg text-green-800 mb-3">Subjects</h3>
                {student.subjects && student.subjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {student.subjects.map((subject, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="font-semibold">{subject.subjectName}</p>
                        <p className="text-sm text-gray-600">Teacher: {subject.teacherName}</p>
                        <p className="text-xs text-gray-400">{subject.term} {subject.academicYear}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No subjects allocated</p>
                )}
              </div>

              {/* Performance Summary */}
              {student.performanceSummary && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-lg text-purple-800 mb-3">Performance Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Total Subjects</p>
                      <p className="text-2xl font-bold text-blue-600">{student.performanceSummary.totalSubjects}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Total Marks</p>
                      <p className="text-2xl font-bold text-green-600">{student.performanceSummary.totalMarks}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Average Score</p>
                      <p className="text-2xl font-bold text-purple-600">{student.performanceSummary.averageScore?.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Marks */}
              {student.marks && student.marks.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">Marks</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Test 1 (20%)</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Test 2 (20%)</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">End Term (60%)</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {student.marks.map((mark, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium">{mark.subjectName}</td>
                            <td className="px-4 py-2 text-sm text-center">{mark.continuousTest1 || '-'}</td>
                            <td className="px-4 py-2 text-sm text-center">{mark.continuousTest2 || '-'}</td>
                            <td className="px-4 py-2 text-sm text-center">{mark.endTermExam || '-'}</td>
                            <td className="px-4 py-2 text-sm text-center font-bold">{mark.totalScore || '-'}%</td>
                            <td className="px-4 py-2 text-sm text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(mark.grade)}`}>
                                {mark.grade || '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No student data available</div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailsModal;