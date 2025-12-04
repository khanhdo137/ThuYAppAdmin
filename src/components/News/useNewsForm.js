import { useState } from 'react';
import {
    NEWS_DIALOG_MODES,
    NEWS_INITIAL_FORM_DATA,
    NEWS_VIEW_MODES
} from './newsConstants';
import { validateNewsForm } from './newsUtils';

/**
 * Custom hook for news form management
 * Handles form state, validation, dialog management, and view mode
 */
export const useNewsForm = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(NEWS_DIALOG_MODES.VIEW);
  const [selectedNews, setSelectedNews] = useState(null);
  const [formData, setFormData] = useState(NEWS_INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [viewMode, setViewMode] = useState(NEWS_VIEW_MODES.TABLE);

  /**
   * Open dialog in specified mode
   */
  const openDialog = (mode, news = null) => {
    setDialogMode(mode);
    setSelectedNews(news);
    
    if (mode === NEWS_DIALOG_MODES.CREATE) {
      setFormData(NEWS_INITIAL_FORM_DATA);
    } else if (news) {
      setFormData({
        title: news.title || '',
        content: news.content || '',
        tags: news.tags || '',
        imageUrl: news.imageUrl || ''
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
    setSelectedNews(null);
    setFormData(NEWS_INITIAL_FORM_DATA);
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
    
    // Clear error for this field
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
    const validation = validateNewsForm(formData);
    setFormErrors(validation.errors);
    return validation.isValid;
  };

  /**
   * Get form data for submission
   */
  const getSubmissionData = () => {
    return {
      ...formData,
      // Trim whitespace from string fields
      title: formData.title.trim(),
      content: formData.content.trim(),
      tags: formData.tags.trim(),
      imageUrl: formData.imageUrl.trim()
    };
  };

  /**
   * Toggle view mode between table and cards
   */
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return {
    // Dialog state
    dialogOpen,
    dialogMode,
    selectedNews,
    
    // Form state
    formData,
    formErrors,
    
    // View state
    viewMode,
    
    // Actions
    openDialog,
    closeDialog,
    handleFormChange,
    validateForm,
    getSubmissionData,
    toggleViewMode,
    
    // Direct setters for external control
    setFormData,
    setFormErrors,
    setDialogMode,
    setViewMode
  };
}; 