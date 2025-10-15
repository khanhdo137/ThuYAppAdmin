import { Chip } from '@mui/material';
import React from 'react';
import { PET_IMAGE_CONFIG } from './petConstants';

/**
 * Get customer name by ID with fallbacks
 */
export const getCustomerName = (customerId, customers) => {
  console.log('🔍 Looking for customer with ID:', customerId);
  console.log('🔍 Available customers:', customers.length);
  
  if (!customers || customers.length === 0) {
    console.log('⚠️ No customers available');
    return 'Đang tải...';
  }
  
  const customer = customers.find(c => {
    // Try multiple field name variations for compatibility
    const id1 = c.CustomerId;
    const id2 = c.customerId;
    const id3 = c.customerID;
    
    const match = id1 === customerId || id2 === customerId || id3 === customerId;
    
    if (match) {
      console.log('✅ Found matching customer:', c);
    }
    
    return match;
  });
  
  if (customer) {
    // Try multiple name field variations
    const name = customer.CustomerName || 
                 customer.customerName || 
                 customer.fullName || 
                 customer.Username ||
                 customer.username || 
                 `Customer ${customer.CustomerId || customer.customerId}`;
    
    console.log('✅ Customer name found:', name);
    return name;
  } else {
    console.log('❌ Customer not found for ID:', customerId);
    console.log('🔍 Available customer IDs:', customers.map(c => c.CustomerId || c.customerId));
    return 'Không tìm thấy';
  }
};

/**
 * Get species chip component
 */
export const getSpeciesChip = (species) => {
  const colorMap = {
    'dog': 'primary',
    'cat': 'secondary',
    'bird': 'info',
    'rabbit': 'success',
    'hamster': 'warning',
    'other': 'default'
  };
  
  const labelMap = {
    'dog': 'Chó',
    'cat': 'Mèo',
    'bird': 'Chim',
    'rabbit': 'Thỏ',
    'hamster': 'Chuột hamster',
    'other': 'Khác'
  };
  
  const normalizedSpecies = species?.toLowerCase();
  
  return (
    <Chip
      label={labelMap[normalizedSpecies] || species || 'Chưa xác định'}
      color={colorMap[normalizedSpecies] || 'default'}
      size="small"
    />
  );
};

/**
 * Format customer display for autocomplete
 */
export const formatCustomerDisplay = (customer) => {
  if (!customer) return '';
  
  // Backend trả về CustomerName từ bảng Customer và PhoneNumber từ bảng User
  const name = customer.CustomerName || customer.customerName || customer.Username || customer.username || `Customer ${customer.CustomerId}`;
  const phone = customer.PhoneNumber || customer.phoneNumber || '';
  
  return phone ? `${name} - ${phone}` : name;
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 'Chưa có';
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) return 'Ngày không hợp lệ';
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  // If less than 1 year, show months
  if (age === 0) {
    const months = monthDiff + (today.getDate() < birth.getDate() ? -1 : 0);
    return `${Math.max(0, months)} tháng`;
  }
  
  return `${age} tuổi`;
};

/**
 * Validate pet form data
 */
export const validatePetForm = (formData) => {
  const errors = {};
  
  if (!formData.customerId) {
    errors.customerId = 'Vui lòng chọn chủ sở hữu';
  }
  
  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Vui lòng nhập tên thú cưng';
  }
  
  if (!formData.species) {
    errors.species = 'Vui lòng chọn loài';
  }
  
  // Validate birth date
  if (formData.birthDate) {
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    
    if (birthDate > today) {
      errors.birthDate = 'Ngày sinh không thể trong tương lai';
    }
    
    // Check if age is reasonable (not older than 50 years)
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 50);
    
    if (birthDate < maxAge) {
      errors.birthDate = 'Ngày sinh không hợp lệ (quá cũ)';
    }
  } else {
    errors.birthDate = 'Vui lòng chọn ngày sinh';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Process API data from multiple sources
 */
export const processApiData = (results) => {
  const [petsResult, customersResult] = results;
  
  // Process pets data
  let pets = [];
  if (petsResult.status === 'fulfilled') {
    pets = Array.isArray(petsResult.value) ? petsResult.value : [];
  }
  
  // Process customers data  
  let customers = [];
  if (customersResult.status === 'fulfilled') {
    const customersData = customersResult.value;
    if (customersData && customersData.customers && Array.isArray(customersData.customers)) {
      customers = customersData.customers;
    } else if (Array.isArray(customersData)) {
      customers = customersData;
    }
  }
  
  return {
    pets,
    customers,
    errors: {
      pets: petsResult.status === 'rejected' ? petsResult.reason : null,
      customers: customersResult.status === 'rejected' ? customersResult.reason : null
    }
  };
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file) => {
  const errors = [];
  
  // Check file size
  if (file.size > PET_IMAGE_CONFIG.MAX_SIZE) {
    errors.push('Kích thước file quá lớn (tối đa 5MB)');
  }
  
  // Check file type
  if (!PET_IMAGE_CONFIG.ACCEPTED_TYPES.includes(file.type)) {
    errors.push('Định dạng file không được hỗ trợ (chỉ hỗ trợ JPG, PNG, GIF, WebP)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create success message for pet operations
 */
export const createPetSuccessMessage = (operation, petName) => {
  const messages = {
    create: `Thêm thú cưng ${petName} thành công!`,
    update: `Cập nhật thú cưng ${petName} thành công!`,
    delete: `Xóa thú cưng ${petName} thành công!`
  };
  return messages[operation] || 'Thao tác thành công!';
};

/**
 * Get field value from pet object with case variations
 */
export const getPetFieldValue = (pet, field) => {
  if (!pet) return null;

  // Try both camelCase and PascalCase variations
  const variations = [
    field,                                    // Original
    field.charAt(0).toUpperCase() + field.slice(1),  // PascalCase
    field.charAt(0).toLowerCase() + field.slice(1),   // camelCase
  ];

  // Try each variation
  for (const variation of variations) {
    if (pet[variation] !== undefined) {
      return pet[variation];
    }
  }

  // Special handling for dates
  if (field === 'birthDate') {
    // Try common date field variations
    const dateFields = ['BirthDate', 'birthDate', 'DateOfBirth', 'dateOfBirth', 'DOB', 'dob'];
    for (const dateField of dateFields) {
      if (pet[dateField]) {
        const date = new Date(pet[dateField]);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
  }

  console.log(`⚠️ Field ${field} not found in pet object:`, pet);
  return null;
};

/**
 * Find pet by ID
 */
export const findPetById = (pets, petId) => {
  return pets.find(pet => (pet.PetId || pet.petId) === petId);
};

/**
 * Format pet data for API submission
 */
export const formatPetSubmissionData = (formData) => {
  // Convert birthDate to DateOnly format (YYYY-MM-DD)
  const birthDate = formData.birthDate ? formData.birthDate : null;
  
  return {
    name: formData.name.trim(),
    species: formData.species.trim(),
    breed: formData.breed?.trim() || null,
    birthDate: birthDate,
    birthDateString: birthDate, // For API compatibility
    imageUrl: formData.imageUrl || null,
    gender: formData.gender || null,
    notes: formData.notes?.trim() || null
  };
};

/**
 * Get gender chip component
 */
export const getPetGenderChip = (gender) => {
  const color = gender === 'Đực' ? 'primary' : gender === 'Cái' ? 'secondary' : 'default';
  return (
    <Chip 
      label={gender || 'Chưa xác định'} 
      color={color} 
      size="small" 
      variant="outlined" 
    />
  );
}; 