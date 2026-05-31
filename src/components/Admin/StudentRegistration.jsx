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

    useEffect(() => {
        if (formData.class && formData.stream) {
            loadAvailableSubjects();
        }
    }, [formData.class, formData.stream, formData.root]);

    const loadClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5123/api/AdminSubjectAllocation/classes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setClasses(data);
            // Extract unique class names and streams
            const uniqueClasses = [...new Set(data.map(c => c.Name))];
            const uniqueStreams = [...new Set(data.map(c => c.Stream))];
            setStreams(uniqueStreams.filter(s => s));
        } catch (error) {
            console.error('Error loading classes:', error);
        }
    };

    const loadAvailableSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:5123/api/StudentRegistration/available-subjects/${formData.class}/${formData.stream}${formData.root ? `?root=${formData.root}` : ''}`;
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
            let url = 'http://localhost:5123/api/StudentRegistration/registered-students';
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
            const response = await fetch('http://localhost:5123/api/StudentRegistration/register', {
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

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Student Registration</h2>

            {message && (
                <div className={`p-3 rounded mb-4 ${message.includes('') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b mb-6">
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === 'register' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('register')}
                >
                    Register New Student
                </button>
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === 'list' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
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
                            <label className="block text-gray-700 mb-2 font-semibold">Admission Number *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.admissionNumber}
                                onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
                                placeholder="e.g., 2024001"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-semibold">Full Name *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                placeholder="e.g., John Doe"
                            />
                        </div>
                    </div>

                    {/* Class and Stream Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2 font-semibold">Class *</label>
                            <select
                                required
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.class}
                                onChange={(e) => setFormData({...formData, class: e.target.value, root: '', selectedSubjectIds: []})}
                            >
                                <option value="">Select Class</option>
                                <option value="Form 1">Form 1</option>
                                <option value="Form 2">Form 2</option>
                                <option value="Form 3">Form 3</option>
                                <option value="Form 4">Form 4</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-semibold">Stream *</label>
                            <select
                                required
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.stream}
                                onChange={(e) => setFormData({...formData, stream: e.target.value})}
                            >
                                <option value="">Select Stream</option>
                                {streams.map(stream => (
                                    <option key={stream} value={stream}>{stream}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Root Selection (Only for Form 3 & 4) */}
                    {isUpperForm() && (
                        <div>
                            <label className="block text-gray-700 mb-2 font-semibold">Root/Specialization *</label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="Humanities"
                                        checked={formData.root === 'Humanities'}
                                        onChange={(e) => setFormData({...formData, root: e.target.value, selectedSubjectIds: []})}
                                        className="mr-2"
                                    />
                                    🏛️ Humanities (History, Geography, Social Studies)
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="Sciences"
                                        checked={formData.root === 'Sciences'}
                                        onChange={(e) => setFormData({...formData, root: e.target.value, selectedSubjectIds: []})}
                                        className="mr-2"
                                    />
                                    🔬 Sciences (Physics, Chemistry, Biology)
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Subjects Display */}
                    {formData.class && formData.stream && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-bold text-lg mb-3">Subjects Allocation</h3>
                            
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
                                <div className="mt-2 text-sm text-gray-600">
                                    Note: Form 1 & Form 2 students take all subjects. No specialization needed.
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-900 disabled:bg-gray-400 font-semibold"
                    >
                        {loading ? 'Registering...' : 'Register Student & Create Account'}
                    </button>
                </form>
            )}

            {/* Student List */}
            {activeTab === 'list' && (
                <div>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-gray-700 mb-2">Filter by Class</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg"
                                value={filterClass}
                                onChange={(e) => { setFilterClass(e.target.value); loadRegisteredStudents(); }}
                            >
                                <option value="">All Classes</option>
                                <option value="Form 1">Form 1</option>
                                <option value="Form 2">Form 2</option>
                                <option value="Form 3">Form 3</option>
                                <option value="Form 4">Form 4</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Filter by Stream</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg"
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
                        <table className="min-w-full bg-white border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border text-left">Admission No</th>
                                    <th className="px-4 py-2 border text-left">Student Name</th>
                                    <th className="px-4 py-2 border text-left">Class</th>
                                    <th className="px-4 py-2 border text-left">Stream</th>
                                    <th className="px-4 py-2 border text-left">Subjects</th>
                                    <th className="px-4 py-2 border text-left">Registered On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registeredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{student.admissionNumber}</td>
                                        <td className="px-4 py-2 border font-medium">{student.fullName}</td>
                                        <td className="px-4 py-2 border">{student.class}</td>
                                        <td className="px-4 py-2 border">{student.stream}</td>
                                        <td className="px-4 py-2 border">{student.subjectsCount} subjects</td>
                                        <td className="px-4 py-2 border">{new Date(student.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {registeredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-gray-500">
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
    );
}

export default StudentRegistration;