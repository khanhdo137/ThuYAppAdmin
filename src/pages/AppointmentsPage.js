import { 
  Add as AddIcon, 
  CalendarToday, 
  Refresh,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  TextField,
  Grid
} from '@mui/material';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { DataTable, DeleteConfirmDialog, PageTemplate, SearchFilterBar } from '../components';
import {
  APPOINTMENT_DIALOG_MODES,
  APPOINTMENT_SEARCH_PLACEHOLDER,
  APPOINTMENT_STATUS_FILTERS,
  APPOINTMENT_STATUS_FILTER_LABELS,
  AppointmentDialog,
  getAppointmentTableColumns,
  useAppointmentForm,
  useAppointments
} from '../components/Appointment';
import { useNotifications } from '../context/NotificationContext';
import excelExportService from '../services/excelExportService';
import { appointmentService } from '../services';
import { useToast } from '../components/ToastProvider';

const AppointmentsPage = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState({ fromDate: '', toDate: '' });

  // Excel Preview Dialog states
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewDateFilter, setPreviewDateFilter] = useState({ fromDate: '', toDate: '' });

  // Get notifications context
  const { refreshNotifications } = useNotifications();
  const toast = useToast();

  // Use custom hooks for state management
  const {
    appointments, pets, services, customers, doctors,
    loading, error, searchTerm, statusFilter, pagination,
    handleSearch: performSearch, handleStatusFilter, handlePageChange, handleLimitChange,
    createAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment,
    setError,
    fetchData
  } = useAppointments();

  const {
    dialogOpen, dialogMode, selectedAppointment,
    formData, formErrors,
    openDialog, closeDialog, handleFormChange,
    validateForm, getSubmissionData
  } = useAppointmentForm({ pets });

  // Use useRef to store timeout ID to avoid re-renders
  const searchTimeoutRef = useRef(null);

  // Debounced search handler with useCallback
  const handleSearch = useCallback((searchValue) => {
    // Update local search term immediately for instant UI feedback
    setLocalSearchTerm(searchValue);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced API call
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchValue || '');
    }, 600); // Increased to 600ms for better performance
  }, [performSearch]);

  // Handle form submission with useCallback
  const handleCreateAppointment = useCallback(async () => {
    if (!validateForm()) return;
    
    const result = await createAppointment(getSubmissionData());
    if (result.success) {
      closeDialog();
    }
  }, [validateForm, createAppointment, getSubmissionData, closeDialog]);

  const handleUpdateAppointment = useCallback(async () => {
    if (!validateForm()) return;
    
    const appointmentId = selectedAppointment.AppointmentId || selectedAppointment.appointmentId;
    const result = await updateAppointment(appointmentId, getSubmissionData());
    if (result.success) {
      closeDialog();
    }
  }, [validateForm, selectedAppointment, updateAppointment, getSubmissionData, closeDialog]);

  const handleDeleteClick = useCallback((appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!appointmentToDelete) return;
    
    const appointmentId = appointmentToDelete.AppointmentId || appointmentToDelete.appointmentId;
    await deleteAppointment(appointmentId);
    setDeleteDialogOpen(false);
    setAppointmentToDelete(null);
  }, [appointmentToDelete, deleteAppointment]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Trigger a refresh of appointments data
      await performSearch(searchTerm || '');
    } finally {
      setRefreshing(false);
    }
  }, [performSearch, searchTerm]);

  // Function để mở preview dialog
  const handleOpenPreview = useCallback(async () => {
    try {
      // Nếu đang lọc dữ liệu theo khoảng thời gian, lấy toàn bộ dữ liệu
      let exportData = appointments;
      
      if (dateFilter.fromDate || dateFilter.toDate) {
        toast.showInfo('Đang tải toàn bộ dữ liệu...');
        // Gọi appointmentService trực tiếp để lấy tất cả dữ liệu
        const response = await appointmentService.getAllAppointments(1, 10000);
        exportData = response.appointments || [];
      }

      if (!exportData || exportData.length === 0) {
        toast.showError('Không có dữ liệu để xuất');
        return;
      }

      const columns = [
        { key: 'appointmentId', label: 'ID' },
        { key: 'customerName', label: 'Khách hàng' },
        { key: 'petName', label: 'Thú cưng' },
        { key: 'serviceName', label: 'Dịch vụ' },
        { key: 'doctorName', label: 'Bác sĩ' },
        { key: 'appointmentDate', label: 'Ngày hẹn' },
        { key: 'appointmentTime', label: 'Giờ hẹn' },
        { key: 'statusText', label: 'Trạng thái' },
        { key: 'notes', label: 'Ghi chú' }
      ];

      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `LichKham_${currentDate}`;

      setPreviewData(exportData);
      setPreviewColumns(columns);
      setPreviewFileName(fileName);
      setPreviewDateFilter({ fromDate: dateFilter.fromDate || '', toDate: dateFilter.toDate || '' }); // Copy filter từ page
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error('Error preparing preview:', error);
      toast.showError('Lỗi khi chuẩn bị dữ liệu: ' + (error.message || 'Unknown error'));
    }
  }, [appointments, dateFilter, toast, appointmentService]);

  // Function để filter dữ liệu theo date range
  const filterDataByDateRange = useCallback((data) => {
    if (!previewDateFilter.fromDate && !previewDateFilter.toDate) {
      return data;
    }

    return data.filter(row => {
      const rowDate = row.appointmentDate || row.AppointmentDate || '';
      if (!rowDate) return false;

      const date = new Date(rowDate);
      const fromDate = previewDateFilter.fromDate ? new Date(previewDateFilter.fromDate) : null;
      const toDate = previewDateFilter.toDate ? new Date(previewDateFilter.toDate) : null;

      if (fromDate && date < fromDate) return false;
      if (toDate) {
        const toDateEnd = new Date(toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        if (date > toDateEnd) return false;
      }
      return true;
    });
  }, [previewDateFilter]);

  // Function để xuất Excel sau khi preview
  const handleConfirmExport = useCallback(async () => {
    try {
      const filteredData = filterDataByDateRange(previewData);
      await excelExportService.exportTableToExcel(filteredData, previewColumns, previewFileName, 'Lịch hẹn');
      toast.showSuccess('Xuất Excel thành công!');
      setPreviewDialogOpen(false);
    } catch (error) {
      console.error('Error exporting appointments:', error);
      toast.showError('Lỗi khi xuất Excel: ' + (error.message || 'Unknown error'));
    }
  }, [previewData, previewColumns, previewFileName, filterDataByDateRange, toast]);

  // Wrapped status update to refresh notifications
  const handleStatusUpdate = useCallback(async (...args) => {
    const result = await updateAppointmentStatus(...args);
    // Refresh notifications after status update
    await refreshNotifications();
    return result;
  }, [updateAppointmentStatus, refreshNotifications]);

  // Function để filter appointments theo date range
  const filteredAppointments = useMemo(() => {
    if (!dateFilter.fromDate && !dateFilter.toDate) {
      return appointments;
    }

    return appointments.filter(appointment => {
      const appointmentDate = appointment.appointmentDate || appointment.AppointmentDate || '';
      if (!appointmentDate) return false;

      const date = new Date(appointmentDate);
      const fromDate = dateFilter.fromDate ? new Date(dateFilter.fromDate) : null;
      const toDate = dateFilter.toDate ? new Date(dateFilter.toDate) : null;

      if (fromDate && date < fromDate) return false;
      if (toDate) {
        const toDateEnd = new Date(toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        if (date > toDateEnd) return false;
      }
      return true;
    });
  }, [appointments, dateFilter]);

  // Memoize table columns to prevent unnecessary re-renders
  const columns = useMemo(() => getAppointmentTableColumns({
    pets,
    services, 
    customers,
    doctors,
    onStatusUpdate: handleStatusUpdate
  }), [pets, services, customers, doctors, handleStatusUpdate]);

  // Status filter options for tabs with icons
  const statusTabs = [
    { 
      label: APPOINTMENT_STATUS_FILTER_LABELS[APPOINTMENT_STATUS_FILTERS.ALL], 
      value: APPOINTMENT_STATUS_FILTERS.ALL,
      icon: <CalendarToday />,
      color: 'default'
    },
    { 
      label: APPOINTMENT_STATUS_FILTER_LABELS[APPOINTMENT_STATUS_FILTERS.PENDING], 
      value: APPOINTMENT_STATUS_FILTERS.PENDING,
      icon: <Pending />,
      color: 'warning'
    },
    { 
      label: APPOINTMENT_STATUS_FILTER_LABELS[APPOINTMENT_STATUS_FILTERS.CONFIRMED], 
      value: APPOINTMENT_STATUS_FILTERS.CONFIRMED,
      icon: <Schedule />,
      color: 'info'
    },
    { 
      label: APPOINTMENT_STATUS_FILTER_LABELS[APPOINTMENT_STATUS_FILTERS.COMPLETED], 
      value: APPOINTMENT_STATUS_FILTERS.COMPLETED,
      icon: <CheckCircle />,
      color: 'success'
    },
    { 
      label: APPOINTMENT_STATUS_FILTER_LABELS[APPOINTMENT_STATUS_FILTERS.CANCELLED], 
      value: APPOINTMENT_STATUS_FILTERS.CANCELLED,
      icon: <Cancel />,
      color: 'error'
    }
  ];

  if (loading && appointments.length === 0) {
    return (
      <PageTemplate title="Quản lý lịch hẹn" subtitle="Quản lý lịch hẹn khám bệnh cho thú cưng">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Quản lý lịch hẹn" subtitle="Quản lý lịch hẹn khám bệnh cho thú cưng">
      <Fade in={true} timeout={600}>
        <Box>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
              }} 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Main Content Card */}
          <Paper sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {/* Header */}
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Danh sách lịch hẹn
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tổng cộng {filteredAppointments.length} / {appointments.length} lịch hẹn
                    {(dateFilter.fromDate || dateFilter.toDate) && ' (đã lọc)'}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Tooltip title="Xuất Excel">
                    <IconButton
                      onClick={handleOpenPreview}
                      disabled={appointments.length === 0}
                      sx={{
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <FileDownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Làm mới">
                    <IconButton
                      onClick={handleRefresh}
                      disabled={refreshing}
                      sx={{
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <Refresh sx={{ 
                        animation: refreshing ? 'spin 1s linear infinite' : 'none',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }} />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openDialog(APPOINTMENT_DIALOG_MODES.CREATE)}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    Thêm lịch hẹn
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
              {/* Status Filter Tabs */}
              <Paper sx={{ 
                mb: 3, 
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Tabs 
                  value={statusFilter} 
                  onChange={(e, newValue) => handleStatusFilter(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      minHeight: 60,
                      fontWeight: 500,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        borderRadius: 1
                      }
                    }
                  }}
                >
                  {statusTabs.map((tab) => (
                    <Tab 
                      key={tab.value} 
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          {tab.icon}
                          <span>{tab.label}</span>
                        </Box>
                      } 
                      value={tab.value} 
                    />
                  ))}
                </Tabs>
              </Paper>

              <SearchFilterBar
                searchValue={localSearchTerm}
                onSearchChange={handleSearch}
                placeholder={APPOINTMENT_SEARCH_PLACEHOLDER}
              />

              {/* Date Filter */}
              <Paper sx={{ mt: 2, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: '120px' }}>
                    Lọc theo ngày:
                  </Typography>
                  <TextField
                    label="Từ ngày"
                    type="date"
                    value={dateFilter.fromDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, fromDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 180 }}
                    size="small"
                  />
                  <TextField
                    label="Đến ngày"
                    type="date"
                    value={dateFilter.toDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, toDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 180 }}
                    size="small"
                  />
                  {(dateFilter.fromDate || dateFilter.toDate) && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setDateFilter({ fromDate: '', toDate: '' })}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                  <Chip 
                    label={`Hiển thị: ${filteredAppointments.length} / ${appointments.length}`}
                    color="primary"
                    size="small"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
              </Paper>

              <Slide direction="up" in={true} timeout={800}>
                <Box sx={{ mt: 3 }}>
                  <DataTable
                    columns={columns}
                    data={filteredAppointments}
                    loading={loading}
                    emptyMessage="Không có lịch hẹn nào"
                    onView={(row) => openDialog(APPOINTMENT_DIALOG_MODES.VIEW, row)}
                    onEdit={(row) => openDialog(APPOINTMENT_DIALOG_MODES.EDIT, row)}
                    onDelete={handleDeleteClick}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </Box>
              </Slide>
            </Box>
          </Paper>
        </Box>
      </Fade>

      <AppointmentDialog
        open={dialogOpen} 
        onClose={closeDialog}
        dialogMode={dialogMode}
        formData={formData}
        formErrors={formErrors}
        onFormChange={handleFormChange}
        onCreate={handleCreateAppointment}
        onUpdate={handleUpdateAppointment}
        loading={loading}
        pets={pets}
        services={services}
        doctors={doctors}
        customers={customers}
        feedback={[]} // Can fetch feedback data based on appointmentId
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAppointmentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={loading}
        title="Xác nhận xóa"
      />

      {/* Excel Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#2e7d32',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileDownloadIcon />
            <Typography variant="h6" component="span">
              Xem trước dữ liệu Excel
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Tên file: {previewFileName}.xlsx
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {/* Date Filter */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Lọc theo khoảng thời gian
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={previewDateFilter.fromDate}
                  onChange={(e) => setPreviewDateFilter(prev => ({ ...prev, fromDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={previewDateFilter.toDate}
                  onChange={(e) => setPreviewDateFilter(prev => ({ ...prev, toDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>

          {previewData.length > 0 && (
            <Box sx={{ p: 2, maxHeight: '60vh', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Lịch hẹn
                </Typography>
                <Chip 
                  label={`${filterDataByDateRange(previewData).length} / ${previewData.length} dòng`}
                  color="primary"
                  size="small"
                />
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {previewColumns.map((col, colIndex) => (
                        <TableCell 
                          key={colIndex}
                          sx={{ 
                            fontWeight: 600,
                            bgcolor: 'grey.100'
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filterDataByDateRange(previewData).slice(0, 50).map((row, rowIndex) => (
                      <TableRow key={rowIndex} hover>
                        {previewColumns.map((col, colIndex) => (
                          <TableCell key={colIndex}>
                            {row[col.key] !== null && row[col.key] !== undefined 
                              ? String(row[col.key]) 
                              : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {filterDataByDateRange(previewData).length > 50 && (
                      <TableRow>
                        <TableCell 
                          colSpan={previewColumns.length}
                          align="center"
                          sx={{ 
                            fontStyle: 'italic',
                            color: 'text.secondary',
                            py: 2
                          }}
                        >
                          ... và {filterDataByDateRange(previewData).length - 50} dòng khác
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                Hiển thị {Math.min(50, filterDataByDateRange(previewData).length)} / {filterDataByDateRange(previewData).length} dòng
                {previewDateFilter.fromDate || previewDateFilter.toDate ? ' (đã lọc)' : ''}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider />
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setPreviewDialogOpen(false)}
            variant="outlined"
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmExport}
            variant="contained"
            startIcon={<FileDownloadIcon />}
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Tải file Excel
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
};

export default AppointmentsPage; 