import { Box, MenuItem, TextField } from '@mui/material';
import React from 'react';

export const validateCustomerForm = (formData, dialogMode) => {
  const errors = {};
  
  if (!formData.username.trim()) {
    errors.username = 'Tên đăng nhập là bắt buộc';
  }
  
  if (!formData.email.trim()) {
    errors.email = 'Email là bắt buộc';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  if (!formData.phoneNumber.trim()) {
    errors.phoneNumber = 'Số điện thoại là bắt buộc';
  }
  
  if (!formData.customerName.trim()) {
    errors.customerName = 'Tên khách hàng là bắt buộc';
  }
  
  if (dialogMode === 'create' && !formData.password.trim()) {
    errors.password = 'Mật khẩu là bắt buộc';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

const CustomerForm = ({
  formData,
  formErrors,
  dialogMode,
  onFormChange
}) => {
  return (
    <Box display="flex" flexDirection="column" gap={2} pt={1}>
      <TextField
        label="Tên đăng nhập"
        value={formData.username}
        onChange={(e) => onFormChange('username', e.target.value)}
        error={!!formErrors.username}
        helperText={formErrors.username}
        disabled={dialogMode === 'edit'}
        fullWidth
      />
      
      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => onFormChange('email', e.target.value)}
        error={!!formErrors.email}
        helperText={formErrors.email}
        fullWidth
      />
      
      <TextField
        label="Số điện thoại"
        value={formData.phoneNumber}
        onChange={(e) => onFormChange('phoneNumber', e.target.value)}
        error={!!formErrors.phoneNumber}
        helperText={formErrors.phoneNumber}
        fullWidth
      />
      
      <TextField
        label="Họ và tên"
        value={formData.customerName}
        onChange={(e) => onFormChange('customerName', e.target.value)}
        error={!!formErrors.customerName}
        helperText={formErrors.customerName}
        fullWidth
      />
      
      <TextField
        label="Địa chỉ"
        value={formData.address}
        onChange={(e) => onFormChange('address', e.target.value)}
        fullWidth
        multiline
        rows={2}
      />
      
      <TextField
        label="Giới tính"
        select
        value={formData.gender}
        onChange={(e) => onFormChange('gender', parseInt(e.target.value))}
        fullWidth
      >
        <MenuItem value={0}>Nam</MenuItem>
        <MenuItem value={1}>Nữ</MenuItem>
      </TextField>
      
      <TextField
        label="Quyền hạn"
        select
        value={formData.role}
        onChange={(e) => onFormChange('role', parseInt(e.target.value))}
        fullWidth
      >
        <MenuItem value={0}>Khách hàng</MenuItem>
        <MenuItem value={1}>Quản trị viên</MenuItem>
        <MenuItem value={2}>Bác sĩ</MenuItem>
      </TextField>
      
      {dialogMode === 'create' && (
        <TextField
          label="Mật khẩu"
          type="password"
          value={formData.password}
          onChange={(e) => onFormChange('password', e.target.value)}
          error={!!formErrors.password}
          helperText={formErrors.password}
          fullWidth
        />
      )}
    </Box>
  );
};

export default CustomerForm; 