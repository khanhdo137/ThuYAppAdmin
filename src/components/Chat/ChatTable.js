import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Typography,
  Box,
  Badge
} from '@mui/material';
import {
  Chat as ChatIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Message as MessageIcon,
  Visibility as ViewIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import chatService from '../../services/chatService';

const ChatTable = ({ onViewChat, onReply, refresh, onMessageSent, chatRooms: externalChatRooms }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Use external chatRooms if provided, otherwise load internally
  useEffect(() => {
    if (externalChatRooms) {
      setChatRooms(externalChatRooms);
      setLoading(false);
    }
  }, [externalChatRooms]);

  const loadChatRooms = async (page = 1, forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await chatService.getAdminChatRooms(page, pagination.limit, forceRefresh);
      setChatRooms(response.rooms || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update specific room data without full reload
  const updateRoomData = (roomId, updates) => {
    setChatRooms(prev => prev.map(room => 
      room.roomId === roomId ? { ...room, ...updates } : room
    ));
  };

  // Handle message sent callback to update specific room
  const handleMessageSent = (roomId, messageContent) => {
    updateRoomData(roomId, {
      lastMessage: messageContent.length > 50 ? 
        messageContent.substring(0, 50) + "..." : messageContent,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0 // Admin sent message, so no unread
    });
  };

  useEffect(() => {
    // Only load if external chatRooms not provided
    if (!externalChatRooms) {
      loadChatRooms();
    }
  }, [refresh, externalChatRooms]);

  // Listen for message sent events to update specific room
  useEffect(() => {
    if (onMessageSent) {
      // This will be called when a message is sent from ChatDialog
      const handleMessageSent = (roomId, messageContent) => {
        // Update specific room data without full reload
        updateRoomData(roomId, {
          lastMessage: messageContent.length > 50 ? 
            messageContent.substring(0, 50) + "..." : messageContent,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0 // Admin sent message, so no unread
        });
      };
      
      // Store the handler for cleanup
      window.chatMessageSentHandler = handleMessageSent;
      
      return () => {
        delete window.chatMessageSentHandler;
      };
    }
  }, [onMessageSent]);

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'warning'; // Chờ xử lý
      case 1: return 'info'; // Đang trả lời
      case 2: return 'success'; // Hoàn thành
      case 3: return 'error'; // Đã hủy
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Chờ xử lý';
      case 1: return 'Đang trả lời';
      case 2: return 'Hoàn thành';
      case 3: return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return 'Chưa có tin nhắn';
    return message.length > 50 ? `${message.substring(0, 50)}...` : message;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime || dateTime === null || dateTime === undefined || dateTime === '') {
      return '--:--';
    }
    
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in ChatTable:', dateTime, 'Type:', typeof dateTime);
        return '--:--';
      }
      
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      // If today, show time only
      if (days === 0) {
        return format(date, 'HH:mm', { locale: vi });
      }
      // If yesterday, show "Hôm qua"
      else if (days === 1) {
        return 'Hôm qua ' + format(date, 'HH:mm', { locale: vi });
      }
      // If this year, show date without year
      else if (date.getFullYear() === now.getFullYear()) {
        return format(date, 'dd/MM HH:mm', { locale: vi });
      }
      // Otherwise show full date
      else {
        return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
      }
    } catch (error) {
      console.error('Error formatting date in ChatTable:', error, dateTime);
      return '--:--';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography>Đang tải danh sách phòng chat...</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Khách hàng</TableCell>
            <TableCell>Phòng chat</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Tin nhắn cuối</TableCell>
            <TableCell>Thời gian</TableCell>
            <TableCell>Chưa đọc</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chatRooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body2" color="textSecondary">
                  Chưa có phòng chat nào
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            chatRooms.map((room) => (
              <TableRow key={room.roomId} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {room.customerName || 'Khách hàng'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {room.customerId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {room.roomName || `Phòng chat #${room.roomId}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(room.status)}
                    color={getStatusColor(room.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {formatLastMessage(room.lastMessage)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="caption">
                      {formatDateTime(room.lastMessageAt || room.createdAt)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {room.unreadCount > 0 && (
                    <Badge badgeContent={room.unreadCount} color="error">
                      <MessageIcon color="action" />
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        onClick={() => onViewChat(room)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {room.status === 0 && (
                      <Tooltip title="Nhận phòng chat">
                        <IconButton
                          size="small"
                          onClick={() => onReply(room)}
                          color="success"
                        >
                          <ReplyIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ChatTable;

