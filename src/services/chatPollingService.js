/**
 * Chat Polling Service - Real-time updates for admin dashboard
 */

import { chatService } from './chatService';

class ChatPollingService {
  constructor() {
    this.pollingInterval = null;
    this.isPolling = false;
    this.pollingIntervalMs = 3000; // 3 seconds - more frequent polling for real-time updates
    this.callbacks = new Set();
    this.lastMessageCount = 0;
    this.lastRoomCount = 0;
    this.lastMessageTimestamps = new Map(); // Track last message timestamps per room
    this.lastRoomData = new Map(); // Track last room data for comparison
  }

  /**
   * Start polling for chat updates
   */
  startPolling() {
    if (this.isPolling) {
      console.log('ChatPollingService: Already polling');
      return;
    }

    console.log('ChatPollingService: Starting polling...');
    this.isPolling = true;
    
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForUpdates();
      } catch (error) {
        console.error('ChatPollingService: Polling error:', error);
      }
    }, this.pollingIntervalMs);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('ChatPollingService: Stopped polling');
  }

  /**
   * Check for updates and notify callbacks
   */
  async checkForUpdates() {
    try {
      // Get fresh data with force refresh to bypass cache
      const response = await chatService.getAdminChatRooms(1, 20, true);
      
      if (!response || !response.rooms) {
        return;
      }

      const currentRoomCount = response.rooms.length;
      const currentMessageCount = response.rooms.reduce((total, room) => {
        return total + (room.unreadCount || 0);
      }, 0);

      // Check for new messages by comparing timestamps and room data
      let hasNewMessages = false;
      let hasNewRooms = currentRoomCount > this.lastRoomCount;

      // Check each room for new messages or changes
      response.rooms.forEach(room => {
        const lastTimestamp = this.lastMessageTimestamps.get(room.roomId);
        const currentTimestamp = room.lastMessageAt;
        const lastRoomData = this.lastRoomData.get(room.roomId);
        
        // Check for new messages by timestamp comparison
        if (currentTimestamp && (!lastTimestamp || new Date(currentTimestamp) > new Date(lastTimestamp))) {
          hasNewMessages = true;
          console.log(`ChatPollingService: New message in room ${room.roomId}`, {
            lastTimestamp,
            currentTimestamp,
            lastMessage: room.lastMessage
          });
        }
        
        // Check for changes in room data (unread count, last message content)
        if (lastRoomData) {
          if (room.unreadCount !== lastRoomData.unreadCount || 
              room.lastMessage !== lastRoomData.lastMessage) {
            hasNewMessages = true;
            console.log(`ChatPollingService: Room data changed for room ${room.roomId}`, {
              unreadCount: { old: lastRoomData.unreadCount, new: room.unreadCount },
              lastMessage: { old: lastRoomData.lastMessage, new: room.lastMessage }
            });
          }
        }
        
        // Update tracking data
        this.lastMessageTimestamps.set(room.roomId, currentTimestamp);
        this.lastRoomData.set(room.roomId, {
          unreadCount: room.unreadCount,
          lastMessage: room.lastMessage,
          lastMessageAt: room.lastMessageAt
        });
      });

      const hasUpdates = hasNewMessages || hasNewRooms;

      if (hasUpdates) {
        console.log('ChatPollingService: Updates detected', {
          newMessages: hasNewMessages,
          newRooms: hasNewRooms,
          messageCount: currentMessageCount,
          roomCount: currentRoomCount
        });

        // Notify all callbacks with debounce to prevent rapid updates
        // Only notify if there are actual changes from external sources
        // (not from admin's own actions)
        setTimeout(() => {
          this.callbacks.forEach(callback => {
            try {
              callback(response, {
                hasNewMessages,
                hasNewRooms,
                messageCount: currentMessageCount,
                roomCount: currentRoomCount,
                updateType: hasNewMessages ? 'message' : 'room',
                isExternalUpdate: true // Flag to indicate this is from external source
              });
            } catch (error) {
              console.error('ChatPollingService: Callback error:', error);
            }
          });
        }, 100); // Small delay to prevent rapid updates
      }

      // Update counters
      this.lastMessageCount = currentMessageCount;
      this.lastRoomCount = currentRoomCount;

    } catch (error) {
      console.error('ChatPollingService: Error checking updates:', error);
    }
  }

  /**
   * Subscribe to updates
   * @param {Function} callback - Function to call when updates are detected
   */
  subscribe(callback) {
    this.callbacks.add(callback);
    console.log('ChatPollingService: Subscribed, total callbacks:', this.callbacks.size);
  }

  /**
   * Unsubscribe from updates
   * @param {Function} callback - Function to remove from callbacks
   */
  unsubscribe(callback) {
    this.callbacks.delete(callback);
    console.log('ChatPollingService: Unsubscribed, total callbacks:', this.callbacks.size);
  }

  /**
   * Get current polling status
   */
  getStatus() {
    return {
      isPolling: this.isPolling,
      intervalMs: this.pollingIntervalMs,
      callbackCount: this.callbacks.size,
      lastMessageCount: this.lastMessageCount,
      lastRoomCount: this.lastRoomCount
    };
  }

  /**
   * Update polling interval
   * @param {number} intervalMs - New interval in milliseconds
   */
  setPollingInterval(intervalMs) {
    this.pollingIntervalMs = intervalMs;
    
    if (this.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
  }

  /**
   * Force check for updates
   */
  async forceCheck() {
    await this.checkForUpdates();
  }
}

// Create singleton instance
const chatPollingService = new ChatPollingService();

export default chatPollingService;
