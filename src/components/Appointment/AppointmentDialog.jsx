import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField
} from '@mui/material';
import React from 'react';
import {
  APPOINTMENT_DIALOG_MODES,
  APPOINTMENT_TIME_SLOTS
} from './appointmentConstants';
import { formatPetDisplay, formatServiceDisplay } from './appointmentUtils';

const AppointmentDialog = ({
  open,
  onClose,
  dialogMode,
  formData,
  formErrors,
  onFormChange,
  onCreate,
  onUpdate,
  loading,
  pets,
  services,
  doctors,
  customers
}) => {
  const isViewMode = dialogMode === APPOINTMENT_DIALOG_MODES.VIEW;
  const isCreateMode = dialogMode === APPOINTMENT_DIALOG_MODES.CREATE;
  const isEditMode = dialogMode === APPOINTMENT_DIALOG_MODES.EDIT;

  const handleSubmit = () => {
    if (isCreateMode) {
      onCreate();
    } else if (isEditMode) {
      onUpdate();
    }
  };

  const getDialogTitle = () => {
    switch (dialogMode) {
      case APPOINTMENT_DIALOG_MODES.CREATE:
        return 'Thêm lịch hẹn mới';
      case APPOINTMENT_DIALOG_MODES.EDIT:
        return 'Chỉnh sửa lịch hẹn';
      case APPOINTMENT_DIALOG_MODES.VIEW:
        return 'Thông tin lịch hẹn';
      default:
        return '';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {getDialogTitle()}
      </DialogTitle>
      
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          {/* Pet Selection */}
          <TextField
            label="Thú cưng"
            select
            value={formData.petId}
            onChange={(e) => onFormChange('petId', e.target.value)}
            error={!!formErrors.petId}
            helperText={formErrors.petId}
            disabled={isViewMode}
            fullWidth
            required
          >
            {pets && pets.map((pet) => {
              const petId = pet.PetId || pet.petId;
              return (
                <MenuItem key={petId} value={petId}>
                  {formatPetDisplay(pet, customers)}
                </MenuItem>
              );
            })}
          </TextField>
          
          {/* Service Selection */}
          <TextField
            label="Dịch vụ"
            select
            value={formData.serviceId}
            onChange={(e) => onFormChange('serviceId', e.target.value)}
            error={!!formErrors.serviceId}
            helperText={formErrors.serviceId}
            disabled={isViewMode}
            fullWidth
            required
          >
            {services && services.map((service) => {
              const serviceId = service.ServiceId || service.serviceId;
              return (
                <MenuItem key={serviceId} value={serviceId}>
                  {formatServiceDisplay(service)}
                </MenuItem>
              );
            })}
          </TextField>

          {/* Doctor Selection */}
          <TextField
            label="Bác sĩ"
            select
            value={formData.doctorId}
            onChange={(e) => onFormChange('doctorId', e.target.value)}
            error={!!formErrors.doctorId}
            helperText={formErrors.doctorId}
            disabled={isViewMode}
            fullWidth
          >
            <MenuItem value="">Chưa chọn bác sĩ</MenuItem>
            {doctors && doctors.map((doctor) => {
              const doctorId = doctor.DoctorId || doctor.doctorId;
              const doctorName = doctor.FullName || doctor.fullName || doctor.DoctorName || doctor.doctorName;
              return (
                <MenuItem key={doctorId} value={doctorId}>
                  {doctorName}
                </MenuItem>
              );
            })}
          </TextField>

          {/* Appointment Date */}
          <TextField
            label="Ngày hẹn"
            type="date"
            value={formData.appointmentDate}
            onChange={(e) => onFormChange('appointmentDate', e.target.value)}
            error={!!formErrors.appointmentDate}
            helperText={formErrors.appointmentDate}
            disabled={isViewMode}
            fullWidth
            required
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: new Date().toISOString().split('T')[0] // Prevent past dates
            }}
          />

          {/* Appointment Time */}
          <TextField
            label="Giờ hẹn"
            select
            value={formData.appointmentTime}
            onChange={(e) => onFormChange('appointmentTime', e.target.value)}
            error={!!formErrors.appointmentTime}
            helperText={formErrors.appointmentTime}
            disabled={isViewMode}
            fullWidth
            required
          >
            {APPOINTMENT_TIME_SLOTS.map((time) => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </TextField>

          {/* Pet Age */}
          <TextField
            label="Tuổi thú cưng"
            type="number"
            value={formData.age}
            InputProps={{
              readOnly: true,
            }}
            disabled={true}
            fullWidth
            helperText="Tuổi được tự động điền khi chọn thú cưng"
          />

          {/* Notes */}
          <TextField
            label="Ghi chú"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => onFormChange('notes', e.target.value)}
            disabled={isViewMode}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        {!isViewMode && (
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Lưu'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDialog; 