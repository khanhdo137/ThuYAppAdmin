import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Box
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

/**
 * AppointmentCard - Component hiển thị thông tin lịch hẹn dạng card
 * Có thể tái sử dụng ở nhiều nơi trong ứng dụng
 */
export default function AppointmentCard({ appointment, onClick, showViewButton = true }) {
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Pending': 'warning',
      'Confirmed': 'info',
      'Completed': 'success',
      'Cancelled': 'error',
      'Đang chờ': 'warning',
      'Đã xác nhận': 'info',
      'Hoàn thành': 'success',
      'Đã hủy': 'error'
    };
    return statusColors[status] || 'default';
  };

  const getStatusBgColor = (status) => {
    if (status === 'Completed' || status === 'Hoàn thành') return '#e8f5e9';
    if (status === 'Cancelled' || status === 'Đã hủy') return '#ffebee';
    return '#fff3e0';
  };

  const getStatusTextColor = (status) => {
    if (status === 'Completed' || status === 'Hoàn thành') return '#4caf50';
    if (status === 'Cancelled' || status === 'Đã hủy') return '#f44336';
    return '#ff9800';
  };

  const getBorderColor = (status) => {
    if (status === 'Completed' || status === 'Hoàn thành') return '#4caf50';
    if (status === 'Cancelled' || status === 'Đã hủy') return '#f44336';
    return '#ff9800';
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s',
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: '4px solid',
        borderLeftColor: getBorderColor(appointment.status),
        '&:hover': onClick ? {
          transform: 'translateX(8px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                bgcolor: getStatusBgColor(appointment.status),
                color: getStatusTextColor(appointment.status),
                width: 56,
                height: 56
              }}
            >
              <CalendarIcon />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" fontWeight="600">
                {appointment.serviceName || appointment.service_name || 'Dịch vụ'}
              </Typography>
              <Chip
                label={appointment.status}
                size="small"
                color={getStatusColor(appointment.status)}
                sx={{ fontWeight: 500 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Thú cưng:</strong> {appointment.petName || appointment.pet_name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Bác sĩ:</strong> {appointment.doctorName || appointment.doctor_name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Thời gian:</strong> {formatDateTime(appointment.appointmentDate || appointment.appointment_date)}
            </Typography>
            {appointment.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Ghi chú:</strong> {appointment.notes}
              </Typography>
            )}
          </Grid>
          {showViewButton && onClick && (
            <Grid item>
              <IconButton
                sx={{
                  bgcolor: '#f5f5f5',
                  '&:hover': { bgcolor: '#eeeeee' }
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}



