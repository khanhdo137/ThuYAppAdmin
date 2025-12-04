import { 
    Add as AddIcon,
    Pets as PetsIcon,
    Refresh as RefreshIcon,
    Mouse as MouseIcon,
    Category as CategoryIcon,
    TrendingUp as TrendingUpIcon,
    Male as MaleIcon,
    Female as FemaleIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Tooltip,
    IconButton,
    Fade,
    Slide
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
  const [refreshing, setRefreshing] = React.useState(false);

  // Use custom hooks for state management
  const {
    pets,
    customers,
    loading,
    error,
    searchTerm,
    customerLoadState,
    pagination,
    handleSearch,
    handlePageChange,
    handleLimitChange,
    createPet,
    updatePet,
    deletePet,
    setError,
    refreshPets
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

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (refreshPets) {
      await refreshPets();
    }
    setRefreshing(false);
  };

  // Calculate statistics
  const petsArray = Array.isArray(pets) ? pets : [];
  const stats = React.useMemo(() => {
    const speciesCount = {};
    let maleCount = 0;
    let femaleCount = 0;

    petsArray.forEach(pet => {
      // Count by species
      const species = pet.species || 'Khác';
      speciesCount[species] = (speciesCount[species] || 0) + 1;

      // Count by gender - check multiple possible formats
      const gender = pet.gender !== undefined ? pet.gender : pet.Gender;
      
      // Debug log để kiểm tra dữ liệu
      console.log('Pet gender debug:', {
        petName: pet.name || pet.Name,
        gender: gender,
        genderType: typeof gender,
        genderValue: gender
      });
      
      if (gender === 0 || gender === '0' || gender === 'Đực' || gender === 'male') {
        maleCount++;
      } else if (gender === 1 || gender === '1' || gender === 'Cái' || gender === 'female') {
        femaleCount++;
      }
    });

    const topSpecies = Object.entries(speciesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    console.log('Pet statistics calculated:', {
      total: petsArray.length,
      male: maleCount,
      female: femaleCount,
      bySpecies: speciesCount,
      topSpecies
    });

    return {
      total: petsArray.length,
      male: maleCount,
      female: femaleCount,
      bySpecies: speciesCount,
      topSpecies
    };
  }, [petsArray]);

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
      <Fade in={true} timeout={600}>
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                minHeight: '120px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Tổng số thú cưng
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total}
                      </Typography>
                    </Box>
                    <PetsIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                minHeight: '120px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Thú cưng đực
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.male}
                      </Typography>
                    </Box>
                    <MaleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                minHeight: '120px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Thú cưng cái
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.female}
                      </Typography>
                    </Box>
                    <FemaleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                minHeight: '120px',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Loài phổ biến
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {Object.keys(stats.bySpecies).length}
                      </Typography>
                    </Box>
                    <CategoryIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {stats.topSpecies.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TrendingUpIcon sx={{ fontSize: 40, color: '#667eea' }} />
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Loài thú cưng phổ biến nhất
                        </Typography>
                        <Box display="flex" gap={3} flexWrap="wrap">
                          {stats.topSpecies.map(([species, count], index) => (
                            <Box key={species} display="flex" alignItems="center" gap={1}>
                              <MouseIcon sx={{ color: '#667eea', fontSize: 20 }} />
                              <Typography variant="body1" fontWeight="bold" color="primary">
                                {species}: {count}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* Main Content */}
          <Paper sx={{ 
            p: 3,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,1))',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            {/* Header with Actions */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <PetsIcon sx={{ fontSize: 32, color: '#667eea' }} />
                <Typography variant="h5" fontWeight="bold">
                  Danh sách thú cưng ({stats.total})
                </Typography>
              </Box>
              
              <Box display="flex" gap={1}>
                <Tooltip title="Làm mới dữ liệu">
                  <IconButton 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        transform: 'rotate(180deg)',
                        transition: 'transform 0.6s ease'
                      }
                    }}
                  >
                    <RefreshIcon sx={{ 
                      animation: refreshing ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }} />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openDialog(PET_DIALOG_MODES.CREATE)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    px: 3,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Thêm thú cưng
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={handleSearch}
                placeholder={PET_SEARCH_PLACEHOLDER}
              />
            </Box>

            <Slide direction="up" in={true} timeout={800}>
              <Box>
                <DataTable
                  columns={columns}
                  data={petsArray}
                  loading={loading}
                  emptyMessage="Không có thú cưng nào"
                  onView={(row) => openDialog(PET_DIALOG_MODES.VIEW, row)}
                  onEdit={(row) => openDialog(PET_DIALOG_MODES.EDIT, row)}
                  onDelete={(row) => deletePet(row.petId)}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </Box>
            </Slide>
          </Paper>
        </Box>
      </Fade>

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