// src/components/Student/StudentResults.jsx
import React, { useState, useEffect } from 'react';
import { resultsAPI } from '../../services/api';

function StudentResults({ admissionNumber }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');

  useEffect(() => {
    if (admissionNumber) {
      fetchResults();
    }
  }, [admissionNumber, year, term]);

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await resultsAPI.getStudentResults(admissionNumber, year, term);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await resultsAPI.downloadPDF(admissionNumber, year, term);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results_${admissionNumber}_${term}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Failed to download PDF');
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-red-100 text-red-800',
      'F': 'bg-red-200 text-red-900'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!results) {
    return <div className="text-center py-8 text-gray-500">No results available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📊 My Results</h2>
        <button
          onClick={handleDownloadPDF}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          📄 Download PDF
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Term</label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
        </div>
        <button
          onClick={fetchResults}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg self-end hover:bg-blue-600"
        >
          Apply
        </button>
      </div>

      {/* Performance Summary */}
      {results.ranking && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Marks</p>
            <p className="text-2xl font-bold text-blue-700">{results.ranking.totalMarks || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Average</p>
            <p className="text-2xl font-bold text-green-700">{results.ranking.average || 0}%</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Position</p>
            <p className="text-2xl font-bold text-yellow-700">#{results.ranking.position || 'N/A'}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Overall Grade</p>
            <p className="text-2xl font-bold text-purple-700">{results.ranking.grade || 'N/A'}</p>
          </div>
        </div>
      )}

      {/* Marks Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Test 1 (20%)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Test 2 (20%)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">End Term (60%)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Overall</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.results?.map((mark, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">{mark.subjectName}</td>
                <td className="px-4 py-2 text-sm text-center">{mark.test1 || '-'}</td>
                <td className="px-4 py-2 text-sm text-center">{mark.test2 || '-'}</td>
                <td className="px-4 py-2 text-sm text-center">{mark.endTerm || '-'}</td>
                <td className="px-4 py-2 text-sm text-center font-bold">
                  {mark.overallPercentage?.toFixed(1) || '-'}%
                </td>
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
  );
}

export default StudentResults;