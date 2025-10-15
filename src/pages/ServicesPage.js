import {
  Add as AddIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DeleteConfirmDialog } from '../components';
import DataTable from '../components/DataTable';
import PageTemplate from '../components/PageTemplate';
import SearchFilterBar from '../components/SearchFilterBar';
import { useToast } from '../components/ToastProvider';
import { serviceService } from '../services';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'edit', 'create'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Toast hook
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    price: '',
    duration: '',
    category: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await serviceService.getAllServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError(`Không thể tải danh sách dịch vụ: ${error.message}`);
      toast.showError('Không thể tải danh sách dịch vụ. Vui lòng thử lại.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchValue) => {
    setSearchTerm(searchValue);
    
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Set new timeout for debouncing (wait 500ms after user stops typing)
    window.searchTimeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (searchValue.trim()) {
          const data = await serviceService.searchServices(searchValue.trim());
          setServices(Array.isArray(data) ? data : []);
        } else {
          await fetchServices();
        }
      } catch (error) {
        console.error('Error searching services:', error);
        setError(`Lỗi tìm kiếm: ${error.message}`);
        toast.showError('Không thể tìm kiếm dịch vụ. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const openDialog = (mode, service = null) => {
    setDialogMode(mode);
    setSelectedService(service);
    
    if (mode === 'create') {
      setFormData({
        serviceName: '',
        description: '',
        price: '',
        duration: '',
        category: ''
      });
    } else if (service) {
      setFormData({
        serviceName: service.name || service.Name || service.serviceName || '',
        description: service.description || service.Description || '',
        price: (service.price || service.Price)?.toString() || '',
        duration: (service.duration || service.Duration)?.toString() || '',
        category: service.category || service.Category || ''
      });
    }
    
    setFormErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedService(null);
    setFormData({
      serviceName: '',
      description: '',
      price: '',
      duration: '',
      category: ''
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
    const validation = serviceService.validateServiceData({
      ...formData,
      price: parseFloat(formData.price) || 0,
      duration: parseInt(formData.duration) || 0
    });
    
    setFormErrors(validation.errors);
    return validation.isValid;
  };

  const handleCreateService = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        duration: parseInt(formData.duration) || 0
      };
      
      await serviceService.createService(serviceData);
      await fetchServices();
      closeDialog();
      
      // Show success toast
      toast.showSuccess(`Đã thêm dịch vụ "${formData.serviceName}" thành công!`);
      
    } catch (error) {
      console.error('Error creating service:', error);
      toast.showError('Không thể tạo dịch vụ mới. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateService = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        duration: parseInt(formData.duration) || 0
      };
      
      const serviceId = selectedService.serviceId || selectedService.ServiceId;
      await serviceService.updateService(serviceId, serviceData);
      await fetchServices();
      closeDialog();
      
      // Show success toast
      toast.showSuccess(`Đã cập nhật dịch vụ "${formData.serviceName}" thành công!`);
      
    } catch (error) {
      console.error('Error updating service:', error);
      toast.showError('Không thể cập nhật dịch vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    try {
      setLoading(true);
      const serviceId = serviceToDelete.serviceId || serviceToDelete.ServiceId;
      const serviceName = serviceToDelete.name || serviceToDelete.Name || serviceToDelete.serviceName || 'dịch vụ';
      
      await serviceService.deleteService(serviceId);
      await fetchServices();
      
      // Show success toast
      toast.showSuccess(`Đã xóa ${serviceName} thành công!`);
      
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.showError('Không thể xóa dịch vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const getCategoryChip = (category) => {
    const colorMap = {
      'kham-tong-quat': 'primary',
      'tiem-phong': 'success',
      'phau-thuat': 'error',
      'xet-nghiem': 'warning',
      'cham-soc': 'info',
      'cap-cuu': 'error'
    };
    
    const categoryLabel = serviceService.getServiceCategories()
      .find(cat => cat.value === category)?.label || category || 'Không xác định';
    
    return (
      <Chip 
        label={categoryLabel} 
        color={colorMap[category] || 'default'} 
        size="small"
      />
    );
  };

  const columns = [
    {
      field: 'serviceId',
      label: 'ID',
      minWidth: 70,
      render: (row) => row.serviceId || row.ServiceId
    },
    {
      field: 'name',
      label: 'Tên dịch vụ',
      minWidth: 200,
      render: (row) => row.name || row.Name || 'Chưa có tên'
    },
    {
      field: 'category',
      label: 'Danh mục',
      minWidth: 150,
      render: (row) => getCategoryChip(row.category || row.Category)
    },
    {
      field: 'price',
      label: 'Giá',
      minWidth: 120,
      render: (row) => serviceService.formatPrice(row.price || row.Price)
    },
    {
      field: 'duration',
      label: 'Thời gian',
      minWidth: 100,
      render: (row) => serviceService.formatDuration(row.duration || row.Duration)
    },
    {
      field: 'description',
      label: 'Mô tả',
      minWidth: 250,
      render: (row) => {
        const desc = row.description || row.Description;
        return desc ? (desc.length > 100 ? desc.substring(0, 100) + '...' : desc) : 'Chưa có';
      }
    }
  ];

  // Show loading but with timeout to prevent infinite spinner
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 5000);
    if (services.length > 0) setShowLoading(false);
    return () => clearTimeout(timer);
  }, [services.length]);

  if (loading && services.length === 0 && showLoading) {
    return (
      <PageTemplate title="Quản lý dịch vụ" subtitle="Quản lý các dịch vụ y tế cho thú cưng">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Quản lý dịch vụ" subtitle="Quản lý các dịch vụ y tế cho thú cưng">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Danh sách dịch vụ ({services.length})
          </Typography>
          <Box display="flex" gap={2}>


            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog('create')}
            >
              Thêm dịch vụ
            </Button>
          </Box>
        </Box>

        <SearchFilterBar
          searchValue={searchTerm}
          onSearchChange={handleSearch}
          placeholder="Tìm kiếm theo tên dịch vụ, mô tả..."
        />

        <DataTable
          columns={columns}
          data={services}
          loading={loading}
          emptyMessage="Không có dịch vụ nào"
          onView={(row) => openDialog('view', row)}
          onEdit={(row) => openDialog('edit', row)}
          onDelete={handleDeleteClick}
        />
      </Paper>

      {/* Service Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' && 'Thêm dịch vụ mới'}
          {dialogMode === 'edit' && 'Chỉnh sửa dịch vụ'}
          {dialogMode === 'view' && 'Thông tin dịch vụ'}
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Tên dịch vụ"
              value={formData.serviceName}
              onChange={(e) => handleFormChange('serviceName', e.target.value)}
              error={!!formErrors.serviceName}
              helperText={formErrors.serviceName}
              disabled={dialogMode === 'view'}
              fullWidth
            />
            
            <TextField
              label="Danh mục"
              select
              value={formData.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
              disabled={dialogMode === 'view'}
              fullWidth
            >
              {serviceService.getServiceCategories().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <Box display="flex" gap={2}>
              <TextField
                label="Giá (VND)"
                type="number"
                value={formData.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                error={!!formErrors.price}
                helperText={formErrors.price}
                disabled={dialogMode === 'view'}
                fullWidth
                inputProps={{ min: 0 }}
              />
              
              <TextField
                label="Thời gian (phút)"
                select
                value={formData.duration}
                onChange={(e) => handleFormChange('duration', e.target.value)}
                error={!!formErrors.duration}
                helperText={formErrors.duration}
                disabled={dialogMode === 'view'}
                fullWidth
              >
                {serviceService.getDurationOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            
            <TextField
              label="Mô tả dịch vụ"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              error={!!formErrors.description}
              helperText={formErrors.description}
              disabled={dialogMode === 'view'}
              fullWidth
            />
            
            {dialogMode === 'view' && selectedService && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Thông tin bổ sung:
                </Typography>
                <Typography variant="body2">
                  Giá đã định dạng: {serviceService.formatPrice(selectedService.price || selectedService.Price)}
                </Typography>
                <Typography variant="body2">
                  Thời gian: {serviceService.formatDuration(selectedService.duration || selectedService.Duration)}
                </Typography>
                <Typography variant="body2">
                  Trạng thái: {(selectedService.isActive || selectedService.IsActive) !== false ? 'Đang hoạt động' : 'Tạm dừng'}
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
              onClick={handleCreateService}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Đang thêm...' : 'Thêm'}
            </Button>
          )}
          {dialogMode === 'edit' && (
            <Button 
              variant="contained" 
              onClick={handleUpdateService}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={loading}
        title="Xác nhận xóa"
      />
    </PageTemplate>
  );
};

export default ServicesPage; 