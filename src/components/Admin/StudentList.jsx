import React, { useState, useEffect } from 'react';

function StudentList({ refreshTrigger }) {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterStream, setFilterStream] = useState('');
    const [availableFilterStreams, setAvailableFilterStreams] = useState([]);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        loadStudents();
        loadClasses();
    }, [refreshTrigger]);

    // Update filter streams when filter class changes
    useEffect(() => {
        if (filterClass) {
            const availableStreams = classes
                .filter(c => c.Name === filterClass)
                .map(c => c.Stream)
                .filter(s => s);
            setAvailableFilterStreams([...new Set(availableStreams)]);
            setFilterStream('');
        } else {
            setAvailableFilterStreams([]);
            setFilterStream('');
        }
    }, [filterClass, classes]);

    // Apply filters whenever students, search term, or filters change
    useEffect(() => {
        applyFilters();
    }, [students, searchTerm, filterClass, filterStream]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://school-yathu.onrender.com/api/StudentRegistration/registered-students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            } else {
                console.error('Failed to load students');
            }
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://school-yathu.onrender.com/api/admin/classes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const normalizedData = data.map(item => ({
                    Name: item.name || item.Name || item.className || '',
                    Stream: item.stream || item.Stream || '',
                    id: item.id || Math.random()
                })).filter(c => c.Name);
                setClasses(normalizedData);
            }
        } catch (error) {
            console.error('Error loading classes:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...students];

        // Search filter - search in admission number and full name
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(student => 
                student.admissionNumber?.toLowerCase().includes(search) ||
                student.fullName?.toLowerCase().includes(search)
            );
        }

        // Class filter
        if (filterClass) {
            filtered = filtered.filter(student => student.class === filterClass);
        }

        // Stream filter
        if (filterStream) {
            filtered = filtered.filter(student => student.stream === filterStream);
        }

        setFilteredStudents(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const uniqueClasses = [...new Set(classes.map(c => c.Name).filter(Boolean))];

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const clearFilters = () => {
        setSearchTerm('');
        setFilterClass('');
        setFilterStream('');
        setAvailableFilterStreams([]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Student List</h2>
                        <p className="text-blue-100 text-sm mt-1">
                            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                            {students.length > 0 && ` (${students.length} total)`}
                        </p>
                    </div>
                    <button
                        onClick={loadStudents}
                        className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>
            
            <div className="p-6">
                {/* Filters */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search by name or admission number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Filter by Class
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                            >
                                <option value="">All Classes</option>
                                {uniqueClasses.map(className => (
                                    <option key={className} value={className}>{className}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Filter by Stream
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filterStream}
                                onChange={(e) => setFilterStream(e.target.value)}
                                disabled={!filterClass}
                            >
                                <option value="">All Streams</option>
                                {availableFilterStreams.map(stream => (
                                    <option key={stream} value={stream}>{stream}</option>
                                ))}
                            </select>
                            {!filterClass && (
                                <p className="text-xs text-yellow-600 mt-1">Select a class first</p>
                            )}
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={clearFilters}
                                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4"></div>
                            <p className="text-gray-500 text-lg">No students found</p>
                            {searchTerm || filterClass || filterStream ? (
                                <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
                            ) : (
                                <p className="text-sm text-gray-400 mt-2">No students registered yet</p>
                            )}
                            {(searchTerm || filterClass || filterStream) && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <table className="min-w-full bg-white border rounded-lg">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                                        <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Registered On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((student, index) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2 border text-sm text-gray-500">
                                                {indexOfFirstItem + index + 1}
                                            </td>
                                            <td className="px-4 py-2 border text-sm font-mono text-gray-600">
                                                {student.admissionNumber || 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 border text-sm font-medium text-gray-900">
                                                {student.fullName}
                                            </td>
                                            <td className="px-4 py-2 border text-sm">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                    {student.class || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border text-sm">
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                                    {student.stream || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border text-sm text-gray-600">
                                                {student.subjectsCount || 0} subjects
                                            </td>
                                            <td className="px-4 py-2 border text-sm text-gray-500">
                                                {formatDate(student.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} students
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => paginate(index + 1)}
                                                className={`px-3 py-1 border rounded-lg transition-colors ${
                                                    currentPage === index + 1
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentList;