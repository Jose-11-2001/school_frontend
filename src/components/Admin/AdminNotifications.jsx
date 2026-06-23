import React, { useState, useEffect } from 'react';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/notifications/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        const unread = data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } else if (response.status === 401) {
        console.error('Unauthorized - please login again');
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else {
        console.error('Failed to mark all as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
        title="Notifications"
        aria-label="Toggle notifications"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2} 
          stroke="currentColor" 
          className="w-6 h-6 text-white"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" 
          />
        </svg>
        
        {/* Loading Spinner */}
        {loading && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        )}
        
        {/* Unread Count Badge */}
        {!loading && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full border-2 border-white min-w-[20px] min-h-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-72">
            {loading ? (
              <div className="p-8 text-center">
                <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500 text-sm mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-gray-500 text-sm font-medium">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                      {notification.type && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {notification.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && !loading && (
            <div className="p-2 border-t bg-gray-50">
              <button 
                onClick={() => setShowDropdown(false)}
                className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors py-1"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click Outside Handler */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default AdminNotifications;