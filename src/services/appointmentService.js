import apiService from './apiService';

class AppointmentService {
  // Get API URL helper
  getApiUrl() {
    return process.env.REACT_APP_API_BASE_URL || 'http://192.168.1.33:5074/api';
  }

  // Get all appointments (for admin)
  async getAllAppointments(page = 1, limit = 15, status = null, date = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (status !== null && status !== 'all') {
        params.append('status', status.toString());
      }
      
      if (date) {
        params.append('date', date);
      }

      const url = `${this.getApiUrl()}/Appointment/admin?${params}`;
      console.log('🔍 Fetching appointments from:', url);
      console.log('🔍 Headers:', apiService.getHeaders());

      const response = await apiService.fetchWithFallback(url, {
        method: 'GET',
        headers: apiService.getHeaders(),
      });
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      
      const result = await apiService.handleResponse(response);
      console.log('getAllAppointments result:', result);
      
      // Backend returns { appointments: [], pagination: {} }
      // Return the full result object with both appointments and pagination
      return result || { appointments: [], pagination: { page: 1, limit: 15, total: 0, totalPages: 0 } };
    } catch (error) {
      console.error('❌ Error getting all appointments:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Get appointment by ID (for admin)
  async getAppointmentById(id) {
    try {
      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/Appointment/admin/${id}`, {
        method: 'GET',
        headers: apiService.getHeaders(),
      });
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error getting appointment by ID:', error);
      throw error;
    }
  }

  // Search appointments (for admin)
  async searchAppointments(searchTerm, page = 1, limit = 15) {
    try {
      console.log('Searching appointments with term:', searchTerm);
      const params = {
        query: searchTerm,
        page: page.toString(),
        limit: limit.toString()
      };

      const result = await apiService.getWithParams('Appointment/admin/search', params);
      console.log('Search result:', result);
      
      // Backend returns { appointments: [], pagination: {} }
      // Return the full result object with both appointments and pagination
      return result || { appointments: [], pagination: { page: 1, limit: 15, total: 0, totalPages: 0 } };
    } catch (error) {
      console.error('Error searching appointments:', error);
      throw error;
    }
  }

  // Create new appointment (for admin)
  async createAppointment(appointmentData) {
    try {
      // Map frontend fields to backend DTO (PascalCase for C#)
      const createDto = {
        PetId: parseInt(appointmentData.petId),
        ServiceId: parseInt(appointmentData.serviceId),
        DoctorId: appointmentData.doctorId ? parseInt(appointmentData.doctorId) : null,
        AppointmentDate: appointmentData.appointmentDate,
        AppointmentTime: appointmentData.appointmentTime,
        Weight: appointmentData.weight ? parseFloat(appointmentData.weight) : null,
        Age: appointmentData.age ? parseInt(appointmentData.age) : null,
        IsNewPet: appointmentData.isNewPet || false,
        Notes: appointmentData.notes || null
      };

      console.log('🚀 Creating appointment with data:', createDto);
      
      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/Appointment/admin`, {
        method: 'POST',
        headers: apiService.getHeaders(),
        body: JSON.stringify(createDto),
      });
      
      console.log('✅ Create appointment response status:', response.status);
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  // Update appointment (for admin)
  async updateAppointment(id, appointmentData) {
    try {
      // Map frontend fields to backend DTO (PascalCase for C#)
      const updateDto = {
        PetId: parseInt(appointmentData.petId),
        ServiceId: parseInt(appointmentData.serviceId),
        DoctorId: appointmentData.doctorId ? parseInt(appointmentData.doctorId) : null,
        AppointmentDate: appointmentData.appointmentDate,
        AppointmentTime: appointmentData.appointmentTime,
        Weight: appointmentData.weight ? parseFloat(appointmentData.weight) : null,
        Age: appointmentData.age ? parseInt(appointmentData.age) : null,
        IsNewPet: appointmentData.isNewPet || false,
        Notes: appointmentData.notes || null
      };

      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/Appointment/admin/${id}`, {
        method: 'PUT',
        headers: apiService.getHeaders(),
        body: JSON.stringify(updateDto),
      });
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  // Update appointment status (for admin)
  async updateAppointmentStatus(id, status) {
    try {
      console.log(`🔄 Updating appointment ${id} status to ${status}`);
      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/Appointment/admin/${id}/status`, {
        method: 'PATCH',
        headers: apiService.getHeaders(),
        body: JSON.stringify(parseInt(status)), // Backend expects just the status number as int
      });
      console.log('✅ Status update response:', response.status);
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
      throw error;
    }
  }

  // Delete appointment (for admin)
  async deleteAppointment(id) {
    try {
      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/Appointment/admin/${id}`, {
        method: 'DELETE',
        headers: apiService.getHeaders(),
      });
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  // Filter appointments by status
  async getAppointmentsByStatus(status, page = 1, limit = 15) {
    return await this.getAllAppointments(page, limit, status);
  }

  // Filter appointments by date
  async getAppointmentsByDate(date, page = 1, limit = 15) {
    return await this.getAllAppointments(page, limit, null, date);
  }

  // Get status options
  getStatusOptions() {
    return [
      { value: 0, label: 'Chờ xác nhận', color: 'warning' },
      { value: 1, label: 'Đã xác nhận', color: 'info' },
      { value: 2, label: 'Hoàn thành', color: 'success' },
      { value: 3, label: 'Đã hủy', color: 'error' }
    ];
  }

  // Get status name and color
  getStatusInfo(status) {
    const options = this.getStatusOptions();
    return options.find(option => option.value === status) || { label: 'Không xác định', color: 'default' };
  }

  // Get time slots
  getTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        slots.push({ value: time, label: time.substring(0, 5) }); // Show HH:mm format
      }
    }
    return slots;
  }

  // Format appointment data for display
  formatAppointmentData(appointment) {
    return {
      ...appointment,
      appointmentDate: appointment.appointmentDate ? 
        new Date(appointment.appointmentDate).toLocaleDateString('vi-VN') : 'Chưa có',
      createdAt: appointment.createdAt ? 
        new Date(appointment.createdAt).toLocaleDateString('vi-VN') : 'Chưa có',
      statusInfo: this.getStatusInfo(appointment.status)
    };
  }

  // Get pet's latest medical info (weight from latest appointment)
  async getPetMedicalInfo(petId) {
    try {
      // Get recent appointments to find latest weight
      const response = await apiService.fetchWithFallback(`${this.getApiUrl()}/Appointment/admin?page=1&limit=50`, {
        method: 'GET',
        headers: apiService.getHeaders(),
      });
      
      const result = await apiService.handleResponse(response);
      const appointments = result.appointments || [];
      
      // Find latest appointment for this pet with weight info
      const petAppointments = appointments
        .filter(apt => {
          const appointmentPetId = apt.PetId || apt.petId;
          const weight = apt.Weight || apt.weight;
          return appointmentPetId === petId && weight && weight > 0;
        })
        .sort((a, b) => {
          const dateA = new Date(a.CreatedAt || a.createdAt || a.AppointmentDate || a.appointmentDate);
          const dateB = new Date(b.CreatedAt || b.createdAt || b.AppointmentDate || b.appointmentDate);
          return dateB - dateA; // Newest first
        });

      const latestAppointment = petAppointments[0];

      return {
        weight: latestAppointment ? (latestAppointment.Weight || latestAppointment.weight) : null,
        lastWeightDate: latestAppointment ? (latestAppointment.CreatedAt || latestAppointment.createdAt) : null
      };
    } catch (error) {
      console.error('Error getting pet medical info:', error);
      return { weight: null, lastWeightDate: null };
    }
  }

  // Calculate age in months from birth date
  calculateAgeInMonths(birthDate) {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    
    // Adjust if the day hasn't occurred this month
    if (today.getDate() < birth.getDate()) {
      months--;
    }
    
    return Math.max(0, months);
  }

  // Validate appointment time
  isValidAppointmentTime(date, time) {
    const appointmentDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    // Không thể đặt lịch trong quá khứ
    if (appointmentDateTime < now) {
      return { valid: false, message: 'Không thể đặt lịch trong quá khứ' };
    }

    // Chỉ cho phép đặt lịch trong giờ làm việc (8:00 - 17:30)
    const hour = parseInt(time.split(':')[0]);
    const minute = parseInt(time.split(':')[1]);
    if (hour < 8 || hour > 17 || (hour === 17 && minute > 30)) {
      return { valid: false, message: 'Chỉ có thể đặt lịch từ 8:00 đến 17:30' };
    }

    return { valid: true };
  }

  // Get appointments by customer ID (admin) - filter admin appointments by customer
  async getAppointmentsByCustomerId(customerId) {
    try {
      console.log('Getting appointments for customer:', customerId);
      
      // Get all appointments and filter by customer
      const result = await apiService.get('/appointment/admin?limit=1000&page=1');
      console.log('getAppointmentsByCustomerId response:', result);
      
      // Backend returns { appointments: [], pagination: {} }
      const allAppointments = result.appointments || [];
      
      // Since we don't have direct customerId in appointments, we'll need to get the customer name
      // and filter by that, or get pets first to find petIds belonging to this customer
      return allAppointments; // For now, return all and we'll filter in the frontend
      
    } catch (error) {
      console.error('Error getting appointments by customer ID:', error);
      return [];
    }
  }
}

const appointmentService = new AppointmentService();
export default appointmentService; 