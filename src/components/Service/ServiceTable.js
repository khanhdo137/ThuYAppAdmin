import { Box, Chip, Typography } from '@mui/material';
import React from 'react';

export const getCategoryChip = (category) => {
  const colorMap = {
    'examination': 'primary',
    'surgery': 'error',
    'treatment': 'success',
    'vaccination': 'info',
    'grooming': 'warning',
    'emergency': 'error',
    'other': 'default'
  };
  
  const labelMap = {
    'examination': 'Khám bệnh',
    'surgery': 'Phẫu thuật',
    'treatment': 'Điều trị',
    'vaccination': 'Tiêm phòng',
    'grooming': 'Chăm sóc',
    'emergency': 'Cấp cứu',
    'other': 'Khác'
  };
  
  return (
    <Chip
      label={labelMap[category] || category || 'Chưa phân loại'}
      color={colorMap[category] || 'default'}
      size="small"
    />
  );
};

export const formatPrice = (price) => {
  if (!price) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export const formatDuration = (duration) => {
  if (!duration) return 'Chưa xác định';
  return `${duration} phút`;
};

export const getServiceTableColumns = () => [
  {
    field: 'serviceName',
    label: 'Tên dịch vụ',
    minWidth: 200,
    render: (row) => (
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {row.name || row.Name || row.serviceName || 'Chưa có tên'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ID: {row.serviceId || row.ServiceId}
        </Typography>
      </Box>
    )
  },
  {
    field: 'description',
    label: 'Mô tả',
    minWidth: 250,
    render: (row) => {
      const description = row.description || row.Description || 'Chưa có mô tả';
      return description.length > 100 ? `${description.substring(0, 100)}...` : description;
    }
  },
  {
    field: 'category',
    label: 'Danh mục',
    minWidth: 120,
    render: (row) => getCategoryChip(row.category || row.Category)
  },
  {
    field: 'price',
    label: 'Giá tiền',
    minWidth: 120,
    render: (row) => formatPrice(row.price || row.Price)
  },
  {
    field: 'duration',
    label: 'Thời gian',
    minWidth: 100,
    render: (row) => formatDuration(row.duration || row.Duration)
  }
]; 