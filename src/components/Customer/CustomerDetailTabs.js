import {
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Pets as PetsIcon
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Chip,
    CircularProgress,
    Paper,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import React from 'react';
import { formatPhoneNumber, getGenderChip } from './CustomerTable';

const CustomerDetailTabs = ({
  selectedCustomer,
  pets = [], // Add default empty array
  appointments = [], // Add default empty array
  selectedTab,
  onTabChange,
  loadingCustomerDetails = false
}) => {
  if (!selectedCustomer) return null;
  
  // The pets and appointments are already filtered by customer from the parent component
  const customerPets = pets;
  const customerAppointments = appointments;

  const joinDate = selectedCustomer.createdAt ? 
    new Date(selectedCustomer.createdAt).toLocaleDateString('vi-VN') : 'Chưa có';

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={selectedTab} onChange={(e, newValue) => onTabChange(newValue)}>
        <Tab label="Thông tin cơ bản" />
        <Tab label={`Thú cưng (${selectedCustomer.petCount || 0})`} />
        <Tab label={`Lịch hẹn (${selectedCustomer.appointmentCount || 0})`} />
      </Tabs>

      {/* Tab 0: Basic Info */}
      {selectedTab === 0 && (
        <Box sx={{ p: 3 }}>
          <Box display="flex" gap={3}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                {selectedCustomer.customerName || selectedCustomer.fullName || 'Chưa có tên'}
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">
                  <strong>Tên đăng nhập:</strong> {selectedCustomer.username || 'Chưa có'}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedCustomer.email || 'Chưa có'}
                </Typography>
                <Typography variant="body2">
                  <strong>Số điện thoại:</strong> {formatPhoneNumber(selectedCustomer.phoneNumber)}
                </Typography>
                <Typography variant="body2">
                  <strong>Giới tính:</strong> {getGenderChip(selectedCustomer.gender)}
                </Typography>
                <Typography variant="body2">
                  <strong>Quyền hạn:</strong> 
                  <Chip 
                    label={
                      selectedCustomer.role === 0 ? 'Khách hàng' :
                      selectedCustomer.role === 1 ? 'Quản trị viên' :
                      selectedCustomer.role === 2 ? 'Bác sĩ' : 'Không xác định'
                    }
                    color={
                      selectedCustomer.role === 0 ? 'default' :
                      selectedCustomer.role === 1 ? 'error' :
                      selectedCustomer.role === 2 ? 'primary' : 'default'
                    }
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2">
                  <strong>Địa chỉ:</strong> {selectedCustomer.address || 'Chưa có'}
                </Typography>
                <Typography variant="body2">
                  <strong>Ngày tham gia:</strong> {joinDate}
                </Typography>
              </Box>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                {selectedCustomer.petCount || 0}
              </Typography>
              <Typography variant="caption">Thú cưng</Typography>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h4" color="secondary">
                {selectedCustomer.appointmentCount || 0}
              </Typography>
              <Typography variant="caption">Lịch hẹn</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Tab 1: Pets */}
      {selectedTab === 1 && (
        <Box sx={{ p: 3 }}>
          {loadingCustomerDetails ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : customerPets.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              Khách hàng chưa có thú cưng nào
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {customerPets.map((pet) => (
                <Paper key={pet.petId} sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <PetsIcon />
                    </Avatar>
                    
                    <Box flex={1}>
                      <Typography variant="subtitle1">
                        {pet.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pet.species} {pet.breed && `• ${pet.breed}`} {pet.age !== null && pet.age !== undefined && `• ${pet.age} tuổi`}
                      </Typography>
                      {pet.gender !== null && pet.gender !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          Giới tính: {pet.gender === 0 ? 'Đực' : pet.gender === 1 ? 'Cái' : 'Không xác định'}
                        </Typography>
                      )}
                    </Box>
                    
                    <Chip 
                      label={
                        pet.gender === 0 ? 'Đực' : 
                        pet.gender === 1 ? 'Cái' : 
                        'Không xác định'
                      } 
                      size="small" 
                      color={pet.gender === 0 ? 'primary' : pet.gender === 1 ? 'secondary' : 'default'}
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Tab 2: Appointments */}
      {selectedTab === 2 && (
        <Box sx={{ p: 3 }}>
          {loadingCustomerDetails ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : customerAppointments.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              Khách hàng chưa có lịch hẹn nào
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {customerAppointments.map((appointment) => (
                <Paper key={appointment.appointmentId} sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <CalendarIcon />
                    </Avatar>
                    
                    <Box flex={1}>
                      <Typography variant="subtitle1">
                        {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')} 
                        {appointment.appointmentTime && ` - ${appointment.appointmentTime}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Thú cưng: {appointment.petName} • Dịch vụ: {appointment.serviceName}
                      </Typography>
                      {appointment.notes && (
                        <Typography variant="body2" color="text.secondary">
                          Ghi chú: {appointment.notes}
                        </Typography>
                      )}
                    </Box>
                    
                    <Chip 
                      label={
                        appointment.status === 0 ? 'Chờ xác nhận' :
                        appointment.status === 1 ? 'Đã xác nhận' :
                        appointment.status === 2 ? 'Hoàn thành' : 'Đã hủy'
                      }
                      color={
                        appointment.status === 0 ? 'warning' :
                        appointment.status === 1 ? 'info' :
                        appointment.status === 2 ? 'success' : 'error'
                      }
                      size="small"
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CustomerDetailTabs; 
