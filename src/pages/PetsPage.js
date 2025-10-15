import { Add as AddIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography
} from '@mui/material';
import React from 'react';
import { DataTable, PageTemplate, SearchFilterBar } from '../components';
import {
    PET_DIALOG_MODES,
    PET_SEARCH_PLACEHOLDER,
    PetDialog,
    getPetTableColumns,
    usePetForm,
    usePets
} from '../components/Pet';

const PetsPage = () => {
  // Use custom hooks for state management
  const {
    pets,
    customers,
    loading,
    error,
    searchTerm,
    customerLoadState,
    handleSearch,
    createPet,
    updatePet,
    deletePet,
    setError
  } = usePets();

  const {
    dialogOpen,
    dialogMode,
    selectedPet,
    formData,
    formErrors,
    imageUploading,
    openDialog,
    closeDialog,
    handleFormChange,
    handleImageUpload,
    handleImageRemove,
    validateForm,
    getSubmissionData
  } = usePetForm();

  // Handle form submission
  const handleCreatePet = async () => {
    if (!validateForm()) return;
    
    const result = await createPet(getSubmissionData());
    if (result.success) {
      closeDialog();
    }
  };

  const handleUpdatePet = async () => {
    if (!validateForm()) return;
    
    const petId = selectedPet.petId;
    const result = await updatePet(petId, getSubmissionData());
    if (result.success) {
      closeDialog();
    }
  };

  // Get table columns
  const columns = getPetTableColumns(customers);

  if (loading && pets.length === 0) {
    return (
      <PageTemplate title="Quản lý thú cưng" subtitle="Quản lý thông tin thú cưng trong hệ thống">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Quản lý thú cưng" subtitle="Quản lý thông tin thú cưng trong hệ thống">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Danh sách thú cưng ({Array.isArray(pets) ? pets.length : 0})
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog(PET_DIALOG_MODES.CREATE)}
            >
              Thêm thú cưng
            </Button>
          </Box>
        </Box>

        <SearchFilterBar
          searchValue={searchTerm}
          onSearchChange={handleSearch}
          placeholder={PET_SEARCH_PLACEHOLDER}
        />

        <DataTable
          columns={columns}
          data={Array.isArray(pets) ? pets : []}
          loading={loading}
          emptyMessage="Không có thú cưng nào"
          onView={(row) => openDialog(PET_DIALOG_MODES.VIEW, row)}
          onEdit={(row) => openDialog(PET_DIALOG_MODES.EDIT, row)}
          onDelete={(row) => deletePet(row.petId)}
        />
      </Paper>

      <PetDialog
        open={dialogOpen} 
        onClose={closeDialog}
        dialogMode={dialogMode}
        formData={formData}
        formErrors={formErrors}
        onFormChange={handleFormChange}
        onCreate={handleCreatePet}
        onUpdate={handleUpdatePet}
        onImageUpload={handleImageUpload}
        onImageRemove={handleImageRemove}
        loading={loading}
        imageUploading={imageUploading}
        customers={customers}
        customerLoadState={customerLoadState}
      />
    </PageTemplate>
  );
};

export default PetsPage; 