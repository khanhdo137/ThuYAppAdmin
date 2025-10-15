import { Box, MenuItem, TextField } from '@mui/material';
import React from 'react';
import { doctorService } from '../../services';

const DoctorForm = ({
  formData,
  formErrors,
  onFormChange
}) => {
  return (
    <Box display="flex" flexDirection="column" gap={2} pt={1}>
      <TextField
        label="Họ và tên"
        value={formData.fullName}
        onChange={(e) => onFormChange('fullName', e.target.value)}
        error={!!formErrors.fullName}
        helperText={formErrors.fullName}
        fullWidth
        required
      />
      
      <TextField
        label="Chuyên khoa"
        select
        value={formData.specialization}
        onChange={(e) => onFormChange('specialization', e.target.value)}
        error={!!formErrors.specialization}
        helperText={formErrors.specialization}
        fullWidth
      >
        <MenuItem value="">
          <em>Chọn chuyên khoa</em>
        </MenuItem>
        {doctorService.getSpecializationOptions().map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      
      <TextField
        label="Số năm kinh nghiệm"
        type="number"
        value={formData.experienceYears}
        onChange={(e) => onFormChange('experienceYears', e.target.value)}
        error={!!formErrors.experienceYears}
        helperText={formErrors.experienceYears}
        fullWidth
        inputProps={{ min: 0, max: 50 }}
      />
      
      <TextField
        label="Chi nhánh"
        select
        value={formData.branch}
        onChange={(e) => onFormChange('branch', e.target.value)}
        error={!!formErrors.branch}
        helperText={formErrors.branch}
        fullWidth
      >
        <MenuItem value="">
          <em>Chọn chi nhánh</em>
        </MenuItem>
        {doctorService.getBranchOptions().map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.shortLabel}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default DoctorForm; 