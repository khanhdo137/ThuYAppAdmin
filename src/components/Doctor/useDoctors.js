import { useCallback, useEffect, useState } from 'react';
import { doctorService } from '../../services';
import { useToast } from '../ToastProvider';
import {
    DOCTOR_ERROR_MESSAGES,
    DOCTOR_SEARCH_DEBOUNCE_DELAY,
    DOCTOR_SUCCESS_MESSAGES
} from './doctorConstants';

/**
 * Custom hook for doctors management
 */
export const useDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const toast = useToast();

  /**
   * Fetch all doctors
   */
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorService.getAllDoctors();
      const data = response?.doctors || response;
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.showError(DOCTOR_ERROR_MESSAGES.FETCH_FAILED);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Debounced search
   */
  const performSearch = useCallback(async (searchValue) => {
    try {
      setLoading(true);
      setError(null);
      
      if (searchValue.trim()) {
        const data = await doctorService.searchDoctors(searchValue);
        setDoctors(Array.isArray(data) ? data : []);
      } else {
        await fetchDoctors();
      }
    } catch (error) {
      console.error('Error searching doctors:', error);
      setError(error.message || DOCTOR_ERROR_MESSAGES.SEARCH_FAILED);
      toast.showError(DOCTOR_ERROR_MESSAGES.SEARCH_FAILED);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      performSearch(searchValue);
    }, DOCTOR_SEARCH_DEBOUNCE_DELAY);
    setSearchTimeout(timeout);
  };

  /**
   * Create doctor
   */
  const createDoctor = async (doctorData) => {
    try {
      setLoading(true);
      await doctorService.createDoctor(doctorData);
      await fetchDoctors();
      toast.showSuccess(DOCTOR_SUCCESS_MESSAGES.CREATE_SUCCESS);
      return { success: true };
    } catch (error) {
      toast.showError(DOCTOR_ERROR_MESSAGES.CREATE_FAILED);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update doctor
   */
  const updateDoctor = async (doctorId, doctorData) => {
    try {
      setLoading(true);
      await doctorService.updateDoctor(doctorId, doctorData);
      await fetchDoctors();
      toast.showSuccess(DOCTOR_SUCCESS_MESSAGES.UPDATE_SUCCESS);
      return { success: true };
    } catch (error) {
      toast.showError(DOCTOR_ERROR_MESSAGES.UPDATE_FAILED);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete doctor
   */
  const deleteDoctor = async (doctorId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này?')) {
      return { success: false, cancelled: true };
    }
    try {
      await doctorService.deleteDoctor(doctorId);
      setDoctors(prev => prev.filter(d => d.doctorId !== doctorId));
      toast.showSuccess(DOCTOR_SUCCESS_MESSAGES.DELETE_SUCCESS);
      return { success: true };
    } catch (error) {
      toast.showError(DOCTOR_ERROR_MESSAGES.DELETE_FAILED);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  return {
    doctors,
    loading,
    error,
    searchTerm,
    fetchDoctors,
    handleSearch,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    setError,
    setSearchTerm
  };
}; 