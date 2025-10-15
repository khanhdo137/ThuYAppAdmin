import React from 'react';
import DataTable from '../DataTable';
import { getPetTableColumns } from './petColumns';

export const PetTable = ({
  pets = [],
  customers = [],
  loading = false,
  pagination,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete
}) => {
  const columns = getPetTableColumns({ customers });

  return (
    <DataTable
      rows={pets}
      columns={columns}
      loading={loading}
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      onEdit={onEdit}
      onDelete={onDelete}
      getRowId={(row) => row.petId || row.PetId}
    />
  );
}; 