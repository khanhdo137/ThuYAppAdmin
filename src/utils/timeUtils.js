/**
 * Utility functions for time formatting in Vietnam timezone
 */

/**
 * Format a date string to Vietnam timezone
 * @param {string} dateString - ISO date string from API
 * @returns {string} Formatted date string in Vietnam timezone
 */
export const formatVietnamTime = (dateString) => {
  if (!dateString || dateString === null || dateString === undefined) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '';
    }
    
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting Vietnam time:', error);
    return '';
  }
};

/**
 * Format a date string to Vietnam timezone for display in chat messages
 * @param {string} dateString - ISO date string from API
 * @returns {string} Formatted time string (HH:mm DD/MM/YYYY)
 */
export const formatVietnamChatTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting Vietnam chat time:', error);
    return dateString;
  }
};

/**
 * Format a date string to Vietnam timezone for display in tables
 * @param {string} dateString - ISO date string from API
 * @returns {string} Formatted date string (DD/MM/YYYY HH:mm)
 */
export const formatVietnamTableTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting Vietnam table time:', error);
    return dateString;
  }
};

/**
 * Get current Vietnam time
 * @returns {Date} Current date in Vietnam timezone
 */
export const getCurrentVietnamTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
};

/**
 * Format relative time (e.g., "2 phút trước", "1 giờ trước")
 * @param {string} dateString - ISO date string from API
 * @returns {string} Relative time string in Vietnamese
 */
export const formatRelativeVietnamTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = getCurrentVietnamTime();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }
  } catch (error) {
    console.error('Error formatting relative Vietnam time:', error);
    return dateString;
  }
};

/**
 * Format date for display in chat room list
 * @param {string} dateString - ISO date string from API
 * @returns {string} Formatted date string for chat room list
 */
export const formatChatRoomTime = (dateString) => {
  if (!dateString || dateString === null || dateString === undefined) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string for chat room time:', dateString);
      return '';
    }
    
    const now = getCurrentVietnamTime();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Same day - show time only
      return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInDays === 1) {
      // Yesterday
      return 'Hôm qua ' + date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInDays < 7) {
      // This week - show day and time
      return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // Older - show full date
      return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting chat room time:', error);
    return '';
  }
};
