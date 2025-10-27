import { Add as AddIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Typography
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

const AppointmentsPage = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Use custom hooks for state management
  const {
    appointments, pets, services, customers, doctors,
    loading, error, searchTerm, statusFilter, pagination,
    handleSearch: performSearch, handleStatusFilter, handlePageChange, handleLimitChange,
    createAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment,
    setError
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

  // Memoize table columns to prevent unnecessary re-renders
  const columns = useMemo(() => getAppointmentTableColumns({
    pets,
    services, 
    customers,
    doctors,
    onStatusUpdate: updateAppointmentStatus
  }), [pets, services, customers, doctors, updateAppointmentStatus]);

  // Status filter options for tabs
  const statusTabs = [
    { label: APPOINTMENT_STATUS_FILTER_LABELS[APPOINTMENT_STATUS_FILTERS.ALL], value: APPOINTMENT_STATUS_FILTERS.ALL },
    { label: APPOINTMENT_STATUS_FILTER_LABELS[APPOINTMENT_STATUS_FILTERS.PENDING], value: APPOINTMENT_STATUS_FILTERS.PENDING },
    { label: APPOINTMENT_STATUS_FILTER_LABELS[APPOINTMENT_STATUS_FILTERS.CONFIRMED], value: APPOINTMENT_STATUS_FILTERS.CONFIRMED },
    { label: APPOINTMENT_STATUS_FILTER_LABELS[APPOINTMENT_STATUS_FILTERS.COMPLETED], value: APPOINTMENT_STATUS_FILTERS.COMPLETED },
    { label: APPOINTMENT_STATUS_FILTER_LABELS[APPOINTMENT_STATUS_FILTERS.CANCELLED], value: APPOINTMENT_STATUS_FILTERS.CANCELLED }
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Danh sách lịch hẹn ({appointments.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog(APPOINTMENT_DIALOG_MODES.CREATE)}
          >
            Thêm lịch hẹn
          </Button>
        </Box>

        {/* Status Filter Tabs */}
        <Tabs 
          value={statusFilter} 
          onChange={(e, newValue) => handleStatusFilter(newValue)}
          sx={{ mb: 2 }}
        >
          {statusTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>

        <SearchFilterBar
          searchValue={localSearchTerm}
          onSearchChange={handleSearch}
          placeholder={APPOINTMENT_SEARCH_PLACEHOLDER}
        />

        <DataTable
          columns={columns}
          data={appointments}
          loading={loading}
          emptyMessage="Không có lịch hẹn nào"
          onView={(row) => openDialog(APPOINTMENT_DIALOG_MODES.VIEW, row)}
          onEdit={(row) => openDialog(APPOINTMENT_DIALOG_MODES.EDIT, row)}
          onDelete={handleDeleteClick}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </Paper>

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
    </PageTemplate>
  );
};

export default AppointmentsPage; 