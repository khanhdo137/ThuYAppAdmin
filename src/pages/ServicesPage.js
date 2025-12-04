import {
  Add as AddIcon,
  LocalHospital as HospitalIcon,
  Refresh as RefreshIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon
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
  Typography,
  Grid,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Fade,
  Slide
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DeleteConfirmDialog } from '../components';
import DataTable from '../components/DataTable';
import PageTemplate from '../components/PageTemplate';
import SearchFilterBar from '../components/SearchFilterBar';
import { useToast } from '../components/ToastProvider';
import { serviceService } from '../services';
import { useServices } from '../components/Service/useServices';

const ServicesPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'edit', 'create'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use services hook
  const {
    services,
    loading,
    error,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleLimitChange,
    createService,
    updateService,
    deleteService,
    setError
  } = useServices();

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

  // Debounced search handler
  const handleSearchDebounced = (searchValue) => {
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Set new timeout for debouncing (wait 500ms after user stops typing)
    window.searchTimeout = setTimeout(() => {
      handleSearch(searchValue);
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
    
    const serviceData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      duration: parseInt(formData.duration) || 0
    };
    
    const success = await createService(serviceData);
    if (success) {
      closeDialog();
    }
  };

  const handleUpdateService = async () => {
    if (!validateForm()) return;
    
    const serviceData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      duration: parseInt(formData.duration) || 0
    };
    
    const serviceId = selectedService.serviceId || selectedService.ServiceId;
    const success = await updateService(serviceId, serviceData);
    if (success) {
      closeDialog();
    }
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    const serviceId = serviceToDelete.serviceId || serviceToDelete.ServiceId;
    const success = await deleteService(serviceId);
    
    if (success) {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh services data
    window.location.reload(); // Simple refresh for now
    setRefreshing(false);
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const servicesArray = Array.isArray(services) ? services : [];
    const categoryCount = {};
    let totalPrice = 0;
    let totalDuration = 0;

    servicesArray.forEach(service => {
      // Count by category
      const category = service.category || service.Category || 'Khác';
      categoryCount[category] = (categoryCount[category] || 0) + 1;

      // Sum prices and durations
      const price = parseFloat(service.price || service.Price || 0);
      const duration = parseInt(service.duration || service.Duration || 0);
      totalPrice += price;
      totalDuration += duration;
    });

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      total: servicesArray.length,
      byCategory: categoryCount,
      topCategories,
      averagePrice: servicesArray.length > 0 ? Math.round(totalPrice / servicesArray.length) : 0,
      averageDuration: servicesArray.length > 0 ? Math.round(totalDuration / servicesArray.length) : 0
    };
  }, [services]);

  // Render statistics cards - Always show full layout
  const renderStatisticsCards = () => {
    const cards = [
      {
        title: 'Tổng số dịch vụ',
        value: stats.total,
        icon: HospitalIcon,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        title: 'Giá trung bình',
        value: serviceService.formatPrice(stats.averagePrice),
        icon: MoneyIcon,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        title: 'Thời gian TB',
        value: `${stats.averageDuration}p`,
        icon: ScheduleIcon,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        title: 'Danh mục',
        value: Object.keys(stats.byCategory).length,
        icon: CategoryIcon,
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      }
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Show all 4 cards */}
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%',
              minHeight: '120px',
              background: card.gradient,
              color: 'white',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                  <card.icon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        {/* Always show trending card if data available */}
        {stats.topCategories.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#667eea' }} />
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Danh mục dịch vụ phổ biến nhất
                    </Typography>
                    <Box display="flex" gap={3} flexWrap="wrap">
                      {stats.topCategories.map(([category, count], index) => (
                        <Box key={category} display="flex" alignItems="center" gap={1}>
                          <HospitalIcon sx={{ color: '#667eea', fontSize: 20 }} />
                          <Typography variant="body1" fontWeight="bold" color="primary">
                            {serviceService.getServiceCategories().find(cat => cat.value === category)?.label || category}: {count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
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


  return (
    <PageTemplate title="Quản lý dịch vụ" subtitle="Quản lý các dịch vụ y tế cho thú cưng">
      <Fade in={true} timeout={600}>
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Statistics Cards - Always show full layout */}
          {renderStatisticsCards()}

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
                <HospitalIcon sx={{ fontSize: 32, color: '#667eea' }} />
                <Typography variant="h5" fontWeight="bold">
                  Danh sách dịch vụ ({stats.total})
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
                  onClick={() => openDialog('create')}
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
                  Thêm dịch vụ
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={handleSearchDebounced}
                placeholder="Tìm kiếm theo tên dịch vụ, mô tả..."
              />
            </Box>

            <Slide direction="up" in={true} timeout={800}>
              <Box>
                <DataTable
                  columns={columns}
                  data={services}
                  loading={loading}
                  emptyMessage="Không có dịch vụ nào"
                  onView={(row) => openDialog('view', row)}
                  onEdit={(row) => openDialog('edit', row)}
                  onDelete={handleDeleteClick}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </Box>
            </Slide>
          </Paper>
        </Box>
      </Fade>

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