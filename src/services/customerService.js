import apiService from './apiService';

class CustomerService {
  // ⚠️ Method này lấy TẤT CẢ customers (không filter theo role)
  // Dùng cho dropdown chọn khách hàng trong pet management
  async getCustomersForPetManagement(search = '', page = 1, limit = 1000) {
    try {
      console.log('Fetching customers for pet management...');
      
      const params = {
        page: page,
        limit: limit
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await apiService.getWithParams('Pet/admin/customers', params);
      
      // Backend Pet/admin/customers trả về: { customers: [...], pagination: {...} }
      if (response && response.customers && Array.isArray(response.customers)) {
        const customers = response.customers.map((customer, index) => {
          const mappedCustomer = {
            CustomerId: customer.CustomerId || customer.customerId,
            customerId: customer.CustomerId || customer.customerId,
            CustomerName: customer.CustomerName || customer.customerName || customer.Username || customer.username,
            customerName: customer.CustomerName || customer.customerName || customer.Username || customer.username,
            email: customer.Email || customer.email,
            phoneNumber: customer.PhoneNumber || customer.phoneNumber || customer.phone || customer.Phone,
            address: customer.Address || customer.address,
            gender: customer.Gender || customer.gender,
            userId: customer.UserId || customer.userId,
            username: customer.Username || customer.username,
            role: customer.Role || customer.role
          };
          
          return mappedCustomer;
        });
        
        return {
          customers: customers,
          pagination: response.pagination || {
            page: parseInt(page),
            limit: parseInt(limit),
            total: customers.length,
            totalPages: Math.ceil(customers.length / parseInt(limit))
          }
        };
      }
      
      console.warn('Unexpected response structure or empty customers');
      return {
        customers: [],
        pagination: { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          total: 0, 
          totalPages: 0 
        }
      };
      
    } catch (error) {
      console.error('Error fetching customers for pet management:', error);
      
      // Try fallback endpoint if primary fails
      try {
        return await this.getAllCustomersFromUserEndpoint(page, limit);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error(`Không thể lấy danh sách khách hàng: ${error.message}`);
      }
    }
  }

  // Endpoint cũ (backup) - từ User controller
  // ⚠️ Method này lấy TẤT CẢ users có CustomerId (không filter theo role)
  // Dùng cho dropdown chọn khách hàng trong pet management
  async getAllCustomersFromUserEndpoint(page = 1, limit = 1000) {
    try {
      const response = await apiService.getWithParams('User/list', {
        page: page,
        limit: limit
      });
      
      // Backend User/list trả về: { users: [...], pagination: {...} }
      if (response && response.users && Array.isArray(response.users)) {
        // Lấy tất cả users có CustomerId (không filter theo role)
        const customers = response.users
          .filter(user => user.CustomerId != null)
          .map(user => ({
            // Map User response to Customer format
            CustomerId: user.CustomerId,
            customerID: user.CustomerId, // For backwards compatibility
            customerId: user.CustomerId, // For backwards compatibility
            CustomerName: user.CustomerName || user.Username,
            customerName: user.CustomerName || user.Username, // For backwards compatibility
            Email: user.Email,
            email: user.Email, // For backwards compatibility
            PhoneNumber: user.PhoneNumber,
            phoneNumber: user.PhoneNumber, // For backwards compatibility
            Address: user.Address || '',
            address: user.Address || '', // For backwards compatibility
            Gender: user.Gender || 0,
            gender: user.Gender || 0, // For backwards compatibility
            UserId: user.UserId,
            userId: user.UserId, // For backwards compatibility
            Username: user.Username,
            username: user.Username, // For backwards compatibility
            Role: user.Role,
            role: user.Role // For backwards compatibility
          }));
        
        return {
          customers: customers,
          pagination: response.pagination || {
            page: parseInt(page),
            limit: parseInt(limit),
            total: customers.length,
            totalPages: Math.ceil(customers.length / parseInt(limit))
          }
        };
      }
      
      return {
        customers: [],
        pagination: { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          total: 0, 
          totalPages: 0 
        }
      };
      
    } catch (error) {
      console.error('Error fetching customers from User endpoint:', error);
      throw error;
    }
  }

  // Get customer by ID
  async getCustomerById(id) {
    return await apiService.getById('User', id);
  }

  // Create new customer
  async createCustomer(customerData) {
    const dataWithRole = { ...customerData, role: 0 }; // Set customer role
    return await apiService.create('User', dataWithRole);
  }

  // Update customer
  async updateCustomer(id, customerData) {
    return await apiService.update('User', id, customerData);
  }

  // Delete customer
  async deleteCustomer(id) {
    return await apiService.delete('User', id);
  }

  // Search customers
  async searchCustomers(searchTerm) {
    try {
      const response = await apiService.search('User', { search: searchTerm });
      // Filter for customers only (role = 0)
      return Array.isArray(response) ? response.filter(user => user.role === 0) : [];
    } catch (error) {
      console.error('Error searching customers:', error);
      return [];
    }
  }

  // Get customer statistics
  async getCustomerStats() {
    try {
      const result = await this.getAllCustomersFromUserEndpoint(1, 1000);
      const allUsers = result.customers || [];
      // Filter for customers only (role = 0)
      const customers = allUsers.filter(user => user.Role === 0 || user.role === 0);
      return {
        total: customers.length,
        active: customers.filter(c => c.isActive).length,
        inactive: customers.filter(c => !c.isActive).length
      };
    } catch (error) {
      console.error('Error getting customer stats:', error);
      return { total: 0, active: 0, inactive: 0 };
    }
  }

  // Get gender options
  getGenderOptions() {
    return [
      { value: 'Nam', label: 'Nam' },
      { value: 'Nữ', label: 'Nữ' },
      { value: 'Khác', label: 'Khác' }
    ];
  }

  // Validate customer data
  validateCustomerData(customerData) {
    const errors = {};

    if (!customerData.fullName?.trim()) {
      errors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!customerData.email?.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!this.isValidEmail(customerData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!customerData.phoneNumber?.trim()) {
      errors.phoneNumber = 'Số điện thoại là bắt buộc';
    } else if (!this.isValidPhoneNumber(customerData.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (!customerData.address?.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate Vietnamese phone number
  isValidPhoneNumber(phone) {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Format phone number for display
  formatPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  }

  // Format customer data for display
  formatCustomerData(customer) {
    return {
      ...customer,
      formattedPhone: this.formatPhoneNumber(customer.phoneNumber),
      fullAddress: customer.address || 'Chưa cập nhật',
      memberSince: customer.createdAt ? 
        new Date(customer.createdAt).toLocaleDateString('vi-VN') : 'Chưa có',
      lastActivity: customer.lastLogin ? 
        new Date(customer.lastLogin).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'
    };
  }

  // Get gender label
  getGenderLabel(value) {
    const option = this.getGenderOptions().find(opt => opt.value === value);
    return option ? option.label : value || 'Chưa xác định';
  }

  // Get customer activity summary
  getCustomerActivity(customer) {
    const today = new Date();
    const joinDate = new Date(customer.createdAt);
    const daysSinceJoin = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
    
    return {
      daysSinceJoin,
      isNewCustomer: daysSinceJoin <= 30,
      status: customer.isActive ? 'Hoạt động' : 'Không hoạt động'
    };
  }

  // Generate customer report data
  generateCustomerReport(customers, pets, appointments) {
    return customers.map(customer => ({
      ...this.formatCustomerData(customer),
      activity: this.getCustomerActivitySummary(customer, pets, appointments)
    }));
  }
}

const customerService = new CustomerService();
export default customerService; 