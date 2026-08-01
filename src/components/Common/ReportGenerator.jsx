import React, { useState } from 'react';
import { generateGradePDF, getLetterGrade, getPoints, getPointsGrade } from './PDFGenerator';

function ReportGenerator({ studentData, marks, ranking, classLevel }) {
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerateReport = async () => {
    if (!studentData) {
      setMessage('No student data available');
      return;
    }

    setGenerating(true);
    try {
      // Use the existing PDF generator
      generateGradePDF(studentData, marks, ranking, classLevel);
      setMessage('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage('Error generating report');
    } finally {
      setGenerating(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Generate Report</h2>
          <p className="text-sm text-gray-500 mt-1">Generate PDF report for student performance</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
        >
          {generating ? 'Generating...' : 'Generate PDF Report'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${
          message.includes('success') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border">
        <p className="text-sm text-gray-600">
          Click the button above to generate a comprehensive PDF report including:
        </p>
        <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
          <li>Student personal information</li>
          <li>Subject-wise marks breakdown</li>
          <li>Performance summary and rankings</li>
          <li>Grade and points system</li>
          <li>Teacher remarks and recommendations</li>
        </ul>
      </div>
    </div>
  );
}

export default ReportGenerator;