import {
    Add as AddIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog(DOCTOR_DIALOG_MODES.CREATE)}
          >
            Thêm bác sĩ
          </Button>
        </Box>

        <SearchFilterBar
          searchValue={searchTerm}
          onSearchChange={handleSearch}
          placeholder={DOCTOR_SEARCH_PLACEHOLDER}
        />

        <DoctorTable
          doctors={doctors}
          loading={loading}
          onView={(row) => openDialog(DOCTOR_DIALOG_MODES.VIEW, row)}
          onEdit={(row) => openDialog(DOCTOR_DIALOG_MODES.EDIT, row)}
          onDelete={handleDeleteDoctor}
        />
      </Paper>

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