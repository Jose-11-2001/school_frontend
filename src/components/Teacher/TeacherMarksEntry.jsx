import React, { useState, useEffect } from 'react';
import { generateGradePDF, getLetterGrade, getPoints, getPointsGrade } from './PDFGenerator';

function TeacherMarksEntry() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [marks, setMarks] = useState({
    continuousTest1: '',
    continuousTest2: '',
    endTermExam: ''
  });
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [savedMarks, setSavedMarks] = useState([]);
  const [showSavedMarks, setShowSavedMarks] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadMyStudents();
    loadMySubjects();
    loadNotifications();
    loadUnreadCount();
  }, []);

  useEffect(() => {
    if (selectedStudent && selectedSubject && year && term) {
      loadSavedMarks();
    }
  }, [selectedStudent, selectedSubject, year, term]);

  const loadMyStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      let response = await fetch('https://school-yathu.onrender.com/api/TeacherMarks/my-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        response = await fetch('https://school-yathu.onrender.com/api/StudentSubject/teacher-students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadMySubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/TeacherSubjects/my-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadSavedMarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://school-yathu.onrender.com/api/TeacherMarks/student-marks/${selectedStudent?.studentId || selectedStudent?.id}/${selectedSubject?.id}/${year}/${term}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSavedMarks(data);
        if (data) {
          setMarks({
            continuousTest1: data.continuousTest1 || '',
            continuousTest2: data.continuousTest2 || '',
            endTermExam: data.endTermExam || ''
          });
        }
      } else {
        setSavedMarks([]);
      }
    } catch (error) {
      console.error('Error loading saved marks:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/TeacherMarks/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/TeacherMarks/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://school-yathu.onrender.com/api/TeacherMarks/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('https://school-yathu.onrender.com/api/TeacherMarks/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Get student class level (Form 1, Form 2, Form 3, Form 4)
  const getStudentClassLevel = () => {
    if (!selectedStudent) return null;
    const className = selectedStudent.class || selectedStudent.className || '';
    if (className.includes('Form 1') || className.includes('Form1')) return 'form1';
    if (className.includes('Form 2') || className.includes('Form2')) return 'form2';
    if (className.includes('Form 3') || className.includes('Form3')) return 'form3';
    if (className.includes('Form 4') || className.includes('Form4')) return 'form4';
    return null;
  };

  // Calculate overall percentage score
  const calculateOverallPercentage = () => {
    const ct1 = parseFloat(marks.continuousTest1) || 0;
    const ct2 = parseFloat(marks.continuousTest2) || 0;
    const endTerm = parseFloat(marks.endTermExam) || 0;
    
    // Calculate weighted score: Test1(20%) + Test2(20%) + EndTerm(60%)
    const overall = (ct1 * 0.20) + (ct2 * 0.20) + (endTerm * 0.60);
    return overall;
  };

  const overallPercentage = calculateOverallPercentage();

  // Generate PDF report for selected student
  const handleGeneratePDF = async () => {
    if (!selectedStudent) {
      setMessage('Please select a student first');
      return;
    }

    setGeneratingPDF(true);
    try {
      const token = localStorage.getItem('token');
      const classLevel = getStudentClassLevel();
      
      // Fetch all marks for the student
      const response = await fetch(`https://school-yathu.onrender.com/api/Student/marks/${selectedStudent.id || selectedStudent.studentId}?year=${year}&term=${term}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch marks');
      }
      
      const marksData = await response.json();
      
      // Format marks for PDF
      const formattedMarks = marksData.map(mark => ({
        subjectName: mark.subjectName,
        score: mark.totalScore || 0,
        grade: mark.grade,
        remark: mark.remark
      }));
      
      // Calculate ranking data
      const totalMarks = formattedMarks.reduce((sum, m) => sum + m.score, 0);
      const average = formattedMarks.length > 0 ? totalMarks / formattedMarks.length : 0;
      
      let overallGrade = '';
      if (classLevel === 'form3' || classLevel === 'form4') {
        const points = getPoints(average);
        overallGrade = `${points} points`;
      } else {
        overallGrade = getLetterGrade(average);
      }
      
      const rankingData = {
        totalMarks: totalMarks,
        average: average.toFixed(2),
        position: 'N/A',
        grade: overallGrade,
        remarks: `Average score: ${average.toFixed(2)}%`
      };
      
      const studentData = {
        name: selectedStudent.studentName || selectedStudent.fullName,
        admissionNumber: selectedStudent.admissionNumber,
        class: selectedStudent.class,
        stream: selectedStudent.stream,
        term: term,
        year: year
      };
      
      generateGradePDF(studentData, formattedMarks, rankingData, classLevel);
      setMessage('✅ PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage('❌ Error generating PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject) {
      setMessage('Please select student and subject');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const classLevel = getStudentClassLevel();
      
      let totalScore = overallPercentage;
      let grade = '';
      let finalDisplay = '';
      
      // For Form 3 & Form 4: Store points instead of percentage
      if (classLevel === 'form3' || classLevel === 'form4') {
        totalScore = getPoints(overallPercentage);
        grade = getPointsGrade(totalScore);
        finalDisplay = `${overallPercentage.toFixed(2)}% (${totalScore} point${totalScore !== 1 ? 's' : ''})`;
      } else {
        // For Form 1 & Form 2: Store percentage and letter grade
        totalScore = parseFloat(overallPercentage.toFixed(2));
        grade = getLetterGrade(overallPercentage);
        finalDisplay = `${totalScore}%`;
      }
      
      const response = await fetch('https://school-yathu.onrender.com/api/TeacherMarks/enter-marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudent.studentId || selectedStudent.id,
          subjectId: selectedSubject.id,
          year: year,
          term: term,
          continuousTest1: marks.continuousTest1 ? parseInt(marks.continuousTest1) : null,
          continuousTest2: marks.continuousTest2 ? parseInt(marks.continuousTest2) : null,
          endTermExam: marks.endTermExam ? parseInt(marks.endTermExam) : null
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(` Marks saved! Overall: ${finalDisplay}, Grade: ${grade}`);
        await loadSavedMarks();
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error saving marks');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePublishResults = async () => {
    if (!selectedSubject) {
      setMessage('Please select a subject first');
      return;
    }

    if (confirm(`Publish ${term} results for ${selectedSubject.name}?\n\nStudents will receive a notification that results are out.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://school-yathu.onrender.com/api/TeacherMarks/publish-results/${selectedSubject.id}/${year}/${term}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok) {
          setMessage(` ${data.message}`);
          loadNotifications();
          loadUnreadCount();
        } else {
          setMessage(`❌ ${data.message}`);
        }
      } catch (error) {
        setMessage('❌ Error publishing results');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const classLevel = getStudentClassLevel();
  
  // Determine display information based on class level
  let displayGrade = '';
  let finalDisplayText = '';
  
  if (classLevel === 'form3' || classLevel === 'form4') {
    const points = getPoints(overallPercentage);
    displayGrade = `${points} point${points !== 1 ? 's' : ''} - ${getPointsGrade(points)}`;
    finalDisplayText = `${overallPercentage.toFixed(2)}%`;
  } else if (classLevel === 'form1' || classLevel === 'form2') {
    displayGrade = getLetterGrade(overallPercentage);
    finalDisplayText = `${overallPercentage.toFixed(2)}%`;
  }

  // Get saved marks display
  const getSavedMarksDisplay = () => {
    if (!savedMarks || Object.keys(savedMarks).length === 0) return null;
    
    const savedCT1 = parseFloat(savedMarks.continuousTest1) || 0;
    const savedCT2 = parseFloat(savedMarks.continuousTest2) || 0;
    const savedEndTerm = parseFloat(savedMarks.endTermExam) || 0;
    const savedOverall = (savedCT1 * 0.20) + (savedCT2 * 0.20) + (savedEndTerm * 0.60);
    
    let savedDisplay = '';
    if (classLevel === 'form3' || classLevel === 'form4') {
      const savedPoints = getPoints(savedOverall);
      savedDisplay = `${savedOverall.toFixed(2)}% (${savedPoints} point${savedPoints !== 1 ? 's' : ''})`;
    } else {
      savedDisplay = `${savedOverall.toFixed(2)}%`;
    }
    
    return (
      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-800 mb-2">Previously Saved Marks</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Test 1 (20%):</span>
            <span className="ml-2 font-semibold">{savedMarks.continuousTest1 || 'Not entered'}</span>
          </div>
          <div>
            <span className="text-gray-600">Test 2 (20%):</span>
            <span className="ml-2 font-semibold">{savedMarks.continuousTest2 || 'Not entered'}</span>
          </div>
          <div>
            <span className="text-gray-600">End Term (60%):</span>
            <span className="ml-2 font-semibold">{savedMarks.endTermExam || 'Not entered'}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-green-200">
          <span className="text-gray-600">Final Overall Percentage:</span>
          <span className="ml-2 font-bold text-green-700">{savedDisplay}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Enter Student Marks</h2>
        <div className="flex gap-2">
          {selectedStudent && (
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
            >
              {generatingPDF ? 'Generating...' : 'Generate PDF Report'}
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative bg-gray-100 p-2 rounded-full hover:bg-gray-200"
            >
              <span className="text-xl"></span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-10">
                <div className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center">No notifications</p>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkNotificationAsRead(notif.id)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${
                          !notif.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="font-medium text-sm">{notif.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{notif.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 mb-2">Select Student</label>
          <select
            className="w-full px-3 py-2 border rounded-lg"
            onChange={(e) => {
              const student = students.find(s => (s.studentId || s.id) === parseInt(e.target.value));
              setSelectedStudent(student);
              setMarks({ continuousTest1: '', continuousTest2: '', endTermExam: '' });
            }}
            value={selectedStudent?.studentId || selectedStudent?.id || ''}
          >
            <option value="">Select a student</option>
            {students.map(student => (
              <option key={student.studentId || student.id} value={student.studentId || student.id}>
                {student.admissionNumber} - {student.studentName || student.fullName} ({student.class})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Select Subject</label>
          <select
            className="w-full px-3 py-2 border rounded-lg"
            onChange={(e) => {
              const subject = subjects.find(s => s.id === parseInt(e.target.value));
              setSelectedSubject(subject);
            }}
            value={selectedSubject?.id || ''}
          >
            <option value="">Select a subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Year</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-lg"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Term</label>
          <select
            className="w-full px-3 py-2 border rounded-lg"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
        </div>
      </div>

      {getSavedMarksDisplay()}
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Marks Entry</h3>
          {classLevel && (
            <span className={`text-sm px-2 py-1 rounded ${
              classLevel === 'form1' || classLevel === 'form2' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {classLevel === 'form1' || classLevel === 'form2' ? 'Letter Grades (A-F)' : ' Points System (1-9 points)'}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Continuous Test 1 (20%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg"
              value={marks.continuousTest1}
              onChange={(e) => setMarks({...marks, continuousTest1: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Continuous Test 2 (20%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg"
              value={marks.continuousTest2}
              onChange={(e) => setMarks({...marks, continuousTest2: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">End Term Exam (60%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg"
              value={marks.endTermExam}
              onChange={(e) => setMarks({...marks, endTermExam: e.target.value})}
            />
          </div>
        </div>
        
        {(marks.continuousTest1 || marks.continuousTest2 || marks.endTermExam) && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-bold text-center text-gray-700 mb-3">FINAL COMPUTED RESULT</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Overall Percentage</p>
                <p className="text-3xl font-bold text-blue-600">{overallPercentage.toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-1">Test1(20%) + Test2(20%) + End(60%)</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Grade</p>
                <p className="text-3xl font-bold text-green-600">{displayGrade}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Final Score Display</p>
                <p className="text-xl font-bold text-purple-600">{finalDisplayText}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : ' Save Marks'}
        </button>
        
        <button
          onClick={handlePublishResults}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Publish Results & Notify Students
        </button>
      </div>
    </div>
  );
}

export default TeacherMarksEntry;