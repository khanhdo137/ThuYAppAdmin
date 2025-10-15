import { useCallback, useEffect, useState } from 'react';
import { customerService, petService } from '../../services';
import { useToast } from '../ToastProvider';
import {
  PET_CUSTOMER_LOAD_STATES,
  PET_ERROR_MESSAGES,
  PET_SEARCH_DEBOUNCE_DELAY
} from './petConstants';
import { createPetSuccessMessage, findPetById } from './petUtils';

/**
 * Custom hook for pets management
 * Handles all data fetching, CRUD operations, search, and customer management
 */
export const usePets = () => {
  // State
  const [pets, setPets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [customerLoadState, setCustomerLoadState] = useState(PET_CUSTOMER_LOAD_STATES.LOADING);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  const toast = useToast();

  /**
   * Fetch all pets and customers data
   */
  const fetchData = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting to fetch pets and customers data...');
      
      // Fetch pets with pagination
      const petsResult = await petService.getAllPets(page, limit);
      console.log('Pets result:', petsResult);
      
      // Fetch customers
      const customersResult = await customerService.getCustomersForPetManagement();
      console.log('Customers result:', customersResult);
      
      if (petsResult.pets) {
        setPets(petsResult.pets);
        setPagination(petsResult.pagination);
      } else {
        console.error('❌ Failed to load pets: Invalid data format');
        toast.showError(PET_ERROR_MESSAGES.PETS_LOAD_FAILED);
      }
      
      if (customersResult.customers) {
        setCustomers(customersResult.customers);
        setCustomerLoadState(PET_CUSTOMER_LOAD_STATES.LOADED);
      } else {
        console.error('❌ Failed to load customers: Invalid data format');
        toast.showError(PET_ERROR_MESSAGES.CUSTOMERS_LOAD_FAILED);
        setCustomerLoadState(PET_CUSTOMER_LOAD_STATES.ERROR);
      }
      
      console.log('🎯 Final state update:');
      console.log('   - Pets:', petsResult);
      console.log('   - Customers:', customersResult);
      
    } catch (error) {
      console.error('💥 Critical error in fetchData:', error);
      toast.showError(PET_ERROR_MESSAGES.FETCH_FAILED);
      setError(PET_ERROR_MESSAGES.FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    fetchData(newPage, pagination.limit);
  };

  /**
   * Handle rows per page change
   */
  const handleLimitChange = (newLimit) => {
    fetchData(1, newLimit);
  };

  /**
   * Debounced search function
   */
  const performSearch = useCallback(async (searchValue) => {
    try {
      setLoading(true);
      console.log('Performing search with value:', searchValue);
      
      const result = await petService.searchPets(searchValue, pagination.page, pagination.limit);
      console.log('Search result:', result);
      
      if (result.pets) {
        setPets(result.pets);
        setPagination(result.pagination);
      } else {
        console.error('Invalid search results format:', result);
        setPets([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error searching pets:', error);
      toast.showError(PET_ERROR_MESSAGES.SEARCH_FAILED);
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, toast]);

  /**
   * Handle search with debouncing
   */
  const handleSearch = (searchValue) => {
    console.log('handleSearch called with:', searchValue);
    setSearchTerm(searchValue);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      performSearch(searchValue);
    }, PET_SEARCH_DEBOUNCE_DELAY);
    
    setSearchTimeout(timeout);
  };

  /**
   * Create new pet
   */
  const createPet = async (petData) => {
    try {
      setLoading(true);
      await petService.createPet(petData);
      await fetchData(pagination.page, pagination.limit);
      
      const successMsg = createPetSuccessMessage('create', petData.name);
      toast.showSuccess(successMsg);
      return { success: true };
      
    } catch (error) {
      console.error('Error creating pet:', error);
      toast.showError(PET_ERROR_MESSAGES.CREATE_FAILED);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update existing pet
   */
  const updatePet = async (petId, petData) => {
    try {
      setLoading(true);
      await petService.updatePet(petId, petData);
      await fetchData(pagination.page, pagination.limit);
      
      const successMsg = createPetSuccessMessage('update', petData.name);
      toast.showSuccess(successMsg);
      return { success: true };
      
    } catch (error) {
      console.error('Error updating pet:', error);
      toast.showError(PET_ERROR_MESSAGES.UPDATE_FAILED);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete pet
   */
  const deletePet = async (petId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thú cưng này?')) {
      return { success: false, cancelled: true };
    }
    
    try {
      // Find pet name for success message
      const pet = findPetById(pets, petId);
      const petName = pet ? (pet.Name || pet.name) : 'thú cưng';
      
      await petService.deletePet(petId);
      
      // Refresh data after delete
      await fetchData(pagination.page, pagination.limit);
      
      const successMsg = createPetSuccessMessage('delete', petName);
      toast.showSuccess(successMsg);
      return { success: true };
      
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast.showError(PET_ERROR_MESSAGES.DELETE_FAILED);
      return { success: false, error };
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData(1, 10);
  }, []);

  return {
    pets,
    customers,
    loading,
    error,
    searchTerm,
    customerLoadState,
    pagination,
    handleSearch,
    handlePageChange,
    handleLimitChange,
    createPet,
    updatePet,
    deletePet,
    setError
  };
}; 