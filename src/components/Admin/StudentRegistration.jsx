import React, { useState, useEffect } from 'react';

function StudentRegistration({ onStudentAdded }) {
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
    const [availableSubjects, setAvailableSubjects] = useState({ 
        coreSubjects: [], 
        humanitiesSubjects: [], 
        scienceSubjects: [] 
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [registeredStudents, setRegisteredStudents] = useState([]);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoadingData(true);
        await loadClasses();
        await loadRegisteredStudents();
        setLoadingData(false);
    };

    // Update streams when form class changes
    useEffect(() => {
        if (formData.class) {
            const availableStreams = classes
                .filter(c => c.Name === formData.class)
                .map(c => c.Stream)
                .filter(s => s);
            setStreams([...new Set(availableStreams)]);
            setFormData(prev => ({ ...prev, stream: '' }));
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
            
            if (!token) {
                console.error('No token found');
                return;
            }

            let data = [];
            let response;
            
            // Try primary endpoint
            response = await fetch('https://school-yathu.onrender.com/api/admin/classes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                data = await response.json();
                console.log('Classes loaded from /api/admin/classes:', data);
            } else {
                // Try alternative endpoint
                response = await fetch('https://school-yathu.onrender.com/api/AdminSubjectAllocation/classes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    data = await response.json();
                    console.log('Classes loaded from /api/AdminSubjectAllocation/classes:', data);
                }
            }
            
            // If no classes found from API, extract from registered students
            if (data.length === 0 && registeredStudents.length > 0) {
                console.log('No classes from API, extracting from students...');
                const studentClasses = registeredStudents
                    .map(s => s.class)
                    .filter(Boolean);
                const uniqueClasses = [...new Set(studentClasses)];
                
                const classMap = {};
                registeredStudents.forEach(s => {
                    if (s.class && s.stream) {
                        if (!classMap[s.class]) {
                            classMap[s.class] = [];
                        }
                        if (!classMap[s.class].includes(s.stream)) {
                            classMap[s.class].push(s.stream);
                        }
                    }
                });
                
                data = uniqueClasses.map((name, index) => ({
                    id: index + 1,
                    name: name,
                    stream: classMap[name]?.[0] || ''
                }));
                
                console.log('Classes extracted from students:', data);
            }
            
            const normalizedData = data.map(item => ({
                Name: item.name || item.Name || item.className || '',
                Stream: item.stream || item.Stream || '',
                id: item.id || Math.random()
            })).filter(c => c.Name);
            
            setClasses(normalizedData);
            
            if (normalizedData.length === 0) {
                setMessage('No classes found. Please add classes in Class Management first.');
                setMessageType('warning');
                setTimeout(() => setMessage(''), 5000);
            }
            
        } catch (error) {
            console.error('Error loading classes:', error);
            
            if (registeredStudents.length > 0) {
                const studentClasses = registeredStudents
                    .map(s => s.class)
                    .filter(Boolean);
                const uniqueClasses = [...new Set(studentClasses)];
                
                const classMap = {};
                registeredStudents.forEach(s => {
                    if (s.class && s.stream) {
                        if (!classMap[s.class]) {
                            classMap[s.class] = [];
                        }
                        if (!classMap[s.class].includes(s.stream)) {
                            classMap[s.class].push(s.stream);
                        }
                    }
                });
                
                const data = uniqueClasses.map((name, index) => ({
                    Name: name,
                    Stream: classMap[name]?.[0] || '',
                    id: index + 1
                }));
                
                setClasses(data);
            } else {
                setMessage('Error loading classes. Please add classes in Class Management.');
                setMessageType('error');
                setTimeout(() => setMessage(''), 5000);
            }
        }
    };

    const loadRegisteredStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://school-yathu.onrender.com/api/StudentRegistration/registered-students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setRegisteredStudents(data);
            } else {
                console.error('Failed to load registered students');
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    };

    const loadAvailableSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `https://school-yathu.onrender.com/api/StudentRegistration/available-subjects/${encodeURIComponent(formData.class)}/${encodeURIComponent(formData.stream)}${formData.root ? `?root=${encodeURIComponent(formData.root)}` : ''}`;
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

    const generateRandomPassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        let password = "";
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const generateEmail = (name) => {
        const cleanName = name.toLowerCase().replace(/\s/g, '');
        return `${cleanName}@gmail.com`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        if (!formData.admissionNumber || !formData.fullName) {
            setMessage('Admission Number and Full Name are required');
            setMessageType('error');
            setLoading(false);
            return;
        }
        
        const password = generateRandomPassword();
        const email = generateEmail(formData.fullName);
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setMessage('Please login first');
                setMessageType('error');
                setLoading(false);
                return;
            }

            // Step 1: Create the student
            const studentResponse = await fetch('https://school-yathu.onrender.com/api/Student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    admissionNumber: formData.admissionNumber,
                    fullName: formData.fullName,
                    class: formData.class || '',
                    stream: formData.stream || ''
                })
            });
            
            const studentData = await studentResponse.json();
            
            if (!studentResponse.ok) {
                setMessage(`${studentData.message || 'Error adding student'}`);
                setMessageType('error');
                setLoading(false);
                return;
            }
            
            // Step 2: Create user account for the student
            const userResponse = await fetch('https://school-yathu.onrender.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: email,
                    name: formData.fullName,
                    password: password,
                    role: 'Student'
                })
            });
            
            const userData = await userResponse.json();
            
            if (userResponse.ok) {
                setMessage(
                    `Student "${formData.fullName}" added successfully!\n\n` +
                    `Login Email: ${email}\n` +
                    `Temporary Password: ${password}\n\n` +
                    `Student must change password on first login.`
                );
                setMessageType('success');
                setFormData({
                    admissionNumber: '',
                    fullName: '',
                    class: '',
                    stream: '',
                    root: '',
                    selectedSubjectIds: []
                });
                // Notify parent component
                if (onStudentAdded) {
                    onStudentAdded();
                }
                // Refresh classes after adding student
                await loadClasses();
            } else {
                setMessage(`Student added but user account creation failed: ${userData.message}`);
                setMessageType('warning');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage(`${error.message || 'Network error'}`);
            setMessageType('error');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleClear = () => {
        setFormData({
            admissionNumber: '',
            fullName: '',
            class: '',
            stream: '',
            root: '',
            selectedSubjectIds: []
        });
        setMessage('');
        setMessageType('');
    };

    const isUpperForm = () => {
        return formData.class && (formData.class.includes('Form 3') || formData.class.includes('Form 4') ||
                                  formData.class.includes('Form3') || formData.class.includes('Form4'));
    };

    const uniqueClasses = [...new Set(classes.map(c => c.Name).filter(Boolean))];

    if (loadingData) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-2xl font-bold text-white">Student Registration</h2>
                <p className="text-blue-100 text-sm mt-1">Register new students and automatically create their accounts</p>
            </div>
            
            <div className="p-6">
                {message && (
                    <div className={`p-4 rounded-lg mb-4 whitespace-pre-line border ${
                        messageType === 'success' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : messageType === 'warning'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {message}
                    </div>
                )}

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
                            {uniqueClasses.length === 0 ? (
                                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                    <p className="text-xs text-yellow-700">
                                        ⚠️ No classes found. 
                                        <button 
                                            onClick={() => window.location.href = '/admin-dashboard?tab=classes'}
                                            className="ml-1 text-blue-600 hover:underline font-medium"
                                        >
                                            Add classes in Class Management
                                        </button>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 mt-1">
                                    {uniqueClasses.length} class(es) available
                                </p>
                            )}
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
                                disabled={!formData.class || streams.length === 0}
                            >
                                <option value="">Select Stream</option>
                                {streams.map(stream => (
                                    <option key={stream} value={stream}>{stream}</option>
                                ))}
                            </select>
                            {!formData.class && (
                                <p className="text-xs text-yellow-600 mt-1">Please select a class first</p>
                            )}
                            {formData.class && streams.length === 0 && (
                                <p className="text-xs text-yellow-600 mt-1">No streams available for this class</p>
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
                                    <span className="text-lg">📚</span>
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
                                    <span className="text-lg">🔬</span>
                                    <span className="ml-2">Sciences (Physics, Chemistry, Biology)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Subjects Display */}
                    {formData.class && formData.stream && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-bold text-lg mb-3 text-gray-800">Subjects Allocation</h3>
                            
                            {availableSubjects.coreSubjects?.length === 0 && 
                             availableSubjects.humanitiesSubjects?.length === 0 && 
                             availableSubjects.scienceSubjects?.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                    <p>No subjects available for this class.</p>
                                    <p className="text-sm text-gray-400 mt-1">Please add subjects in Manage Subjects.</p>
                                </div>
                            ) : (
                                <>
                                    {availableSubjects.coreSubjects?.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-green-700 mb-2">Core Subjects (Compulsory)</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {availableSubjects.coreSubjects.map((subject, index) => (
                                                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {formData.root === 'Humanities' && availableSubjects.humanitiesSubjects?.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-blue-700 mb-2">Humanities Subjects</h4>
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
                                            <h4 className="font-semibold text-purple-700 mb-2">Science Subjects</h4>
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
                                            ℹ️ Note: Form 1 & Form 2 students take all subjects. No specialization needed.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading || uniqueClasses.length === 0}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 font-semibold transition-all duration-200 shadow-md"
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
                        <button
                            type="button"
                            onClick={handleClear}
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                    
                    {uniqueClasses.length === 0 && (
                        <div className="text-center text-sm text-red-500 mt-2">
                            ⚠️ Cannot register student. Please add classes first.
                        </div>
                    )}

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Info</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Student will receive auto-generated email and password</li>
                            <li>• Password: 10 characters with special characters</li>
                            <li>• Student must change password on first login</li>
                            <li>• Student will appear in the "Student List" after creation</li>
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StudentRegistration;