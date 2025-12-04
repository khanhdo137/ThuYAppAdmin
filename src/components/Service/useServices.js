import { useState, useEffect, useCallback } from 'react';
import { serviceService } from '../../services';
import { useToast } from '../ToastProvider';

export const useServices = () => {
  // State
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0
  });

  // Toast hook
  const toast = useToast();

  /**
   * Fetch services with pagination
   */
  const fetchData = useCallback(async (page = 1, limit = 15) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching services: page=${page}, limit=${limit}`);
      const data = await serviceService.getAllServices(page, limit);
      
      console.log('Services data:', data);
      
      if (data && data.services && data.pagination) {
        setServices(data.services);
        setPagination(data.pagination);
        console.log('Set services pagination:', data.pagination);
      } else {
        setServices([]);
        setPagination({
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Không thể tải danh sách dịch vụ');
      toast.showError('Không thể tải danh sách dịch vụ. Vui lòng thử lại.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Search services with pagination
   */
  const handleSearch = useCallback(async (searchValue, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      setSearchTerm(searchValue);
      
      let data;
      if (searchValue?.trim()) {
        data = await serviceService.searchServices(searchValue, page, 15);
      } else {
        data = await serviceService.getAllServices(page, 15);
      }
      
      // Handle paginated response
      console.log('Search data:', data);
      if (data && data.services && data.pagination) {
        setServices(data.services);
        setPagination(data.pagination);
        console.log('Set search pagination:', data.pagination);
      } else if (Array.isArray(data)) {
        setServices(data);
        setPagination({
          page: 1,
          limit: 15,
          total: data.length,
          totalPages: 1
        });
      } else {
        setServices([]);
        setPagination({
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      setError('Không thể tìm kiếm dịch vụ');
      toast.showError('Không thể tìm kiếm dịch vụ. Vui lòng thử lại.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((newPage) => {
    if (searchTerm?.trim()) {
      handleSearch(searchTerm, newPage);
    } else {
      fetchData(newPage, pagination.limit);
    }
  }, [searchTerm, pagination.limit, handleSearch, fetchData]);

  /**
   * Handle limit change
   */
  const handleLimitChange = useCallback((newLimit) => {
    if (searchTerm?.trim()) {
      handleSearch(searchTerm, 1);
    } else {
      fetchData(1, newLimit);
    }
  }, [searchTerm, handleSearch, fetchData]);

  /**
   * Create new service
   */
  const createService = useCallback(async (serviceData) => {
    try {
      setLoading(true);
      await serviceService.createService(serviceData);
      
      // Refresh data
      if (searchTerm?.trim()) {
        await handleSearch(searchTerm, pagination.page);
      } else {
        await fetchData(pagination.page, pagination.limit);
      }
      
      toast.showSuccess('Đã thêm dịch vụ thành công!');
      return true;
    } catch (error) {
      console.error('Error creating service:', error);
      toast.showError('Không thể tạo dịch vụ mới. Vui lòng thử lại.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pagination.page, pagination.limit, handleSearch, fetchData, toast]);

  /**
   * Update service
   */
  const updateService = useCallback(async (serviceId, serviceData) => {
    try {
      setLoading(true);
      await serviceService.updateService(serviceId, serviceData);
      
      // Refresh data
      if (searchTerm?.trim()) {
        await handleSearch(searchTerm, pagination.page);
      } else {
        await fetchData(pagination.page, pagination.limit);
      }
      
      toast.showSuccess('Đã cập nhật dịch vụ thành công!');
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      toast.showError('Không thể cập nhật dịch vụ. Vui lòng thử lại.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pagination.page, pagination.limit, handleSearch, fetchData, toast]);

  /**
   * Delete service
   */
  const deleteService = useCallback(async (serviceId) => {
    try {
      setLoading(true);
      await serviceService.deleteService(serviceId);
      
      // Refresh data
      if (searchTerm?.trim()) {
        await handleSearch(searchTerm, pagination.page);
      } else {
        await fetchData(pagination.page, pagination.limit);
      }
      
      toast.showSuccess('Đã xóa dịch vụ thành công!');
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.showError('Không thể xóa dịch vụ. Vui lòng thử lại.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pagination.page, pagination.limit, handleSearch, fetchData, toast]);

  // Initial fetch
  useEffect(() => {
    fetchData(1, 15);
  }, [fetchData]);

  return {
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
  };
};

