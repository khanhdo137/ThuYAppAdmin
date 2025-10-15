import { Avatar, Box, Rating, Typography } from '@mui/material';
import React from 'react';

export const getFeedbackTableColumns = () => [
  {
    field: 'feedbackId',
    label: 'ID',
    minWidth: 70,
    render: (row) => row.feedbackId
  },
  {
    field: 'customerName',
    label: 'Khách hàng',
    minWidth: 150,
    render: (row) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
          {row.customerName?.charAt(0)?.toUpperCase() || 'K'}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.customerName || 'Chưa có'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Thú cưng: {row.petName || 'Chưa có'}
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    field: 'serviceName',
    label: 'Dịch vụ',
    minWidth: 140,
    render: (row) => (
      <Box>
        <Typography variant="body2">
          {row.serviceName || 'Chưa có'}
        </Typography>
        {row.doctorName && (
          <Typography variant="caption" color="text.secondary">
            BS: {row.doctorName}
          </Typography>
        )}
      </Box>
    )
  },
  {
    field: 'rating',
    label: 'Đánh giá',
    minWidth: 150,
    render: (row) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Rating
          value={row.rating || 0}
          readOnly
          size="small"
          precision={1}
        />
        <Typography variant="body2" color="text.secondary">
          ({row.rating || 0}/5)
        </Typography>
      </Box>
    )
  },
  {
    field: 'comment',
    label: 'Nhận xét',
    minWidth: 250,
    render: (row) => (
      <Typography 
        variant="body2" 
        sx={{ 
          maxWidth: 250,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        title={row.comment || ''}
      >
        {row.comment || 'Không có nhận xét'}
      </Typography>
    )
  },
  {
    field: 'appointmentDate',
    label: 'Ngày khám',
    minWidth: 120,
    render: (row) => {
      const date = row.appointmentDate ? new Date(row.appointmentDate) : null;
      return (
        <Box>
          <Typography variant="body2">
            {date ? date.toLocaleDateString('vi-VN') : 'Chưa có'}
          </Typography>
          {row.appointmentTime && (
            <Typography variant="caption" color="text.secondary">
              {row.appointmentTime}
            </Typography>
          )}
        </Box>
      );
    }
  },
  {
    field: 'createdAt',
    label: 'Ngày đánh giá',
    minWidth: 130,
    render: (row) => {
      const date = row.createdAt ? new Date(row.createdAt) : null;
      return (
        <Box>
          <Typography variant="body2">
            {date ? date.toLocaleDateString('vi-VN') : 'Chưa có'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {date ? date.toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : ''}
          </Typography>
        </Box>
      );
    }
  }
]; 