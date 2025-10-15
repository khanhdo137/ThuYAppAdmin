import { useState } from 'react';
import {
  DOCTOR_DIALOG_MODES,
  DOCTOR_INITIAL_FORM_DATA
} from './doctorConstants';
import { validateDoctorForm } from './doctorUtils';

/**
 * Custom hook for doctor form management
 */
export const useDoctorForm = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(DOCTOR_DIALOG_MODES.VIEW);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState(DOCTOR_INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});

  /**
   * Open dialog in specified mode
   */
  const openDialog = (mode, doctor = null) => {
    setDialogMode(mode);
    setSelectedDoctor(doctor);
    if (mode === DOCTOR_DIALOG_MODES.CREATE) {
      setFormData(DOCTOR_INITIAL_FORM_DATA);
    } else if (doctor) {
      setFormData({
        fullName: doctor.fullName || '',
        specialization: doctor.specialization || '',
        experienceYears: doctor.experienceYears?.toString() || '',
        branch: doctor.branch || ''
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
    setSelectedDoctor(null);
    setFormData(DOCTOR_INITIAL_FORM_DATA);
    setFormErrors({});
  };

  /**
   * Handle form field changes
   */
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Validate current form data
   */
  const validateForm = () => {
    const validation = validateDoctorForm(formData);
    setFormErrors(validation.errors);
    return validation.isValid;
  };

  /**
   * Get form data for submission
   */
  const getSubmissionData = () => {
    return {
      ...formData,
      experienceYears: parseInt(formData.experienceYears) || 0
    };
  };

  return {
    dialogOpen,
    dialogMode,
    selectedDoctor,
    formData,
    formErrors,
    openDialog,
    closeDialog,
    handleFormChange,
    validateForm,
    getSubmissionData,
    setFormData,
    setFormErrors,
    setDialogMode
  };
}; 