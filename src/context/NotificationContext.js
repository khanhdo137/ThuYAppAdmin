import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    total: 0,
    appointments: 0,
    feedbacks: 0
  });
  const [loading, setLoading] = useState(true);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      // Check if user is authenticated before loading notifications
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping notification load');
        setLoading(false);
        return;
      }

      console.log('=== LOADING NOTIFICATIONS ===');
      // Clear old read feedbacks on load
      notificationService.clearOldReadFeedbacks();
      
      const data = await notificationService.getAllNotifications();
      console.log('Notification data received:', data);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Mark feedback as read
  const markFeedbackAsRead = useCallback(async (feedbackId) => {
    notificationService.markFeedbackAsRead(feedbackId);
    // Refresh notifications to update count
    await refreshNotifications();
  }, [refreshNotifications]);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []); // Empty dependency array to run only once

  // Auto-refresh every 30 seconds - DISABLED to prevent reload loop
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     loadNotifications();
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, []); // Empty dependency array to avoid recreation

  const value = {
    notifications,
    loading,
    refreshNotifications,
    markFeedbackAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

