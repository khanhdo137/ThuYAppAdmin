import apiService from './apiService';

class UserService {
  // Normalize user data to ensure consistent field names
  normalizeUserData(user) {
    return {
      // User ID fields
      userId: user.userId || user.UserId,
      UserId: user.UserId || user.userId,
      
      // Customer ID fields (multiple variants for compatibility)
      customerId: user.customerId || user.CustomerId || user.customerID,
      CustomerId: user.CustomerId || user.customerId || user.customerID,
      customerID: user.customerID || user.customerId || user.CustomerId,
      
      // Name fields
      customerName: user.customerName || user.CustomerName || user.fullName || user.username,
      CustomerName: user.CustomerName || user.customerName || user.fullName || user.username,
      fullName: user.fullName || user.customerName || user.CustomerName || user.username,
      
      // Contact fields
      username: user.username || user.Username,
      Username: user.Username || user.username,
      email: user.email || user.Email,
      Email: user.Email || user.email,
      phoneNumber: user.phoneNumber || user.PhoneNumber,
      PhoneNumber: user.PhoneNumber || user.phoneNumber,
      
      // Other fields
      address: user.address || user.Address || '',
      Address: user.Address || user.address || '',
      gender: user.gender !== undefined ? user.gender : (user.Gender !== undefined ? user.Gender : 0),
      Gender: user.Gender !== undefined ? user.Gender : (user.gender !== undefined ? user.gender : 0),
      role: user.role !== undefined ? user.role : (user.Role !== undefined ? user.Role : 0),
      Role: user.Role !== undefined ? user.Role : (user.role !== undefined ? user.role : 0),
      
      // Counts
      petCount: user.petCount || user.PetCount || 0,
      PetCount: user.PetCount || user.petCount || 0,
      appointmentCount: user.appointmentCount || user.AppointmentCount || 0,
      AppointmentCount: user.AppointmentCount || user.appointmentCount || 0,
      
      // Timestamps
      createdAt: user.createdAt || user.CreatedAt,
      CreatedAt: user.CreatedAt || user.createdAt
    };
  }

  // Get all users (admin only)
  async getAllUsers(page = 1, limit = 1000) {
    try {
      console.log('Calling API: Pet/admin/customers with params:', { page, limit });
      const response = await apiService.search('Pet/admin/customers', { page, limit });
      console.log('API Response:', response);
      
      // Normalize all customer data
      const normalizedCustomers = Array.isArray(response?.customers) 
        ? response.customers.map(customer => this.normalizeUserData(customer))
        : [];
      
      return {
        customers: normalizedCustomers,
        pagination: response?.pagination || {
          page: 1,
          limit: 1000,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Error fetching all users:', error);
      return {
        customers: [],
        pagination: {
          page: 1,
          limit: 1000,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  // Get user profile by ID (admin only)
  async getUserById(id) {
    try {
      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/User/profile/${id}`, {
        method: 'GET',
        headers: apiService.getHeaders(),
      });
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Create new user (admin only)
  async createUser(userData) {
    try {
      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/User/register`, {
        method: 'POST',
        headers: apiService.getHeaders(),
        body: JSON.stringify(userData),
      });
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId, newRole) {
    try {
      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/User/update-role/${userId}`, {
        method: 'PUT',
        headers: apiService.getHeaders(),
        body: JSON.stringify(newRole),
      });
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Update user profile (admin only)
  async updateUser(userId, userData) {
    try {
      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/User/update/${userId}`, {
        method: 'PUT',
        headers: apiService.getHeaders(),
        body: JSON.stringify(userData),
      });
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/User/${userId}`, {
        method: 'DELETE',
        headers: apiService.getHeaders(),
      });
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(searchTerm, page = 1, limit = 1000) {
    try {
      console.log('UserService: Searching users with term:', searchTerm);
      const response = await apiService.search('Pet/admin/customers', { 
        page, 
        limit,
        search: searchTerm 
      });
      console.log('UserService: API response:', response);
      
      // Normalize all customer data
      const normalizedCustomers = Array.isArray(response?.customers) 
        ? response.customers.map(customer => this.normalizeUserData(customer))
        : [];
      
      return {
        customers: normalizedCustomers,
        pagination: response?.pagination || {
          page: 1,
          limit: 1000,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Error searching users:', error);
      return {
        customers: [],
        pagination: {
          page: 1,
          limit: 1000,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  // Helper method to get API URL
  getApiUrl() {
    return process.env.REACT_APP_API_BASE_URL || 'https://localhost:7048/api';
  }

  // Get role name from role number
  getRoleName(role) {
    const roleNames = {
      0: 'Customer',
      1: 'Administrator',
      2: 'Doctor'
    };
    return roleNames[role] || 'Unknown';
  }

  // Get role options for dropdown
  getRoleOptions() {
    return [
      { value: 0, label: 'Customer' },
      { value: 1, label: 'Administrator' },
      { value: 2, label: 'Doctor' }
    ];
  }
}

const userService = new UserService();
export default userService; 