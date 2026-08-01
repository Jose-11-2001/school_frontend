import React, { useState, useEffect } from 'react';
import { generateGradePDF, getLetterGrade, getPoints, getPointsGrade } from '../Common/PDFGenerator';

function FormTeacherReports() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [reportType, setReportType] = useState('class');
  const [classReport, setClassReport] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/FormTeacher/my-classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/FormTeacher/my-students?classId=${selectedClass}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const generateClassReport = async () => {
    if (!selectedClass) {
      setMessage('Please select a class');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://school-yathu.onrender.com/api/FormTeacherReport/class-report?classId=${selectedClass}&year=${year}&term=${encodeURIComponent(term)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClassReport(data);
        setStudentReport(null);
        setSubjectPerformance(null);
        setMessage('Class report generated successfully!');
        setMessageType('success');
      } else {
        setMessage('Failed to generate class report');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error generating class report:', error);
      setMessage('Network error');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const generateStudentReport = async () => {
    if (!selectedStudent) {
      setMessage('Please select a student');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://school-yathu.onrender.com/api/FormTeacherReport/student-report?studentId=${selectedStudent}&year=${year}&term=${encodeURIComponent(term)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudentReport(data);
        setClassReport(null);
        setSubjectPerformance(null);
        setMessage('Student report generated successfully!');
        setMessageType('success');
      } else {
        setMessage('Failed to generate student report');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error generating student report:', error);
      setMessage('Network error');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const generateSubjectPerformance = async () => {
    if (!selectedClass) {
      setMessage('Please select a class');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://school-yathu.onrender.com/api/FormTeacherReport/subject-performance?classId=${selectedClass}&year=${year}&term=${encodeURIComponent(term)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubjectPerformance(data);
        setClassReport(null);
        setStudentReport(null);
        setMessage('Subject performance report generated successfully!');
        setMessageType('success');
      } else {
        setMessage('Failed to generate subject performance report');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error generating subject performance:', error);
      setMessage('Network error');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const downloadStudentPDF = (studentData, marks, ranking, classLevel) => {
    if (!studentData || !marks) {
      setMessage('No data available to download');
      setMessageType('error');
      return;
    }

    const studentInfo = {
      name: studentData.fullName,
      admissionNumber: studentData.admissionNumber,
      class: studentData.class,
      stream: studentData.stream,
      term: term,
      year: year
    };

    const formattedMarks = marks.map(m => ({
      subjectName: m.subjectName,
      score: m.totalScore || 0,
      grade: m.grade,
      remark: m.remark
    }));

    const rankingData = {
      totalMarks: ranking?.totalMarks || 0,
      average: ranking?.averageScore || 0,
      position: ranking?.position || 'N/A',
      grade: ranking?.grade || 'N/A',
      remarks: ranking?.remarks || ''
    };

    generateGradePDF(studentInfo, formattedMarks, rankingData, classLevel);
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade.includes('A')) return 'bg-green-100 text-green-800';
    if (grade.includes('B')) return 'bg-blue-100 text-blue-800';
    if (grade.includes('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade.includes('D')) return 'bg-orange-100 text-orange-800';
    if (grade.includes('E') || grade.includes('F')) return 'bg-red-100 text-red-800';
    if (grade.includes('point')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const renderClassReport = () => {
    if (!classReport) return null;

    return (
      <div className="mt-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-xl font-bold text-gray-800">
            {classReport.className} {classReport.stream} - Class Report
          </h3>
          <p className="text-sm text-gray-600">
            {classReport.term} {classReport.year} | Total Students: {classReport.totalStudents} | 
            With Results: {classReport.studentsWithResults} | 
            Class Average: {classReport.averageClassScore?.toFixed(2)}%
          </p>
          {classReport.topStudent && (
            <div className="mt-2 text-sm">
              <span className="font-semibold">Top Student:</span> {classReport.topStudent.fullName} 
              ({classReport.topStudent.averageScore}%)
            </div>
          )}
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classReport.studentReports?.map((student, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold">#{student.position}</td>
                  <td className="px-6 py-4 text-sm font-mono">{student.admissionNumber}</td>
                  <td className="px-6 py-4 text-sm font-medium">{student.fullName}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{student.totalMarks}</td>
                  <td className="px-6 py-4 text-sm">{student.averageScore}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.grade)}`}>
                      {student.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{student.subjectCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStudentReport = () => {
    if (!studentReport) return null;

    const { student, performance, subjects, className, stream } = studentReport;

    return (
      <div className="mt-6 space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{student.fullName}</h3>
              <p className="text-sm text-gray-600">
                {className} {stream} | {student.admissionNumber}
              </p>
            </div>
            <button
              onClick={() => downloadStudentPDF(student, subjects, performance, 
                (className?.includes('Form 3') || className?.includes('Form 4')) ? 'form3' : 'form1')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Download PDF
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Total Marks</p>
              <p className="text-xl font-bold text-blue-600">{performance.totalMarks}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-xl font-bold text-green-600">{performance.averageScore}%</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Position</p>
              <p className="text-xl font-bold text-yellow-600">#{performance.position} / {performance.totalStudents}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Grade</p>
              <p className="text-xl font-bold text-purple-600">{performance.grade}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Test 1 (20%)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Test 2 (20%)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">End Term (60%)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remark</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects?.map((subject, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{subject.subjectName}</td>
                  <td className="px-6 py-4 text-sm text-center">{subject.continuousTest1 || '-'}</td>
                  <td className="px-6 py-4 text-sm text-center">{subject.continuousTest2 || '-'}</td>
                  <td className="px-6 py-4 text-sm text-center">{subject.endTermExam || '-'}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold">{subject.totalScore || '-'}%</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(subject.grade)}`}>
                      {subject.grade || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{subject.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSubjectPerformance = () => {
    if (!subjectPerformance) return null;

    return (
      <div className="mt-6 space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-xl font-bold text-gray-800">
            Subject Performance - {subjectPerformance.className} {subjectPerformance.stream}
          </h3>
          <p className="text-sm text-gray-600">
            {subjectPerformance.term} {subjectPerformance.year} | 
            Total Subjects: {subjectPerformance.totalSubjects}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectPerformance.subjectPerformance?.map((subject, index) => (
            <div key={index} className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-lg text-gray-800">{subject.subjectName}</h4>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Average:</span>
                  <span className="font-bold text-blue-600">{subject.averageScore?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Highest:</span>
                  <span className="font-bold text-green-600">{subject.highestScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lowest:</span>
                  <span className="font-bold text-red-600">{subject.lowestScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Students:</span>
                  <span>{subject.studentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pass Rate:</span>
                  <span className="font-bold text-green-600">{subject.passRate?.toFixed(2)}%</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">Grade Distribution:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subject.gradeDistribution?.map((g, idx) => (
                    <span key={idx} className={`px-2 py-0.5 rounded-full text-xs ${getGradeColor(g.grade)}`}>
                      {g.grade}: {g.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Class Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Generate and view class performance reports</p>
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

      <div className="bg-gray-50 p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Class --</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.stream || ''} ({cls.studentCount} students)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="class">Class Report</option>
              <option value="student">Student Report</option>
              <option value="subject">Subject Performance</option>
            </select>
          </div>
        </div>

        {reportType === 'student' && (
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Student --</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.admissionNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={reportType === 'class' ? generateClassReport : 
                     reportType === 'student' ? generateStudentReport : 
                     generateSubjectPerformance}
            disabled={loading || (reportType === 'student' && !selectedStudent) || 
                     (reportType !== 'student' && !selectedClass)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>

          <button
            onClick={() => {
              setClassReport(null);
              setStudentReport(null);
              setSubjectPerformance(null);
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Clear Report
          </button>
        </div>
      </div>

      {renderClassReport()}
      {renderStudentReport()}
      {renderSubjectPerformance()}
    </div>
  );
}

export default FormTeacherReports;