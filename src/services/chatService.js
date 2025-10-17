import apiService from './apiService';
import { formatVietnamTime, formatChatRoomTime } from '../utils/timeUtils';

const CHAT_API_BASE = '/Chat';

// Cache for chat data to avoid unnecessary reloads
let chatRoomsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 2000; // 2 seconds cache - shorter cache for real-time updates

export const chatService = {
  // Lấy danh sách phòng chat cho admin với cache
  async getAdminChatRooms(page = 1, limit = 20, forceRefresh = false) {
    try {
      const now = Date.now();
      
      // Use cache if available and not expired
      if (!forceRefresh && chatRoomsCache && (now - lastFetchTime) < CACHE_DURATION) {
        console.log('ChatService: Using cached data');
        return chatRoomsCache;
      }
      
      console.log('ChatService: Fetching fresh data...', { page, limit });
      const response = await apiService.get(`${CHAT_API_BASE}/admin/rooms`, {
        params: { page, limit }
      });
      console.log('ChatService: API response:', response);
      
      // Format thời gian cho tất cả rooms
      if (response.rooms) {
        response.rooms = response.rooms.map(room => ({
          ...room,
          createdAt: formatVietnamTime(room.createdAt),
          lastMessageAt: formatChatRoomTime(room.lastMessageAt || room.createdAt)
        }));
      }
      
      // Cache the response
      chatRoomsCache = response;
      lastFetchTime = now;
      
      return response;
    } catch (error) {
      console.error('Error fetching admin chat rooms:', error);
      throw error;
    }
  },

  // Nhận phòng chat
  async assignChatRoom(roomId) {
    try {
      const response = await apiService.post(`${CHAT_API_BASE}/admin/room/${roomId}/assign`);
      return response;
    } catch (error) {
      console.error('Error assigning chat room:', error);
      throw error;
    }
  },

  // Gửi tin nhắn (admin) với optimistic update
  async sendAdminMessage(roomId, messageContent, messageType = 0, fileUrl = null) {
    try {
      const response = await apiService.post(`${CHAT_API_BASE}/admin/message`, {
        roomId,
        messageContent,
        messageType,
        fileUrl
      });
      
      // Update cache optimistically without clearing it
      if (chatRoomsCache && chatRoomsCache.rooms) {
        const roomIndex = chatRoomsCache.rooms.findIndex(room => room.roomId === roomId);
        if (roomIndex !== -1) {
          const now = new Date();
          chatRoomsCache.rooms[roomIndex].lastMessage = messageContent.length > 100 ? 
            messageContent.substring(0, 100) + "..." : messageContent;
          chatRoomsCache.rooms[roomIndex].lastMessageAt = now.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          chatRoomsCache.rooms[roomIndex].unreadCount = 0; // Admin sent message, so no unread
          
          // Move this room to the top of the list (most recent)
          const updatedRoom = chatRoomsCache.rooms[roomIndex];
          chatRoomsCache.rooms.splice(roomIndex, 1);
          chatRoomsCache.rooms.unshift(updatedRoom);
        }
      }
      
      console.log('ChatService: Message sent successfully, cache updated optimistically');
      return response;
    } catch (error) {
      console.error('Error sending admin message:', error);
      throw error;
    }
  },

  // Lấy tin nhắn trong phòng chat (admin)
  async getChatMessages(roomId, page = 1, limit = 200, forceRefresh = false) {
    try {
      const response = await apiService.get(`${CHAT_API_BASE}/admin/room/${roomId}/messages`, {
        params: { page, limit, forceRefresh }
      });
      
      // KHÔNG format createdAt ở đây - để ChatDialog.js tự format
      // Vì nếu format thành string rồi, ChatDialog không thể parse lại được
      
      return response;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },

  // Lấy thông tin phòng chat chi tiết
  async getChatRoomDetails(roomId) {
    try {
      const response = await apiService.get(`${CHAT_API_BASE}/admin/room/${roomId}`);
      
      // Format thời gian cho room details
      if (response) {
        response.createdAt = formatVietnamTime(response.createdAt);
        response.lastMessageAt = formatVietnamTime(response.lastMessageAt || response.createdAt);
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching chat room details:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái phòng chat
  async updateChatRoomStatus(roomId, status) {
    try {
      const response = await apiService.patch(`${CHAT_API_BASE}/admin/room/${roomId}/status`, {
        status
      });
      
      // Update cache optimistically without clearing it
      if (chatRoomsCache && chatRoomsCache.rooms) {
        const roomIndex = chatRoomsCache.rooms.findIndex(room => room.roomId === roomId);
        if (roomIndex !== -1) {
          chatRoomsCache.rooms[roomIndex].status = status;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error updating chat room status:', error);
      throw error;
    }
  },

  // Clear cache
  clearCache() {
    chatRoomsCache = null;
    lastFetchTime = 0;
    console.log('ChatService: Cache cleared');
  },

  // Force refresh
  async forceRefresh() {
    chatService.clearCache();
    return await chatService.getAdminChatRooms(1, 20, true);
  },

  // Get cached data
  getCachedData() {
    return chatRoomsCache;
  },

  // Check if cache is valid
  isCacheValid() {
    const now = Date.now();
    return chatRoomsCache && (now - lastFetchTime) < CACHE_DURATION;
  },

  // Mark messages as read
  async markAsRead(roomId) {
    try {
      const response = await apiService.post(`${CHAT_API_BASE}/admin/room/${roomId}/mark-read`);
      
      // Update cache optimistically
      if (chatRoomsCache && chatRoomsCache.rooms) {
        const roomIndex = chatRoomsCache.rooms.findIndex(room => room.roomId === roomId);
        if (roomIndex !== -1) {
          chatRoomsCache.rooms[roomIndex].unreadCount = 0;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
};

export default chatService;

