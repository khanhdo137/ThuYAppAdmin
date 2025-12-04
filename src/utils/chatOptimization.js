/**
 * Chat Optimization Utilities
 * Prevents unnecessary re-renders and improves performance
 */

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function calls to once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Check if two message arrays are different
 * @param {Array} oldMessages - Previous messages array
 * @param {Array} newMessages - New messages array
 * @returns {boolean} True if different
 */
export const messagesChanged = (oldMessages, newMessages) => {
  if (!oldMessages || !newMessages) return true;
  if (oldMessages.length !== newMessages.length) return true;
  
  // Check if any message content changed
  for (let i = 0; i < oldMessages.length; i++) {
    if (oldMessages[i].messageId !== newMessages[i].messageId ||
        oldMessages[i].messageContent !== newMessages[i].messageContent ||
        oldMessages[i].createdAt !== newMessages[i].createdAt) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if two chat room arrays are different
 * @param {Array} oldRooms - Previous rooms array
 * @param {Array} newRooms - New rooms array
 * @returns {boolean} True if different
 */
export const roomsChanged = (oldRooms, newRooms) => {
  if (!oldRooms || !newRooms) return true;
  if (oldRooms.length !== newRooms.length) return true;
  
  // Check if any room data changed
  for (let i = 0; i < oldRooms.length; i++) {
    const oldRoom = oldRooms[i];
    const newRoom = newRooms[i];
    
    if (oldRoom.roomId !== newRoom.roomId ||
        oldRoom.lastMessage !== newRoom.lastMessage ||
        oldRoom.lastMessageAt !== newRoom.lastMessageAt ||
        oldRoom.unreadCount !== newRoom.unreadCount ||
        oldRoom.status !== newRoom.status) {
      return true;
    }
  }
  
  return false;
};

/**
 * Smart scroll function - only scroll if user is near bottom
 * @param {HTMLElement} container - Scroll container element
 * @param {HTMLElement} target - Target element to scroll to
 * @param {number} threshold - Distance threshold in pixels
 */
export const smartScroll = (container, target, threshold = 100) => {
  if (!container || !target) return;
  
  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  
  if (isNearBottom) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Create a stable callback that won't cause unnecessary re-renders
 * @param {Function} callback - Original callback function
 * @param {Array} deps - Dependencies array
 * @returns {Function} Stable callback
 */
export const createStableCallback = (callback, deps = []) => {
  const ref = { current: callback };
  ref.current = callback;
  
  return (...args) => ref.current(...args);
};

/**
 * Optimize message updates to prevent flickering
 * @param {Array} currentMessages - Current messages
 * @param {Array} newMessages - New messages
 * @returns {Array} Optimized messages array
 */
export const optimizeMessageUpdates = (currentMessages, newMessages) => {
  if (!newMessages || newMessages.length === 0) return currentMessages;
  
  // If no current messages, return new messages
  if (!currentMessages || currentMessages.length === 0) return newMessages;
  
  // If messages haven't changed, return current messages
  if (!messagesChanged(currentMessages, newMessages)) {
    return currentMessages;
  }
  
  return newMessages;
};

/**
 * Optimize room updates to prevent flickering
 * @param {Array} currentRooms - Current rooms
 * @param {Array} newRooms - New rooms
 * @returns {Array} Optimized rooms array
 */
export const optimizeRoomUpdates = (currentRooms, newRooms) => {
  if (!newRooms || newRooms.length === 0) return currentRooms;
  
  // If no current rooms, return new rooms
  if (!currentRooms || currentRooms.length === 0) return newRooms;
  
  // If rooms haven't changed, return current rooms
  if (!roomsChanged(currentRooms, newRooms)) {
    return currentRooms;
  }
  
  return newRooms;
};
