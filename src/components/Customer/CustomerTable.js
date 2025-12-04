import { Box, Chip, Typography } from '@mui/material';
import React from 'react';

export const getGenderChip = (gender) => {
  return (
    <Chip 
      label={gender === 0 ? 'Nam' : 'Nữ'} 
      size="small" 
      color={gender === 0 ? 'primary' : 'secondary'}
    />
  );
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return 'Chưa có';
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

export const getCustomerTableColumns = () => [
  {
    field: 'userId',
    label: 'ID',
    minWidth: 70,
    render: (row) => row.userId
  },
  {
    field: 'customerName',
    label: 'Tên khách hàng',
    minWidth: 150,
    render: (row) => row.customerName || row.fullName || 'Chưa có'
  },
  {
    field: 'username',
    label: 'Tên đăng nhập',
    minWidth: 120,
    render: (row) => row.username || 'Chưa có'
  },
  {
    field: 'email',
    label: 'Email',
    minWidth: 180,
    render: (row) => row.email || 'Chưa có'
  },
  {
    field: 'phoneNumber',
    label: 'Số điện thoại',
    minWidth: 130,
    render: (row) => formatPhoneNumber(row.phoneNumber)
  },
  {
    field: 'gender',
    label: 'Giới tính',
    minWidth: 100,
    render: (row) => getGenderChip(row.gender)
  },
  {
    field: 'role',
    label: 'Quyền hạn',
    minWidth: 120,
    render: (row) => (
      <Chip 
        label={
          row.role === 0 ? 'Khách hàng' :
          row.role === 1 ? 'Quản trị viên' :
          row.role === 2 ? 'Bác sĩ' : 'Không xác định'
        }
        color={
          row.role === 0 ? 'default' :
          row.role === 1 ? 'error' :
          row.role === 2 ? 'primary' : 'default'
        }
        size="small"
      />
    )
  },
  {
    field: 'address',
    label: 'Địa chỉ',
    minWidth: 200,
    render: (row) => row.address || 'Chưa có'
  },
  {
    field: 'activity',
    label: 'Hoạt động',
    minWidth: 120,
    render: (row) => {
      return (
        <Box>
          <Typography variant="caption" display="block">
            {row.petCount || 0} thú cưng
          </Typography>
          <Typography variant="caption" display="block">
            {row.appointmentCount || 0} lịch hẹn
          </Typography>
        </Box>
      );
    }
  }
]; 