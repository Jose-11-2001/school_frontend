import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, hasRole, getUserName } from '../../utils/roleUtils';
import Notifications from '../Common/Notifications';
import SubjectSelection from './SubjectSelection';
import ContactInfo from '../Common/ContactInfo';
import Timetable from '../Common/Timetable';
import { generateGradePDF } from '../Common/PDFGenerator';

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [activeTab, setActiveTab] = useState('my-subjects');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // ... (keep all existing functions: loadStudentData, loadStudentSubjects, fetchStudentResults, getStudentClassLevel, getLetterGrade, getPoints, calculateStudentGrade, getPointsRemark, getGradeColor, handleLogout, handleGoBack, toggleMobileSidebar)

  const classLevel = getStudentClassLevel();
  const isUpperForm = (classLevel === 'form3' || classLevel === 'form4');

  // Add download PDF function
  const handleDownloadPDF = () => {
    if (!studentData || marks.length === 0) {
      setMessage('No results available to download');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const studentInfo = {
      name: studentData.fullName,
      admissionNumber: studentData.admissionNumber,
      class: studentData.class,
      stream: studentData.stream,
      term: selectedTerm,
      year: selectedYear
    };
    
    const formattedMarks = marks.map(mark => ({
      subjectName: mark.subjectName,
      score: mark.overallPercentage || 0,
      grade: mark.grade,
      remark: mark.remark
    }));
    
    const rankingData = ranking || {
      totalMarks: formattedMarks.reduce((sum, m) => sum + m.score, 0),
      average: formattedMarks.length > 0 ? formattedMarks.reduce((sum, m) => sum + m.score, 0) / formattedMarks.length : 0,
      position: 'N/A',
      grade: 'N/A',
      remarks: ''
    };
    
    const classLevel = getStudentClassLevel();
    generateGradePDF(studentInfo, formattedMarks, rankingData, classLevel);
    setMessage('PDF downloaded successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const menuItems = [
    { id: 'my-subjects', label: 'My Subjects' },
    { id: 'results', label: 'My Results' },
    { id: 'timetable', label: 'Timetable' },
    { id: 'contacts', label: 'Contacts' },
  ];

  if (isUpperForm) {
    menuItems.push({ id: 'subject-selection', label: 'Select Subjects' });
  }

  // Update the renderResults function to include Download PDF button
  const renderResults = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      );
    }

    return (
      <div>
        {/* ... existing results UI ... */}
        
        {/* Add Download PDF button in the header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">My Results</h2>
          <button
            onClick={handleDownloadPDF}
            disabled={marks.length === 0}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
          >
            Download PDF
          </button>
        </div>
        
        {/* ... rest of the results content ... */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ... existing header and sidebar ... */}
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* ... existing navbar ... */}
        
        <div className="flex-1 p-4 lg:p-6 mt-16 lg:mt-16">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 lg:p-6">
              {activeTab === 'my-subjects' && renderMySubjects()}
              {activeTab === 'results' && renderResults()}
              {activeTab === 'timetable' && <Timetable role="Student" userId={user?.id} classId={studentData?.classId} />}
              {activeTab === 'contacts' && <ContactInfo role="Student" />}
              {activeTab === 'subject-selection' && isUpperForm && (
                <SubjectSelection studentData={studentData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;