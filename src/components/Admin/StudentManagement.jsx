import React, { useState } from 'react';
import StudentRegistration from './StudentRegistration';
import StudentList from './StudentList';

function StudentManagement() {
    const [activeTab, setActiveTab] = useState('register');
    const [refreshList, setRefreshList] = useState(false);

    const handleStudentAdded = () => {
        // Toggle refresh trigger to reload student list
        setRefreshList(prev => !prev);
        // Switch to list view after registration
        setActiveTab('list');
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Tab Navigation */}
            <div className="flex border-b mb-6 bg-white rounded-t-lg shadow-sm">
                <button
                    className={`px-6 py-3 font-semibold transition-all duration-200 ${
                        activeTab === 'register' 
                            ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('register')}
                >
                    Register Student
                </button>
                <button
                    className={`px-6 py-3 font-semibold transition-all duration-200 ${
                        activeTab === 'list' 
                            ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('list')}
                >
                    Student List
                </button>
            </div>

            {/* Content */}
            {activeTab === 'register' ? (
                <StudentRegistration onStudentAdded={handleStudentAdded} />
            ) : (
                <StudentList refreshTrigger={refreshList} />
            )}
        </div>
    );
}

export default StudentManagement;