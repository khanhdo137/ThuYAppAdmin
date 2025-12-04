import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Badge,
  Pagination
} from '@mui/material';
import {
  Person as PersonIcon,
  Pets as PetsIcon,
  CalendarMonth as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import PetDialog from '../Pet/PetDialog';
import AppointmentDialog from '../Appointment/AppointmentDialog';
import PetCard from '../shared/PetCard';
import AppointmentCard from '../shared/AppointmentCard';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CustomerDetailTabs({
  selectedCustomer,
  pets,
  appointments,
  selectedTab,
  onTabChange,
  loadingCustomerDetails
}) {
  console.log('=== CustomerDetailTabs Rendered ===');
  console.log('selectedCustomer:', selectedCustomer);
  console.log('selectedCustomer keys:', selectedCustomer ? Object.keys(selectedCustomer) : 'null');
  
  const [petDialogOpen, setPetDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Pagination states
  const [petPage, setPetPage] = useState(1);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const itemsPerPage = 6; // 6 items per page for pets (2 rows x 3 columns)
  const appointmentsPerPage = 5; // 5 appointments per page

  const handlePetClick = (pet) => {
    setSelectedPet(pet);
    setPetDialogOpen(true);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDialogOpen(true);
  };

  const handlePetPageChange = (event, value) => {
    setPetPage(value);
  };

  const handleAppointmentPageChange = (event, value) => {
    setAppointmentPage(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Helper function to get value from customer object with multiple field name variations
  const getCustomerValue = (fieldName, fallback = 'Chưa cập nhật') => {
    if (!selectedCustomer) return fallback;
    
    // Try different casing variations
    const variations = [
      fieldName, // original
      fieldName.toLowerCase(), // lowercase
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1), // capitalize first letter
      fieldName.charAt(0).toLowerCase() + fieldName.slice(1) // lowercase first letter
    ];
    
    for (const variation of variations) {
      if (selectedCustomer[variation] !== undefined && selectedCustomer[variation] !== null && selectedCustomer[variation] !== '') {
        return selectedCustomer[variation];
      }
    }
    
    // Special mappings
    const specialMappings = {
      'fullname': ['customerName', 'CustomerName', 'FullName', 'fullName', 'full_name'],
      'phone': ['phoneNumber', 'PhoneNumber', 'phone_number'],
      'gender': ['Gender'],
      'userId': ['UserId', 'user_id'],
      'email': ['Email'],
      'address': ['Address'],
      'username': ['Username', 'userName', 'UserName', 'user_name'],
      'role': ['Role']
    };
    
    if (specialMappings[fieldName.toLowerCase()]) {
      for (const mapping of specialMappings[fieldName.toLowerCase()]) {
        if (selectedCustomer[mapping] !== undefined && selectedCustomer[mapping] !== null && selectedCustomer[mapping] !== '') {
          return selectedCustomer[mapping];
        }
      }
    }
    
    return fallback;
  };

  // Pagination logic for pets
  const petsArray = pets || [];
  const totalPetPages = Math.ceil(petsArray.length / itemsPerPage);
  const startPetIndex = (petPage - 1) * itemsPerPage;
  const endPetIndex = startPetIndex + itemsPerPage;
  const displayedPets = petsArray.slice(startPetIndex, endPetIndex);

  // Pagination logic for appointments
  const appointmentsArray = appointments || [];
  const totalAppointmentPages = Math.ceil(appointmentsArray.length / appointmentsPerPage);
  const startAppointmentIndex = (appointmentPage - 1) * appointmentsPerPage;
  const endAppointmentIndex = startAppointmentIndex + appointmentsPerPage;
  const displayedAppointments = appointmentsArray.slice(startAppointmentIndex, endAppointmentIndex);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: 4,
          pb: 2,
          px: 3,
          color: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.3)',
                fontSize: '2rem'
              }}
            >
              {getCustomerValue('fullname', 'N')?.charAt(0)?.toUpperCase() || <PersonIcon sx={{ fontSize: 40 }} />}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="600" gutterBottom>
              {getCustomerValue('fullname', 'N/A')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {getCustomerValue('username', '') && (
                <Chip
                  label={`@${getCustomerValue('username')}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )}
              {getCustomerValue('role', 0) === 1 && (
                <Chip
                  label="Admin"
                  size="small"
                  color="error"
                  sx={{ bgcolor: 'rgba(255,59,48,0.9)' }}
                />
              )}
              {getCustomerValue('role', 0) === 2 && (
                <Chip
                  label="User"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => onTabChange(newValue)}
          sx={{
            mt: 2,
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 500,
              fontSize: '0.95rem',
              minHeight: 48,
              '&.Mui-selected': {
                color: 'white'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white',
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab icon={<PersonIcon />} iconPosition="start" label="Thông tin cơ bản" />
          <Tab 
            icon={
              <Badge badgeContent={pets?.length || 0} color="error">
                <PetsIcon />
              </Badge>
            } 
            iconPosition="start" 
            label="Thú cưng" 
          />
          <Tab 
            icon={
              <Badge badgeContent={appointments?.length || 0} color="error">
                <CalendarIcon />
              </Badge>
            } 
            iconPosition="start" 
            label="Lịch hẹn" 
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: 400 }}>
        {/* Tab 1: Thông tin cơ bản */}
        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={3}>
            {/* Thông tin liên hệ */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#667eea' }}>
                    Thông tin liên hệ
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                          <EmailIcon sx={{ color: '#1976d2' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Email"
                        secondary={getCustomerValue('email')}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#f3e5f5' }}>
                          <PhoneIcon sx={{ color: '#9c27b0' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Số điện thoại"
                        secondary={getCustomerValue('phone')}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#e8f5e9' }}>
                          <HomeIcon sx={{ color: '#4caf50' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Địa chỉ"
                        secondary={getCustomerValue('address')}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Thông tin cá nhân */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#764ba2' }}>
                    Thông tin cá nhân
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#e0f2f1' }}>
                          <PersonIcon sx={{ color: '#009688' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="User ID"
                        secondary={`#${getCustomerValue('userId', 'N/A')}`}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Thú cưng */}
        <TabPanel value={selectedTab} index={1}>
          {loadingCustomerDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : petsArray.length > 0 ? (
            <Box>
              {/* Stats Summary */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  icon={<PetsIcon />}
                  label={`Tổng số: ${petsArray.length} thú cưng`}
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Trang {petPage} / {totalPetPages}
                </Typography>
              </Box>

              {/* Scrollable Container */}
              <Box sx={{ 
                maxHeight: '600px', 
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#555',
                  },
                },
              }}>
                <Grid container spacing={3}>
                  {displayedPets.map((pet) => (
                    <Grid item xs={12} sm={6} md={4} key={pet.petId}>
                      <PetCard 
                        pet={pet} 
                        onClick={() => handlePetClick(pet)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Pagination */}
              {totalPetPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={totalPetPages} 
                    page={petPage} 
                    onChange={handlePetPageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: '#fafafa'
              }}
            >
              <PetsIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Chưa có thú cưng nào
              </Typography>
            </Paper>
          )}
        </TabPanel>

        {/* Tab 3: Lịch hẹn */}
        <TabPanel value={selectedTab} index={2}>
          {loadingCustomerDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : appointmentsArray.length > 0 ? (
            <Box>
              {/* Stats Summary */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  icon={<CalendarIcon />}
                  label={`Tổng số: ${appointmentsArray.length} lịch hẹn`}
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Trang {appointmentPage} / {totalAppointmentPages}
                </Typography>
              </Box>

              {/* Scrollable Container */}
              <Box sx={{ 
                maxHeight: '600px', 
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#555',
                  },
                },
              }}>
                <Grid container spacing={2}>
                  {displayedAppointments.map((appointment) => (
                    <Grid item xs={12} key={appointment.appointmentId}>
                      <AppointmentCard 
                        appointment={appointment} 
                        onClick={() => handleAppointmentClick(appointment)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Pagination */}
              {totalAppointmentPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={totalAppointmentPages} 
                    page={appointmentPage} 
                    onChange={handleAppointmentPageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: '#fafafa'
              }}
            >
              <CalendarIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Chưa có lịch hẹn nào
              </Typography>
            </Paper>
          )}
        </TabPanel>
      </Box>

      {/* Pet Detail Dialog */}
      {selectedPet && (
        <PetDialog
          open={petDialogOpen}
          onClose={() => {
            setPetDialogOpen(false);
            setSelectedPet(null);
          }}
          dialogMode="view"
          formData={selectedPet}
          formErrors={{}}
          onFormChange={() => {}}
          onCreate={() => {}}
          onUpdate={() => {}}
          onImageUpload={() => {}}
          onImageRemove={() => {}}
          loading={false}
          imageUploading={false}
          customers={[]}
          customerLoadState={{ loading: false, error: null }}
        />
      )}

      {/* Appointment Detail Dialog */}
      {selectedAppointment && (
        <AppointmentDialog
          open={appointmentDialogOpen}
          onClose={() => {
            setAppointmentDialogOpen(false);
            setSelectedAppointment(null);
          }}
          dialogMode="view"
          formData={selectedAppointment}
          formErrors={{}}
          onFormChange={() => {}}
          onCreate={() => {}}
          onUpdate={() => {}}
          loading={false}
          pets={[]}
          services={[]}
          doctors={[]}
          customers={[]}
          feedback={[]} // Can pass appointment feedback here if available
        />
      )}
    </Box>
  );
}
