import React, { useState, useEffect } from 'react';

function Timetable({ userId, role, classId }) {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');

  useEffect(() => {
    loadTimetable();
  }, [userId, role, classId, selectedDay]);

  const loadTimetable = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/Timetable/${role}?userId=${userId}&classId=${classId || ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTimetable(data);
      } else {
        setError('Failed to load timetable');
      }
    } catch (error) {
      console.error('Error loading timetable:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getDayTimetable = (day) => {
    return timetable.filter(item => item.day === day);
  };

  if (loading) {
    return <div className="text-center py-8">Loading timetable...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Timetable</h2>
          <p className="text-sm text-gray-500 mt-1">
            {role === 'Student' ? 'Your class timetable' : 
             role === 'Teacher' ? 'Your teaching timetable' : 
             'Class timetable'}
          </p>
        </div>
        <button onClick={loadTimetable} className="text-blue-500 hover:text-blue-700">
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedDay === day
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {getDayTimetable(selectedDay).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No classes scheduled for {selectedDay}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getDayTimetable(selectedDay).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{item.startTime} - {item.endTime}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.subjectName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.teacherName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.className} {item.stream}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.venue || 'Classroom'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Timetable;