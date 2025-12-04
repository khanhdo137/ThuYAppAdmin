import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Autocomplete,
  CircularProgress,
  Typography
} from '@mui/material';
import DirectImageUpload from '../DirectImageUpload';
import { PET_GENDERS, PET_SPECIES_OPTIONS } from './petConstants';
import { formatCustomerDisplay } from './petUtils';

const PetFormDialog = ({
  open,
  onClose,
  onSubmit,
  customers = [],
  loading = false,
  imageUploading = false,
  onImageUpload,
  onImageRemove,
  externalImageUrl = ''
}) => {
  const [formData, setFormData] = useState({
    customerId: '',
    name: '',
    species: '',
    breed: '',
    gender: '',
    birthDate: '',
    imageUrl: ''
  });

  const [errors, setErrors] = useState({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        customerId: '',
        name: '',
        species: '',
        breed: '',
        gender: '',
        birthDate: '',
        imageUrl: ''
      });
      setErrors({});
    }
  }, [open]);

  // Sync imageUrl from parent (updated by handleImageUpload)
  useEffect(() => {
    if (externalImageUrl) {
      setFormData(prev => ({ ...prev, imageUrl: externalImageUrl }));
    }
  }, [externalImageUrl]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCustomerChange = (event, newValue) => {
    const customerId = newValue ? (newValue.CustomerId || newValue.customerId) : '';
    setFormData(prev => ({ ...prev, customerId }));
    if (errors.customerId) {
      setErrors(prev => ({ ...prev, customerId: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.customerId) {
      newErrors.customerId = 'Vui lòng chọn chủ sở hữu';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên thú cưng';
    }
    if (!formData.species) {
      newErrors.species = 'Vui lòng chọn loài';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  const selectedCustomer = customers.find(c => 
    (c.CustomerId || c.customerId) === formData.customerId
  ) || null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>Thêm thú cưng mới</DialogTitle>
      
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 2 }}>
          {/* Customer Selection */}
          <Autocomplete
            options={customers}
            getOptionLabel={(customer) => formatCustomerDisplay(customer)}
            value={selectedCustomer}
            onChange={handleCustomerChange}
            loading={loading && customers.length === 0}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chủ sở hữu"
                error={!!errors.customerId}
                helperText={errors.customerId || 'Gõ để tìm kiếm hoặc chọn từ danh sách'}
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading && customers.length === 0 ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, customer) => (
              <Box component="li" {...props} key={customer.CustomerId || customer.customerId}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body1" fontWeight="medium">
                    {customer.CustomerName || customer.customerName || customer.Username || customer.username || `Customer ${customer.CustomerId}`}
                  </Typography>
                  {(customer.PhoneNumber || customer.phoneNumber) && (
                    <Typography variant="body2" color="text.secondary">
                      {customer.PhoneNumber || customer.phoneNumber}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          />

          {/* Pet Name */}
          <TextField
            label="Tên thú cưng"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
          />

          {/* Species */}
          <TextField
            label="Loài"
            select
            value={formData.species}
            onChange={handleChange('species')}
            error={!!errors.species}
            helperText={errors.species}
            fullWidth
            required
          >
            <MenuItem value="">Chọn loài</MenuItem>
            {PET_SPECIES_OPTIONS.map((species) => (
              <MenuItem key={species} value={species}>
                {species}
              </MenuItem>
            ))}
          </TextField>

          {/* Breed */}
          <TextField
            label="Giống"
            value={formData.breed}
            onChange={handleChange('breed')}
            error={!!errors.breed}
            helperText={errors.breed}
            fullWidth
          />

          {/* Gender */}
          <TextField
            label="Giới tính"
            select
            value={formData.gender}
            onChange={handleChange('gender')}
            error={!!errors.gender}
            helperText={errors.gender}
            fullWidth
          >
            <MenuItem value="">Chọn giới tính</MenuItem>
            <MenuItem value={PET_GENDERS.MALE}>{PET_GENDERS.MALE}</MenuItem>
            <MenuItem value={PET_GENDERS.FEMALE}>{PET_GENDERS.FEMALE}</MenuItem>
          </TextField>

          {/* Birth Date */}
          <TextField
            label="Ngày sinh"
            type="date"
            value={formData.birthDate}
            onChange={handleChange('birthDate')}
            error={!!errors.birthDate}
            helperText={errors.birthDate}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: new Date().toISOString().split('T')[0]
            }}
          />

          {/* Image Upload */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Hình ảnh thú cưng
            </Typography>
            <DirectImageUpload
              currentImageUrl={formData.imageUrl}
              onImageUpload={async (file) => {
                // Call parent handler to upload image
                if (onImageUpload) {
                  await onImageUpload(file);
                }
              }}
              onImageRemove={() => {
                setFormData(prev => ({ ...prev, imageUrl: '' }));
                if (onImageRemove) onImageRemove();
              }}
              uploading={imageUploading}
              disabled={loading}
              accept="image/*"
              maxSize={5}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading || imageUploading}>
          Hủy
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading || imageUploading}
          startIcon={(loading || imageUploading) ? <CircularProgress size={20} /> : null}
        >
          {(loading || imageUploading) ? 'Đang thêm...' : 'Thêm thú cưng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PetFormDialog;
