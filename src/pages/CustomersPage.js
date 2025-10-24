import {
  Add as AddIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Pagination,
  Paper,
  Typography
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
  
  // Customer details data
  const [customerPets, setCustomerPets] = useState([]);
  const [customerAppointments, setCustomerAppointments] = useState([]);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const ITEMS_PER_PAGE = 1000;

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const customersData = await getCustomers();
      
      setCustomers(customersData.customers);
      setTotalPages(customersData.pagination.totalPages);
      setTotalCustomers(customersData.pagination.total);
      
    } catch (error) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [getCustomers]);

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

  // Debounced search function
  const performSearch = useCallback(async (searchValue) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.searchUsers(searchValue, page, ITEMS_PER_PAGE);
      
      setCustomers(response.customers);
      setTotalPages(response.pagination.totalPages);
      setTotalCustomers(response.pagination.total);
      
    } catch (error) {
      setError('Không thể tìm kiếm người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [page]);

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
        username: customer.username || '',
        email: customer.email || '',
        phoneNumber: customer.phoneNumber || '',
        customerName: customer.customerName || customer.fullName || '',
        address: customer.address || '',
        gender: customer.gender || 0,
        role: customer.role || 0,
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Danh sách người dùng ({totalCustomers})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog('create')}
          >
            Thêm người dùng
          </Button>
        </Box>

        <SearchFilterBar
          searchValue={searchTerm}
          onSearchChange={handleSearch}
          searchPlaceholder="Tìm kiếm theo tên, email, số điện thoại..."
        />

        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="Không có người dùng nào"
          onView={(row) => openDialog('view', row)}
          onEdit={(row) => openDialog('edit', row)}
          onDelete={(row) => handleDeleteCustomer(row.userId)}
        />

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>

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
    </PageTemplate>
  );
};

export default CustomersPage; 