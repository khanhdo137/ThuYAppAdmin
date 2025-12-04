import {
    Add as AddIcon,
    MedicalServices as MedicalIcon,
    Refresh as RefreshIcon,
    LocalHospital as HospitalIcon,
    School as SchoolIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Tooltip,
    IconButton,
    Fade,
    Slide
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import {
    DeleteDoctorDialog,
    DOCTOR_DIALOG_MODES,
    DOCTOR_INITIAL_FORM_DATA,
    DOCTOR_SEARCH_DEBOUNCE_DELAY,
    DOCTOR_SEARCH_PLACEHOLDER,
    DoctorDialog,
    DoctorTable,
    validateDoctorForm
} from '../components/Doctor';
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
  const [dialogMode, setDialogMode] = useState(DOCTOR_DIALOG_MODES.VIEW);
  const [showLoading, setShowLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast hook
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState(DOCTOR_INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});

  // Memoize fetchDoctors to satisfy react-hooks/exhaustive-deps
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorService.getAllDoctors();
      const data = response?.doctors || response;
      if (Array.isArray(data)) {
        setDoctors(data);
      } else {
        setDoctors([]);
      }
      setShowLoading(false);
    } catch (error) {
      toast.showError(`Không thể tải danh sách bác sĩ: ${error.message}`);
      setDoctors([]);
      setShowLoading(false);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

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
  }, [toast, fetchDoctors]);

  const handleSearch = (searchValue) => {
    console.log('handleSearch called with:', searchValue);
    setSearchTerm(searchValue || '');
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      performSearch(searchValue || '');
    }, DOCTOR_SEARCH_DEBOUNCE_DELAY);
    
    setSearchTimeout(timeout);
  };

  const openDialog = (mode, doctor = null) => {
    setDialogMode(mode);
    setSelectedDoctor(doctor);
    
    if (mode === DOCTOR_DIALOG_MODES.CREATE) {
      setFormData(DOCTOR_INITIAL_FORM_DATA);
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
    setFormData(DOCTOR_INITIAL_FORM_DATA);
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
    const validation = validateDoctorForm(formData);
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

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDoctors();
    setRefreshing(false);
  };

  // Get statistics
  const stats = doctorService.getDoctorStats(doctors);

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
      <Fade in={true} timeout={600}>
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                minHeight: '120px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Tổng số bác sĩ
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total}
                      </Typography>
                    </Box>
                    <MedicalIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                minHeight: '120px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Bác sĩ mới (0-2 năm)
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.byExperience.newbie}
                      </Typography>
                    </Box>
                    <SchoolIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                minHeight: '120px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Có kinh nghiệm (3-10 năm)
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.byExperience.experienced}
                      </Typography>
                    </Box>
                    <HospitalIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                minHeight: '120px',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Chuyên gia (11+ năm)
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.byExperience.expert}
                      </Typography>
                    </Box>
                    <StarIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: '#667eea' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Kinh nghiệm trung bình
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="primary">
                        {stats.averageExperience} năm
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Paper sx={{ 
            p: 3,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,1))',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            {/* Header with Actions */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <MedicalIcon sx={{ fontSize: 32, color: '#667eea' }} />
                <Typography variant="h5" fontWeight="bold">
                  Danh sách bác sĩ ({doctors.length})
                </Typography>
              </Box>
              
              <Box display="flex" gap={1}>
                <Tooltip title="Làm mới dữ liệu">
                  <IconButton 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        transform: 'rotate(180deg)',
                        transition: 'transform 0.6s ease'
                      }
                    }}
                  >
                    <RefreshIcon sx={{ 
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
                  onClick={() => openDialog(DOCTOR_DIALOG_MODES.CREATE)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    px: 3,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Thêm bác sĩ
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={handleSearch}
                placeholder={DOCTOR_SEARCH_PLACEHOLDER}
              />
            </Box>

            <Slide direction="up" in={true} timeout={800}>
              <Box>
                <DoctorTable
                  doctors={doctors}
                  loading={loading}
                  onView={(row) => openDialog(DOCTOR_DIALOG_MODES.VIEW, row)}
                  onEdit={(row) => openDialog(DOCTOR_DIALOG_MODES.EDIT, row)}
                  onDelete={handleDeleteDoctor}
                />
              </Box>
            </Slide>
          </Paper>
        </Box>
      </Fade>

      <DoctorDialog
        open={dialogOpen}
        onClose={closeDialog}
        dialogMode={dialogMode}
        formData={formData}
        formErrors={formErrors}
        onFormChange={handleFormChange}
        onCreate={handleCreateDoctor}
        onUpdate={handleUpdateDoctor}
        loading={loading}
        selectedDoctor={selectedDoctor}
      />

      <DeleteDoctorDialog
        open={deleteDialogOpen}
        onClose={cancelDeleteDoctor}
        onConfirm={confirmDeleteDoctor}
        loading={deleting}
        doctor={doctorToDelete}
      />
    </PageTemplate>
  );
};

export default DoctorsPage; 