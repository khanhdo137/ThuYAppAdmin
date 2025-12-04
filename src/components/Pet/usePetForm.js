import { useState } from 'react';
import { cloudinaryService } from '../../services';
import { useToast } from '../ToastProvider';
import {
    PET_DIALOG_MODES,
    PET_ERROR_MESSAGES,
    PET_INITIAL_FORM_DATA,
    PET_SUCCESS_MESSAGES
} from './petConstants';
import { formatPetSubmissionData, getPetFieldValue, validatePetForm } from './petUtils';

/**
 * Custom hook for pet form management
 * Handles form state, validation, dialog management, and image upload
 */
export const usePetForm = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(PET_DIALOG_MODES.VIEW);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState(PET_INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  
  // Image upload tracking
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const toast = useToast();

  /**
   * Open dialog in specified mode
   */
  const openDialog = (mode, pet = null) => {
    setDialogMode(mode);
    setSelectedPet(pet);
    
    if (mode === PET_DIALOG_MODES.CREATE) {
      setFormData(PET_INITIAL_FORM_DATA);
      setOriginalImageUrl('');
      setPendingImageFile(null);
    } else if (pet) {
      console.log('Opening edit dialog for pet:', pet);
      
      const currentImageUrl = getPetFieldValue(pet, 'imageUrl') || '';
      const birthDate = getPetFieldValue(pet, 'birthDate') || '';
      
      // Format birthDate to YYYY-MM-DD if needed
      const formattedBirthDate = birthDate ? new Date(birthDate).toISOString().split('T')[0] : '';
      
      // Get gender value directly
      const gender = getPetFieldValue(pet, 'gender') || getPetFieldValue(pet, 'Gender') || '';
      
      setFormData({
        petId: getPetFieldValue(pet, 'petId') || getPetFieldValue(pet, 'PetId') || '',
        customerId: getPetFieldValue(pet, 'customerId') || getPetFieldValue(pet, 'CustomerId') || '',
        name: getPetFieldValue(pet, 'name') || getPetFieldValue(pet, 'Name') || '',
        species: getPetFieldValue(pet, 'species') || getPetFieldValue(pet, 'Species') || '',
        breed: getPetFieldValue(pet, 'breed') || getPetFieldValue(pet, 'Breed') || '',
        gender: gender,
        birthDate: formattedBirthDate,
        imageUrl: currentImageUrl,
        notes: getPetFieldValue(pet, 'notes') || getPetFieldValue(pet, 'Notes') || ''
      });
      
      setOriginalImageUrl(currentImageUrl);
      setPendingImageFile(null);
    }
    
    setFormErrors({});
    setDialogOpen(true);
  };

  /**
   * Close dialog and reset form
   */
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedPet(null);
    setFormData(PET_INITIAL_FORM_DATA);
    setFormErrors({});
    setOriginalImageUrl('');
    setPendingImageFile(null);
    setImageUploading(false);
  };

  /**
   * Handle form field changes
   */
  const handleFormChange = (field, value) => {
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
  };

  /**
   * Handle image file selection and upload
   */
  const handleImageUpload = async (file) => {
    if (!file) return;

    console.log('🖼️ Starting image upload process:', file.name, file.size);
    
    try {
      setImageUploading(true);
      setPendingImageFile(file);
      
      console.log('📤 Uploading to Cloudinary...');
      const imageUrl = await cloudinaryService.uploadImage(file);
      console.log('✅ Image uploaded successfully:', imageUrl);
      
      // Update form data with new image URL
      setFormData(prev => ({ ...prev, imageUrl }));
      toast.showSuccess(PET_SUCCESS_MESSAGES.IMAGE_UPLOAD_SUCCESS);
      
    } catch (error) {
      console.error('💥 Image upload failed:', error);
      toast.showError(PET_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED);
      setPendingImageFile(null);
    } finally {
      setImageUploading(false);
    }
  };

  /**
   * Handle image removal
   */
  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setPendingImageFile(null);
  };

  /**
   * Validate current form data
   */
  const validateForm = () => {
    const validation = validatePetForm(formData);
    setFormErrors(validation.errors);
    return validation.isValid;
  };

  /**
   * Get form data for submission
   */
  const getSubmissionData = () => {
    return formatPetSubmissionData(formData);
  };

  /**
   * Check if form has unsaved changes
   */
  const hasUnsavedChanges = () => {
    if (dialogMode === PET_DIALOG_MODES.CREATE) {
      // Check if any field has been filled
      return Object.values(formData).some(value => value && value.toString().trim() !== '');
    }
    
    if (dialogMode === PET_DIALOG_MODES.EDIT && selectedPet) {
      // Check if any field has changed from original
      const originalData = {
        customerId: getPetFieldValue(selectedPet, 'customerId') || '',
        name: getPetFieldValue(selectedPet, 'name') || '',
        species: getPetFieldValue(selectedPet, 'species') || '',
        breed: getPetFieldValue(selectedPet, 'breed') || '',
        gender: getPetFieldValue(selectedPet, 'gender') || '',
        birthDate: getPetFieldValue(selectedPet, 'birthDate') || '',
        imageUrl: originalImageUrl,
        notes: getPetFieldValue(selectedPet, 'notes') || ''
      };
      
      return Object.keys(formData).some(key => 
        formData[key] !== originalData[key]
      );
    }
    
    return false;
  };

  const handleSubmit = async () => {
    if (dialogMode === PET_DIALOG_MODES.CREATE) {
      // ... existing code ...
    }
    if (dialogMode === PET_DIALOG_MODES.EDIT && selectedPet) {
      // ... existing code ...
    }
  };

  return {
    // Dialog state
    dialogOpen,
    dialogMode,
    selectedPet,
    
    // Form state
    formData,
    formErrors,
    
    // Image state
    pendingImageFile,
    originalImageUrl,
    imageUploading,
    
    // Actions
    openDialog,
    closeDialog,
    handleFormChange,
    handleImageUpload,
    handleImageRemove,
    validateForm,
    getSubmissionData,
    hasUnsavedChanges,
    
    // Direct setters for external control
    setFormData,
    setFormErrors,
    setDialogMode
  };
}; 