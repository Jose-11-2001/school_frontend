
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
      const response = await fetch('http://localhost:5123/api/TeacherMarks/my-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

  const calculateTotal = () => {
    const ct1 = parseFloat(marks.continuousTest1) || 0;
    const ct2 = parseFloat(marks.continuousTest2) || 0;
    const endTerm = parseFloat(marks.endTermExam) || 0;
    
    const total = (ct1 * 0.20) + (ct2 * 0.20) + (endTerm * 0.60);
    return total.toFixed(2);
  };

  const getGrade = (total) => {
    const score = parseFloat(total);
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
      const response = await fetch('http://localhost:5123/api/TeacherMarks/enter-marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
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
        setMessage(`✅ Marks saved! Total: ${data.totalScore}%, Grade: ${data.grade}`);
        setMarks({ continuousTest1: '', continuousTest2: '', endTermExam: '' });
        loadNotifications(); // Refresh notifications
        loadUnreadCount(); // Refresh unread count
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

    if (confirm(`Are you sure you want to publish ${term} results for ${selectedSubject.name}? Students will be notified.`)) {
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

  const total = calculateTotal();
  const grade = getGrade(total);

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
              <div className="p-3 border-b flex justify-between items-center">
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
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50' : ''}`}
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
              const student = students.find(s => s.id === parseInt(e.target.value));
              setSelectedStudent(student);
            }}
            value={selectedStudent?.id || ''}
          >
            <option value="">Select a student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.admissionNumber} - {student.fullName} ({student.class})
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
        <h3 className="font-semibold mb-3">Marks Entry (Weighted: Continuous Tests 20% each, End Term 60%)</h3>
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
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-2xl font-bold text-blue-700">{total}%</p>
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
          📢 Publish Results
        </button>
      </div>
    </div>
  );
}

export default TeacherMarksEntry;