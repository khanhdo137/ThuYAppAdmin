import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.1.27:5074/api';
const API_BASE_URL_HTTP = 'http://192.168.1.27:5074/api';
  
class ApiService {
  // Helper method để thử kết nối với cả HTTPS và HTTP
  async fetchWithFallback(url, options = {}) {
    try {
      // Thử HTTPS trước
      const httpsUrl = url.replace(API_BASE_URL_HTTP, API_BASE_URL);
      const response = await fetch(httpsUrl, options);
      return response;
    } catch (error) {
      console.warn('HTTPS failed, trying HTTP:', error.message);
      // Nếu HTTPS fail, thử HTTP
      const httpUrl = url.replace(API_BASE_URL, API_BASE_URL_HTTP);
      return await fetch(httpUrl, options);
    }
  }

  // Get headers with authentication
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
    };

    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle API response and errors
  async handleResponse(response) {
    if (response.status === 401) {
      // Token expired or invalid
      authService.clearAuthData();
      window.location.href = '/login';
      throw new Error('Phiên đăng nhập đã hết hạn');
    }

    if (response.status === 403) {
      throw new Error('Bạn không có quyền truy cập chức năng này');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  }

  // Generic CRUD operations
  async getAll(endpoint) {
    try {
      const response = await this.fetchWithFallback(`${API_BASE_URL}/${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async getById(endpoint, id) {
    try {
      const response = await this.fetchWithFallback(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error fetching ${endpoint}/${id}:`, error);
      throw error;
    }
  }

  async create(endpoint, data) {
    try {
      const response = await this.fetchWithFallback(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error creating ${endpoint}:`, error);
      throw error;
    }
  }

  async update(endpoint, id, data) {
    try {
      const response = await this.fetchWithFallback(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error updating ${endpoint}/${id}:`, error);
      throw error;
    }
  }

  async delete(endpoint, id) {
    try {
      const response = await this.fetchWithFallback(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error deleting ${endpoint}/${id}:`, error);
      throw error;
    }
  }

  // Search with query parameters
  async search(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${API_BASE_URL}/${endpoint}?${queryString}` : `${API_BASE_URL}/${endpoint}`;
      
      console.log('API Search URL:', url);
      console.log('API Search Headers:', this.getHeaders());
      
      const response = await this.fetchWithFallback(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      console.log('API Search Response Status:', response.status);
      const result = await this.handleResponse(response);
      console.log('API Search Result:', result);
      
      return result;
    } catch (error) {
      console.error(`Error searching ${endpoint}:`, error);
      throw error;
    }
  }

  // Get with query parameters (for pagination, etc.)
  async getWithParams(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${API_BASE_URL}/${endpoint}?${queryString}` : `${API_BASE_URL}/${endpoint}`;
      
      console.log('API GetWithParams URL:', url);
      console.log('API GetWithParams Headers:', this.getHeaders());
      
      const response = await this.fetchWithFallback(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      console.log('API GetWithParams Response Status:', response.status);
      const result = await this.handleResponse(response);
      console.log('API GetWithParams Result:', result);
      
      return result;
    } catch (error) {
      console.error(`Error getting ${endpoint} with params:`, error);
      throw error;
    }
  }

  // Simple GET method for customerService compatibility
  async get(endpoint, options = {}) {
    try {
      let url = endpoint.startsWith('/') 
        ? `${API_BASE_URL}${endpoint}` 
        : `${API_BASE_URL}/${endpoint}`;
      
      // Handle query parameters
      if (options.params) {
        const searchParams = new URLSearchParams();
        Object.keys(options.params).forEach(key => {
          if (options.params[key] !== null && options.params[key] !== undefined) {
            searchParams.append(key, options.params[key]);
          }
        });
        const queryString = searchParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
        
      console.log('API GET URL:', url);
      console.log('API GET Headers:', this.getHeaders());
      
      const response = await this.fetchWithFallback(url, {
        method: 'GET',
        headers: this.getHeaders(),
        ...options
      });
      
      console.log('API GET Response Status:', response.status);
      const result = await this.handleResponse(response);
      console.log('API GET Result:', result);
      
      return result;
    } catch (error) {
      console.error(`Error with GET ${endpoint}:`, error);
      throw error;
    }
  }

  // Simple POST method for customerService compatibility  
  async post(endpoint, data = null, options = {}) {
    try {
      const url = endpoint.startsWith('/') 
        ? `${API_BASE_URL}${endpoint}` 
        : `${API_BASE_URL}/${endpoint}`;
        
      console.log('API POST URL:', url);
      console.log('API POST Data:', data);
      console.log('API POST Headers:', this.getHeaders());
      
      const response = await this.fetchWithFallback(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : null,
        ...options
      });
      
      console.log('API POST Response Status:', response.status);
      const result = await this.handleResponse(response);
      console.log('API POST Result:', result);
      
      return result;
    } catch (error) {
      console.error(`Error with POST ${endpoint}:`, error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService; 