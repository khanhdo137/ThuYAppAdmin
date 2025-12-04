import apiService from './apiService';
import { API_BASE_URL } from './config';

class ServiceService {
  // Get all services (for admin) with pagination
  async getAllServices(page = 1, limit = 15) {
    try {
      console.log(`Fetching services: page=${page}, limit=${limit}`);
      
      // Try admin endpoint first
      let response = await apiService.getWithParams('Service/admin', { page, limit });
      
      console.log('Services response:', response);
      
      // Backend trả về { services: [...], pagination: {...} }
      if (response && response.services && response.pagination) {
        return response;
      }
      
      // Fallback: nếu admin endpoint không có pagination, thử endpoint thường
      response = await apiService.getWithParams('Service', { page, limit });
      
      // Endpoint thường có thể trả về { data: [...] } hoặc trực tiếp array
      if (response && response.data) {
        return {
          services: response.data,
          pagination: {
            page: 1,
            limit: response.data.length,
            total: response.data.length,
            totalPages: 1
          }
        };
      }
      
      // Fallback: nếu response trực tiếp là array
      if (Array.isArray(response)) {
        return {
          services: response,
          pagination: {
            page: 1,
            limit: response.length,
            total: response.length,
            totalPages: 1
          }
        };
      }
      
      return {
        services: [],
        pagination: {
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      
      // Last attempt: try without any query params
      try {
        const basicResponse = await apiService.get('Service');
        
        if (Array.isArray(basicResponse)) {
          return {
            services: basicResponse,
            pagination: {
              page: 1,
              limit: basicResponse.length,
              total: basicResponse.length,
              totalPages: 1
            }
          };
        }
        if (basicResponse && basicResponse.data && Array.isArray(basicResponse.data)) {
          return {
            services: basicResponse.data,
            pagination: {
              page: 1,
              limit: basicResponse.data.length,
              total: basicResponse.data.length,
              totalPages: 1
            }
          };
        }
        if (basicResponse && basicResponse.services && Array.isArray(basicResponse.services)) {
          return {
            services: basicResponse.services,
            pagination: {
              page: 1,
              limit: basicResponse.services.length,
              total: basicResponse.services.length,
              totalPages: 1
            }
          };
        }
      } catch (basicError) {
        console.error('Basic endpoint also failed:', basicError);
      }
      
      throw error;
    }
  }

  // Get service by ID (for admin)
  async getServiceById(id) {
    try {
      return await apiService.get(`Service/admin/${id}`);
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  // Create new service (for admin)
  async createService(serviceData) {
    try {
      // Map frontend fields to backend fields
      const mappedData = {
        name: serviceData.serviceName || serviceData.name, // Backend expects 'name'
        description: serviceData.description,
        price: parseFloat(serviceData.price) || null,
        duration: parseInt(serviceData.duration) || null,
        category: serviceData.category,
        isActive: true // Always set to true for new services
      };

      return await apiService.post('Service/admin', mappedData);
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  // Update service (for admin)
  async updateService(id, serviceData) {
    try {
      // Map frontend fields to backend fields
      const mappedData = {
        name: serviceData.serviceName || serviceData.name, // Backend expects 'name'
        description: serviceData.description,
        price: parseFloat(serviceData.price) || null,
        duration: parseInt(serviceData.duration) || null,
        category: serviceData.category,
        isActive: serviceData.isActive !== undefined ? serviceData.isActive : true
      };

      const response = await fetch(`${API_BASE_URL}/Service/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(mappedData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  // Delete service (for admin)
  async deleteService(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/Service/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Search services (for admin) with pagination
  async searchServices(searchTerm, page = 1, limit = 15) {
    try {
      console.log(`Searching services with term: "${searchTerm}", page=${page}, limit=${limit}`);
      
      const response = await apiService.getWithParams('Service/admin/search', { 
        query: searchTerm,
        page,
        limit
      });
      
      console.log('Search response:', response);
      
      // Backend trả về { services: [...], pagination: {...} }
      if (response && response.services && response.pagination) {
        console.log(`Found ${response.services.length} services with pagination`);
        return response;
      }
      
      // Fallback: nếu response trực tiếp là array
      if (Array.isArray(response)) {
        console.log(`Found ${response.length} services (direct array)`);
        return {
          services: response,
          pagination: {
            page: 1,
            limit: response.length,
            total: response.length,
            totalPages: 1
          }
        };
      }
      
      console.log('No services found in response');
      return {
        services: [],
        pagination: {
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Error searching services:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      throw error;
    }
  }

  // Get service categories
  getServiceCategories() {
    return [
      { value: 'kham-tong-quat', label: 'Khám tổng quát' },
      { value: 'tiem-phong', label: 'Tiêm phòng' },
      { value: 'phau-thuat', label: 'Phẫu thuật' },
      { value: 'xet-nghiem', label: 'Xét nghiệm' },
      { value: 'cham-soc', label: 'Chăm sóc làm đẹp' },
      { value: 'cap-cuu', label: 'Cấp cứu' },
      { value: 'noi-tru', label: 'Nội trú' },
      { value: 'khac', label: 'Khác' }
    ];
  }

  // Get duration options (in minutes)
  getDurationOptions() {
    return [
      { value: 15, label: '15 phút' },
      { value: 30, label: '30 phút' },
      { value: 45, label: '45 phút' },
      { value: 60, label: '1 giờ' },
      { value: 90, label: '1.5 giờ' },
      { value: 120, label: '2 giờ' },
      { value: 180, label: '3 giờ' },
      { value: 240, label: '4 giờ' }
    ];
  }

  // Format service data for display
  formatServiceData(service) {
    return {
      ...service,
      formattedPrice: this.formatPrice(service.price),
      formattedDuration: this.formatDuration(service.duration),
      createdAt: service.createdAt ? 
        new Date(service.createdAt).toLocaleDateString('vi-VN') : 'Chưa có'
    };
  }

  // Format price in VND
  formatPrice(price) {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // Format duration
  formatDuration(minutes) {
    if (!minutes) return 'Chưa xác định';
    
    if (minutes < 60) {
      return `${minutes} phút`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} giờ`;
      } else {
        return `${hours} giờ ${remainingMinutes} phút`;
      }
    }
  }

  // Validate service data
  validateServiceData(serviceData) {
    const errors = {};

    if (!serviceData.serviceName?.trim()) {
      errors.serviceName = 'Tên dịch vụ là bắt buộc';
    }

    if (!serviceData.description?.trim()) {
      errors.description = 'Mô tả dịch vụ là bắt buộc';
    }

    if (!serviceData.price || serviceData.price < 0) {
      errors.price = 'Giá dịch vụ phải lớn hơn 0';
    }

    if (!serviceData.duration || serviceData.duration < 15) {
      errors.duration = 'Thời gian thực hiện phải ít nhất 15 phút';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Get price range suggestions
  getPriceRangeSuggestions() {
    return [
      { category: 'Khám tổng quát', min: 100000, max: 300000 },
      { category: 'Tiêm phòng', min: 150000, max: 500000 },
      { category: 'Phẫu thuật', min: 500000, max: 5000000 },
      { category: 'Xét nghiệm', min: 200000, max: 800000 },
      { category: 'Chăm sóc làm đẹp', min: 200000, max: 1000000 },
      { category: 'Cấp cứu', min: 300000, max: 2000000 }
    ];
  }




}

const serviceService = new ServiceService();
export default serviceService; 