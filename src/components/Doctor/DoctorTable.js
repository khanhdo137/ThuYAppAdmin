import {
  Delete as DeleteIcon,
  LocalHospital as DoctorIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Typography
} from '@mui/material';
import React from 'react';
import { doctorService } from '../../services';
import DataTable from '../DataTable';

export const getSpecializationChip = (specialization) => {
  const colorMap = {
    'tong-quat': 'primary',
    'thu-cung': 'secondary',
    'gia-suc': 'info', 
    'phau-thuat': 'error',
    'noi-khoa': 'success',
    'da-lieu': 'warning',
    'mat-khoa': 'info',
    'rang-ham-mat': 'secondary',
    'chan-doan-hinh-anh': 'success',
    'gay-me-hoi-suc': 'error',
    'cap-cuu': 'error',
    'dinh-duong': 'success',
    'hanh-vi': 'info',
    'sinh-san': 'secondary',
    'benh-truyen-nhiem': 'warning',
    'tiem-chung': 'success',
    'chan-nuoi': 'info',
    'ung-buou': 'error'
  };
  
  const label = doctorService.getSpecializationLabel(specialization);
  
  return (
    <Chip
      label={label} 
      color={colorMap[specialization] || 'default'} 
      size="small"
    />
  );
};

export const getExperienceChip = (years) => {
  if (!years || years <= 2) return <Chip label="Mới" color="info" size="small" />;
  if (years <= 10) return <Chip label="Có kinh nghiệm" color="success" size="small" />;
  return <Chip label="Chuyên gia" color="warning" size="small" />;
};

export const getDoctorTableColumns = (onView, onEdit, onDelete) => [
  {
    field: 'avatar',
    label: '',
    minWidth: 60,
    render: (row) => (
      <Avatar sx={{ width: 40, height: 40 }}>
        <DoctorIcon />
      </Avatar>
    )
  },
  {
    field: 'fullName',
    label: 'Họ tên',
    minWidth: 180,
    render: (row) => row.fullName || 'Chưa có tên'
  },
  {
    field: 'specialization',
    label: 'Chuyên khoa',
    minWidth: 150,
    render: (row) => getSpecializationChip(row.specialization)
  },
  {
    field: 'experienceYears',
    label: 'Kinh nghiệm',
    minWidth: 120,
    render: (row) => (
      <Box>
        <Typography variant="body2">
          {doctorService.formatExperience(row.experienceYears)}
        </Typography>
        {getExperienceChip(row.experienceYears)}
      </Box>
    )
  },
  {
    field: 'branch',
    label: 'Chi nhánh',
    minWidth: 150,
    render: (row) => {
      const branchOption = doctorService.getBranchOptions().find(opt => opt.value === row.branch);
      return branchOption ? branchOption.shortLabel : (row.branch || 'Chưa xác định');
    }
  },
  {
    field: 'actions',
    label: 'Thao tác',
    minWidth: 150,
    render: (row) => (
      <Box>
        <IconButton 
          size="small" 
          onClick={() => onView(row)}
          color="primary"
          title="Xem chi tiết"
        >
          <SearchIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onEdit(row)}
          color="warning"
          title="Chỉnh sửa"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(row.doctorId)}
          color="error"
          title="Xóa"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    )
  }
];

const DoctorTable = ({ doctors, loading, onView, onEdit, onDelete }) => {
  const columns = getDoctorTableColumns(onView, onEdit, onDelete);

  // Format doctors data using doctorService
  const formattedDoctors = doctors.map(doctor => doctorService.formatDoctorData(doctor));

  return (
    <DataTable
      columns={columns}
      data={formattedDoctors}
      loading={loading}
      emptyMessage="Không có bác sĩ nào"
      showActions={false} // Disable DataTable's built-in actions since we have custom ones
    />
  );
};

export default DoctorTable; 