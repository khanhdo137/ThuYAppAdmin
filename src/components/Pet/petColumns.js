import { Avatar, Chip } from '@mui/material';
import React from 'react';
import { PET_GENDERS, PET_TABLE_MIN_WIDTHS } from './petConstants';
import { getSpeciesChip } from './petUtils';

const calculateAge = (birthDate) => {
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

const findCustomerById = (customers, customerId) => {
  if (!customers || !Array.isArray(customers)) {
    console.log('No customers data available');
    return null;
  }

  // Convert customerId to string for comparison
  const searchId = String(customerId);
  
  return customers.find(c => {
    // Get all possible ID fields and convert them to string
    const customerIdFields = [
      String(c.CustomerId || ''),
      String(c.customerId || ''),
      String(c.userId || ''),
      String(c.UserId || ''),
      String(c.id || '')
    ];
    
    console.log('Customer:', c);
    console.log('Customer ID fields:', customerIdFields);
    console.log('Searching for ID:', searchId);
    
    return customerIdFields.includes(searchId);
  });
};

const getCustomerName = (customer) => {
  if (!customer) return 'Chưa xác định';
  
  console.log('Getting name for customer:', customer);
  
  // Ưu tiên sử dụng CustomerName
  if (customer.CustomerName) {
    return customer.CustomerName;
  }
  
  // Fallback to other name fields
  const nameFields = [
    customer.customerName,
    customer.fullName,
    customer.FullName,
    customer.name,
    customer.Name,
    customer.username,
    customer.Username
  ];
  
  const foundName = nameFields.find(name => name);
  console.log('Found name:', foundName);
  
  return foundName || `Khách hàng ${customer.CustomerId || customer.customerId || customer.userId || customer.UserId || customer.id}`;
};

/**
 * Get pet table columns configuration
 */
export const getPetTableColumns = ({
  customers
}) => [
  {
    field: 'imageUrl',
    label: 'Ảnh',
    render: (row) => (
      <Avatar 
        src={row.imageUrl || ''} 
        sx={{ width: 50, height: 50 }}
        variant="rounded"
      >
        {(row.name || '')[0] || 'P'}
      </Avatar>
    ),
    minWidth: PET_TABLE_MIN_WIDTHS.AVATAR,
    align: 'center',
    headerAlign: 'center'
  },
  {
    field: 'name',
    label: 'Tên',
    minWidth: PET_TABLE_MIN_WIDTHS.NAME,
    flex: 1
  },
  {
    field: 'species',
    label: 'Loài',
    render: (row) => getSpeciesChip(row.species),
    minWidth: PET_TABLE_MIN_WIDTHS.SPECIES,
    flex: 1
  },
  {
    field: 'breed',
    label: 'Giống',
    minWidth: PET_TABLE_MIN_WIDTHS.BREED,
    flex: 1
  },
  {
    field: 'gender',
    label: 'Giới tính',
    render: (row) => {
      let label = 'Chưa xác định';
      let color = 'default';

      if (row.gender === PET_GENDERS.MALE) {
        label = PET_GENDERS.MALE;
        color = 'primary';
      } else if (row.gender === PET_GENDERS.FEMALE) {
        label = PET_GENDERS.FEMALE;
        color = 'secondary';
      }

      return (
        <Chip 
          label={label}
          color={color}
          size="small"
        />
      );
    },
    minWidth: PET_TABLE_MIN_WIDTHS.GENDER,
    flex: 1
  },
  {
    field: 'age',
    label: 'Tuổi',
    render: (row) => calculateAge(row.birthDate),
    minWidth: PET_TABLE_MIN_WIDTHS.AGE,
    flex: 1
  },
  {
    field: 'customerName',
    label: 'Chủ sở hữu',
    render: (row) => {
      // API now returns customerName directly in the pet data
      return row.customerName || 'Chưa xác định';
    },
    minWidth: PET_TABLE_MIN_WIDTHS.CUSTOMER,
    flex: 1
  }
];