import { useCallback, useEffect, useState } from 'react';
import { appointmentService, customerService, doctorService, petService, serviceService } from '../../services';
import { useToast } from '../ToastProvider';
import {
    APPOINTMENT_ERROR_MESSAGES,
    APPOINTMENT_STATUS_FILTERS,
    APPOINTMENT_SUCCESS_MESSAGES
} from './appointmentConstants';
import { processApiData } from './appointmentUtils';

/**
 * Custom hook for appointments management
 * Handles all data fetching, CRUD operations, search and filter
 */
export const useAppointments = () => {
  // State
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(APPOINTMENT_STATUS_FILTERS.ALL);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0
  });

  const toast = useToast();

  /**
   * Enrich appointment with related names
   */
  const enrichAppointment = useCallback((appointment, petsData, servicesData, customersData, doctorsData) => {
    const petId = appointment.PetId || appointment.petId;
    const serviceId = appointment.ServiceId || appointment.serviceId;
    const doctorId = appointment.DoctorId || appointment.doctorId;
    
    // Find related data
    const pet = petsData?.find(p => (p.PetId || p.petId) === petId);
    const service = servicesData?.find(s => (s.ServiceId || s.serviceId) === serviceId);
    const doctor = doctorsData?.find(d => (d.DoctorId || d.doctorId) === doctorId);
    const customer = pet ? customersData?.find(c => (c.CustomerId || c.customerId) === (pet.CustomerId || pet.customerId)) : null;
    
    return {
      ...appointment,
      // Add name fields for easy access
      PetName: appointment.PetName || appointment.petName || pet?.PetName || pet?.petName || pet?.name || 'Chưa có',
      petName: appointment.PetName || appointment.petName || pet?.PetName || pet?.petName || pet?.name || 'Chưa có',
      ServiceName: appointment.ServiceName || appointment.serviceName || service?.ServiceName || service?.serviceName || service?.name || 'Chưa có',
      serviceName: appointment.ServiceName || appointment.serviceName || service?.ServiceName || service?.serviceName || service?.name || 'Chưa có',
      DoctorName: appointment.DoctorName || appointment.doctorName || doctor?.FullName || doctor?.fullName || doctor?.name || 'Chưa chọn',
      doctorName: appointment.DoctorName || appointment.doctorName || doctor?.FullName || doctor?.fullName || doctor?.name || 'Chưa chọn',
      CustomerName: appointment.CustomerName || appointment.customerName || customer?.FullName || customer?.fullName || customer?.name || 'Chưa có',
      customerName: appointment.CustomerName || appointment.customerName || customer?.FullName || customer?.fullName || customer?.name || 'Chưa có',
      OwnerName: appointment.OwnerName || appointment.ownerName || customer?.FullName || customer?.fullName || customer?.name || 'Chưa có',
      ownerName: appointment.OwnerName || appointment.ownerName || customer?.FullName || customer?.fullName || customer?.name || 'Chưa có',
      Price: appointment.Price || appointment.price || service?.Price || service?.price || 0,
      price: appointment.Price || appointment.price || service?.Price || service?.price || 0,
      // Add pet details
      Species: pet?.Species || pet?.species || '',
      species: pet?.Species || pet?.species || '',
      Breed: pet?.Breed || pet?.breed || '',
      breed: pet?.Breed || pet?.breed || '',
      // Add customer phone
      CustomerPhone: customer?.PhoneNumber || customer?.phoneNumber || customer?.phone || '',
      customerPhone: customer?.PhoneNumber || customer?.phoneNumber || customer?.phone || ''
    };
  }, []);

  /**
   * Sort appointments by date (newest first)
   */
  const sortAppointmentsByDate = useCallback((appointmentsArray) => {
    return [...appointmentsArray].sort((a, b) => {
      const dateA = new Date(`${a.AppointmentDate || a.appointmentDate} ${a.AppointmentTime || a.appointmentTime}`);
      const dateB = new Date(`${b.AppointmentDate || b.appointmentDate} ${b.AppointmentTime || b.appointmentTime}`);
      return dateB - dateA;
    });
  }, []);

  /**
   * Fetch all required data
   */
  const fetchData = useCallback(async (page = 1, limit = 15) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await Promise.allSettled([
        appointmentService.getAllAppointments(page, limit),
        petService.getAllPets(1, 1000),
        serviceService.getAllServices(),
        customerService.getCustomersForPetManagement(),
        doctorService.getAllDoctors()
      ]);
      
      const processedData = processApiData(results);
      
      // Set related data first so we can use it for enrichment
      const petsData = processedData.pets;
      const servicesData = processedData.services;
      const customersData = processedData.customers;
      const doctorsData = processedData.doctors;
      
      setPets(petsData);
      setServices(servicesData);
      setCustomers(customersData);
      setDoctors(doctorsData);
      
      // Handle appointments with pagination
      const appointmentsData = results[0].status === 'fulfilled' ? results[0].value : null;
      console.log('Raw appointments data:', appointmentsData);
      
      if (appointmentsData && appointmentsData.appointments && appointmentsData.pagination) {
        // Handle paginated response - ENRICH appointments
        const enrichedAppointments = appointmentsData.appointments.map(apt => 
          enrichAppointment(apt, petsData, servicesData, customersData, doctorsData)
        );
        const sortedAppointments = sortAppointmentsByDate(enrichedAppointments);
        setAppointments(sortedAppointments);
        setPagination(appointmentsData.pagination);
        console.log('Set pagination:', appointmentsData.pagination);
      } else if (processedData.appointments && Array.isArray(processedData.appointments)) {
        // Handle simple array response (fallback) - ENRICH appointments
        const enrichedAppointments = processedData.appointments.map(apt => 
          enrichAppointment(apt, petsData, servicesData, customersData, doctorsData)
        );
        const sortedAppointments = sortAppointmentsByDate(enrichedAppointments);
        setAppointments(sortedAppointments);
        // Set default pagination for non-paginated response
        setPagination({
          page: 1,
          limit: 15,
          total: processedData.appointments.length,
          totalPages: 1
        });
      } else {
        setAppointments([]);
        setPagination({
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0
        });
      }
      
      // Show errors for failed requests
      const { errors } = processedData;
      if (errors.appointments) {
        toast.showError('Không thể tải danh sách lịch hẹn');
      }
      if (errors.pets) {
        toast.showError('Không thể tải danh sách thú cưng');
      }
      if (errors.services) {
        toast.showError('Không thể tải danh sách dịch vụ');
      }
      if (errors.customers) {
        toast.showError('Không thể tải danh sách khách hàng');
      }
      if (errors.doctors) {
        toast.showError('Không thể tải danh sách bác sĩ');
      }
      
    } catch (error) {
      toast.showError(APPOINTMENT_ERROR_MESSAGES.FETCH_FAILED);
      setError(APPOINTMENT_ERROR_MESSAGES.FETCH_FAILED);
      
      // Ensure arrays even on error
      setAppointments([]);
      setPets([]);
      setServices([]);
      setCustomers([]);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [sortAppointmentsByDate, toast]);

  /**
   * Search appointments
   */
  const handleSearch = useCallback(async (searchValue, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      setSearchTerm(searchValue || '');
      
      let data;
      if (searchValue?.trim()) {
        data = await appointmentService.searchAppointments(searchValue, page, 15);
      } else {
        data = await appointmentService.getAllAppointments(page, 15);
      }
      
      // Handle paginated response
      console.log('Search data:', data);
      if (data && data.appointments && data.pagination) {
        // ENRICH appointments before sorting
        const enrichedAppointments = data.appointments.map(apt => 
          enrichAppointment(apt, pets, services, customers, doctors)
        );
        const sortedAppointments = sortAppointmentsByDate(enrichedAppointments);
        setAppointments(sortedAppointments);
        setPagination(data.pagination);
        console.log('Set search pagination:', data.pagination);
      } else if (Array.isArray(data)) {
        // ENRICH appointments before sorting
        const enrichedAppointments = data.map(apt => 
          enrichAppointment(apt, pets, services, customers, doctors)
        );
        const sortedAppointments = sortAppointmentsByDate(enrichedAppointments);
        setAppointments(sortedAppointments);
        setPagination({
          page: 1,
          limit: 15,
          total: data.length,
          totalPages: 1
        });
      } else {
        setAppointments([]);
        setPagination({
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      setError(APPOINTMENT_ERROR_MESSAGES.SEARCH_FAILED);
      toast.showError(APPOINTMENT_ERROR_MESSAGES.SEARCH_FAILED);
      setAppointments([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [sortAppointmentsByDate, toast, enrichAppointment, pets, services, customers, doctors]);

  /**
   * Filter appointments by status
   */
  const handleStatusFilter = useCallback(async (status, page = 1) => {
    try {
      setLoading(true);
      setStatusFilter(status);
      
      let data;
      if (status === APPOINTMENT_STATUS_FILTERS.ALL) {
        data = await appointmentService.getAllAppointments(page, 15);
      } else {
        data = await appointmentService.getAppointmentsByStatus(parseInt(status), page);
      }
      
      // Handle paginated response
      console.log('Status filter data:', data);
      if (data && data.appointments && data.pagination) {
        // ENRICH appointments before sorting
        const enrichedAppointments = data.appointments.map(apt => 
          enrichAppointment(apt, pets, services, customers, doctors)
        );
        const sortedAppointments = sortAppointmentsByDate(enrichedAppointments);
        setAppointments(sortedAppointments);
        setPagination(data.pagination);
        console.log('Set status filter pagination:', data.pagination);
      } else if (Array.isArray(data)) {
        // ENRICH appointments before sorting
        const enrichedAppointments = data.map(apt => 
          enrichAppointment(apt, pets, services, customers, doctors)
        );
        const sortedAppointments = sortAppointmentsByDate(enrichedAppointments);
        setAppointments(sortedAppointments);
        setPagination({
          page: 1,
          limit: 15,
          total: data.length,
          totalPages: 1
        });
      } else {
        setAppointments([]);
        setPagination({
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      toast.showError('Không thể lọc lịch hẹn theo trạng thái. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [sortAppointmentsByDate, toast, enrichAppointment, pets, services, customers, doctors]);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((newPage) => {
    if (searchTerm?.trim()) {
      handleSearch(searchTerm, newPage);
    } else if (statusFilter !== APPOINTMENT_STATUS_FILTERS.ALL) {
      handleStatusFilter(statusFilter, newPage);
    } else {
      fetchData(newPage, pagination.limit);
    }
  }, [searchTerm, statusFilter, pagination.limit, handleSearch, handleStatusFilter, fetchData]);

  /**
   * Handle rows per page change
   */
  const handleLimitChange = useCallback((newLimit) => {
    if (searchTerm?.trim()) {
      handleSearch(searchTerm, 1);
    } else if (statusFilter !== APPOINTMENT_STATUS_FILTERS.ALL) {
      handleStatusFilter(statusFilter, 1);
    } else {
      fetchData(1, newLimit);
    }
  }, [searchTerm, statusFilter, handleSearch, handleStatusFilter, fetchData]);

  /**
   * Create new appointment
   */
  const createAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      
      await appointmentService.createAppointment(appointmentData);
      
      // Refresh data
      await fetchData();
      
      toast.showSuccess(APPOINTMENT_SUCCESS_MESSAGES.CREATE_SUCCESS);
      return { success: true };
      
    } catch (error) {
      toast.showError(APPOINTMENT_ERROR_MESSAGES.CREATE_FAILED);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update existing appointment
   */
  const updateAppointment = async (appointmentId, appointmentData) => {
    try {
      setLoading(true);
      
      await appointmentService.updateAppointment(appointmentId, appointmentData);
      
      // Refresh data
      await fetchData();
      
      toast.showSuccess(APPOINTMENT_SUCCESS_MESSAGES.UPDATE_SUCCESS);
      return { success: true };
      
    } catch (error) {
      toast.showError(APPOINTMENT_ERROR_MESSAGES.UPDATE_FAILED);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update appointment status only
   */
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      
      // Update local state immediately for better UX
      setAppointments(prev => prev.map(appointment => {
        const id = appointment.AppointmentId || appointment.appointmentId;
        if (id === appointmentId) {
          return {
            ...appointment,
            Status: newStatus,
            status: newStatus
          };
        }
        return appointment;
      }));
      
      toast.showSuccess(APPOINTMENT_SUCCESS_MESSAGES.STATUS_UPDATE_SUCCESS);
      
    } catch (error) {
      toast.showError(APPOINTMENT_ERROR_MESSAGES.STATUS_UPDATE_FAILED);
      
      // Refresh data on error to ensure consistency
      await fetchData();
    }
  };

  /**
   * Delete appointment
   */
  const deleteAppointment = async (appointmentId) => {
    try {
      await appointmentService.deleteAppointment(appointmentId);
      
      // Remove from local state immediately
      setAppointments(prev => prev.filter(appointment => {
        const id = appointment.AppointmentId || appointment.appointmentId;
        return id !== appointmentId;
      }));
      
      toast.showSuccess(APPOINTMENT_SUCCESS_MESSAGES.DELETE_SUCCESS);
      return { success: true };
      
    } catch (error) {
      toast.showError(APPOINTMENT_ERROR_MESSAGES.DELETE_FAILED);
      return { success: false, error };
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData(1, 15);
  }, [fetchData]);

  return {
    // State
    appointments,
    pets,
    services,
    customers,
    doctors,
    loading,
    error,
    searchTerm,
    statusFilter,
    pagination,
    
    // Actions
    fetchData,
    handleSearch,
    handleStatusFilter,
    handlePageChange,
    handleLimitChange,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    
    // Setters for external control
    setError,
    setSearchTerm,
    setStatusFilter
  };
}; 

// Default export for compatibility
export default useAppointments; 