import React from 'react';
import { DataTable } from '../';

const AppointmentTable = ({ 
  appointments, 
  onEdit,
  onDelete,
  loading,
  columns
}) => {
  return (
    <DataTable
      columns={columns}
      data={appointments}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default AppointmentTable; 