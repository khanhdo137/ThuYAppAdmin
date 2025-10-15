import apiService from './apiService';

class UserService {
  // Get all users (admin only)
  async getAllUsers(page = 1, limit = 1000) {
    try {
      console.log('Calling API: Pet/admin/customers with params:', { page, limit });
      const response = await apiService.search('Pet/admin/customers', { page, limit });
      console.log('API Response:', response);
      return {
        customers: Array.isArray(response?.customers) ? response.customers : [],
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
      return {
        customers: Array.isArray(response?.customers) ? response.customers : [],
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