import { Chip } from '@mui/material';
import React from 'react';
import { appointmentService, serviceService } from '../../services';

/**
 * Get pet name by ID from pets array
 * Supports both PascalCase and camelCase field names
 */
export const getPetName = (petId, pets) => {
  const pet = pets.find(p => (p.PetId || p.petId) === petId);
  return pet ? (pet.Name || pet.name) : 'Không xác định';
};

/**
 * Get service name by ID from services array
 * Supports both PascalCase and camelCase field names
 */
export const getServiceName = (serviceId, services) => {
  const service = services.find(s => (s.ServiceId || s.serviceId) === serviceId);
  return service ? (service.Name || service.name || service.ServiceName || service.serviceName) : 'Không xác định';
};

/**
 * Get doctor name by ID from doctors array
 * Supports both PascalCase and camelCase field names
 */
export const getDoctorName = (doctorId, doctors) => {
  if (!doctorId) return 'Chưa chỉ định';
  const doctor = doctors.find(d => (d.DoctorId || d.doctorId) === doctorId);
  return doctor ? (doctor.FullName || doctor.fullName || doctor.DoctorName || doctor.doctorName) : 'Không xác định';
};

/**
 * Get customer name by pet ID
 * First finds the pet, then finds the customer
 */
export const getCustomerName = (petId, pets, customers) => {
  const pet = pets.find(p => (p.PetId || p.petId) === petId);
  if (!pet) return 'Không xác định';
  
  const customerId = pet.CustomerId || pet.customerId;
  const customer = customers.find(c => (c.CustomerId || c.customerId) === customerId);
  return customer ? (customer.CustomerName || customer.customerName || customer.FullName || customer.fullName || customer.Username || customer.username) : 'Không xác định';
};

/**
 * Get status chip component with proper styling
 */
export const getStatusChip = (status) => {
  const statusInfo = appointmentService.getStatusInfo(status);
  return (
    <Chip
      label={statusInfo.label} 
      color={statusInfo.color} 
      size="small"
    />
  );
};

/**
 * Format appointment date for display
 */
export const formatAppointmentDate = (date) => {
  return date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa có';
};

/**
 * Format appointment time for display (HH:mm format)
 */
export const formatAppointmentTime = (time) => {
  return time ? time.substring(0, 5) : 'Chưa có';
};

/**
 * Process fetched data from API responses
 * Handles different response structures and ensures arrays
 */
export const processApiData = (results) => {
  const [appointmentsResult, petsResult, servicesResult, customersResult, doctorsResult] = results;
  
  // Process appointments
  let appointments = [];
  if (appointmentsResult.status === 'fulfilled') {
    appointments = Array.isArray(appointmentsResult.value) ? appointmentsResult.value : [];
  }

  // Process pets
  let pets = [];
  if (petsResult.status === 'fulfilled') {
    const petsData = petsResult.value;
    console.log('Processing pets data:', petsData);
    
    if (petsData && petsData.pets && Array.isArray(petsData.pets)) {
      pets = petsData.pets;
    } else if (petsData && petsData.data && Array.isArray(petsData.data)) {
      pets = petsData.data;
    } else if (Array.isArray(petsData)) {
      pets = petsData;
    }
    
    console.log('Processed pets:', pets);
  }

  // Process services  
  let services = [];
  if (servicesResult.status === 'fulfilled') {
    const servicesData = servicesResult.value;
    if (servicesData && servicesData.services && Array.isArray(servicesData.services)) {
      services = servicesData.services;
    } else if (Array.isArray(servicesData)) {
      services = servicesData;
    }
  }

  // Process customers
  let customers = [];
  if (customersResult.status === 'fulfilled') {
    const customersData = customersResult.value;
    if (customersData && customersData.customers && Array.isArray(customersData.customers)) {
      customers = customersData.customers;
    } else if (Array.isArray(customersData)) {
      customers = customersData;
    }
  }

  // Process doctors
  let doctors = [];
  if (doctorsResult.status === 'fulfilled') {
    const doctorsData = doctorsResult.value;
    if (doctorsData && doctorsData.doctors && Array.isArray(doctorsData.doctors)) {
      doctors = doctorsData.doctors;
    } else if (Array.isArray(doctorsData)) {
      doctors = doctorsData;
    }
  }
  
  return {
    appointments,
    pets,
    services,
    customers,
    doctors,
    errors: {
      appointments: appointmentsResult.status === 'rejected' ? appointmentsResult.reason : null,
      pets: petsResult.status === 'rejected' ? petsResult.reason : null,
      services: servicesResult.status === 'rejected' ? servicesResult.reason : null,
      customers: customersResult.status === 'rejected' ? customersResult.reason : null,
      doctors: doctorsResult.status === 'rejected' ? doctorsResult.reason : null,
    }
  };
};

/**
 * Format service display with price
 */
export const formatServiceDisplay = (service) => {
  const serviceName = service.Name || service.name || service.ServiceName || service.serviceName;
  const price = service.Price || service.price;
  return `${serviceName} - ${serviceService.formatPrice(price)}`;
};

/**
 * Format pet display with owner
 */
export const formatPetDisplay = (pet, customers) => {
  const petName = pet.Name || pet.name;
  const petId = pet.PetId || pet.petId;
  const customerName = getCustomerName(petId, [pet], customers);
  return `${petName} - ${customerName}`;
};

/**
 * Validate appointment form data
 */
export const validateAppointmentForm = (formData) => {
  const errors = {};
  
  if (!formData.petId) {
    errors.petId = 'Vui lòng chọn thú cưng';
  }
  
  if (!formData.serviceId) {
    errors.serviceId = 'Vui lòng chọn dịch vụ';
  }
  
  if (!formData.appointmentDate) {
    errors.appointmentDate = 'Vui lòng chọn ngày hẹn';
  }
  
  if (!formData.appointmentTime) {
    errors.appointmentTime = 'Vui lòng chọn giờ hẹn';
  }
  
  // Validate date is not in the past
  if (formData.appointmentDate) {
    const selectedDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.appointmentDate = 'Ngày hẹn không thể trong quá khứ';
    }
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Get field value supporting both naming conventions
 */
export const getFieldValue = (obj, field) => {
  const pascalCase = field.charAt(0).toUpperCase() + field.slice(1);
  return obj[pascalCase] || obj[field];
}; 