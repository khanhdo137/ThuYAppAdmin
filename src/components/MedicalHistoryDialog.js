import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Card,
    CardContent,
    Avatar,
    Chip,
    Paper,
    Fade,
    Slide,
    IconButton,
    CircularProgress,
    Alert,
    Stack
} from '@mui/material';
import {
    MedicalServices,
    Pets,
    Person,
    CalendarToday,
    Notes,
    Healing,
    Schedule,
    Notifications,
    Edit,
    Save,
    Close
} from '@mui/icons-material';
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
  loading = false,
  services = [] // Danh sách dịch vụ để chọn dịch vụ tái khám
}) => {
  const [formData, setFormData] = useState({
    petId: '',
    doctorId: '',
    appointmentId: '',
    recordDate: new Date(),
    description: '',
    treatment: '',
    notes: '',
    nextAppointmentDate: null,
    nextAppointmentTime: '',
    nextServiceId: '',
    reminderNote: ''
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

  // console.log('MedicalHistoryDialog test data:', testData); // Removed to reduce console spam

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
          doctorId: existingMedicalHistory.DoctorId || existingMedicalHistory.doctorId || '',
          appointmentId: existingMedicalHistory.AppointmentId || existingMedicalHistory.appointmentId || '',
          recordDate: existingMedicalHistory.RecordDate 
            ? new Date(existingMedicalHistory.RecordDate) 
            : existingMedicalHistory.recordDate 
              ? new Date(existingMedicalHistory.recordDate)
              : new Date(),
          description: existingMedicalHistory.Description || existingMedicalHistory.description || '',
          treatment: existingMedicalHistory.Treatment || existingMedicalHistory.treatment || '',
          notes: existingMedicalHistory.Notes || existingMedicalHistory.notes || '',
          nextAppointmentDate: existingMedicalHistory.NextAppointmentDate || existingMedicalHistory.nextAppointmentDate
            ? new Date(existingMedicalHistory.NextAppointmentDate || existingMedicalHistory.nextAppointmentDate)
            : null,
          nextServiceId: existingMedicalHistory.NextServiceId || existingMedicalHistory.nextServiceId || '',
          reminderNote: existingMedicalHistory.ReminderNote || existingMedicalHistory.reminderNote || ''
        };
        
        console.log('Setting form data for edit:', newFormData);
        setFormData(newFormData);
        
      } else if (appointmentData) {
        // Chế độ tạo mới - điền dữ liệu từ appointment
        console.log('Setting create mode with appointment data:', appointmentData);
        console.log('DoctorId from appointmentData:', appointmentData.DoctorId || appointmentData.doctorId);
        
        const newFormData = {
          petId: appointmentData.PetId || appointmentData.petId || '',
          doctorId: appointmentData.DoctorId || appointmentData.doctorId || null,
          appointmentId: appointmentData.AppointmentId || appointmentData.appointmentId || '',
          recordDate: new Date(),
          description: `Khám bệnh định kỳ - Dịch vụ: ${appointmentData.ServiceName || appointmentData.serviceName || ''}`,
          treatment: '',
          notes: appointmentData.Notes || appointmentData.notes || '',
          nextAppointmentDate: null,
          nextAppointmentTime: '',
          nextServiceId: '',
          reminderNote: ''
        };
        
        console.log('Setting form data for create (doctorId):', newFormData.doctorId);
        setFormData(newFormData);
        
      } else {
        // Reset form nếu không có dữ liệu
        console.log('Resetting form data - no appointment data or medical history');
        setFormData({
          petId: '',
          doctorId: '',
          appointmentId: '',
          recordDate: new Date(),
          description: '',
          treatment: '',
          notes: '',
          nextAppointmentDate: null,
          nextAppointmentTime: '',
          nextServiceId: '',
          reminderNote: ''
        });
      }
      
      setErrors({});
    } else {
      // Reset form khi dialog đóng
      setFormData({
        petId: '',
        doctorId: '',
        appointmentId: '',
        recordDate: new Date(),
        description: '',
        treatment: '',
        notes: '',
        nextAppointmentDate: null,
        nextAppointmentTime: '',
        nextServiceId: '',
        reminderNote: ''
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
        doctorId: existingMedicalHistory.DoctorId || existingMedicalHistory.doctorId || '',
        appointmentId: existingMedicalHistory.AppointmentId || existingMedicalHistory.appointmentId || '',
        recordDate: existingMedicalHistory.RecordDate 
          ? new Date(existingMedicalHistory.RecordDate) 
          : existingMedicalHistory.recordDate 
            ? new Date(existingMedicalHistory.recordDate)
            : new Date(),
        description: existingMedicalHistory.Description || existingMedicalHistory.description || '',
        treatment: existingMedicalHistory.Treatment || existingMedicalHistory.treatment || '',
        notes: existingMedicalHistory.Notes || existingMedicalHistory.notes || '',
        nextAppointmentDate: existingMedicalHistory.NextAppointmentDate || existingMedicalHistory.nextAppointmentDate
          ? new Date(existingMedicalHistory.NextAppointmentDate || existingMedicalHistory.nextAppointmentDate)
          : null,
        nextServiceId: existingMedicalHistory.NextServiceId || existingMedicalHistory.nextServiceId || '',
        reminderNote: existingMedicalHistory.ReminderNote || existingMedicalHistory.reminderNote || ''
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
      doctorId: '',
      appointmentId: '',
      recordDate: new Date(),
      description: '',
      treatment: '',
      notes: '',
      nextAppointmentDate: null,
      nextAppointmentTime: '',
      nextServiceId: '',
      reminderNote: ''
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
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: 3,
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)',
            width: 48,
            height: 48
          }}>
            <MedicalServices sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {dialogTitle}
            </Typography>
            <Typography variant="body2" sx={{ 
              mt: 0.5,
              opacity: 0.9,
              fontWeight: 400
            }}>
              {dialogSubtitle}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Thông tin appointment */}
          {appointmentData && (
            <Fade in timeout={300}>
              <Card sx={{ 
                mb: 3, 
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '1px solid',
                borderColor: 'primary.200',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarToday sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                      Thông tin lịch hẹn
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                          <Pets sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            Thú cưng
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {appointmentData.PetName || appointmentData.petName}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ bgcolor: 'secondary.light', width: 32, height: 32 }}>
                          <Person sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            Chủ sở hữu
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {appointmentData.CustomerName || appointmentData.customerName}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                          <MedicalServices sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            Dịch vụ
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {appointmentData.ServiceName || appointmentData.serviceName}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
                          <Healing sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            Bác sĩ
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {appointmentData.DoctorName || appointmentData.doctorName}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Thông tin hồ sơ bệnh án hiện có nếu là chế độ chỉnh sửa */}
          {isEdit && existingMedicalHistory && (
            <Fade in timeout={400}>
              <Card sx={{ 
                mb: 3, 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: '1px solid',
                borderColor: 'info.200',
                borderRadius: 2
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Edit sx={{ color: 'info.main', fontSize: 20 }} />
                    <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                      Hồ sơ bệnh án hiện có
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip 
                      label={`ID: ${existingMedicalHistory.HistoryId || existingMedicalHistory.historyId}`}
                      color="info"
                      variant="outlined"
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo: {new Date(existingMedicalHistory.RecordDate || existingMedicalHistory.recordDate).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Form nhập liệu - Thông tin khám bệnh */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <CalendarToday sx={{ color: 'primary.main', fontSize: 24 }} />
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                Thông tin khám bệnh
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {/* Ngày khám */}
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                  <DatePicker
                    label="Ngày khám *"
                    value={formData.recordDate}
                    onChange={(newValue) => handleChange('recordDate', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Spacer để ngày khám nổi bật */}
              <Grid item xs={12} sm={6} />

              {/* Triệu chứng và chẩn đoán */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  1️⃣ Triệu chứng và Chẩn đoán *
                </Typography>
                <TextField
                  label="Mô tả triệu chứng, chẩn đoán bệnh"
                  multiline
                  rows={4}
                  fullWidth
                  required
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description || 'VD: Chó bị tiêu chảy 3 ngày, nôn mửa, mất nước. Nhiệt độ 39.5°C. Chẩn đoán: Viêm ruột cấp'}
                  placeholder="Nhập triệu chứng quan sát được: sốt, ho, nôn, tiêu chảy, da khô, chảy nước mũi, mắt..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Phương pháp điều trị */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  2️⃣ Phương pháp Điều trị *
                </Typography>
                <TextField
                  label="Phương pháp điều trị và thuốc sử dụng"
                  multiline
                  rows={4}
                  fullWidth
                  required
                  value={formData.treatment}
                  onChange={(e) => handleChange('treatment', e.target.value)}
                  error={!!errors.treatment}
                  helperText={errors.treatment || 'VD: Tiêm Metronidazole 10mg/kg, truyền dịch Ringer 200ml. Kê thuốc Smecta uống 3 lần/ngày'}
                  placeholder="Nhập phương pháp điều trị: tiêm, truyền dịch, phẫu thuật, thuốc uống, liều lượng..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Ghi chú thêm */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  3️⃣ Ghi chú thêm (Không bắt buộc)
                </Typography>
                <TextField
                  label="Lời dặn cho chủ và thông tin bổ sung"
                  multiline
                  rows={3}
                  fullWidth
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="VD: Cho ăn cháo loãng 3 ngày, tránh thức ăn cứng. Theo dõi phân, nếu còn tiêu chảy sau 2 ngày thì quay lại..."
                  helperText="Lời dặn chế độ ăn uống, chăm sóc, theo dõi tại nhà..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Phần lịch hẹn tái khám */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            mt: 3,
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
            border: '1px solid',
            borderColor: 'secondary.200'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Notifications sx={{ color: 'secondary.main', fontSize: 24 }} />
              <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 600 }}>
                Lịch hẹn tái khám & Nhắc hẹn
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ml: 4 }}>
              (Không bắt buộc - Để trống nếu không cần hẹn tái khám)
            </Typography>

            <Grid container spacing={3}>
              {/* Ngày hẹn tái khám */}
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  📅 Ngày hẹn tái khám
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                  <DatePicker
                    label="Chọn ngày hẹn tái khám"
                    value={formData.nextAppointmentDate}
                    onChange={(newValue) => handleChange('nextAppointmentDate', newValue)}
                    minDate={new Date()}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        helperText="VD: Hẹn tái khám sau 7 ngày"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'secondary.main',
                            },
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Giờ hẹn tái khám */}
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  🕐 Giờ hẹn
                </Typography>
                <TextField
                  label="Chọn giờ hẹn"
                  type="time"
                  fullWidth
                  value={formData.nextAppointmentTime}
                  onChange={(e) => handleChange('nextAppointmentTime', e.target.value)}
                  helperText="VD: 09:00, 14:30"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Dịch vụ tái khám */}
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  💉 Dịch vụ tái khám
                </Typography>
                <FormControl 
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                      },
                    },
                  }}
                >
                  <InputLabel>Chọn dịch vụ tái khám</InputLabel>
                  <Select
                    value={formData.nextServiceId}
                    onChange={(e) => handleChange('nextServiceId', e.target.value)}
                    label="Chọn dịch vụ tái khám"
                  >
                    <MenuItem value="">
                      <em>-- Không chọn dịch vụ --</em>
                    </MenuItem>
                    {services.map((service) => (
                      <MenuItem key={service.serviceId || service.ServiceId} value={service.serviceId || service.ServiceId}>
                        {service.name || service.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Ghi chú nhắc hẹn */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  📝 Nội dung nhắc hẹn cho chủ
                </Typography>
                <TextField
                  label="Lời nhắn gửi cho chủ thú cưng"
                  multiline
                  rows={3}
                  fullWidth
                  value={formData.reminderNote}
                  onChange={(e) => handleChange('reminderNote', e.target.value)}
                  placeholder="VD: Hẹn tiêm mũi 2 vắc-xin 5 bệnh sau 21 ngày. Nhớ mang sổ tiêm chủng. Cho bé nhịn ăn 2 giờ trước khi đến khám. Nếu có sốt hoặc dị ứng, báo ngay cho bác sĩ..."
                  helperText="Lời dặn cho chủ về lịch tái khám: tiêm phòng, tái khám, xét nghiệm..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 0,
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          startIcon={<Close />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 500,
            '&:hover': {
              bgcolor: 'error.light',
              borderColor: 'error.main',
              color: 'error.contrastText'
            }
          }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 500,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)',
              transform: 'none',
              boxShadow: 'none'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {loading ? (isEdit ? 'Đang cập nhật...' : 'Đang lưu...') : saveButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicalHistoryDialog; 