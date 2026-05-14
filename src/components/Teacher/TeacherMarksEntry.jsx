import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    loadMyStudents();
    loadMySubjects();
    loadNotifications();
    loadUnreadCount();
  }, []);

  const loadMyStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      let response = await fetch('http://localhost:5123/api/TeacherMarks/my-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        response = await fetch('http://localhost:5123/api/StudentSubject/teacher-students', {
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
      const response = await fetch('http://localhost:5123/api/TeacherSubjects/my-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/TeacherMarks/notifications', {
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
      const response = await fetch('http://localhost:5123/api/TeacherMarks/notifications/unread-count', {
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
      await fetch(`http://localhost:5123/api/TeacherMarks/notifications/${notificationId}/read`, {
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
      await fetch('http://localhost:5123/api/TeacherMarks/notifications/mark-all-read', {
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

  // Convert percentage score to points for Form 3 & Form 4
  const convertToPoints = (percentage) => {
    if (percentage >= 85) return 1;
    if (percentage >= 80) return 2;
    if (percentage >= 70) return 3;
    if (percentage >= 60) return 4;
    if (percentage >= 55) return 5;
    if (percentage >= 50) return 6;
    if (percentage >= 45) return 7;
    if (percentage >= 40) return 8;
    return 9;
  };

  // Convert points back to percentage for display
  const convertPointsToPercentage = (points) => {
    if (points === 1) return 90;
    if (points === 2) return 82;
    if (points === 3) return 75;
    if (points === 4) return 65;
    if (points === 5) return 57;
    if (points === 6) return 52;
    if (points === 7) return 47;
    if (points === 8) return 42;
    return 35;
  };

  // Calculate total based on class level
  const calculateTotal = () => {
    const ct1 = parseFloat(marks.continuousTest1) || 0;
    const ct2 = parseFloat(marks.continuousTest2) || 0;
    const endTerm = parseFloat(marks.endTermExam) || 0;
    const classLevel = getStudentClassLevel();
    
    // For Form 1 & Form 2: Use percentage scores directly
    if (classLevel === 'form1' || classLevel === 'form2') {
      const total = (ct1 * 0.20) + (ct2 * 0.20) + (endTerm * 0.60);
      return { total: total.toFixed(2), display: `${total.toFixed(2)}%`, points: null };
    }
    
    // For Form 3 & Form 4: Convert to points first
    if (classLevel === 'form3' || classLevel === 'form4') {
      const ct1Points = ct1 > 0 ? convertToPoints(ct1) : 0;
      const ct2Points = ct2 > 0 ? convertToPoints(ct2) : 0;
      const endTermPoints = endTerm > 0 ? convertToPoints(endTerm) : 0;
      
      // Weighted average of points (20% + 20% + 60%)
      let totalPoints = 0;
      let hasMarks = false;
      
      if (ct1Points > 0) {
        totalPoints += ct1Points * 0.20;
        hasMarks = true;
      }
      if (ct2Points > 0) {
        totalPoints += ct2Points * 0.20;
        hasMarks = true;
      }
      if (endTermPoints > 0) {
        totalPoints += endTermPoints * 0.60;
        hasMarks = true;
      }
      
      if (!hasMarks) return { total: 0, display: '0 pts', points: 0 };
      
      const finalPoints = Math.round(totalPoints);
      const equivalentPercentage = convertPointsToPercentage(finalPoints);
      return { total: finalPoints, display: `${finalPoints} points`, points: finalPoints, percentage: equivalentPercentage };
    }
    
    // Default: percentage based
    const total = (ct1 * 0.20) + (ct2 * 0.20) + (endTerm * 0.60);
    return { total: total.toFixed(2), display: `${total.toFixed(2)}%`, points: null };
  };

  // Get grade based on class level
  const getGrade = (result) => {
    const classLevel = getStudentClassLevel();
    
    if ((classLevel === 'form1' || classLevel === 'form2') && result.total) {
      const score = parseFloat(result.total);
      if (score >= 90) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 75) return 'A-';
      if (score >= 70) return 'B+';
      if (score >= 65) return 'B';
      if (score >= 60) return 'B-';
      if (score >= 55) return 'C+';
      if (score >= 50) return 'C';
      if (score >= 45) return 'C-';
      if (score >= 40) return 'D';
      return 'E';
    }
    
    if ((classLevel === 'form3' || classLevel === 'form4') && result.points) {
      const points = result.points;
      if (points === 1) return 'A+ (Excellent)';
      if (points === 2) return 'A (Very Good)';
      if (points === 3) return 'B+ (Good)';
      if (points === 4) return 'B (Above Average)';
      if (points === 5) return 'C+ (Average)';
      if (points === 6) return 'C (Satisfactory)';
      if (points === 7) return 'D+ (Below Average)';
      if (points === 8) return 'D (Poor)';
      return 'E (Fail)';
    }
    
    return 'N/A';
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
      const result = calculateTotal();
      
      let totalScore = result.total;
      let grade = getGrade(result);
      
      // For Form 3 & Form 4, store points as totalScore
      if (classLevel === 'form3' || classLevel === 'form4') {
        totalScore = result.points;
      }
      
      const response = await fetch('http://localhost:5123/api/TeacherMarks/enter-marks', {
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
        setMessage(`✅ Marks saved! ${classLevel === 'form3' || classLevel === 'form4' ? `Points: ${totalScore}` : `Total: ${result.display}`}, Grade: ${grade}`);
        setMarks({ continuousTest1: '', continuousTest2: '', endTermExam: '' });
        loadNotifications();
        loadUnreadCount();
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

    if (confirm(`📢 Publish ${term} results for ${selectedSubject.name}?\n\nStudents will receive a notification that results are out.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5123/api/TeacherMarks/publish-results/${selectedSubject.id}/${year}/${term}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok) {
          setMessage(`✅ ${data.message}`);
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

  const result = calculateTotal();
  const grade = getGrade(result);
  const classLevel = getStudentClassLevel();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Enter Student Marks</h2>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative bg-gray-100 p-2 rounded-full hover:bg-gray-200"
          >
            <span className="text-xl">🔔</span>
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
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
              // Reset marks when student changes
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
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Marks Entry</h3>
          {classLevel && (
            <span className={`text-sm px-2 py-1 rounded ${
              classLevel === 'form1' || classLevel === 'form2' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {classLevel === 'form1' || classLevel === 'form2' ? '📊 Percentage Based' : '🎯 Points Based (1-9)'}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Continuous Test 1 (20%)
              {(classLevel === 'form3' || classLevel === 'form4') && <span className="text-xs text-gray-500 ml-1">(Convert to points)</span>}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg"
              value={marks.continuousTest1}
              onChange={(e) => setMarks({...marks, continuousTest1: e.target.value})}
            />
            {marks.continuousTest1 && (classLevel === 'form3' || classLevel === 'form4') && (
              <div className="text-xs text-gray-500 mt-1">
                Points: {convertToPoints(parseInt(marks.continuousTest1))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              Continuous Test 2 (20%)
              {(classLevel === 'form3' || classLevel === 'form4') && <span className="text-xs text-gray-500 ml-1">(Convert to points)</span>}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg"
              value={marks.continuousTest2}
              onChange={(e) => setMarks({...marks, continuousTest2: e.target.value})}
            />
            {marks.continuousTest2 && (classLevel === 'form3' || classLevel === 'form4') && (
              <div className="text-xs text-gray-500 mt-1">
                Points: {convertToPoints(parseInt(marks.continuousTest2))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              End Term Exam (60%)
              {(classLevel === 'form3' || classLevel === 'form4') && <span className="text-xs text-gray-500 ml-1">(Convert to points)</span>}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg"
              value={marks.endTermExam}
              onChange={(e) => setMarks({...marks, endTermExam: e.target.value})}
            />
            {marks.endTermExam && (classLevel === 'form3' || classLevel === 'form4') && (
              <div className="text-xs text-gray-500 mt-1">
                Points: {convertToPoints(parseInt(marks.endTermExam))}
              </div>
            )}
          </div>
        </div>
        
        {(marks.continuousTest1 || marks.continuousTest2 || marks.endTermExam) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Final Score</p>
                <p className="text-2xl font-bold text-blue-700">{result.display}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Grade</p>
                <p className="text-2xl font-bold text-green-700">{grade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Calculation</p>
                <p className="text-xs text-gray-600">CT1(20%) + CT2(20%) + End(60%)</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Save Marks'}
        </button>
        
        <button
          onClick={handlePublishResults}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          📢 Publish Results & Notify Students
        </button>
      </div>

      {/* Grading Guide */}
      {(classLevel === 'form3' || classLevel === 'form4') && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">Points Grading Guide (Form 3 & Form 4):</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>85-100% → 1 point (A+)</div>
            <div>80-84% → 2 points (A)</div>
            <div>70-79% → 3 points (B+)</div>
            <div>60-69% → 4 points (B)</div>
            <div>55-59% → 5 points (C+)</div>
            <div>50-54% → 6 points (C)</div>
            <div>45-49% → 7 points (D+)</div>
            <div>40-44% → 8 points (D)</div>
            <div>0-39% → 9 points (E)</div>
          </div>
        </div>
      )}

      {(classLevel === 'form1' || classLevel === 'form2') && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">Percentage Grading Guide (Form 1 & Form 2):</h3>
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
      )}
    </div>
  );
}

export default TeacherMarksEntry;