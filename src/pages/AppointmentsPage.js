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
import React, { useState } from 'react';
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

  // Use custom hooks for state management
  const {
    appointments, pets, services, customers, doctors,
    loading, error, searchTerm, statusFilter,
    handleSearch: performSearch, handleStatusFilter,
    createAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment,
    setError
  } = useAppointments();

  const {
    dialogOpen, dialogMode, selectedAppointment,
    formData, formErrors,
    openDialog, closeDialog, handleFormChange,
    validateForm, getSubmissionData
  } = useAppointmentForm({ pets });

  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearch = (searchValue) => {
    console.log('handleSearch called with:', searchValue);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      performSearch(searchValue || '');
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  };

  // Handle form submission
  const handleCreateAppointment = async () => {
    if (!validateForm()) return;
    
    const result = await createAppointment(getSubmissionData());
    if (result.success) {
      closeDialog();
    }
  };

  const handleUpdateAppointment = async () => {
    if (!validateForm()) return;
    
    const appointmentId = selectedAppointment.AppointmentId || selectedAppointment.appointmentId;
    const result = await updateAppointment(appointmentId, getSubmissionData());
    if (result.success) {
      closeDialog();
    }
  };

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;
    
    const appointmentId = appointmentToDelete.AppointmentId || appointmentToDelete.appointmentId;
    await deleteAppointment(appointmentId);
    setDeleteDialogOpen(false);
    setAppointmentToDelete(null);
  };

  // Get table columns with handlers
  const columns = getAppointmentTableColumns({
    pets,
    services, 
    customers,
    doctors,
    onStatusUpdate: updateAppointmentStatus
  });

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
          searchValue={searchTerm}
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