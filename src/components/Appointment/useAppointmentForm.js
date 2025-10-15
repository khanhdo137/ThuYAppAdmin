import { useState } from 'react';
import { calculateAge } from '../Pet/petUtils';
import {
    APPOINTMENT_DIALOG_MODES,
    APPOINTMENT_INITIAL_FORM_DATA
} from './appointmentConstants';
import { validateAppointmentForm } from './appointmentUtils';

/**
 * Custom hook for appointment form management
 * Handles form state, validation, and dialog management
 */
export const useAppointmentForm = ({ pets } = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(APPOINTMENT_DIALOG_MODES.VIEW);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState(APPOINTMENT_INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});

  /**
   * Calculate pet's age in years
   */
  const calculatePetAge = (birthDate) => {
    if (!birthDate) return null;
    
    const ageText = calculateAge(birthDate);
    if (ageText.includes('tháng')) {
      return 0; // Less than 1 year
    }
    return parseInt(ageText.split(' ')[0]) || 0;
  };

  /**
   * Open dialog in specified mode
   */
  const openDialog = (mode, appointment = null) => {
    setDialogMode(mode);
    setSelectedAppointment(appointment);
    
    if (mode === APPOINTMENT_DIALOG_MODES.CREATE) {
      setFormData({
        ...APPOINTMENT_INITIAL_FORM_DATA,
        status: 0 // Chờ xác nhận
      });
    } else if (appointment) {
      // Get pet information if available
      const petId = appointment.PetId || appointment.petId;
      const selectedPet = pets && petId ? pets.find(pet => 
        String(pet.PetId || pet.petId) === String(petId)
      ) : null;

      // Calculate pet's age if birth date is available
      const petAge = selectedPet ? calculatePetAge(selectedPet.birthDate || selectedPet.BirthDate) : null;
      
      // Map appointment data to form format
      setFormData({
        petId: petId || '',
        serviceId: appointment.ServiceId || appointment.serviceId || '',
        doctorId: appointment.DoctorId || appointment.doctorId || '',
        appointmentDate: appointment.AppointmentDate || appointment.appointmentDate || '',
        appointmentTime: appointment.AppointmentTime || appointment.appointmentTime || '',
        age: petAge !== null ? petAge : (appointment.Age || appointment.age || ''),
        isNewPet: appointment.IsNewPet || appointment.isNewPet || false,
        notes: appointment.Notes || appointment.notes || '',
        status: appointment.Status !== undefined ? appointment.Status : (appointment.status || 0)
      });
    }
    
    setFormErrors({});
    setDialogOpen(true);
  };

  /**
   * Close dialog and reset form
   */
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedAppointment(null);
    setFormData(APPOINTMENT_INITIAL_FORM_DATA);
    setFormErrors({});
  };

  /**
   * Handle form field changes
   */
  const handleFormChange = async (field, value) => {
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
    
    // Auto-fill pet information when a pet is selected
    if (field === 'petId' && value && pets) {
      const selectedPet = pets.find(pet => String(pet.PetId || pet.petId) === String(value));
      
      if (selectedPet) {
        // Calculate pet's age from birth date
        const petAge = calculatePetAge(selectedPet.birthDate || selectedPet.BirthDate);
        
        const newData = {
          ...formData,
          petId: value,
          age: petAge !== null ? petAge : '',
          isNewPet: false
        };
        setFormData(newData);
      }
    }
  };

  /**
   * Validate current form data
   */
  const validateForm = () => {
    const validation = validateAppointmentForm(formData);
    setFormErrors(validation.errors);
    return validation.isValid;
  };

  /**
   * Get form data for submission
   */
  const getSubmissionData = () => {
    return {
      ...formData,
      // Convert string values to appropriate types
      age: formData.age ? parseInt(formData.age) : null,
      status: parseInt(formData.status)
    };
  };

  return {
    // Dialog state
    dialogOpen,
    dialogMode,
    selectedAppointment,
    
    // Form state
    formData,
    formErrors,
    
    // Actions
    openDialog,
    closeDialog,
    handleFormChange,
    validateForm,
    getSubmissionData,
    
    // Direct setters for external control
    setFormData,
    setFormErrors,
    setDialogMode
  };
}; 

// Default export for compatibility  
export default useAppointmentForm; 