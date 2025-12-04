import apiService from './apiService';

class NotificationService {
  // Keys for localStorage
  READ_FEEDBACKS_KEY = 'readFeedbacks';
  
  // Get today's start and end timestamps
  getTodayRange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      start: today,
      end: tomorrow
    };
  }

  // Check if date is today
  isToday(date) {
    const dateObj = new Date(date);
    const today = new Date();
    
    // Set both to start of day for comparison
    dateObj.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return dateObj.getTime() === today.getTime();
  }

  // Get unconfirmed appointments for today
  async getUnconfirmedAppointmentsCount() {
    try {
      const response = await apiService.get('/appointment/admin');
      const appointments = Array.isArray(response) ? response : response.appointments || [];
      
      console.log('=== NOTIFICATION DEBUG ===');
      console.log('Total appointments:', appointments.length);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      console.log('Current date:', today.toLocaleDateString('vi-VN'));
      console.log('Current time:', new Date().toLocaleTimeString('vi-VN'));
      
      const unconfirmedAppointments = appointments.filter(apt => {
        // Status 0 = Pending/Chờ xác nhận
        const status = apt.status !== undefined ? apt.status : apt.Status;
        const appointmentDateStr = apt.appointmentDate || apt.AppointmentDate;
        
        if (!appointmentDateStr) {
          console.log('Appointment without date:', apt);
          return false;
        }
        
        const appointmentDate = new Date(appointmentDateStr);
        appointmentDate.setHours(0, 0, 0, 0);
        
        const isStatusZero = status === 0 || status === '0';
        const isToday = appointmentDate.getTime() === today.getTime();
        
        // Debug log for ALL appointments with status 0
        if (isStatusZero) {
          console.log('Pending appointment found:', {
            id: apt.appointmentId || apt.AppointmentId,
            status: status,
            appointmentDate: appointmentDateStr,
            parsedDate: appointmentDate.toLocaleDateString('vi-VN'),
            today: today.toLocaleDateString('vi-VN'),
            isToday: isToday,
            timeDiff: appointmentDate.getTime() - today.getTime()
          });
        }
        
        return isStatusZero && isToday;
      });
      
      console.log('Unconfirmed appointments today:', unconfirmedAppointments.length);
      console.log('IDs:', unconfirmedAppointments.map(a => a.appointmentId || a.AppointmentId));
      console.log('=== END DEBUG ===');
      
      return unconfirmedAppointments.length;
    } catch (error) {
      console.error('Error getting unconfirmed appointments count:', error);
      // Don't throw error, just return 0 to prevent infinite loop
      return 0;
    }
  }

  // Get unread feedbacks count for today
  async getUnreadFeedbacksCount() {
    try {
      const response = await apiService.get('/feedback/admin?page=1&limit=1000');
      const feedbacks = response.feedbacks || [];
      
      console.log('=== FEEDBACK DEBUG ===');
      console.log('Total feedbacks:', feedbacks.length);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      console.log('Today:', today.toLocaleDateString('vi-VN'));
      
      // Get read feedback IDs from localStorage
      const readFeedbackIds = this.getReadFeedbackIds();
      console.log('Read feedback IDs:', readFeedbackIds);
      
      // Count feedbacks from today that haven't been read
      const count = feedbacks.filter(feedback => {
        const feedbackId = feedback.feedbackId || feedback.FeedbackId;
        const createdAt = feedback.createdAt || feedback.CreatedAt;
        
        console.log('Feedback:', {
          id: feedbackId,
          createdAt: createdAt,
          isToday: this.isToday(createdAt),
          isRead: readFeedbackIds.includes(feedbackId)
        });
        
        return this.isToday(createdAt) && !readFeedbackIds.includes(feedbackId);
      }).length;
      
      console.log('Unread feedbacks today:', count);
      console.log('=== END FEEDBACK DEBUG ===');
      return count;
    } catch (error) {
      console.error('Error getting unread feedbacks count:', error);
      // Don't throw error, just return 0 to prevent infinite loop
      return 0;
    }
  }

  // Get total notification count
  async getTotalNotificationCount() {
    try {
      const [appointmentsCount, feedbacksCount] = await Promise.all([
        this.getUnconfirmedAppointmentsCount(),
        this.getUnreadFeedbacksCount()
      ]);
      
      return appointmentsCount + feedbacksCount;
    } catch (error) {
      console.error('Error getting total notification count:', error);
      return 0;
    }
  }

  // Get all notification details
  async getAllNotifications() {
    try {
      const [appointmentsCount, feedbacksCount] = await Promise.all([
        this.getUnconfirmedAppointmentsCount(),
        this.getUnreadFeedbacksCount()
      ]);
      
      return {
        total: appointmentsCount + feedbacksCount,
        appointments: appointmentsCount,
        feedbacks: feedbacksCount
      };
    } catch (error) {
      console.error('Error getting all notifications:', error);
      return {
        total: 0,
        appointments: 0,
        feedbacks: 0
      };
    }
  }

  // Mark feedback as read
  markFeedbackAsRead(feedbackId) {
    try {
      const readFeedbackIds = this.getReadFeedbackIds();
      
      if (!readFeedbackIds.includes(feedbackId)) {
        readFeedbackIds.push(feedbackId);
        localStorage.setItem(this.READ_FEEDBACKS_KEY, JSON.stringify(readFeedbackIds));
        console.log('Marked feedback as read:', feedbackId);
      }
    } catch (error) {
      console.error('Error marking feedback as read:', error);
    }
  }

  // Get read feedback IDs from localStorage
  getReadFeedbackIds() {
    try {
      const stored = localStorage.getItem(this.READ_FEEDBACKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading stored feedback IDs:', error);
      return [];
    }
  }

  // Clear read feedbacks (for testing or daily reset)
  clearReadFeedbacks() {
    try {
      localStorage.removeItem(this.READ_FEEDBACKS_KEY);
      console.log('Cleared read feedbacks');
    } catch (error) {
      console.error('Error clearing read feedbacks:', error);
    }
  }

  // Clear old read feedbacks (keep only today's)
  clearOldReadFeedbacks() {
    try {
      // This could be enhanced to only keep feedback IDs from today
      // For now, we'll just clear all to reset daily
      const now = new Date();
      const lastClearDate = localStorage.getItem('lastFeedbackClearDate');
      
      if (!lastClearDate || !this.isToday(lastClearDate)) {
        this.clearReadFeedbacks();
        localStorage.setItem('lastFeedbackClearDate', now.toISOString());
        console.log('Cleared old read feedbacks');
      }
    } catch (error) {
      console.error('Error clearing old read feedbacks:', error);
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;

