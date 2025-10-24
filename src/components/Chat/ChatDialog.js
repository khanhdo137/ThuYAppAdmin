import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  KeyboardArrowDown as ScrollDownIcon,
  PhotoCamera as CameraIcon,
  Image as ImageIcon,
  Videocam as VideocamIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import chatService from '../../services/chatService';
import apiService from '../../services/apiService';
import { optimizeMessageUpdates, smartScroll } from '../../utils/chatOptimization';
import DirectImageUpload from '../DirectImageUpload';
import { useToast } from '../ToastProvider';

const ChatDialog = ({ open, onClose, chatRoom, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [messagePollingInterval, setMessagePollingInterval] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open && chatRoom) {
      loadMessages();
      startMessagePolling();
      
      // Mark messages as read when opening chat
      markMessagesAsRead();
    } else {
      stopMessagePolling();
    }
  }, [open, chatRoom]);

  const markMessagesAsRead = async () => {
    if (!chatRoom || !chatRoom.roomId) return;
    
    try {
      await chatService.markAsRead(chatRoom.roomId);
      console.log('Messages marked as read');
      
      // Notify parent to update unread count in table
      if (onMessageSent) {
        onMessageSent(chatRoom.roomId, null, true); // Pass true to indicate read action
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Auto-scroll to bottom when dialog opens
  useEffect(() => {
    if (open && messages.length > 0) {
      // Only scroll to bottom when dialog first opens, not on every message change
      setTimeout(() => {
        forceScrollToBottom();
      }, 100);
    }
  }, [open]);

  // Only scroll to bottom when new messages are added (not on every render)
  useEffect(() => {
    if (messages.length > lastMessageCount && messages.length > 0) {
      // Check if user is near bottom before auto-scrolling
      const container = messagesEndRef.current?.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom) {
          setTimeout(() => {
            forceScrollToBottom();
          }, 50);
        }
      }
    }
    setLastMessageCount(messages.length);
  }, [messages.length]);

  // Start polling for new messages when dialog is open
  const startMessagePolling = () => {
    if (messagePollingInterval) return;
    
    const interval = setInterval(async () => {
      if (open && chatRoom) {
        try {
          const response = await chatService.getChatMessages(chatRoom.roomId, 1, 50, true);
          const newMessages = response.messages || [];
          
          // Check if there are actually new messages
          if (newMessages.length !== messages.length) {
            const optimizedMessages = optimizeMessageUpdates(messages, newMessages);
            if (optimizedMessages !== messages) {
              setMessages(optimizedMessages);
              setLastMessageCount(optimizedMessages.length);
              
              // Auto-scroll to bottom if user is near bottom
              const container = messagesEndRef.current?.parentElement;
              if (container) {
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
                if (isNearBottom) {
                  setTimeout(() => {
                    forceScrollToBottom();
                  }, 50);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error polling messages:', error);
        }
      }
    }, 2000); // Poll every 2 seconds
    
    setMessagePollingInterval(interval);
  };

  // Stop polling for new messages
  const stopMessagePolling = () => {
    if (messagePollingInterval) {
      clearInterval(messagePollingInterval);
      setMessagePollingInterval(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMessagePolling();
    };
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChatMessages(chatRoom.roomId, 1, 50, true);
      const newMessages = response.messages || [];
      
      // Optimize message updates to prevent flickering
      const optimizedMessages = optimizeMessageUpdates(messages, newMessages);
      if (optimizedMessages !== messages) {
        setMessages(optimizedMessages);
        setLastMessageCount(optimizedMessages.length);
        
        // Scroll to bottom after loading messages
        forceScrollToBottom();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    smartScroll(container, messagesEndRef.current, 100);
  };

  const forceScrollToBottom = () => {
    // Force scroll to bottom with smooth animation
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }, 50);
  };

  const handleScroll = (event) => {
    const container = event.target;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      setSending(true);
      
      // Optimistic update - add message to UI immediately
      const optimisticMessage = {
        messageId: `temp_${Date.now()}`,
        messageContent: messageText,
        senderType: 1, // Admin
        senderName: 'Admin',
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Smooth scroll to bottom after adding message
      setTimeout(() => {
        forceScrollToBottom();
      }, 50);
      
      // Send to server
      await chatService.sendAdminMessage(chatRoom.roomId, messageText);
      
      // Replace optimistic message with real message without full reload
      const realMessage = {
        messageId: `real_${Date.now()}`,
        messageContent: messageText,
        senderType: 1,
        senderName: 'Admin',
        createdAt: new Date().toISOString(),
        isOptimistic: false
      };
      
      setMessages(prev => prev.map(msg => 
        msg.isOptimistic ? realMessage : msg
      ));
      
      // Notify parent component for optimistic update with specific room data
      onMessageSent?.(chatRoom.roomId, messageText);
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      console.log('=== IMAGE UPLOAD DEBUG ===');
      console.log('File:', file.name, file.type, file.size);
      
      // Tạo FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ThuYHuongNo'); // Sử dụng preset từ cloudinaryService.ts
      
      console.log('Uploading directly to Cloudinary...');
      
      // Upload trực tiếp lên Cloudinary (giống như React Native app)
      const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dl6lq6ord/image/upload';
      
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Upload success:', result);
      console.log('Image URL:', result.secure_url);
      
      // Lưu URL ảnh (secure_url từ Cloudinary response)
      setSelectedImage(result.secure_url);
      setUploadingImage(false);
      toast.showSuccess('Ảnh đã được tải lên thành công');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.showError(`Không thể tải lên hình ảnh: ${error.message}`);
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (file) => {
    setUploadingVideo(true);
    try {
      console.log('=== VIDEO UPLOAD DEBUG ===');
      console.log('File:', file.name, file.type, file.size);
      
      // Validate video file
      if (!file.type.startsWith('video/')) {
        throw new Error('Chỉ chấp nhận file video');
      }
      
      // Check file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        throw new Error('Video không được vượt quá 100MB');
      }
      
      // Tạo FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ThuYHuongNo');
      formData.append('resource_type', 'video'); // Chỉ định là video
      
      console.log('Uploading video to Cloudinary...');
      
      // Upload video lên Cloudinary
      const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dl6lq6ord/video/upload';
      
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Upload success:', result);
      console.log('Video URL:', result.secure_url);
      
      // Lưu URL video
      setSelectedVideo(result.secure_url);
      setUploadingVideo(false);
      toast.showSuccess('Video đã được tải lên thành công');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.showError(`Không thể tải lên video: ${error.message}`);
      setUploadingVideo(false);
    }
  };

  const handleSendImage = async () => {
    if (!selectedImage || !chatRoom) return;
    
    try {
      setSending(true);
      
      // Optimistic update - add image message to UI immediately
      const optimisticMessage = {
        messageId: `temp_img_${Date.now()}`,
        messageContent: '[Hình ảnh]',
        messageType: 1,
        fileUrl: selectedImage,
        senderType: 1, // Admin
        senderName: 'Admin',
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Smooth scroll to bottom after adding message
      setTimeout(() => {
        forceScrollToBottom();
      }, 50);
      
      // Send to server
      await chatService.sendAdminMessage(chatRoom.roomId, '[Hình ảnh]', 1, selectedImage);
      
      // Replace optimistic message with real message
      const realMessage = {
        messageId: `real_img_${Date.now()}`,
        messageContent: '[Hình ảnh]',
        messageType: 1,
        fileUrl: selectedImage,
        senderType: 1,
        senderName: 'Admin',
        createdAt: new Date().toISOString(),
        isOptimistic: false
      };
      
      setMessages(prev => prev.map(msg => 
        msg.isOptimistic ? realMessage : msg
      ));
      
      // Notify parent component for optimistic update
      onMessageSent?.(chatRoom.roomId, '[Hình ảnh]');
      
      // Clear selected image and hide upload section
      setSelectedImage(null);
      setShowImageUpload(false);
      toast.showSuccess('Đã gửi hình ảnh thành công');
      
    } catch (error) {
      console.error('Error sending image:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
      toast.showError('Không thể gửi hình ảnh');
    } finally {
      setSending(false);
    }
  };

  const handleSendVideo = async () => {
    if (!selectedVideo || !chatRoom) return;
    
    try {
      setSending(true);
      
      // Optimistic update - add video message to UI immediately
      const optimisticMessage = {
        messageId: `temp_vid_${Date.now()}`,
        messageContent: '[Video]',
        messageType: 3,
        fileUrl: selectedVideo,
        senderType: 1, // Admin
        senderName: 'Admin',
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Smooth scroll to bottom after adding message
      setTimeout(() => {
        forceScrollToBottom();
      }, 50);
      
      // Send to server
      await chatService.sendAdminMessage(chatRoom.roomId, '[Video]', 3, selectedVideo);
      
      // Replace optimistic message with real message
      const realMessage = {
        messageId: `real_vid_${Date.now()}`,
        messageContent: '[Video]',
        messageType: 3,
        fileUrl: selectedVideo,
        senderType: 1,
        senderName: 'Admin',
        createdAt: new Date().toISOString(),
        isOptimistic: false
      };
      
      setMessages(prev => prev.map(msg => 
        msg.isOptimistic ? realMessage : msg
      ));
      
      // Notify parent component for optimistic update
      onMessageSent?.(chatRoom.roomId, '[Video]');
      
      // Clear selected video and hide upload section
      setSelectedVideo(null);
      setShowVideoUpload(false);
      toast.showSuccess('Đã gửi video thành công');
      
    } catch (error) {
      console.error('Error sending video:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
      toast.showError('Không thể gửi video');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateTime) => {
    try {
      if (!dateTime) return '--:--';
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return '--:--';
      return format(date, 'HH:mm', { locale: vi });
    } catch (error) {
      console.error('Error formatting time:', error, dateTime);
      return '--:--';
    }
  };

  const formatMessageDate = (dateTime) => {
    try {
      if (!dateTime) return 'Không xác định';
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return 'Không xác định';
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Error formatting date:', error, dateTime);
      return 'Không xác định';
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatMessageDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (!chatRoom) return null;

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {chatRoom.customerName || 'Khách hàng'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Phòng chat #{chatRoom.roomId}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box 
          sx={{ 
            height: '400px', 
            overflow: 'auto', 
            p: 1, 
            position: 'relative',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '4px',
              '&:hover': {
                background: '#a8a8a8',
              },
            },
          }}
          onScroll={handleScroll}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {Object.entries(messageGroups).map(([date, dateMessages]) => (
                <Box key={date} mb={2}>
                  <Box display="flex" justifyContent="center" mb={1}>
                    <Chip label={date} size="small" />
                  </Box>
                  {dateMessages.map((message, index) => (
                    <Box
                      key={message.messageId}
                      display="flex"
                      justifyContent={message.senderType === 1 ? 'flex-end' : 'flex-start'}
                      mb={1}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: '70%',
                          backgroundColor: message.senderType === 1 ? 'primary.main' : 'grey.100',
                          color: message.senderType === 1 ? 'white' : 'text.primary'
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          {message.senderType === 1 ? <AdminIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                          <Typography variant="caption">
                            {message.senderName || (message.senderType === 1 ? 'Admin' : 'Khách hàng')}
                          </Typography>
                          <Typography variant="caption">
                            {formatMessageTime(message.createdAt)}
                          </Typography>
                        </Box>
                        {message.messageType === 1 && message.fileUrl ? (
                          <Box>
                            <Box
                              component="img"
                              src={message.fileUrl}
                              alt="Chat image"
                              sx={{
                                maxWidth: 200,
                                maxHeight: 200,
                                borderRadius: 1,
                                mb: 1,
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                              onClick={() => window.open(message.fileUrl, '_blank')}
                            />
                            <Typography variant="body2">
                              {message.messageContent}
                            </Typography>
                          </Box>
                        ) : message.messageType === 3 && message.fileUrl ? (
                          <Box>
                            <Box
                              component="video"
                              src={message.fileUrl}
                              controls
                              sx={{
                                maxWidth: 300,
                                maxHeight: 300,
                                borderRadius: 1,
                                mb: 1,
                                backgroundColor: '#000'
                              }}
                            />
                            <Typography variant="body2">
                              {message.messageContent}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2">
                            {message.messageContent}
                          </Typography>
                        )}
                      </Paper>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>
              ))}
              {messages.length === 0 && (
                <Box display="flex" justifyContent="center" p={3}>
                  <Typography color="textSecondary">
                    Chưa có tin nhắn nào
                  </Typography>
                </Box>
              )}
            </>
          )}
          
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <IconButton
              onClick={forceScrollToBottom}
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                boxShadow: 2,
                zIndex: 1
              }}
              size="small"
            >
              <ScrollDownIcon />
            </IconButton>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'stretch' }}>
        {/* Image Upload Section */}
        {showImageUpload && (
          <Box sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Gửi hình ảnh:
            </Typography>
            <DirectImageUpload
              currentImageUrl={selectedImage}
              onImageUpload={handleImageUpload}
              onImageRemove={() => setSelectedImage(null)}
              uploading={uploadingImage}
              maxSize={5}
            />
            {selectedImage && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSendImage}
                  disabled={sending}
                  startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                  size="small"
                >
                  {sending ? 'Đang gửi...' : 'Gửi ảnh'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedImage(null);
                    setShowImageUpload(false);
                  }}
                  size="small"
                >
                  Hủy
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Video Upload Section */}
        {showVideoUpload && (
          <Box sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Gửi video:
            </Typography>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleVideoUpload(file);
                }
              }}
              style={{ display: 'none' }}
              id="video-upload-input"
            />
            <label htmlFor="video-upload-input">
              <Button
                variant="outlined"
                component="span"
                disabled={uploadingVideo}
                startIcon={uploadingVideo ? <CircularProgress size={20} /> : <VideocamIcon />}
                fullWidth
              >
                {uploadingVideo ? 'Đang tải lên...' : 'Chọn video'}
              </Button>
            </label>
            {selectedVideo && (
              <Box sx={{ mt: 2 }}>
                <Box
                  component="video"
                  src={selectedVideo}
                  controls
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    borderRadius: 1,
                    backgroundColor: '#000',
                    mb: 1
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleSendVideo}
                    disabled={sending}
                    startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                    size="small"
                  >
                    {sending ? 'Đang gửi...' : 'Gửi video'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedVideo(null);
                      setShowVideoUpload(false);
                    }}
                    size="small"
                  >
                    Hủy
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Text Message Input */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <IconButton
            onClick={() => setShowImageUpload(!showImageUpload)}
            color="primary"
            disabled={sending}
          >
            <CameraIcon />
          </IconButton>
          
          <IconButton
            onClick={() => setShowVideoUpload(!showVideoUpload)}
            color="secondary"
            disabled={sending}
          >
            <VideocamIcon />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
          />
          
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sending ? 'Đang gửi...' : 'Gửi'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ChatDialog;

