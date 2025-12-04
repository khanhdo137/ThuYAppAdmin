import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Pets as PetsIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNotifications } from '../context/NotificationContext';
import apiService from '../services/apiService';

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const { refreshNotifications } = useNotifications();

  // Load upcoming reminders
  const loadReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get('/reminder/upcoming-reminders');
      setReminders(response.reminders || []);
    } catch (err) {
      setError('Không thể tải danh sách nhắc hẹn');
      console.error('Error loading reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load users with reminders
  const loadUsersWithReminders = async () => {
    try {
      const response = await apiService.get('/reminder/users-with-reminders');
      return response.users || [];
    } catch (err) {
      console.error('Error loading users with reminders:', err);
      return [];
    }
  };

  // Send all reminders
  const sendAllReminders = async () => {
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiService.post('/reminder/check-all-reminders');
      setSuccess(response.message);
      await loadReminders(); // Reload to see updated status
      refreshNotifications(); // Refresh notification counts
    } catch (err) {
      setError('Không thể gửi nhắc hẹn');
      console.error('Error sending reminders:', err);
    } finally {
      setSending(false);
    }
  };

  // View reminder details
  const handleViewDetails = (reminder) => {
    setSelectedReminder(reminder);
    setDetailsOpen(true);
  };

  // Get status chip
  const getStatusChip = (reminder) => {
    if (reminder.reminderSent) {
      return <Chip label="Đã gửi" color="success" size="small" icon={<CheckCircleIcon />} />;
    } else if (reminder.daysUntil === 0) {
      return <Chip label="Hôm nay" color="error" size="small" icon={<WarningIcon />} />;
    } else if (reminder.daysUntil === 1) {
      return <Chip label="Ngày mai" color="warning" size="small" icon={<WarningIcon />} />;
    } else {
      return <Chip label={`Còn ${reminder.daysUntil} ngày`} color="info" size="small" icon={<InfoIcon />} />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          Quản lý Nhắc hẹn
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tự động gửi nhắc hẹn cho các lịch tái khám trong vòng 7 ngày tới
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={sendAllReminders}
          disabled={sending || loading}
          sx={{ minWidth: 200 }}
        >
          {sending ? <CircularProgress size={20} /> : 'Gửi tất cả nhắc hẹn'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadReminders}
          disabled={loading}
        >
          Làm mới
        </Button>

        <Button
          variant="outlined"
          color="warning"
          startIcon={<RefreshIcon />}
          onClick={async () => {
            try {
              const response = await apiService.post('/reminder/reset-reminder-status');
              setSuccess(response.message);
              await loadReminders();
            } catch (err) {
              setError('Không thể reset trạng thái reminders');
            }
          }}
          disabled={loading}
        >
          Reset để test lại
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <NotificationsIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4">{reminders.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng nhắc hẹn
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4">
                  {reminders.filter(r => r.reminderSent).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đã gửi
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon color="warning" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4">
                  {reminders.filter(r => !r.reminderSent && r.daysUntil <= 1).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cần gửi gấp
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Reminders Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách Nhắc hẹn
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : reminders.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Không có nhắc hẹn nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tất cả lịch tái khám đều đã được nhắc hẹn hoặc chưa đến thời gian
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Thú cưng</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>Dịch vụ</TableCell>
                    <TableCell>Ngày hẹn</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reminders.map((reminder, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PetsIcon color="primary" />
                          <Typography variant="body2" fontWeight="medium">
                            {reminder.petName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {reminder.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reminder.customerEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {reminder.serviceName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(reminder.nextAppointmentDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(reminder)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(reminder)}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PetsIcon color="primary" />
            Chi tiết Nhắc hẹn
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReminder && (
            <List>
              <ListItem>
                <ListItemIcon><PetsIcon /></ListItemIcon>
                <ListItemText 
                  primary="Thú cưng" 
                  secondary={selectedReminder.petName}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText 
                  primary="Khách hàng" 
                  secondary={`${selectedReminder.customerName} (${selectedReminder.customerEmail})`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><ScheduleIcon /></ListItemIcon>
                <ListItemText 
                  primary="Dịch vụ tái khám" 
                  secondary={selectedReminder.serviceName}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><ScheduleIcon /></ListItemIcon>
                <ListItemText 
                  primary="Ngày hẹn" 
                  secondary={formatDate(selectedReminder.nextAppointmentDate)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><NotificationsIcon /></ListItemIcon>
                <ListItemText 
                  primary="Trạng thái" 
                  secondary={selectedReminder.reminderSent ? "Đã gửi" : "Chưa gửi"}
                />
              </ListItem>
              {selectedReminder.reminderNote && (
                <>
                  <Divider />
                  <ListItem>
                    <ListItemText 
                      primary="Ghi chú nhắc hẹn" 
                      secondary={selectedReminder.reminderNote}
                    />
                  </ListItem>
                </>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RemindersPage;
