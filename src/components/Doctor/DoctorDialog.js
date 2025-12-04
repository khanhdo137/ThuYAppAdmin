import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography
} from '@mui/material';
import React from 'react';
import { doctorService } from '../../services';
import DoctorForm from './DoctorForm';
import { getExperienceChip, getSpecializationChip } from './DoctorTable';

const DoctorDialog = ({
  open,
  onClose,
  dialogMode,
  formData,
  formErrors,
  onFormChange,
  onCreate,
  onUpdate,
  loading,
  selectedDoctor
}) => {
  const renderViewMode = () => {
    if (!selectedDoctor) return null;
    
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom>
          {selectedDoctor.fullName}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Chuyên khoa:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getSpecializationChip(selectedDoctor.specialization)}
              <Typography variant="body2" color="text.secondary">
                {doctorService.getSpecializationOptions()
                  .find(opt => opt.value === selectedDoctor.specialization)?.description || ''}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Kinh nghiệm:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">
                {doctorService.formatExperience(selectedDoctor.experienceYears)}
              </Typography>
              {getExperienceChip(selectedDoctor.experienceYears)}
            </Box>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Chi nhánh:
            </Typography>
            <Typography variant="body1">
              {doctorService.getBranchLabel(selectedDoctor.branch)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {doctorService.getBranchOptions()
                .find(opt => opt.value === selectedDoctor.branch)?.address || ''}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const getDialogTitle = () => {
    switch (dialogMode) {
      case 'create':
        return 'Thêm bác sĩ mới';
      case 'edit':
        return `Chỉnh sửa thông tin bác sĩ${selectedDoctor ? ` - ${selectedDoctor.fullName}` : ''}`;
      case 'view':
        return 'Thông tin bác sĩ';
      default:
        return 'Quản lý bác sĩ';
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
        {dialogMode === 'view' ? renderViewMode() : (
          <DoctorForm
            formData={formData}
            formErrors={formErrors}
            onFormChange={onFormChange}
          />
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {dialogMode === 'view' ? 'Đóng' : 'Hủy'}
        </Button>
        {dialogMode === 'create' && (
          <Button 
            variant="contained" 
            onClick={onCreate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang thêm...' : 'Thêm bác sĩ'}
          </Button>
        )}
        {dialogMode === 'edit' && (
          <Button 
            variant="contained" 
            onClick={onUpdate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật bác sĩ'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DoctorDialog; 