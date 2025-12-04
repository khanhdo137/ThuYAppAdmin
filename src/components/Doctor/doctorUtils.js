import { doctorService } from '../../services';

/**
 * Validate doctor form data - using doctorService
 */
export const validateDoctorForm = (formData) => {
  // Convert form data to match API format
  const apiData = {
    fullName: formData.fullName,
    specialization: formData.specialization,
    experienceYears: parseInt(formData.experienceYears) || null,
    branch: formData.branch
  };
  
  return doctorService.validateDoctorData(apiData);
};

/**
 * Format experience years for display - using doctorService
 */
export const formatExperience = (years) => {
  return doctorService.formatExperience(years);
};

/**
 * Get branch label - using doctorService
 */
export const getBranchLabel = (branch) => {
  return doctorService.getBranchLabel(branch);
};

/**
 * Get specialization label - using doctorService
 */
export const getSpecializationLabel = (specialization) => {
  return doctorService.getSpecializationLabel(specialization);
}; 