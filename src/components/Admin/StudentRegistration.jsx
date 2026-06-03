import React, { useState, useEffect } from 'react';

function StudentRegistration() {
    const [formData, setFormData] = useState({
        admissionNumber: '',
        fullName: '',
        class: '',
        stream: '',
        root: '',
        selectedSubjectIds: []
    });
    
    const [classes, setClasses] = useState([]);
    const [streams, setStreams] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState({ coreSubjects: [], humanitiesSubjects: [], scienceSubjects: [] });
    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('register');
    const [filterClass, setFilterClass] = useState('');
    const [filterStream, setFilterStream] = useState('');

    useEffect(() => {
        loadClasses();
        loadRegisteredStudents();
    }, []);

    // Update streams when class changes
    useEffect(() => {
        if (formData.class) {
            // Find all streams for the selected class
            const availableStreams = classes
                .filter(c => c.Name === formData.class)
                .map(c => c.Stream)
                .filter(s => s);
            setStreams([...new Set(availableStreams)]); // Remove duplicates
            setFormData(prev => ({ ...prev, stream: '' })); // Reset stream when class changes
        } else {
            setStreams([]);
        }
    }, [formData.class, classes]);

    useEffect(() => {
        if (formData.class && formData.stream) {
            loadAvailableSubjects();
        }
    }, [formData.class, formData.stream, formData.root]);

    const loadClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://school-yathu.onrender.com/api/AdminSubjectAllocation/classes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setClasses(data);
        } catch (error) {
            console.error('Error loading classes:', error);
        }
    };

    const loadAvailableSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `https://school-yathu.onrender.com/api/StudentRegistration/available-subjects/${formData.class}/${formData.stream}${formData.root ? `?root=${formData.root}` : ''}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setAvailableSubjects({
                coreSubjects: data.coreSubjects || [],
                humanitiesSubjects: data.humanitiesSubjects || [],
                scienceSubjects: data.scienceSubjects || []
            });
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    };

    const loadRegisteredStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = 'https://school-yathu.onrender.com/api/StudentRegistration/registered-students';
            if (filterClass) url += `?className=${filterClass}`;
            if (filterStream) url += `${filterClass ? '&' : '?'}stream=${filterStream}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setRegisteredStudents(data);
        } catch (error) {
            console.error('Error loading students:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://school-yathu.onrender.com/api/StudentRegistration/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage(` ${data.message}`);
                setFormData({
                    admissionNumber: '',
                    fullName: '',
                    class: '',
                    stream: '',
                    root: '',
                    selectedSubjectIds: []
                });
                loadRegisteredStudents();
                setActiveTab('list');
            } else {
                setMessage(`❌ ${data.message}`);
            }
        } catch (error) {
            setMessage('❌ Error registering student');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const isUpperForm = () => {
        return formData.class && (formData.class.includes('Form 3') || formData.class.includes('Form 4') ||
                                  formData.class.includes('Form3') || formData.class.includes('Form4'));
    };

    // Get unique class names for dropdown
    const uniqueClasses = [...new Set(classes.map(c => c.Name))];

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-2xl font-bold text-white">Student Registration</h2>
                <p className="text-blue-100 text-sm mt-1">Register new students and automatically create their accounts</p>
            </div>
            
            <div className="p-6">
                {message && (
                    <div className={`p-3 rounded-lg mb-4 ${
                        message.includes('✅') 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex border-b mb-6">
                    <button
                        className={`px-4 py-2 font-semibold transition-all duration-200 ${
                            activeTab === 'register' 
                                ? 'border-b-2 border-blue-600 text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('register')}
                    >
                        Register New Student
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold transition-all duration-200 ${
                            activeTab === 'list' 
                                ? 'border-b-2 border-blue-600 text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => { setActiveTab('list'); loadRegisteredStudents(); }}
                    >
                         View All Students
                    </button>
                </div>

                {/* Registration Form */}
                {activeTab === 'register' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-semibold">
                                    Admission Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.admissionNumber}
                                    onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
                                    placeholder="e.g., 2024001"
                                />
                                <p className="text-xs text-gray-400 mt-1">Unique identifier for the student</p>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-semibold">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    placeholder="e.g., John Doe"
                                />
                            </div>
                        </div>

                        {/* Class and Stream Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-semibold">
                                    Class <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.class}
                                    onChange={(e) => setFormData({...formData, class: e.target.value, root: '', selectedSubjectIds: []})}
                                >
                                    <option value="">Select Class</option>
                                    {uniqueClasses.map(className => (
                                        <option key={className} value={className}>{className}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-semibold">
                                    Stream <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.stream}
                                    onChange={(e) => setFormData({...formData, stream: e.target.value})}
                                    disabled={!formData.class}
                                >
                                    <option value="">Select Stream</option>
                                    {streams.map(stream => (
                                        <option key={stream} value={stream}>{stream}</option>
                                    ))}
                                </select>
                                {!formData.class && (
                                    <p className="text-xs text-yellow-600 mt-1"> Please select a class first</p>
                                )}
                            </div>
                        </div>

                        {/* Root Selection (Only for Form 3 & 4) */}
                        {isUpperForm() && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-gray-700 mb-3 font-semibold">Root/Specialization <span className="text-red-500">*</span></label>
                                <div className="flex gap-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            value="Humanities"
                                            checked={formData.root === 'Humanities'}
                                            onChange={(e) => setFormData({...formData, root: e.target.value, selectedSubjectIds: []})}
                                            className="mr-2 w-4 h-4"
                                        />
                                        <span className="text-lg"></span>
                                        <span className="ml-2">Humanities (History, Geography, Social Studies)</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            value="Sciences"
                                            checked={formData.root === 'Sciences'}
                                            onChange={(e) => setFormData({...formData, root: e.target.value, selectedSubjectIds: []})}
                                            className="mr-2 w-4 h-4"
                                        />
                                        <span className="text-lg"></span>
                                        <span className="ml-2">Sciences (Physics, Chemistry, Biology)</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Subjects Display */}
                        {formData.class && formData.stream && (
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <h3 className="font-bold text-lg mb-3 text-gray-800"> Subjects Allocation</h3>
                                
                                {/* Core Subjects */}
                                {availableSubjects.coreSubjects?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-green-700 mb-2">✓ Core Subjects (Compulsory)</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSubjects.coreSubjects.map((subject, index) => (
                                                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Subjects based on root selection */}
                                {formData.root === 'Humanities' && availableSubjects.humanitiesSubjects?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-blue-700 mb-2"> Humanities Subjects</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSubjects.humanitiesSubjects.map((subject, index) => (
                                                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.root === 'Sciences' && availableSubjects.scienceSubjects?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-purple-700 mb-2"> Science Subjects</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSubjects.scienceSubjects.map((subject, index) => (
                                                <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!isUpperForm() && availableSubjects.coreSubjects?.length > 0 && (
                                    <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                                         Note: Form 1 & Form 2 students take all subjects. No specialization needed.
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 font-semibold transition-all duration-200 shadow-md"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registering Student...
                                </span>
                            ) : (
                                'Register Student & Create Account'
                            )}
                        </button>
                    </form>
                )}

                {/* Student List */}
                {activeTab === 'list' && (
                    <div>
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-gray-700 mb-2 font-semibold">Filter by Class</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filterClass}
                                    onChange={(e) => { setFilterClass(e.target.value); loadRegisteredStudents(); }}
                                >
                                    <option value="">All Classes</option>
                                    {uniqueClasses.map(className => (
                                        <option key={className} value={className}>{className}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-semibold">Filter by Stream</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filterStream}
                                    onChange={(e) => { setFilterStream(e.target.value); loadRegisteredStudents(); }}
                                >
                                    <option value="">All Streams</option>
                                    {streams.map(stream => (
                                        <option key={stream} value={stream}>{stream}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border rounded-lg">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Registered On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registeredStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2 border text-sm text-gray-600">{student.admissionNumber}</td>
                                            <td className="px-4 py-2 border text-sm font-medium text-gray-900">{student.fullName}</td>
                                            <td className="px-4 py-2 border text-sm text-gray-600">{student.class}</td>
                                            <td className="px-4 py-2 border text-sm text-gray-600">{student.stream}</td>
                                            <td className="px-4 py-2 border text-sm text-gray-600">{student.subjectsCount} subjects</td>
                                            <td className="px-4 py-2 border text-sm text-gray-500">{new Date(student.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {registeredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">
                                                <div className="text-4xl mb-2"></div>
                                                No students registered yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentRegistration;