import { 
  Close as CloseIcon,
  Person as PersonIcon,
  Pets as PetsIcon,
  MedicalServices as MedicalServicesIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Rating,
    Stack,
    Typography
} from '@mui/material';
import React from 'react';
import { formatFeedbackDate, getRatingText } from './feedbackUtils';
import feedbackService from '../../services/feedbackService';

const FeedbackDialog = ({ open, onClose, feedback }) => {
  if (!feedback) return null;

  const appointmentDate = formatFeedbackDate(feedback.appointmentDate);
  const createdDate = formatFeedbackDate(feedback.createdAt);
  const ratingColor = feedbackService.getRatingColor(feedback.rating);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 24
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="700">
              Chi tiết đánh giá
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mã đánh giá: #{feedback.feedbackId}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Rating Card - Featured */}
          <Card 
            sx={{ 
              background: `linear-gradient(135deg, ${ratingColor}.light 0%, ${ratingColor}.main 100%)`,
              color: 'white'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                    Đánh giá của khách hàng
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h2" fontWeight="700">
                      {feedback.rating}
                    </Typography>
                    <Box>
                      <Rating
                        value={feedback.rating || 0}
                        readOnly
                        size="large"
                        precision={1}
                        sx={{ 
                          color: 'white',
                          '& .MuiRating-iconEmpty': {
                            color: 'rgba(255,255,255,0.3)'
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {getRatingText(feedback.rating)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <StarIcon sx={{ fontSize: 40, color: 'white' }} />
                </Avatar>
              </Box>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  display: 'block',
                  mt: 2
                }}
              >
                Đánh giá vào: {createdDate.full}
              </Typography>
            </CardContent>
          </Card>

          {/* Customer & Pet Info */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  bgcolor: 'primary.50',
                  border: 1,
                  borderColor: 'primary.200',
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="600">
                    Khách hàng
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary.main" fontWeight="700">
                  {feedback.customerName || 'Chưa có tên'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  bgcolor: 'success.50',
                  border: 1,
                  borderColor: 'success.200',
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                    <PetsIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="600">
                    Thú cưng
                  </Typography>
                </Box>
                <Typography variant="h6" color="success.main" fontWeight="700">
                  {feedback.petName || 'Chưa có'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Appointment Info Card */}
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                  <MedicalServicesIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="600">
                  Thông tin lịch hẹn
                </Typography>
              </Box>
              
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Dịch vụ
                  </Typography>
                  <Chip 
                    label={feedback.serviceName || 'Chưa có'} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                {feedback.doctorName && (
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Bác sĩ
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {feedback.doctorName}
                    </Typography>
                  </Box>
                )}
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Ngày khám
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight="600">
                      {appointmentDate.date} {feedback.appointmentTime && `- ${feedback.appointmentTime}`}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Mã lịch hẹn
                  </Typography>
                  <Chip 
                    label={`#${feedback.appointmentId}`} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Comment Section */}
          {feedback.comment && (
            <Card variant="outlined" sx={{ borderColor: `${ratingColor}.main`, borderWidth: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Avatar sx={{ bgcolor: `${ratingColor}.main`, width: 40, height: 40 }}>
                    <CommentIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="600">
                    Nhận xét từ khách hàng
                  </Typography>
                </Box>
                
                <Paper 
                  elevation={0}
                  sx={{ 
                    bgcolor: `${ratingColor}.50`, 
                    p: 3, 
                    borderRadius: 2,
                    border: 1,
                    borderColor: `${ratingColor}.100`,
                    position: 'relative'
                  }}
                >
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      position: 'absolute',
                      top: 10,
                      left: 15,
                      color: `${ratingColor}.200`,
                      opacity: 0.5,
                      fontFamily: 'Georgia, serif'
                    }}
                  >
                    "
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.8,
                      fontStyle: 'italic',
                      color: 'text.primary',
                      pl: 2
                    }}
                  >
                    {feedback.comment}
                  </Typography>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      position: 'absolute',
                      bottom: 10,
                      right: 15,
                      color: `${ratingColor}.200`,
                      opacity: 0.5,
                      fontFamily: 'Georgia, serif'
                    }}
                  >
                    "
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          )}

          {!feedback.comment && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                bgcolor: 'action.hover',
                borderRadius: 2
              }}
            >
              <CommentIcon sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Khách hàng không để lại nhận xét
              </Typography>
            </Paper>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog; 