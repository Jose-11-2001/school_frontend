import React, { useState, useEffect } from 'react';
import { studentAPI, subjectAPI } from '../services/api';

function MarksEntry() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    subjectId: '',
    score: '',
    year: new Date().getFullYear(),
    term: 'Term 1',
    examType: 'EndTerm'
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    loadStudents();
    loadTeacherSubjects();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedClass, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll();
      setStudents(response.data);
      setFilteredStudents(response.data);
      
      const uniqueClasses = [...new Set(response.data.map(s => s.class).filter(c => c))];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await fetch('http://localhost:5123/api/teachersubjects/my-subjects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      } else {
        const allSubjects = await subjectAPI.getAll();
        setSubjects(allSubjects.data);
      }
    } catch (error) {
      console.error('Error loading teacher subjects:', error);
      const allSubjects = await subjectAPI.getAll();
      setSubjects(allSubjects.data);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedClass) {
      filtered = filtered.filter(student => student.class === selectedClass);
    }
    
    setFilteredStudents(filtered);
  };

  const handleStudentSelect = (studentId, studentName) => {
    setFormData({
      ...formData,
      studentId: studentId,
      studentName: studentName
    });
  };

  const calculateGrade = (score) => {
    if (score >= 90) return { grade: 'A+', remark: 'Excellent' };
    if (score >= 80) return { grade: 'A', remark: 'Very Good' };
    if (score >= 75) return { grade: 'A-', remark: 'Good' };
    if (score >= 70) return { grade: 'B+', remark: 'Above Average' };
    if (score >= 65) return { grade: 'B', remark: 'Satisfactory' };
    if (score >= 60) return { grade: 'B-', remark: 'Average' };
    if (score >= 55) return { grade: 'C+', remark: 'Fair' };
    if (score >= 50) return { grade: 'C', remark: 'Pass' };
    if (score >= 45) return { grade: 'C-', remark: 'Below Average' };
    if (score >= 40) return { grade: 'D', remark: 'Needs Improvement' };
    return { grade: 'E', remark: 'Fail' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentId) {
      setMessage('Please select a student');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const gradeInfo = calculateGrade(parseInt(formData.score));
    
    try {
      await studentAPI.enterMarks({
        studentId: formData.studentId,
        subjectId: formData.subjectId,
        score: parseInt(formData.score),
        year: formData.year,
        term: formData.term,
        examType: formData.examType,
        grade: gradeInfo.grade,
        remark: gradeInfo.remark
      });
      setMessage(`✓ Marks entered successfully for ${formData.studentName}! Grade: ${gradeInfo.grade} - ${gradeInfo.remark}`);
      setMessageType('success');
      setFormData({
        ...formData,
        score: '',
        studentId: '',
        studentName: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error entering marks. Please try again.');
      setMessageType('error');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setFilteredStudents(students);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Enter Student Marks</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
          {message}
        </div>
      )}
      
      {/* Student Search and Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">Find Student</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Search by Name or Admission No</label>
            <input
              type="text"
              placeholder="Type student name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Filter by Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {classes.map((cls, index) => (
                <option key={index} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Student List Display */}
        {filteredStudents.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-2">
              Select Student ({filteredStudents.length} found)
            </label>
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentSelect(student.id, student.fullName)}
                  className={`p-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 transition-colors ${
                    formData.studentId === student.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="font-medium">{student.fullName}</div>
                  <div className="text-sm text-gray-500">
                    Admission: {student.admissionNumber} | Class: {student.class || 'N/A'} | Stream: {student.stream || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {filteredStudents.length === 0 && students.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-center text-yellow-700">
            No students found matching your search criteria.
          </div>
        )}
        
        {loading && (
          <div className="mt-4 text-center text-gray-500">Loading students...</div>
        )}
      </div>
      
      {/* Selected Student Display */}
      {formData.studentId && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold text-blue-800">Selected Student:</span>
              <span className="ml-2 text-blue-900">{formData.studentName}</span>
            </div>
            <button
              onClick={() => setFormData({...formData, studentId: '', studentName: ''})}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Change Student
            </button>
          </div>
        </div>
      )}
      
      {/* Marks Entry Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Subject *</label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({...formData, subjectId: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!formData.studentId}
            >
              <option value="">-- Select Subject --</option>
              {loadingSubjects ? (
                <option disabled>Loading subjects...</option>
              ) : (
                subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))
              )}
            </select>
            {subjects.length === 0 && !loadingSubjects && (
              <p className="text-sm text-red-500 mt-1">
                No subjects assigned. Please contact administrator.
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Score (0-100) *</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => {
                const score = parseInt(e.target.value);
                setFormData({...formData, score: e.target.value});
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!formData.studentId}
            />
            {formData.score && (
              <div className="mt-1 text-sm">
                Grade: <span className="font-bold">{calculateGrade(parseInt(formData.score)).grade}</span>
                {' - '}
                <span className="text-gray-600">{calculateGrade(parseInt(formData.score)).remark}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Year *</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Term *</label>
            <select
              value={formData.term}
              onChange={(e) => setFormData({...formData, term: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Exam Type</label>
            <select
              value={formData.examType}
              onChange={(e) => setFormData({...formData, examType: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>CAT 1</option>
              <option>CAT 2</option>
              <option>EndTerm</option>
            </select>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!formData.studentId || !formData.subjectId || !formData.score}
        >
          Save Marks
        </button>
      </form>

      {/* Grade Guide */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">Grade Guide:</h3>
        <div className="grid grid-cols-5 gap-2 text-sm">
          <div className="bg-green-100 p-1 rounded">90-100: A+ (Excellent)</div>
          <div className="bg-green-50 p-1 rounded">80-89: A (Very Good)</div>
          <div className="bg-blue-50 p-1 rounded">75-79: A- (Good)</div>
          <div className="bg-blue-50 p-1 rounded">70-74: B+ (Above Average)</div>
          <div className="bg-yellow-50 p-1 rounded">65-69: B (Satisfactory)</div>
          <div className="bg-yellow-50 p-1 rounded">60-64: B- (Average)</div>
          <div className="bg-orange-50 p-1 rounded">55-59: C+ (Fair)</div>
          <div className="bg-orange-50 p-1 rounded">50-54: C (Pass)</div>
          <div className="bg-red-50 p-1 rounded">45-49: C- (Below Average)</div>
          <div className="bg-red-50 p-1 rounded">40-44: D (Needs Improvement)</div>
          <div className="bg-red-100 p-1 rounded">0-39: E (Fail)</div>
        </div>
      </div>
    </div>
  );
}

export default MarksEntry;