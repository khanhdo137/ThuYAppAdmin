import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Rating,
  Badge
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Pets as PetsIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as ServiceIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Note as NoteIcon,
  Feedback as FeedbackIcon,
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  Cake as BirthdayIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassIcon
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointment-tabpanel-${index}`}
      aria-labelledby={`appointment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1.5 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AppointmentDetailView({ appointment, feedback }) {
  const [selectedTab, setSelectedTab] = useState(0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // Handle time format like "14:30:00"
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const parts = timeString.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Chờ xác nhận',
      1: 'Đã xác nhận',
      2: 'Hoàn thành',
      3: 'Đã hủy',
      'Pending': 'Chờ xác nhận',
      'Confirmed': 'Đã xác nhận',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy'
    };
    return statusMap[status] || 'Không xác định';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: '#ff9800',
      1: '#2196f3',
      2: '#4caf50',
      3: '#f44336',
      'Pending': '#ff9800',
      'Confirmed': '#2196f3',
      'Completed': '#4caf50',
      'Cancelled': '#f44336'
    };
    return colorMap[status] || '#757575';
  };

  const getStatusBgColor = (status) => {
    const bgMap = {
      0: '#fff3e0',
      1: '#e3f2fd',
      2: '#e8f5e9',
      3: '#ffebee',
      'Pending': '#fff3e0',
      'Confirmed': '#e3f2fd',
      'Completed': '#e8f5e9',
      'Cancelled': '#ffebee'
    };
    return bgMap[status] || '#f5f5f5';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      0: <HourglassIcon sx={{ color: 'white', fontSize: 20 }} />,
      1: <PendingIcon sx={{ color: 'white', fontSize: 20 }} />,
      2: <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />,
      3: <CancelIcon sx={{ color: 'white', fontSize: 20 }} />,
      'Pending': <HourglassIcon sx={{ color: 'white', fontSize: 20 }} />,
      'Confirmed': <PendingIcon sx={{ color: 'white', fontSize: 20 }} />,
      'Completed': <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />,
      'Cancelled': <CancelIcon sx={{ color: 'white', fontSize: 20 }} />
    };
    return iconMap[status] || <HourglassIcon sx={{ color: 'white', fontSize: 20 }} />;
  };

  const hasFeedback = feedback && feedback.length > 0;

  // Helper to get value with fallback
  const getValue = (field, fallback = 'Chưa cập nhật') => {
    const value = appointment[field] || appointment[field.toLowerCase()] || 
                  appointment[field.charAt(0).toLowerCase() + field.slice(1)];
    return value || fallback;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with gradient - Compact */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: 2.5,
          pb: 1.5,
          px: 3,
          color: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: getStatusBgColor(appointment.Status !== undefined ? appointment.Status : appointment.status),
                border: '2px solid rgba(255,255,255,0.3)',
                color: getStatusColor(appointment.Status !== undefined ? appointment.Status : appointment.status)
              }}
            >
              <CalendarIcon sx={{ fontSize: 32 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ mb: 0.5 }}>
              {getValue('serviceName') || getValue('service_name')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={getStatusText(appointment.Status !== undefined ? appointment.Status : appointment.status)}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  height: '24px'
                }}
              />
              <Chip
                icon={<CalendarIcon sx={{ color: 'white !important', fontSize: 16 }} />}
                label={formatDate(appointment.appointmentDate || appointment.appointment_date)}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: '24px' }}
              />
              <Chip
                icon={<TimeIcon sx={{ color: 'white !important', fontSize: 16 }} />}
                label={formatTime(appointment.appointmentDate || appointment.appointment_date)}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: '24px' }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Tabs - Compact */}
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{
            mt: 1.5,
            minHeight: '40px',
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 500,
              fontSize: '0.9rem',
              minHeight: 40,
              py: 0.5,
              '&.Mui-selected': {
                color: 'white'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white',
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab icon={<CalendarIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Chi tiết" />
          <Tab 
            icon={
              hasFeedback ? (
                <Badge badgeContent={feedback.length} color="error">
                  <FeedbackIcon sx={{ fontSize: 20 }} />
                </Badge>
              ) : (
                <FeedbackIcon sx={{ fontSize: 20 }} />
              )
            } 
            iconPosition="start" 
            label="Đánh giá" 
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: 0 }}>
        {/* Tab 1: Chi tiết lịch hẹn */}
        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={1.5}>
            {/* Card tổng hợp - Layout 2 hàng */}
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  {/* Hàng 1: Thông tin dịch vụ */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ color: '#667eea', mb: 1.5 }}>
                      <ServiceIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                      Thông tin dịch vụ
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          bgcolor: '#f8f9fa',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          height: '100%',
                          minHeight: '72px'
                        }}>
                          <Avatar sx={{ bgcolor: '#e3f2fd', width: 40, height: 40 }}>
                            <ServiceIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Dịch vụ
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {getValue('serviceName') || getValue('service_name')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          bgcolor: '#f8f9fa',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          height: '100%',
                          minHeight: '72px'
                        }}>
                          <Avatar sx={{ bgcolor: '#f3e5f5', width: 40, height: 40 }}>
                            <MoneyIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Giá dịch vụ
                            </Typography>
                            <Typography variant="body1" fontWeight="600" color="primary">
                              {appointment.price ? `${appointment.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          bgcolor: '#f8f9fa',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          minHeight: '72px'
                        }}>
                          <Avatar sx={{ bgcolor: '#e8f5e9', width: 40, height: 40 }}>
                            <MedicalIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Bác sĩ phụ trách
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {getValue('doctorName') || getValue('doctor_name') || 'Chưa chọn'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Thông tin lịch hẹn */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ color: '#f57c00', mb: 1.5 }}>
                      <CalendarIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                      Thông tin lịch hẹn
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          bgcolor: '#fff3e0',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid #ffb74d',
                          height: '100%',
                          minHeight: '72px'
                        }}>
                          <Avatar sx={{ bgcolor: '#ffe0b2', width: 40, height: 40 }}>
                            <CalendarIcon sx={{ color: '#f57c00', fontSize: 20 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Ngày hẹn
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {formatDate(appointment.AppointmentDate || appointment.appointmentDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          bgcolor: '#e8eaf6',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid #9fa8da',
                          height: '100%',
                          minHeight: '72px'
                        }}>
                          <Avatar sx={{ bgcolor: '#c5cae9', width: 40, height: 40 }}>
                            <ScheduleIcon sx={{ color: '#3f51b5', fontSize: 20 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Giờ hẹn
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {formatTime(appointment.AppointmentTime || appointment.appointmentTime)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          bgcolor: '#fce4ec',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid #f48fb1',
                          height: '100%',
                          minHeight: '72px'
                        }}>
                          <Avatar sx={{ bgcolor: '#f8bbd0', width: 40, height: 40 }}>
                            <ScheduleIcon sx={{ color: '#e91e63', fontSize: 20 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Giờ đặt
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {appointment.CreatedAt || appointment.createdAt 
                                ? formatDateTime(appointment.CreatedAt || appointment.createdAt)
                                : 'Chưa có'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          bgcolor: getStatusBgColor(appointment.Status !== undefined ? appointment.Status : appointment.status),
                          p: 1.5,
                          borderRadius: 2,
                          border: `2px solid ${getStatusColor(appointment.Status !== undefined ? appointment.Status : appointment.status)}`,
                          height: '100%',
                          minHeight: '72px'
                        }}>
                          <Avatar sx={{ 
                            bgcolor: getStatusColor(appointment.Status !== undefined ? appointment.Status : appointment.status),
                            width: 40, 
                            height: 40 
                          }}>
                            {getStatusIcon(appointment.Status !== undefined ? appointment.Status : appointment.status)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Trạng thái
                            </Typography>
                            <Typography variant="body1" fontWeight="600" sx={{ 
                              color: getStatusColor(appointment.Status !== undefined ? appointment.Status : appointment.status)
                            }}>
                              {getStatusText(appointment.Status !== undefined ? appointment.Status : appointment.status)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Hàng 2: Thông tin thú cưng & khách hàng */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ color: '#764ba2', mb: 1.5 }}>
                      <PetsIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                      Thông tin thú cưng & khách hàng
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          bgcolor: '#fff8e1',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid #ffe082',
                          minHeight: '88px'
                        }}>
                          <Avatar sx={{ bgcolor: '#fff3e0', width: 40, height: 40 }}>
                            <PetsIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Thú cưng
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {getValue('petName') || getValue('pet_name')}
                            </Typography>
                            {(getValue('species') || getValue('breed')) && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {getValue('species')} {getValue('breed') && `- ${getValue('breed')}`}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Tuổi
                            </Typography>
                            <Typography variant="h6" fontWeight="600" color="primary">
                              {getValue('age') ? `${getValue('age')}` : '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getValue('age') ? 'tuổi' : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          bgcolor: '#e0f2f1',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid #80cbc4',
                          minHeight: '88px'
                        }}>
                          <Avatar sx={{ bgcolor: '#b2dfdb', width: 40, height: 40 }}>
                            <PersonIcon sx={{ color: '#009688', fontSize: 20 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Chủ sở hữu
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {getValue('customerName') || getValue('customer_name') || getValue('ownerName')}
                            </Typography>
                            {(getValue('customerPhone') || getValue('CustomerPhone')) && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                <PhoneIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                {getValue('customerPhone') || getValue('CustomerPhone')}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Ghi chú - Nếu có */}
                  {appointment.notes && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <NoteIcon sx={{ color: '#667eea', fontSize: 20 }} />
                        <Box flex={1}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Ghi chú
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, mt: 0.5 }}>
                            {appointment.notes}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Đánh giá */}
        <TabPanel value={selectedTab} index={1}>
          {hasFeedback ? (
            <Grid container spacing={1.5}>
              {feedback.map((fb, index) => (
                <Grid item xs={12} key={fb.feedbackId || index}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
                            <PersonIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {fb.customerName || 'Khách hàng'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {fb.createdAt ? new Date(fb.createdAt).toLocaleString('vi-VN') : ''}
                            </Typography>
                          </Box>
                        </Box>
                        <Rating value={fb.rating || 0} readOnly size="small" />
                      </Box>
                      {fb.comment && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {fb.comment}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: '#fafafa'
              }}
            >
              <FeedbackIcon sx={{ fontSize: 40, color: '#bdbdbd', mb: 1 }} />
              <Typography variant="subtitle2" color="text.secondary" fontWeight="500">
                Chưa có đánh giá
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Đánh giá sẽ hiển thị sau khi hoàn thành dịch vụ
              </Typography>
            </Paper>
          )}
        </TabPanel>
      </Box>
    </Box>
  );
}

