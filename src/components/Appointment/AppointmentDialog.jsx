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
import AppointmentDetailView from './AppointmentDetailView';

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
  customers,
  feedback = [] // Feedback for view mode
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
      maxWidth={isViewMode ? "md" : "md"}
      fullWidth={!isViewMode}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          ...(isViewMode && {
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(255,255,255,1))',
            backdropFilter: 'blur(10px)',
            width: '700px',
            maxWidth: '95vw'
          })
        }
      }}
    >
      {!isViewMode && (
        <DialogTitle>
          {getDialogTitle()}
        </DialogTitle>
      )}
      
      <DialogContent sx={{ 
        p: 0,
        ...(isViewMode && { 
          overflow: 'auto',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
            '&:hover': {
              background: '#555',
            },
          },
        }),
        ...(!isViewMode && { pt: 1 })
      }}>
        {isViewMode ? (
          <AppointmentDetailView 
            appointment={formData}
            feedback={feedback}
          />
        ) : (
        <Box display="flex" flexDirection="column" gap={2} px={3}>
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
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 2.5,
        borderTop: isViewMode ? '1px solid rgba(0,0,0,0.08)' : 'none',
        background: isViewMode ? 'rgba(248, 249, 250, 0.8)' : 'transparent'
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant={isViewMode ? "contained" : "text"}
          sx={{
            ...(isViewMode && {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              }
            })
          }}
        >
          {isViewMode ? 'Đóng' : 'Hủy'}
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