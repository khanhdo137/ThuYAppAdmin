import {
  Add as AddIcon,
  Delete as DeleteIcon,
  LocalHospital as DoctorIcon,
  Edit as EditIcon,
  Search as SearchIcon,
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
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import PageTemplate from '../components/PageTemplate';
import SearchFilterBar from '../components/SearchFilterBar';
import { useToast } from '../components/ToastProvider';
import { doctorService } from '../services';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'edit', 'create'
  const [showLoading, setShowLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast hook
  const toast = useToast();

  // Form state - chỉ các fields mà backend hỗ trợ
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    experienceYears: '',
    branch: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorService.getAllDoctors();
      
      // Backend admin endpoint trả về { doctors: [...], pagination: {...} }
      const data = response?.doctors || response;
      
      if (Array.isArray(data)) {
        setDoctors(data);
      } else {
        setDoctors([]);
      }
      
      setShowLoading(false); // Hide loading when data is loaded
    } catch (error) {
      toast.showError(`Không thể tải danh sách bác sĩ: ${error.message}`);
      setDoctors([]);
      setShowLoading(false); // Hide loading even on error
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const performSearch = useCallback(async (searchValue) => {
    try {
      setLoading(true);
      console.log('Performing search for doctors with value:', searchValue);
      
      if (searchValue.trim()) {
        const response = await doctorService.searchDoctors(searchValue);
        console.log('Doctor search results:', response);
        
        // Backend search endpoint trả về { doctors: [...], searchQuery: ..., pagination: {...} }
        const data = response?.doctors || response;
        setDoctors(Array.isArray(data) ? data : []);
      } else {
        await fetchDoctors();
      }
    } catch (error) {
      console.error('Error searching doctors:', error);
      toast.showError('Không thể tìm kiếm bác sĩ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSearch = (searchValue) => {
    console.log('handleSearch called with:', searchValue);
    setSearchTerm(searchValue);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      performSearch(searchValue);
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  };

  const openDialog = (mode, doctor = null) => {
    setDialogMode(mode);
    setSelectedDoctor(doctor);
    
    if (mode === 'create') {
      setFormData({
        fullName: '',
        specialization: '',
        experienceYears: '',
        branch: ''
      });
    } else if (doctor) {
      setFormData({
        fullName: doctor.fullName || '',
        specialization: doctor.specialization || '',
        experienceYears: doctor.experienceYears?.toString() || '',
        branch: doctor.branch || ''
      });
    }
    
    setFormErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedDoctor(null);
    setFormData({
      fullName: '',
      specialization: '',
      experienceYears: '',
      branch: ''
    });
    setFormErrors({});
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const validation = doctorService.validateDoctorData({
      ...formData,
      experienceYears: parseInt(formData.experienceYears) || 0
    });
    
    setFormErrors(validation.errors);
    return validation.isValid;
  };

  const handleCreateDoctor = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Chỉ gửi các field mà backend hỗ trợ (theo Doctor model)
      const apiDoctorData = {
        fullName: formData.fullName,
        specialization: formData.specialization || null,
        experienceYears: parseInt(formData.experienceYears) || null,
        branch: formData.branch || null
      };
      
      console.log('Creating doctor with data:', apiDoctorData);
      
      await doctorService.createDoctor(apiDoctorData);
      await fetchDoctors();
      closeDialog();
      
      // Show success toast
      toast.showSuccess(`Đã thêm bác sĩ "${formData.fullName}" thành công!`);
      
    } catch (error) {
      toast.showError(`Không thể tạo bác sĩ mới. ${error.message || 'Vui lòng thử lại.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDoctor = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Chỉ gửi các field mà backend hỗ trợ (theo Doctor model)
      const apiDoctorData = {
        fullName: formData.fullName,
        specialization: formData.specialization || null,
        experienceYears: parseInt(formData.experienceYears) || null,
        branch: formData.branch || null
      };
      
      await doctorService.updateDoctor(selectedDoctor.doctorId, apiDoctorData);
      await fetchDoctors();
      closeDialog();
      
      // Show success toast
      toast.showSuccess(`Đã cập nhật thông tin bác sĩ "${formData.fullName}" thành công!`);
      
    } catch (error) {
      toast.showError(`Không thể cập nhật bác sĩ: ${error.message || 'Vui lòng thử lại.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = (doctorId) => {
    const doctor = doctors.find(d => d.doctorId === doctorId);
    setDoctorToDelete(doctor);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    
    try {
      setDeleting(true);
      await doctorService.deleteDoctor(doctorToDelete.doctorId);
      await fetchDoctors();
      setDeleteDialogOpen(false);
      setDoctorToDelete(null);
      
      // Show success toast
      toast.showSuccess(`Đã xóa bác sĩ "${doctorToDelete.fullName}" thành công!`);
      
    } catch (error) {
      toast.showError('Không thể xóa bác sĩ. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteDoctor = () => {
    setDeleteDialogOpen(false);
    setDoctorToDelete(null);
  };

  const getSpecializationChip = (specialization) => {
    const colorMap = {
      'tong-quat': 'primary',
      'phau-thuat': 'error',
      'noi-khoa': 'info',
      'ngoai-khoa': 'warning',
      'chan-doan-hinh-anh': 'success'
    };
    
    const label = doctorService.getSpecializationLabel(specialization);
    
    return (
                    <Chip
        label={label} 
        color={colorMap[specialization] || 'default'} 
                      size="small"
      />
    );
  };

  const getExperienceChip = (years) => {
    if (years <= 2) return <Chip label="Mới" color="info" size="small" />;
    if (years <= 10) return <Chip label="Có kinh nghiệm" color="success" size="small" />;
    return <Chip label="Chuyên gia" color="warning" size="small" />;
  };

  const columns = [
    {
      field: 'avatar',
      label: '',
      minWidth: 60,
      render: (row) => (
        <Avatar sx={{ width: 40, height: 40 }}>
          <DoctorIcon />
        </Avatar>
      )
    },
    {
      field: 'fullName',
      label: 'Họ tên',
      minWidth: 180,
      render: (row) => row.fullName || 'Chưa có tên'
    },
    {
      field: 'specialization',
      label: 'Chuyên khoa',
      minWidth: 150,
      render: (row) => getSpecializationChip(row.specialization)
    },
    {
      field: 'experienceYears',
      label: 'Kinh nghiệm',
      minWidth: 120,
      render: (row) => (
        <Box>
          <Typography variant="body2">
            {doctorService.formatExperience(row.experienceYears)}
                    </Typography>
          {getExperienceChip(row.experienceYears)}
                  </Box>
      )
    },
    {
      field: 'branch',
      label: 'Chi nhánh',
      minWidth: 150,
      render: (row) => doctorService.getBranchLabel(row.branch)
    },
    {
      field: 'actions',
      label: 'Thao tác',
      minWidth: 150,
      render: (row) => (
                  <Box>
          <IconButton 
            size="small" 
            onClick={() => openDialog('view', row)}
            color="primary"
          >
            <SearchIcon />
          </IconButton>
                    <IconButton
                      size="small"
            onClick={() => openDialog('edit', row)}
            color="warning"
          >
            <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
            onClick={() => handleDeleteDoctor(row.doctorId)}
            color="error"
          >
            <DeleteIcon />
                    </IconButton>
                  </Box>
      )
    }
  ];

  // Show loading but with timeout to prevent infinite spinner  
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 5000); // Hide loading after 5s max
    return () => clearTimeout(timer);
  }, []);

  if (loading && doctors.length === 0 && showLoading) {
    return (
      <PageTemplate title="Quản lý bác sĩ" subtitle="Quản lý thông tin bác sĩ trong phòng khám">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Quản lý bác sĩ" subtitle="Quản lý thông tin bác sĩ trong phòng khám">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Danh sách bác sĩ ({doctors.length})
          </Typography>
          <Box display="flex" gap={2}>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog('create')}
            >
              Thêm bác sĩ
            </Button>
          </Box>
                </Box>

        <SearchFilterBar
          searchValue={searchTerm}
          onSearchChange={(e) => handleSearch(e.target.value)}
          searchPlaceholder="Tìm kiếm theo tên, chuyên khoa, chi nhánh..."
        />

        <DataTable
          columns={columns}
          data={doctors}
          loading={loading}
          emptyMessage="Không có bác sĩ nào"
        />

      </Paper>

      {/* Doctor Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' && 'Thêm bác sĩ mới'}
          {dialogMode === 'edit' && 'Chỉnh sửa bác sĩ'}
          {dialogMode === 'view' && 'Thông tin bác sĩ'}
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Họ và tên"
              value={formData.fullName}
              onChange={(e) => handleFormChange('fullName', e.target.value)}
              error={!!formErrors.fullName}
              helperText={formErrors.fullName}
              disabled={dialogMode === 'view'}
              fullWidth
              required
            />
            
            <Box display="flex" gap={2}>
              <TextField
                label="Chuyên khoa"
                select
                value={formData.specialization}
                onChange={(e) => handleFormChange('specialization', e.target.value)}
                error={!!formErrors.specialization}
                helperText={formErrors.specialization}
                disabled={dialogMode === 'view'}
                fullWidth
              >
                <MenuItem value="">
                  <em>Chọn chuyên khoa</em>
                </MenuItem>
                {doctorService.getSpecializationOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
          
              <TextField
                label="Số năm kinh nghiệm"
                type="number"
                value={formData.experienceYears}
                onChange={(e) => handleFormChange('experienceYears', e.target.value)}
                error={!!formErrors.experienceYears}
                helperText={formErrors.experienceYears}
                disabled={dialogMode === 'view'}
                fullWidth
                inputProps={{ min: 0, max: 50 }}
              />
            </Box>
            
            <TextField
              label="Chi nhánh"
              select
              value={formData.branch}
              onChange={(e) => handleFormChange('branch', e.target.value)}
              error={!!formErrors.branch}
              helperText={formErrors.branch}
              disabled={dialogMode === 'view'}
              fullWidth
            >
              <MenuItem value="">
                <em>Chọn chi nhánh</em>
              </MenuItem>
              {doctorService.getBranchOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            {dialogMode === 'view' && selectedDoctor && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Thống kê:
                </Typography>
                <Typography variant="body2">
                  Kinh nghiệm: {doctorService.formatExperience(selectedDoctor.ExperienceYears)}
                </Typography>
                <Typography variant="body2">
                  Chuyên khoa: {doctorService.getSpecializationLabel(selectedDoctor.Specialization)}
                </Typography>
                <Typography variant="body2">
                  Chi nhánh: {doctorService.getBranchLabel(selectedDoctor.Branch)}
                </Typography>
              </Box>
            )}
        </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeDialog} disabled={loading}>
            {dialogMode === 'view' ? 'Đóng' : 'Hủy'}
          </Button>
          {dialogMode === 'create' && (
            <Button 
              variant="contained" 
              onClick={handleCreateDoctor}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Đang thêm...' : 'Thêm'}
            </Button>
          )}
          {dialogMode === 'edit' && (
            <Button 
              variant="contained" 
              onClick={handleUpdateDoctor}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteDoctor}
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
          
          {doctorToDelete && (
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
                      {doctorToDelete.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doctorService.getSpecializationLabel(doctorToDelete.specialization)}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip 
                    label={`${doctorService.formatExperience(doctorToDelete.experienceYears)}`}
                    size="small"
                    color="info"
                  />
                  <Chip 
                    label={doctorService.getBranchLabel(doctorToDelete.branch)}
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
            onClick={cancelDeleteDoctor} 
            disabled={deleting}
            variant="outlined"
            color="inherit"
          >
            Hủy bỏ
          </Button>
          <Button 
            onClick={confirmDeleteDoctor}
            disabled={deleting}
            variant="contained"
            color="error"
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            sx={{ minWidth: 120 }}
          >
            {deleting ? 'Đang xóa...' : 'Xóa bác sĩ'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
};

export default DoctorsPage; 