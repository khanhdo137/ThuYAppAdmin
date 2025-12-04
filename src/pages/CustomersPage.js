import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  MedicalServices as DoctorIcon,
  PersonOutline as UserIcon,
  TrendingUp as TrendingUpIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Pagination,
  Paper,
  Typography,
  Chip,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Fade,
  Slide,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import {
  CustomerDialog
} from '../components/Customer';
import { validateCustomerForm } from '../components/Customer/CustomerForm';
import { getCustomerTableColumns } from '../components/Customer/CustomerTable';
import DataTable from '../components/DataTable';
import PageTemplate from '../components/PageTemplate';
import SearchFilterBar from '../components/SearchFilterBar';
import { useToast } from '../components/ToastProvider';
import { userService } from '../services';
import appointmentService from '../services/appointmentService';
import petService from '../services/petService';
import excelExportService from '../services/excelExportService';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'edit', 'create'
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 0 (Nam), 1 (Nữ)
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 0 (Customer), 1 (Admin), 2 (Doctor)
  
  // Customer details data
  const [customerPets, setCustomerPets] = useState([]);
  const [customerAppointments, setCustomerAppointments] = useState([]);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const ITEMS_PER_PAGE = 1000;

  // Excel Preview Dialog states
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [previewFileName, setPreviewFileName] = useState('');

  // Toast hook
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    customerName: '',
    address: '',
    gender: 0,
    role: 0,
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Get all users (not just customers)
  const getCustomers = useCallback(async () => {
    try {
      const response = await userService.getAllUsers(page, ITEMS_PER_PAGE);
      return {
        customers: Array.isArray(response.customers) ? response.customers : [],
        pagination: response.pagination
      };
    } catch (error) {
      return {
        customers: [],
        pagination: {
          page: 1,
          limit: ITEMS_PER_PAGE,
          total: 0,
          totalPages: 0
        }
      };
    }
  }, [page]);

  // Filter and sort customers
  const getFilteredAndSortedCustomers = useCallback((customersList) => {
    let filtered = [...customersList];
    
    // Apply gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(c => c.gender === parseInt(genderFilter));
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(c => c.role === parseInt(roleFilter));
    }
    
    // Sort by userId (descending - newest first)
    filtered.sort((a, b) => (b.userId || 0) - (a.userId || 0));
    
    return filtered;
  }, [genderFilter, roleFilter]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const customersData = await getCustomers();
      const filteredCustomers = getFilteredAndSortedCustomers(customersData.customers);
      
      setCustomers(filteredCustomers);
      setTotalPages(customersData.pagination.totalPages);
      setTotalCustomers(filteredCustomers.length);
      
    } catch (error) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [getCustomers, getFilteredAndSortedCustomers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Debounced search function - tìm kiếm theo ID, tên, username, email, phone
  const performSearch = useCallback(async (searchValue) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.searchUsers(searchValue, page, ITEMS_PER_PAGE);
      const filteredCustomers = getFilteredAndSortedCustomers(response.customers);
      
      setCustomers(filteredCustomers);
      setTotalPages(response.pagination.totalPages);
      setTotalCustomers(filteredCustomers.length);
      
    } catch (error) {
      setError('Không thể tìm kiếm người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [page, getFilteredAndSortedCustomers]);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue || '');
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      performSearch(searchValue || '');
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    if (searchTerm) {
      performSearch(searchTerm);
    } else {
      fetchData();
    }
  };

  // Handle filter changes
  const handleGenderFilterChange = (event) => {
    setGenderFilter(event.target.value);
    setPage(1); // Reset to first page
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(1); // Reset to first page
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Function để mở preview dialog
  const handleOpenPreview = useCallback(async () => {
    try {
      // Lấy toàn bộ dữ liệu khách hàng
      let exportData = customers;
      
      toast.showInfo('Đang tải toàn bộ dữ liệu khách hàng...');
      const response = await userService.getAllUsers(1, 10000);
      exportData = response.customers || [];

      if (!exportData || exportData.length === 0) {
        toast.showError('Không có dữ liệu để xuất');
        return;
      }

      const columns = [
        { key: 'userId', label: 'ID' },
        { key: 'username', label: 'Tên đăng nhập' },
        { key: 'email', label: 'Email' },
        { key: 'customerName', label: 'Tên khách hàng' },
        { key: 'phoneNumber', label: 'Số điện thoại' },
        { key: 'address', label: 'Địa chỉ' },
        { key: 'genderText', label: 'Giới tính' },
        { key: 'roleText', label: 'Vai trò' }
      ];

      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `KhachHang_${currentDate}`;

      setPreviewData(exportData);
      setPreviewColumns(columns);
      setPreviewFileName(fileName);
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error('Error preparing preview:', error);
      toast.showError('Lỗi khi chuẩn bị dữ liệu: ' + (error.message || 'Unknown error'));
    }
  }, [toast, userService]);

  // Function để xuất Excel sau khi preview
  const handleConfirmExport = useCallback(async () => {
    try {
      await excelExportService.exportTableToExcel(previewData, previewColumns, previewFileName, 'Khách hàng');
      toast.showSuccess('Xuất Excel thành công!');
      setPreviewDialogOpen(false);
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.showError('Lỗi khi xuất Excel: ' + (error.message || 'Unknown error'));
    }
  }, [previewData, previewColumns, previewFileName, toast]);

  // Calculate statistics
  const getStatistics = useCallback(() => {
    const total = customers.length;
    const byGender = {
      male: customers.filter(c => c.gender === 0).length,
      female: customers.filter(c => c.gender === 1).length
    };
    const byRole = {
      customer: customers.filter(c => c.role === 0).length,
      admin: customers.filter(c => c.role === 1).length,
      doctor: customers.filter(c => c.role === 2).length
    };
    
    return { total, byGender, byRole };
  }, [customers]);

  // Fetch customer details (pets and appointments)
  const fetchCustomerDetails = async (customer) => {
    // Get customerId from multiple possible field names
    const customerId = customer?.customerId || customer?.CustomerId || customer?.customerID;
    
    if (!customer || !customerId) {
      console.error('❌ No customer or customerId provided. Customer data:', customer);
      return;
    }
    
    try {
      setLoadingCustomerDetails(true);
      console.log('========================================');
      console.log('🔍 Fetching details for customer:');
      console.log('  - CustomerId:', customerId);
      console.log('  - Customer Name:', customer.customerName || customer.CustomerName);
      console.log('  - Full customer data:', customer);
      console.log('========================================');
      
      // First get the customer's pets
      console.log('📋 Step 1: Fetching pets...');
      const pets = await petService.getPetsByCustomerId(customerId);
      console.log('✅ Pets fetched:', pets.length, 'pets');
      console.log('   Pet IDs:', pets.map(p => p.petId));
      
      // Get all appointments and filter by customer's pets
      console.log('📋 Step 2: Fetching appointments...');
      const appointmentsResult = await appointmentService.getAllAppointments(1, 1000);
      console.log('✅ Appointments result:', appointmentsResult);
      
      // Extract appointments array from result
      const allAppointments = appointmentsResult.appointments || appointmentsResult || [];
      console.log('✅ All appointments array:', allAppointments.length);
      
      const petIds = pets.map(pet => pet.petId);
      console.log('📋 Step 3: Filtering appointments by pet IDs:', petIds);
      
      const customerAppointments = allAppointments.filter(appointment => {
        // Check both petId and PetId (camelCase and PascalCase)
        const appointmentPetId = appointment.petId || appointment.PetId;
        const match = petIds.includes(appointmentPetId);
        if (match) {
          console.log('   ✓ Match found:', appointment.appointmentId || appointment.AppointmentId, 'for pet', appointmentPetId);
        }
        return match;
      });
      
      console.log('✅ Customer appointments:', customerAppointments.length);
      console.log('========================================');
      
      setCustomerPets(pets || []);
      setCustomerAppointments(customerAppointments || []);
      
    } catch (error) {
      console.error('❌ Error fetching customer details:', error);
      console.error('Error stack:', error.stack);
      setCustomerPets([]);
      setCustomerAppointments([]);
    } finally {
      setLoadingCustomerDetails(false);
    }
  };

  const openDialog = (mode, customer = null) => {
    console.log('=== Opening Customer Dialog ===');
    console.log('Mode:', mode);
    console.log('Customer Data:', customer);
    console.log('Customer Keys:', customer ? Object.keys(customer) : 'null');
    
    setDialogMode(mode);
    setSelectedCustomer(customer);
    setSelectedTab(0); // Reset to first tab
    
    // Clear previous customer details
    setCustomerPets([]);
    setCustomerAppointments([]);
    
    if (mode === 'create') {
      setFormData({
        username: '',
        email: '',
        phoneNumber: '',
        customerName: '',
        address: '',
        gender: 0,
        role: 0,
        password: ''
      });
    } else if (customer) {
      setFormData({
        username: customer.username || customer.Username || '',
        email: customer.email || customer.Email || '',
        phoneNumber: customer.phoneNumber || customer.PhoneNumber || customer.phone || '',
        customerName: customer.customerName || customer.CustomerName || customer.fullName || customer.FullName || '',
        address: customer.address || customer.Address || '',
        gender: customer.gender || customer.Gender || 0,
        role: customer.role || customer.Role || 0,
        password: ''
      });
      
      // Fetch customer details if in view mode
      if (mode === 'view') {
        fetchCustomerDetails(customer);
      }
    }
    
    setFormErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedCustomer(null);
    setFormData({
      username: '',
      email: '',
      phoneNumber: '',
      customerName: '',
      address: '',
      gender: 0,
      role: 0,
      password: ''
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
    const validation = validateCustomerForm(formData, dialogMode);
    setFormErrors(validation.errors);
    return validation.isValid;
  };

  const handleCreateCustomer = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const customerData = {
        ...formData
      };
      await userService.createUser(customerData);
      
      closeDialog();
      fetchData(); // Refresh data
      
      // Show success toast
      toast.showSuccess(`Đã tạo người dùng "${formData.customerName}" thành công!`);
      
    } catch (error) {
      toast.showError('Không thể tạo khách hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const updateData = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        customerName: formData.customerName,
        address: formData.address,
        gender: formData.gender,
        role: formData.role
      };
      
      await userService.updateUser(selectedCustomer.userId, updateData);
      
      closeDialog();
      fetchData(); // Refresh data
      
      // Show success toast
      toast.showSuccess(`Đã cập nhật thông tin "${formData.customerName}" thành công!`);
      
    } catch (error) {
      toast.showError('Không thể cập nhật khách hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    
    try {
      setLoading(true);
      
      // Find customer name for success message
      const customer = customers.find(c => c.userId === customerId);
      const customerName = customer ? (customer.customerName || customer.fullName || 'người dùng') : 'người dùng';
      
      await userService.deleteUser(customerId);
      fetchData(); // Refresh data
      
      // Show success toast
      toast.showSuccess(`Đã xóa ${customerName} thành công!`);
      
    } catch (error) {
      toast.showError('Không thể xóa người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Get table columns
  const columns = getCustomerTableColumns();
  const stats = getStatistics();

  if (!hasLoaded && loading) {
    return (
      <PageTemplate title="Quản lý người dùng" subtitle="Quản lý thông tin người dùng và hoạt động">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Quản lý người dùng" subtitle="Quản lý thông tin người dùng và hoạt động">
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
                        Tổng số người dùng
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total}
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
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
                        Khách hàng
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.byRole.customer}
                      </Typography>
                    </Box>
                    <UserIcon sx={{ fontSize: 48, opacity: 0.3 }} />
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
                        Bác sĩ
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.byRole.doctor}
                      </Typography>
                    </Box>
                    <DoctorIcon sx={{ fontSize: 48, opacity: 0.3 }} />
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
                        Quản trị viên
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.byRole.admin}
                      </Typography>
                    </Box>
                    <AdminIcon sx={{ fontSize: 48, opacity: 0.3 }} />
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
                <PeopleIcon sx={{ fontSize: 32, color: '#667eea' }} />
                <Typography variant="h5" fontWeight="bold">
                  Danh sách người dùng ({totalCustomers})
                </Typography>
              </Box>
              
              <Box display="flex" gap={1}>
                <Tooltip title="Xuất Excel">
                  <IconButton 
                    onClick={handleOpenPreview}
                    disabled={customers.length === 0}
                    sx={{
                      color: '#667eea',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
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
                  Thêm người dùng
                </Button>
              </Box>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <SearchFilterBar
                    searchValue={searchTerm}
                    onSearchChange={handleSearch}
                    searchPlaceholder="Tìm kiếm theo ID, tên, tên đăng nhập, email, số điện thoại..."
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={genderFilter}
                      onChange={handleGenderFilterChange}
                      label="Giới tính"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#764ba2'
                        }
                      }}
                    >
                      <MenuItem value="all">
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon /> Tất cả
                        </Box>
                      </MenuItem>
                      <MenuItem value="0">
                        <Box display="flex" alignItems="center" gap={1}>
                          <MaleIcon sx={{ color: '#2196f3' }} /> Nam
                        </Box>
                      </MenuItem>
                      <MenuItem value="1">
                        <Box display="flex" alignItems="center" gap={1}>
                          <FemaleIcon sx={{ color: '#e91e63' }} /> Nữ
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Quyền hạn</InputLabel>
                    <Select
                      value={roleFilter}
                      onChange={handleRoleFilterChange}
                      label="Quyền hạn"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#764ba2'
                        }
                      }}
                    >
                      <MenuItem value="all">
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon /> Tất cả
                        </Box>
                      </MenuItem>
                      <MenuItem value="0">
                        <Box display="flex" alignItems="center" gap={1}>
                          <UserIcon sx={{ color: '#4caf50' }} /> Khách hàng
                        </Box>
                      </MenuItem>
                      <MenuItem value="1">
                        <Box display="flex" alignItems="center" gap={1}>
                          <AdminIcon sx={{ color: '#ff9800' }} /> Quản trị viên
                        </Box>
                      </MenuItem>
                      <MenuItem value="2">
                        <Box display="flex" alignItems="center" gap={1}>
                          <DoctorIcon sx={{ color: '#2196f3' }} /> Bác sĩ
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Slide direction="up" in={true} timeout={800}>
              <Box>
                <DataTable
                  columns={columns}
                  data={customers}
                  loading={loading}
                  emptyMessage="Không có người dùng nào"
                  onView={(row) => openDialog('view', row)}
                  onEdit={(row) => openDialog('edit', row)}
                  onDelete={(row) => handleDeleteCustomer(row.userId)}
                />
              </Box>
            </Slide>

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 'bold'
                    },
                    '& .Mui-selected': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
                      color: 'white'
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        </Box>
      </Fade>

      <CustomerDialog
        open={dialogOpen} 
        onClose={closeDialog}
        dialogMode={dialogMode}
        formData={formData}
        formErrors={formErrors}
        onFormChange={handleFormChange}
        onCreateCustomer={handleCreateCustomer}
        onUpdateCustomer={handleUpdateCustomer}
        loading={loading}
        loadingCustomerDetails={loadingCustomerDetails}
        selectedCustomer={selectedCustomer}
        pets={customerPets}
        appointments={customerAppointments}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      {/* Excel Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#2e7d32',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileDownloadIcon />
            <Typography variant="h6" component="span">
              Xem trước dữ liệu Excel
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Tên file: {previewFileName}.xlsx
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {previewData.length > 0 && (
            <Box sx={{ p: 2, maxHeight: '60vh', overflow: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Khách hàng
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {previewColumns.map((col, colIndex) => (
                        <TableCell 
                          key={colIndex}
                          sx={{ 
                            fontWeight: 600,
                            bgcolor: 'grey.100'
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.slice(0, 50).map((row, rowIndex) => (
                      <TableRow key={rowIndex} hover>
                        {previewColumns.map((col, colIndex) => (
                          <TableCell key={colIndex}>
                            {row[col.key] !== null && row[col.key] !== undefined 
                              ? String(row[col.key]) 
                              : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {previewData.length > 50 && (
                      <TableRow>
                        <TableCell 
                          colSpan={previewColumns.length}
                          align="center"
                          sx={{ 
                            fontStyle: 'italic',
                            color: 'text.secondary',
                            py: 2
                          }}
                        >
                          ... và {previewData.length - 50} dòng khác
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                Hiển thị {Math.min(50, previewData.length)} / {previewData.length} dòng
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider />
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setPreviewDialogOpen(false)}
            variant="outlined"
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmExport}
            variant="contained"
            startIcon={<FileDownloadIcon />}
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Tải file Excel
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
};

export default CustomersPage; 