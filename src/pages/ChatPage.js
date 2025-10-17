import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Message as MessageIcon,
  Visibility as ViewIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import PageTemplate from '../components/PageTemplate';
import ChatTable from '../components/Chat/ChatTable';
import ChatDialog from '../components/Chat/ChatDialog';
import chatService from '../services/chatService';
import chatPollingService from '../services/chatPollingService';

const ChatPage = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading chat rooms...');
      const response = await chatService.getAdminChatRooms(1, 20);
      console.log('Chat rooms response:', response);
      setChatRooms(response.rooms || []);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setError('Không thể tải danh sách phòng chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatRooms();
  }, [refresh]);

  // Setup polling for real-time updates
  useEffect(() => {
    const handleUpdate = (response, updateInfo) => {
      console.log('ChatPage: Received update:', updateInfo);
      
      // Only update if there are actual changes to prevent unnecessary re-renders
      // And only if it's an external update (not from admin's own actions)
      if ((updateInfo.hasNewMessages || updateInfo.hasNewRooms) && updateInfo.isExternalUpdate) {
        setChatRooms(response.rooms || []);
        setLastUpdate(new Date());
        
        if (updateInfo.hasNewMessages) {
          console.log('ChatPage: New messages detected from external source!');
          // You can add a toast notification here
        }
      }
    };

    // Subscribe to polling updates
    chatPollingService.subscribe(handleUpdate);
    
    // Start polling
    chatPollingService.startPolling();
    setIsPolling(true);

    return () => {
      // Cleanup on unmount
      chatPollingService.unsubscribe(handleUpdate);
      chatPollingService.stopPolling();
      setIsPolling(false);
    };
  }, []);

  const handleViewChat = (chatRoom) => {
    setSelectedChatRoom(chatRoom);
    setChatDialogOpen(true);
  };

  const handleReply = async (chatRoom) => {
    try {
      await chatService.assignChatRoom(chatRoom.roomId);
      setRefresh(prev => prev + 1); // Refresh the list
      handleViewChat(chatRoom);
    } catch (error) {
      console.error('Error assigning chat room:', error);
      setError('Không thể nhận phòng chat');
    }
  };

  const handleMessageSent = (roomId, messageContent, isReadAction = false) => {
    // Optimistic update - update only the specific room
    setChatRooms(prevRooms => {
      const roomIndex = prevRooms.findIndex(room => room.roomId === roomId);
      if (roomIndex === -1) return prevRooms;
      
      const updatedRoom = { ...prevRooms[roomIndex] };
      
      if (isReadAction) {
        // Just mark as read, don't change other properties
        updatedRoom.unreadCount = 0;
      } else {
        // Update message content and move to top
        updatedRoom.lastMessage = messageContent.length > 100 ? 
          messageContent.substring(0, 100) + "..." : messageContent;
        updatedRoom.lastMessageAt = new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        updatedRoom.unreadCount = 0;
      }
      
      // Create new array
      const newRooms = [...prevRooms];
      newRooms[roomIndex] = updatedRoom;
      
      // Move room to top only if it's a new message (not read action)
      if (!isReadAction) {
        newRooms.splice(roomIndex, 1);
        newRooms.unshift(updatedRoom);
      }
      
      return newRooms;
    });
    
    setLastUpdate(new Date());
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      // Force refresh and clear cache
      const response = await chatService.forceRefresh();
      setChatRooms(response.rooms || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing chat rooms:', error);
      setError('Không thể làm mới danh sách phòng chat');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseChatDialog = () => {
    setChatDialogOpen(false);
    setSelectedChatRoom(null);
  };

  const getStatusStats = () => {
    const stats = {
      pending: chatRooms.filter(room => room.status === 0).length,
      active: chatRooms.filter(room => room.status === 1).length,
      completed: chatRooms.filter(room => room.status === 2).length,
      cancelled: chatRooms.filter(room => room.status === 3).length
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <PageTemplate title="Quản lý Chat">
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Quản lý Chat">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ChatIcon color="warning" />
                <Box>
                  <Typography variant="h6">{stats.pending}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Chờ xử lý
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ChatIcon color="info" />
                <Box>
                  <Typography variant="h6">{stats.active}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Đang trả lời
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ChatIcon color="success" />
                <Box>
                  <Typography variant="h6">{stats.completed}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Hoàn thành
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ChatIcon color="error" />
                <Box>
                  <Typography variant="h6">{stats.cancelled}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Đã hủy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chat Rooms Table */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Danh sách phòng chat ({chatRooms.length})
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {isPolling && (
              <Chip
                label="Đang cập nhật tự động"
                color="success"
                size="small"
                icon={<CircularProgress size={16} />}
              />
            )}
            {lastUpdate && (
              <Typography variant="caption" color="textSecondary">
                Cập nhật lần cuối: {lastUpdate.toLocaleTimeString('vi-VN')}
              </Typography>
            )}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        <ChatTable
          onViewChat={handleViewChat}
          onReply={handleReply}
          refresh={refresh}
        />
      </Paper>

      {/* Chat Dialog */}
      <ChatDialog
        open={chatDialogOpen}
        onClose={handleCloseChatDialog}
        chatRoom={selectedChatRoom}
        onMessageSent={handleMessageSent}
      />
    </PageTemplate>
  );
};

export default ChatPage;
