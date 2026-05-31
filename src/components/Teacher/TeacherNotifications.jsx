import React, { useState, useEffect } from 'react';

function TeacherNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
      loadUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/TeacherMarks/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/TeacherMarks/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://school-yathu.onrender.com/api/TeacherMarks/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('https://school-yathu.onrender.com/api/TeacherMarks/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'ExamResults': return '📢';
      case 'Success': return '✅';
      case 'Warning': return '⚠️';
      case 'SubjectAllocation': return '📚';
      case 'StudentAllocation': return '👨‍🎓';
      default: return '🔔';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative bg-gray-100 p-2 rounded-full hover:bg-gray-200 focus:outline-none transition-colors"
        title="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 md:hidden" 
            onClick={() => setShowDropdown(false)}
          ></div>
          
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border z-50">
            <div className="p-3 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
              <h3 className="font-semibold text-gray-800">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">🔕</div>
                  <p className="text-gray-500">No notifications</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-all duration-150 ${
                      !notif.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 break-words">
                          {notif.message}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!notif.isRead && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-2 border-t bg-gray-50 rounded-b-lg">
                <button
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default TeacherNotifications;