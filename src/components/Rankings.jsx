import React, { useState } from 'react';
import { adminAPI, studentAPI } from '../services/api';

function Rankings() {
  const [className, setClassName] = useState('');
  const [stream, setStream] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Load classes when component mounts
  React.useEffect(() => {
    loadClasses();
  }, []);

  // Load streams when class changes
  React.useEffect(() => {
    if (className) {
      loadStreams(className);
    } else {
      setStreams([]);
      setStream('');
    }
  }, [className]);

  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      const response = await adminAPI.getClasses();
      // Extract unique class names
      const uniqueClasses = [...new Set(response.data.map(c => c.name))];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadStreams = async (selectedClass) => {
    try {
      const response = await adminAPI.getClasses();
      // Get streams for selected class
      const classStreams = response.data
        .filter(c => c.name === selectedClass)
        .map(c => c.stream)
        .filter(s => s);
      setStreams([...new Set(classStreams)]);
      setStream(''); // Reset stream when class changes
    } catch (error) {
      console.error('Error loading streams:', error);
    }
  };

  const fetchRankings = async () => {
    if (!className) {
      setError('Please select a class');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await studentAPI.getClassRankings(className, year, term, stream);
      setRankings(response.data);
      
      if (!response.data.rankings || response.data.rankings.length === 0) {
        setError('No rankings found for this class. Please ensure marks have been entered.');
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
      if (error.response?.status === 404) {
        setError('No rankings found for this class. Please ensure marks have been entered.');
      } else if (error.response?.status === 401) {
        setError('Please login again to view rankings.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
      setRankings(null);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    const gradeMap = {
      'A+': 'bg-green-600 text-white',
      'A': 'bg-green-500 text-white',
      'A-': 'bg-green-400 text-white',
      'B+': 'bg-blue-500 text-white',
      'B': 'bg-blue-400 text-white',
      'B-': 'bg-blue-300 text-gray-800',
      'C+': 'bg-yellow-500 text-white',
      'C': 'bg-yellow-400 text-gray-800',
      'C-': 'bg-yellow-300 text-gray-800',
      'D+': 'bg-orange-400 text-white',
      'D': 'bg-orange-300 text-gray-800',
      'E': 'bg-red-400 text-white',
      'F': 'bg-red-600 text-white',
      '1 point': 'bg-green-600 text-white',
      '2 points': 'bg-green-500 text-white',
      '3 points': 'bg-blue-500 text-white',
      '4 points': 'bg-blue-400 text-white',
      '5 points': 'bg-yellow-500 text-white',
      '6 points': 'bg-yellow-400 text-gray-800',
      '7 points': 'bg-orange-400 text-white',
      '8 points': 'bg-orange-300 text-gray-800',
      '9 points': 'bg-red-500 text-white'
    };
    return gradeMap[grade] || 'bg-gray-100 text-gray-800';
  };

  const getRankBadge = (position) => {
    if (position === 1) return '#1';
    if (position === 2) return '#2';
    if (position === 3) return '#3';
    return `#${position}`;
  };

  const resetFilters = () => {
    setClassName('');
    setStream('');
    setYear(new Date().getFullYear());
    setTerm('Term 1');
    setRankings(null);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Class Rankings</h2>
          <p className="text-sm text-gray-500 mt-1">View student performance rankings by class and term</p>
        </div>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Reset Filters
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Class Name <span className="text-red-500">*</span>
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingClasses}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            {loadingClasses && (
              <p className="text-xs text-gray-400 mt-1">Loading classes...</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Stream</label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!className || streams.length === 0}
            >
              <option value="">All Streams</option>
              {streams.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {className && streams.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">No streams available for this class</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2023, 2024, 2025, 2026, 2027].map(y => (
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
        </div>
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={fetchRankings}
            disabled={loading || !className}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'View Rankings'
            )}
          </button>
          {className && (
            <button
              onClick={() => {
                setClassName('');
                setStream('');
                setRankings(null);
              }}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-4 rounded-lg mb-4 ${
          error.includes('No rankings') 
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {error}
        </div>
      )}

      
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading rankings...</p>
        </div>
      )}
      
      {/* Rankings Results */}
      {rankings && rankings.rankings && rankings.rankings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{rankings.class} {rankings.stream || ''}</h3>
                <p className="text-sm text-gray-600">
                  Year: {rankings.year} | Term: {rankings.term} | 
                  Total Students: <span className="font-semibold">{rankings.totalStudents}</span>
                  {rankings.rankings && (
                    <span className="ml-2">| Ranked: <span className="font-semibold">{rankings.rankings.length}</span></span>
                  )}
                </p>
              </div>
              <div className="text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                <span className="text-gray-500">Top Student:</span>
                <span className="font-semibold text-blue-600 ml-1">
                  {rankings.rankings[0]?.fullName || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.rankings.map((rank, index) => (
                  <tr key={index} className={`hover:bg-gray-50 transition-colors ${
                    index === 0 ? 'bg-yellow-50' : 
                    index === 1 ? 'bg-gray-50' : 
                    index === 2 ? 'bg-orange-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-center">
                        {getRankBadge(rank.position)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {rank.admissionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rank.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {rank.totalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {rank.average}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(rank.grade)}`}>
                        {rank.grade || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500">
            Showing {rankings.rankings.length} of {rankings.totalStudents || rankings.rankings.length} students
          </div>
        </div>
      )}
      
      {/* No Results State */}
      {rankings && rankings.rankings && rankings.rankings.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Rankings Available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No rankings found for {className} {stream || ''} in {term} {year}.
            Please ensure marks have been entered for this class.
          </p>
        </div>
      )}
    </div>
  );
}

export default Rankings;