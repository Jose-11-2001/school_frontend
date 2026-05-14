import React, { useState } from 'react';
import { studentAPI } from '../services/api';

function Rankings() {
  const [className, setClassName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRankings = async () => {
    if (!className) {
      alert('Please enter class name');
      return;
    }
    
    setLoading(true);
    try {
      const response = await studentAPI.getClassRanking(className, year, term);
      setRankings(response.data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      alert('Error fetching rankings. Make sure marks have been entered.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-800';
    if (grade === 'A-') return 'bg-green-50 text-green-700';
    if (grade === 'E') return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Class Rankings</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Class Name</label>
            <input
              type="text"
              placeholder="e.g., Form 3"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={fetchRankings}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          View Rankings
        </button>
      </div>

      {loading && <div className="text-center py-8">Loading rankings...</div>}
      
      {rankings && rankings.rankings && rankings.rankings.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h3 className="font-bold text-lg">{rankings.class}</h3>
            <p className="text-gray-600">Year: {rankings.year} | Term: {rankings.term} | Total Students: {rankings.totalStudents}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.rankings.map((rank, index) => (
                  <tr key={index} className={index === 0 ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 font-bold text-center">#{rank.position}</td>
                    <td className="px-6 py-4">{rank.admissionNumber}</td>
                    <td className="px-6 py-4 font-medium">{rank.fullName}</td>
                    <td className="px-6 py-4 font-bold">{rank.totalMarks}</td>
                    <td className="px-6 py-4">{rank.average}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(rank.grade)}`}>
                        {rank.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {rankings && rankings.rankings && rankings.rankings.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No rankings found for this class. Please ensure marks have been entered.
        </div>
      )}
    </div>
  );
}

export default Rankings;
