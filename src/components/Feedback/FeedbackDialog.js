import { Close as CloseIcon } from '@mui/icons-material';
import {
    Avatar,
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Rating,
    Typography
} from '@mui/material';
import React from 'react';
import { formatFeedbackDate, getRatingText } from './feedbackUtils';

const FeedbackDialog = ({ open, onClose, feedback }) => {
  if (!feedback) return null;

  const appointmentDate = formatFeedbackDate(feedback.appointmentDate);
  const createdDate = formatFeedbackDate(feedback.createdAt);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Chi tiết đánh giá #{feedback.feedbackId}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Customer Info */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Thông tin khách hàng
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                {feedback.customerName?.charAt(0)?.toUpperCase() || 'K'}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {feedback.customerName || 'Chưa có tên'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thú cưng: {feedback.petName || 'Chưa có'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Appointment Info */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Thông tin lịch hẹn
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight={500}>
                  Dịch vụ:
                </Typography>
                <Typography variant="body2">
                  {feedback.serviceName || 'Chưa có'}
                </Typography>
              </Box>
              
              {feedback.doctorName && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={500}>
                    Bác sĩ:
                  </Typography>
                  <Typography variant="body2">
                    {feedback.doctorName}
                  </Typography>
                </Box>
              )}
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight={500}>
                  Ngày khám:
                </Typography>
                <Typography variant="body2">
                  {appointmentDate.date} {feedback.appointmentTime && `- ${feedback.appointmentTime}`}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight={500}>
                  Mã lịch hẹn:
                </Typography>
                <Typography variant="body2">
                  #{feedback.appointmentId}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Rating & Feedback */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Đánh giá
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Rating
                value={feedback.rating || 0}
                readOnly
                size="large"
                precision={1}
              />
              <Box>
                <Typography variant="h6">
                  {feedback.rating || 0}/5
                </Typography>
                <Chip 
                  label={getRatingText(feedback.rating)} 
                  color={
                    feedback.rating >= 4 ? 'success' :
                    feedback.rating >= 3 ? 'info' :
                    feedback.rating >= 2 ? 'warning' : 'error'
                  }
                  size="small"
                />
              </Box>
            </Box>

            {feedback.comment && (
              <Box>
                <Typography variant="body2" fontWeight={500} gutterBottom>
                  Nhận xét:
                </Typography>
                <Box 
                  sx={{ 
                    bgcolor: 'grey.50', 
                    p: 2, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                    {feedback.comment}
                  </Typography>
                </Box>
              </Box>
            )}

            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                Đánh giá vào: {createdDate.full}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog; 