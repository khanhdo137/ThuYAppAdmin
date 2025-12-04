import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Tab,
    Tabs,
    TextField,
    Typography,
    Avatar,
    Grid,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText
} from '@mui/material';
import {
    Pets as PetsIcon,
    Person as PersonIcon,
    Category as CategoryIcon,
    FamilyRestroom as BreedIcon,
    Wc as GenderIcon,
    Cake as BirthdayIcon,
    Notes as NotesIcon,
    Phone as PhoneIcon
} from '@mui/icons-material';
import React, { useState } from 'react';
import DirectImageUpload from '../DirectImageUpload';
import {
    PET_DIALOG_MODES,
    PET_GENDERS,
    PET_SPECIES_OPTIONS
} from './petConstants';
import PetMedicalHistoryTab from './PetMedicalHistoryTab';
import { formatCustomerDisplay, calculateAge } from './petUtils';

const PetDialog = ({
  open,
  onClose,
  dialogMode,
  formData,
  formErrors,
  onFormChange,
  onCreate,
  onUpdate,
  onImageUpload,
  onImageRemove,
  loading,
  imageUploading,
  customers,
  customerLoadState
}) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const isViewMode = dialogMode === PET_DIALOG_MODES.VIEW;
  const isCreateMode = dialogMode === PET_DIALOG_MODES.CREATE;
  const isEditMode = dialogMode === PET_DIALOG_MODES.EDIT;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmit = () => {
    if (isCreateMode) {
      onCreate();
    } else if (isEditMode) {
      onUpdate();
    }
  };

  const handleClose = () => {
    setActiveTab(0); // Reset tab về tab đầu tiên khi đóng
    onClose();
  };

  const getDialogTitle = () => {
    switch (dialogMode) {
      case PET_DIALOG_MODES.CREATE:
        return 'Thêm thú cưng mới';
      case PET_DIALOG_MODES.EDIT:
        return 'Chỉnh sửa thông tin thú cưng';
      case PET_DIALOG_MODES.VIEW:
        return 'Thông tin thú cưng';
      default:
        return '';
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pet-tabpanel-${index}`}
      aria-labelledby={`pet-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth={isViewMode ? "md" : "lg"}
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '70vh',
          borderRadius: isViewMode ? 3 : 2,
          boxShadow: isViewMode ? '0 20px 60px rgba(0,0,0,0.15)' : undefined
        }
      }}
    >
      {!isViewMode && (
        <DialogTitle>
          {getDialogTitle()}
        </DialogTitle>
      )}
      
      <DialogContent sx={{ 
        p: 0,
        ...(isViewMode && {
          maxHeight: '70vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
            borderRadius: '10px',
            '&:hover': {
              background: 'linear-gradient(135deg, #ff8a8e 0%, #fac0b4 100%)',
            }
          }
        })
      }}>
        {!isViewMode && (
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
          >
            <Tab label="Thông tin cơ bản" id="pet-tab-0" aria-controls="pet-tabpanel-0" />
            {isEditMode && formData.petId && (
              <Tab label="Lịch sử khám bệnh" id="pet-tab-1" aria-controls="pet-tabpanel-1" />
            )}
          </Tabs>
        )}
        
        {isViewMode && (
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              bgcolor: 'white',
              '& .MuiTab-root': {
                fontWeight: 600,
                '&.Mui-selected': {
                  color: '#ff9a9e'
                }
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#ff9a9e',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab label="Thông tin cơ bản" id="pet-tab-0" aria-controls="pet-tabpanel-0" />
            {formData.petId && (
              <Tab label="Lịch sử khám bệnh" id="pet-tab-1" aria-controls="pet-tabpanel-1" />
            )}
          </Tabs>
        )}

        <TabPanel value={activeTab} index={0}>
          {isViewMode ? (
            // VIEW MODE: Beautiful card layout
            <Box>
              {/* Header with gradient */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
                  pt: 4,
                  pb: 2,
                  px: 3,
                  color: 'white',
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        border: '3px solid rgba(255,255,255,0.5)'
                      }}
                      src={formData.imageUrl}
                    >
                      {!formData.imageUrl && <PetsIcon sx={{ fontSize: 40 }} />}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h4" fontWeight="600" gutterBottom>
                      {formData.name || 'Chưa có tên'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body1" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 2, py: 0.5, borderRadius: 5 }}>
                        {formData.species || 'N/A'}
                      </Typography>
                      <Typography variant="body1" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 2, py: 0.5, borderRadius: 5 }}>
                        {formData.gender || 'N/A'}
                      </Typography>
                      {formData.birthDate && (
                        <Typography variant="body1" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 2, py: 0.5, borderRadius: 5 }}>
                          {calculateAge(formData.birthDate)}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Content */}
              <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '400px' }}>
                <Grid container spacing={3}>
                  {/* Thông tin chủ sở hữu */}
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#ff9a9e' }}>
                          Chủ sở hữu
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <List>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: '#ffe0e5' }}>
                                <PersonIcon sx={{ color: '#ff9a9e' }} />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary="Tên chủ sở hữu"
                              secondary={customers.find(c => (c.CustomerId || c.customerId) === formData.customerId)?.CustomerName || 
                                        customers.find(c => (c.CustomerId || c.customerId) === formData.customerId)?.customerName || 
                                        'Chưa cập nhật'}
                              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                              secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                            />
                          </ListItem>
                          {customers.find(c => (c.CustomerId || c.customerId) === formData.customerId)?.PhoneNumber && (
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: '#fff3e0' }}>
                                  <PhoneIcon sx={{ color: '#ff9800' }} />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary="Số điện thoại"
                                secondary={customers.find(c => (c.CustomerId || c.customerId) === formData.customerId)?.PhoneNumber}
                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Thông tin thú cưng */}
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#fad0c4' }}>
                          Thông tin chi tiết
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <List>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                                    <CategoryIcon sx={{ color: '#2196f3' }} />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary="Loài"
                                  secondary={formData.species || 'Chưa cập nhật'}
                                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: '#f3e5f5' }}>
                                    <BreedIcon sx={{ color: '#9c27b0' }} />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary="Giống"
                                  secondary={formData.breed || 'Chưa cập nhật'}
                                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <List>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: '#e8f5e9' }}>
                                    <GenderIcon sx={{ color: '#4caf50' }} />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary="Giới tính"
                                  secondary={formData.gender || 'Chưa cập nhật'}
                                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: '#fff3e0' }}>
                                    <BirthdayIcon sx={{ color: '#ff9800' }} />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary="Ngày sinh"
                                  secondary={formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Hình ảnh */}
                  {formData.imageUrl && (
                    <Grid item xs={12}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#ff9a9e' }}>
                            Hình ảnh
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Box
                            component="img"
                            src={formData.imageUrl}
                            alt={formData.name}
                            sx={{
                              width: '100%',
                              maxHeight: 400,
                              objectFit: 'cover',
                              borderRadius: 2
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Ghi chú */}
                  {formData.notes && (
                    <Grid item xs={12}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <NotesIcon sx={{ color: '#fad0c4' }} />
                            <Typography variant="h6" fontWeight="600" sx={{ color: '#fad0c4' }}>
                              Ghi chú
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                            {formData.notes}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          ) : (
            // CREATE/EDIT MODE: Form layout
            <Box display="flex" flexDirection="column" gap={2} sx={{ p: 3 }}>
            {/* Customer Selection */}
            <Autocomplete
              options={customers}
              getOptionLabel={(customer) => formatCustomerDisplay(customer)}
              value={customers.find(c => 
                (c.CustomerId || c.customerId) === formData.customerId
              ) || null}
              onChange={(event, newValue) => {
                const customerId = newValue ? (newValue.CustomerId || newValue.customerId) : '';
                onFormChange('customerId', customerId);
              }}
              disabled={isViewMode || isEditMode}
              loading={loading && customers.length === 0}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chủ sở hữu"
                  error={!!formErrors.customerId}
                  helperText={formErrors.customerId || (customers.length === 0 ? 'Đang tải danh sách khách hàng...' : 'Gõ để tìm kiếm hoặc chọn từ danh sách')}
                  fullWidth
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading && customers.length === 0 ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, customer) => (
                <Box component="li" {...props} key={customer.CustomerId || customer.customerId}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body1" fontWeight="medium">
                      {customer.CustomerName || customer.customerName || customer.Username || customer.username || `Customer ${customer.CustomerId}`}
                    </Typography>
                    {(customer.PhoneNumber || customer.phoneNumber) && (
                      <Typography variant="body2" color="text.secondary">
                        {customer.PhoneNumber || customer.phoneNumber}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            />

            {/* Pet Name */}
            <TextField
              label="Tên thú cưng"
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={isViewMode}
              fullWidth
              required
            />

            {/* Species */}
            <TextField
              label="Loài"
              select
              value={formData.species}
              onChange={(e) => onFormChange('species', e.target.value)}
              error={!!formErrors.species}
              helperText={formErrors.species}
              disabled={isViewMode}
              fullWidth
              required
            >
              <MenuItem value="">Chọn loài</MenuItem>
              {PET_SPECIES_OPTIONS.map((species) => (
                <MenuItem key={species} value={species}>
                  {species}
                </MenuItem>
              ))}
            </TextField>

            {/* Breed */}
            <TextField
              label="Giống"
              value={formData.breed}
              onChange={(e) => onFormChange('breed', e.target.value)}
              error={!!formErrors.breed}
              helperText={formErrors.breed}
              disabled={isViewMode}
              fullWidth
            />

            {/* Gender */}
            <TextField
              label="Giới tính"
              select
              value={formData.gender}
              onChange={(e) => onFormChange('gender', e.target.value)}
              error={!!formErrors.gender}
              helperText={formErrors.gender}
              disabled={isViewMode}
              fullWidth
            >
              <MenuItem value="">Chọn giới tính</MenuItem>
              <MenuItem value={PET_GENDERS.MALE}>{PET_GENDERS.MALE}</MenuItem>
              <MenuItem value={PET_GENDERS.FEMALE}>{PET_GENDERS.FEMALE}</MenuItem>
            </TextField>

            {/* Birth Date */}
            <TextField
              label="Ngày sinh"
              type="date"
              value={formData.birthDate}
              onChange={(e) => onFormChange('birthDate', e.target.value)}
              error={!!formErrors.birthDate}
              helperText={formErrors.birthDate}
              disabled={isViewMode}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: new Date().toISOString().split('T')[0] // Prevent future dates
              }}
              required
            />

            {/* Image Upload */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Hình ảnh thú cưng
              </Typography>
              <DirectImageUpload
                currentImageUrl={formData.imageUrl}
                onImageUpload={onImageUpload}
                onImageRemove={onImageRemove}
                uploading={imageUploading}
                disabled={loading}
                accept="image/*"
                maxSize={5} // MB
              />
            </Box>

            {/* Notes */}
            <TextField
              label="Ghi chú"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => onFormChange('notes', e.target.value)}
              error={!!formErrors.notes}
              helperText={formErrors.notes}
              fullWidth
              placeholder="Thêm ghi chú về thú cưng..."
            />
            </Box>
          )}
        </TabPanel>

        {(isViewMode || isEditMode) && formData.petId && (
          <TabPanel value={activeTab} index={1}>
            <PetMedicalHistoryTab 
              petId={formData.petId} 
              petName={formData.name}
            />
          </TabPanel>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2, 
        bgcolor: isViewMode ? '#f5f5f5' : 'white',
        borderTop: isViewMode ? '1px solid #e0e0e0' : 'none'
      }}>
        {isViewMode ? (
          <Button 
            onClick={handleClose}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #ff8a8e 0%, #fac0b4 100%)',
                boxShadow: '0 4px 12px rgba(255,154,158,0.4)'
              }
            }}
          >
            Đóng
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={loading || imageUploading}>
              Hủy
            </Button>
            
            {activeTab === 0 && (
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={loading || imageUploading}
                startIcon={(loading || imageUploading) ? <CircularProgress size={20} /> : null}
              >
                {(loading || imageUploading) ? (
                  isCreateMode ? 'Đang thêm...' : 'Đang cập nhật...'
                ) : (
                  isCreateMode ? 'Thêm thú cưng' : 'Cập nhật thú cưng'
                )}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PetDialog; 