import { Autocomplete, Box, MenuItem, TextField } from '@mui/material';
import React from 'react';
import { DirectImageUpload } from '../index';
import { PET_GENDERS, PET_SPECIES_OPTIONS } from './petConstants';

export const validatePetForm = (formData) => {
  const errors = {};
  
  if (!formData.customerId) {
    errors.customerId = 'Vui lòng chọn chủ sở hữu';
  }
  
  if (!formData.name?.trim()) {
    errors.name = 'Tên thú cưng là bắt buộc';
  }
  
  if (!formData.species?.trim()) {
    errors.species = 'Loài thú cưng là bắt buộc';
  }
  
  if (!formData.birthDate) {
    errors.birthDate = 'Ngày sinh là bắt buộc';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

const PetForm = ({
  formData,
  formErrors,
  onFormChange,
  customers,
  dialogMode,
  pendingImageFile,
  onImageChange
}) => {
  return (
    <Box display="flex" flexDirection="column" gap={2} pt={1}>
      <Autocomplete
        value={customers.find(c => c.userId === formData.customerId) || null}
        onChange={(event, newValue) => onFormChange('customerId', newValue?.userId || '')}
        options={customers}
        getOptionLabel={(option) => option.customerName || option.fullName || `User ${option.userId}`}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Chủ sở hữu"
            error={!!formErrors.customerId}
            helperText={formErrors.customerId}
            required
          />
        )}
        disabled={dialogMode === 'edit'}
        fullWidth
      />
      
      <TextField
        label="Tên thú cưng"
        value={formData.name}
        onChange={(e) => onFormChange('name', e.target.value)}
        error={!!formErrors.name}
        helperText={formErrors.name}
        fullWidth
        required
      />
      
      <TextField
        label="Loài"
        select
        value={formData.species}
        onChange={(e) => onFormChange('species', e.target.value)}
        error={!!formErrors.species}
        helperText={formErrors.species}
        fullWidth
        required
      >
        <MenuItem value="">Chọn loài</MenuItem>
        {PET_SPECIES_OPTIONS.map(species => (
          <MenuItem key={species} value={species}>{species}</MenuItem>
        ))}
      </TextField>
      
      <TextField
        label="Giống"
        value={formData.breed}
        onChange={(e) => onFormChange('breed', e.target.value)}
        error={!!formErrors.breed}
        helperText={formErrors.breed}
        fullWidth
      />
      
      <TextField
        label="Giới tính"
        select
        value={formData.gender}
        onChange={(e) => onFormChange('gender', e.target.value)}
        error={!!formErrors.gender}
        helperText={formErrors.gender}
        fullWidth
      >
        <MenuItem value="">Chọn giới tính</MenuItem>
        <MenuItem value={PET_GENDERS.MALE}>{PET_GENDERS.MALE}</MenuItem>
        <MenuItem value={PET_GENDERS.FEMALE}>{PET_GENDERS.FEMALE}</MenuItem>
      </TextField>
      
      <TextField
        label="Ngày sinh"
        type="date"
        value={formData.birthDate}
        onChange={(e) => onFormChange('birthDate', e.target.value)}
        error={!!formErrors.birthDate}
        helperText={formErrors.birthDate}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        required
      />
      
      <TextField
        label="Ghi chú"
        value={formData.notes}
        onChange={(e) => onFormChange('notes', e.target.value)}
        fullWidth
        multiline
        rows={3}
      />
      
      <DirectImageUpload
        currentImageUrl={formData.imageUrl}
        onImageChange={onImageChange}
        pendingFile={pendingImageFile}
        label="Hình ảnh thú cưng"
      />
    </Box>
  );
};

export default PetForm; 