import React, { useState, useEffect } from 'react';

function ContactInfo({ role }) {
  const [contacts, setContacts] = useState({
    headteacher: null,
    headOfDepartment: null,
    formTeacher: null,
    subjectTeachers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, [role]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      // Fetch all contact info
      const response = await fetch('https://school-yathu.onrender.com/api/Contacts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading contact information...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">📞 Contact Information</h3>
      
      <div className="space-y-3">
        {contacts.headteacher && (
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
            <div>
              <span className="font-semibold text-gray-700">Headteacher:</span>
              <span className="ml-2 text-gray-600">{contacts.headteacher.name}</span>
            </div>
            <div className="text-sm text-gray-500">
              <span>{contacts.headteacher.phone}</span>
            </div>
          </div>
        )}

        {contacts.headOfDepartment && (
          <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
            <div>
              <span className="font-semibold text-gray-700">Head of Department:</span>
              <span className="ml-2 text-gray-600">{contacts.headOfDepartment.name}</span>
            </div>
            <div className="text-sm text-gray-500">
              <span>{contacts.headOfDepartment.phone}</span>
            </div>
          </div>
        )}

        {contacts.formTeacher && (
          <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
            <div>
              <span className="font-semibold text-gray-700">Form Teacher:</span>
              <span className="ml-2 text-gray-600">{contacts.formTeacher.name}</span>
            </div>
            <div className="text-sm text-gray-500">
              <span>{contacts.formTeacher.phone}</span>
            </div>
          </div>
        )}

        {contacts.subjectTeachers && contacts.subjectTeachers.length > 0 && (
          <div className="mt-2">
            <h4 className="font-semibold text-gray-700 mb-2">Subject Teachers:</h4>
            {contacts.subjectTeachers.map((teacher, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg mb-1">
                <div>
                  <span className="text-gray-600">{teacher.subject}:</span>
                  <span className="ml-2 font-medium text-gray-800">{teacher.name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  <span>{teacher.phone}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactInfo;