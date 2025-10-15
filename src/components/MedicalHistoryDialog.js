import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    TextField,
    Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { vi } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';

const MedicalHistoryDialog = ({
  open,
  onClose,
  onSave,
  appointmentData,
  existingMedicalHistory = null,
  isEdit = false,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    petId: '',
    recordDate: new Date(),
    description: '',
    treatment: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Test data for debugging
  const testData = existingMedicalHistory ? {
    HistoryId: existingMedicalHistory.HistoryId,
    PetId: existingMedicalHistory.PetId,
    RecordDate: existingMedicalHistory.RecordDate,
    Description: existingMedicalHistory.Description,
    Treatment: existingMedicalHistory.Treatment,
    Notes: existingMedicalHistory.Notes
  } : null;

  console.log('MedicalHistoryDialog test data:', testData);

  // Auto-fill dữ liệu khi có appointmentData hoặc existingMedicalHistory
  useEffect(() => {
    console.log('MedicalHistoryDialog useEffect:', { 
      open, 
      isEdit, 
      existingMedicalHistory: existingMedicalHistory ? 'exists' : 'null', 
      appointmentData: appointmentData ? 'exists' : 'null' 
    });

    if (open) {
      if (isEdit && existingMedicalHistory) {
        // Chế độ chỉnh sửa - điền dữ liệu từ hồ sơ bệnh án có sẵn
        console.log('Setting edit mode with existing data');
        
        const newFormData = {
          petId: existingMedicalHistory.PetId || existingMedicalHistory.petId || '',
          recordDate: existingMedicalHistory.RecordDate 
            ? new Date(existingMedicalHistory.RecordDate) 
            : existingMedicalHistory.recordDate 
              ? new Date(existingMedicalHistory.recordDate)
              : new Date(),
          description: existingMedicalHistory.Description || existingMedicalHistory.description || '',
          treatment: existingMedicalHistory.Treatment || existingMedicalHistory.treatment || '',
          notes: existingMedicalHistory.Notes || existingMedicalHistory.notes || ''
        };
        
        console.log('Setting form data for edit:', newFormData);
        setFormData(newFormData);
        
      } else if (appointmentData) {
        // Chế độ tạo mới - điền dữ liệu từ appointment
        console.log('Setting create mode with appointment data');
        
        const newFormData = {
          petId: appointmentData.PetId || appointmentData.petId || '',
          recordDate: new Date(),
          description: `Khám bệnh định kỳ - Dịch vụ: ${appointmentData.ServiceName || appointmentData.serviceName || ''}`,
          treatment: '',
          notes: appointmentData.Notes || appointmentData.notes || ''
        };
        
        console.log('Setting form data for create:', newFormData);
        setFormData(newFormData);
        
      } else {
        // Reset form nếu không có dữ liệu
        console.log('Resetting form data - no appointment data or medical history');
        setFormData({
          petId: '',
          recordDate: new Date(),
          description: '',
          treatment: '',
          notes: ''
        });
      }
      
      setErrors({});
    } else {
      // Reset form khi dialog đóng
      setFormData({
        petId: '',
        recordDate: new Date(),
        description: '',
        treatment: '',
        notes: ''
      });
      setErrors({});
    }
  }, [open, isEdit, existingMedicalHistory, appointmentData]);

  // Separate effect to watch for existingMedicalHistory changes when dialog is already open
  useEffect(() => {
    if (open && isEdit && existingMedicalHistory) {
      console.log('ExistingMedicalHistory changed, updating form');
      const newFormData = {
        petId: existingMedicalHistory.PetId || existingMedicalHistory.petId || '',
        recordDate: existingMedicalHistory.RecordDate 
          ? new Date(existingMedicalHistory.RecordDate) 
          : existingMedicalHistory.recordDate 
            ? new Date(existingMedicalHistory.recordDate)
            : new Date(),
        description: existingMedicalHistory.Description || existingMedicalHistory.description || '',
        treatment: existingMedicalHistory.Treatment || existingMedicalHistory.treatment || '',
        notes: existingMedicalHistory.Notes || existingMedicalHistory.notes || ''
      };
      setFormData(newFormData);
    }
  }, [existingMedicalHistory, open, isEdit]);

  // Log để debug formData khi thay đổi (chỉ khi có dữ liệu thực sự)
  useEffect(() => {
    if (formData.description || formData.treatment || formData.notes) {
      console.log('Form data changed:', formData);
    }
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Xóa lỗi khi người dùng nhập
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description?.trim()) {
      newErrors.description = 'Mô tả bệnh án là bắt buộc';
    }

    if (!formData.treatment?.trim()) {
      newErrors.treatment = 'Phương pháp điều trị là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    console.log('Closing MedicalHistoryDialog');
    // Reset form về trạng thái ban đầu
    setFormData({
      petId: '',
      recordDate: new Date(),
      description: '',
      treatment: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const dialogTitle = isEdit ? 'Cập nhật hồ sơ bệnh án' : 'Tạo hồ sơ bệnh án';
  const dialogSubtitle = isEdit 
    ? 'Chỉnh sửa thông tin khám bệnh và điều trị cho thú cưng'
    : 'Nhập thông tin khám bệnh và điều trị cho thú cưng';
  const saveButtonText = isEdit ? 'Cập nhật hồ sơ bệnh án' : 'Lưu hồ sơ bệnh án';

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {dialogTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {dialogSubtitle}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Thông tin appointment */}
          {appointmentData && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Thông tin lịch hẹn
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Thú cưng:</strong> {appointmentData.PetName || appointmentData.petName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Chủ sở hữu:</strong> {appointmentData.CustomerName || appointmentData.customerName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Dịch vụ:</strong> {appointmentData.ServiceName || appointmentData.serviceName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Bác sĩ:</strong> {appointmentData.DoctorName || appointmentData.doctorName}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Thông tin hồ sơ bệnh án hiện có nếu là chế độ chỉnh sửa */}
          {isEdit && existingMedicalHistory && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                Hồ sơ bệnh án hiện có
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {existingMedicalHistory.HistoryId || existingMedicalHistory.historyId} | 
                Ngày tạo: {new Date(existingMedicalHistory.RecordDate || existingMedicalHistory.recordDate).toLocaleDateString('vi-VN')}
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 3 }} />

          {/* Form nhập liệu */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <DatePicker
                  label="Ngày khám"
                  value={formData.recordDate}
                  onChange={(newValue) => handleChange('recordDate', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Mô tả bệnh án"
                multiline
                rows={4}
                fullWidth
                required
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Nhập mô tả triệu chứng, chẩn đoán bệnh..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Phương pháp điều trị"
                multiline
                rows={4}
                fullWidth
                required
                value={formData.treatment}
                onChange={(e) => handleChange('treatment', e.target.value)}
                error={!!errors.treatment}
                helperText={errors.treatment}
                placeholder="Nhập phương pháp điều trị, thuốc sử dụng..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Ghi chú thêm"
                multiline
                rows={3}
                fullWidth
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Ghi chú thêm về quá trình khám và điều trị..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={loading}
        >
          {loading ? (isEdit ? 'Đang cập nhật...' : 'Đang lưu...') : saveButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicalHistoryDialog; 