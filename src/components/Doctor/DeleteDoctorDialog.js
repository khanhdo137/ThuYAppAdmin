import {
    LocalHospital as DoctorIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Typography
} from '@mui/material';
import React from 'react';
import { doctorService } from '../../services';
import { getExperienceChip, getSpecializationChip } from './DoctorTable';

const DeleteDoctorDialog = ({
  open,
  onClose,
  onConfirm,
  doctor,
  loading
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle 
        id="delete-dialog-title"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          color: 'error.main',
          pb: 1
        }}
      >
        <WarningIcon color="error" />
        Xác nhận xóa bác sĩ
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText id="delete-dialog-description" sx={{ mb: 2 }}>
          Bạn có chắc chắn muốn xóa bác sĩ này khỏi hệ thống? Hành động này không thể hoàn tác.
        </DialogContentText>
        
        {doctor && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Thông tin bác sĩ sẽ bị xóa:
            </Typography>
            
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: 'grey.50', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'error.light' }}>
                  <DoctorIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {doctor.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doctorService.getSpecializationLabel(doctor.specialization)}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                {getSpecializationChip(doctor.specialization)}
                {getExperienceChip(doctor.experienceYears)}
                <Chip 
                  label={doctorService.getBranchOptions()
                    .find(opt => opt.value === doctor.branch)?.shortLabel || doctor.branch}
                  size="small"
                  color="default"
                />
              </Box>
            </Box>
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Lưu ý:</strong> Việc xóa bác sĩ có thể ảnh hưởng đến:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                <li>Lịch hẹn đã đặt với bác sĩ này</li>
                <li>Lịch sử khám bệnh liên quan</li>
                <li>Báo cáo và thống kê hệ thống</li>
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          color="inherit"
        >
          Hủy bỏ
        </Button>
        <Button 
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="error"
          startIcon={loading ? <CircularProgress size={20} /> : <WarningIcon />}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Đang xóa...' : 'Xóa bác sĩ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDoctorDialog; 