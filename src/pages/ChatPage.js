import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  CircularProgress,
  Skeleton,
  Avatar,
  Fade
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Message as MessageIcon,
  Visibility as ViewIcon,
  Reply as ReplyIcon,
  HourglassEmpty,
  CheckCircle,
  Cancel,
  QuestionAnswer
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

  const loadChatRooms = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      console.log('Loading chat rooms...');
      const response = await chatService.getAdminChatRooms(1, 20);
      console.log('Chat rooms response:', response);
      setChatRooms(response.rooms || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setError('Không thể tải danh sách phòng chat. Vui lòng thử lại.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChatRooms(true);
  }, [refresh, loadChatRooms]);

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

  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true);
      // Clear cache first
      chatService.clearCache();
      // Then force refresh from server
      const response = await chatService.getAdminChatRooms(1, 20, true);
      console.log('Refreshed chat rooms:', response);
      setChatRooms(response.rooms || []);
      setLastUpdate(new Date());
      setError(null);
    } catch (error) {
      console.error('Error refreshing chat rooms:', error);
      setError('Không thể làm mới danh sách phòng chat. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCloseChatDialog = () => {
    setChatDialogOpen(false);
    setSelectedChatRoom(null);
  };

  const stats = useMemo(() => ({
    pending: chatRooms.filter(room => room.status === 0).length,
    active: chatRooms.filter(room => room.status === 1).length,
    completed: chatRooms.filter(room => room.status === 2).length,
    cancelled: chatRooms.filter(room => room.status === 3).length
  }), [chatRooms]);

  // Stat card configuration with gradients and icons
  const statCards = useMemo(() => [
    {
      title: 'Chờ xử lý',
      value: stats.pending,
      icon: HourglassEmpty,
      gradient: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
      color: '#FFA726'
    },
    {
      title: 'Đang trả lời',
      value: stats.active,
      icon: QuestionAnswer,
      gradient: 'linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%)',
      color: '#42A5F5'
    },
    {
      title: 'Hoàn thành',
      value: stats.completed,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)',
      color: '#66BB6A'
    },
    {
      title: 'Đã hủy',
      value: stats.cancelled,
      icon: Cancel,
      gradient: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',
      color: '#EF5350'
    }
  ], [stats]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={80} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={400} />
      </Paper>
    </>
  );

  return (
    <PageTemplate title="Quản lý Chat">
      <Fade in={!!error}>
        <Box>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
              action={
                <Button color="inherit" size="small" onClick={() => loadChatRooms(true)}>
                  Thử lại
                </Button>
              }
            >
              {error}
            </Alert>
          )}
        </Box>
      </Fade>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Statistics Cards with Gradients */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Fade in timeout={300 + index * 100}>
                    <Card 
                      elevation={3}
                      sx={{
                        background: stat.gradient,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                opacity: 0.9, 
                                fontWeight: 500,
                                mb: 1,
                                fontSize: '0.875rem'
                              }}
                            >
                              {stat.title}
                            </Typography>
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                fontWeight: 700,
                                mb: 0.5
                              }}
                            >
                              {stat.value}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ opacity: 0.8 }}
                            >
                              phòng chat
                            </Typography>
                          </Box>
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.3)',
                              width: 56,
                              height: 56
                            }}
                          >
                            <IconComponent sx={{ fontSize: 32 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                      
                      {/* Decorative background elements */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -30,
                          right: -30,
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          zIndex: 0
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -20,
                          left: -20,
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          zIndex: 0
                        }}
                      />
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {/* Chat Rooms Table */}
      <Fade in={!loading} timeout={500}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 1))'
          }}
        >
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={3}
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Danh sách phòng chat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số: {chatRooms.length} phòng chat
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              {isPolling && (
                <Chip
                  label="Cập nhật tự động"
                  color="success"
                  size="small"
                  variant="outlined"
                  icon={<CircularProgress size={14} color="inherit" />}
                  sx={{ fontWeight: 500 }}
                />
              )}
              {lastUpdate && (
                <Chip
                  label={`Cập nhật: ${lastUpdate.toLocaleTimeString('vi-VN')}`}
                  size="small"
                  variant="outlined"
                  icon={<TimeIcon fontSize="small" />}
                />
              )}
              <Tooltip title="Làm mới dữ liệu">
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    }
                  }}
                >
                  Làm mới
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {chatRooms.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              py={8}
            >
              <ChatIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có phòng chat nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Các phòng chat sẽ xuất hiện ở đây khi khách hàng bắt đầu trò chuyện
              </Typography>
            </Box>
          ) : (
        <ChatTable
          onViewChat={handleViewChat}
          onReply={handleReply}
          refresh={refresh}
          chatRooms={chatRooms}
        />
          )}
        </Paper>
      </Fade>

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
