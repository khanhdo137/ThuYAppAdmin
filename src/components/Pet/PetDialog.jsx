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
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import DirectImageUpload from '../DirectImageUpload';
import {
    PET_DIALOG_MODES,
    PET_GENDERS,
    PET_SPECIES_OPTIONS
} from './petConstants';
import PetMedicalHistoryTab from './PetMedicalHistoryTab';
import { formatCustomerDisplay } from './petUtils';

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
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        {getDialogTitle()}
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
        >
          <Tab label="Thông tin cơ bản" id="pet-tab-0" aria-controls="pet-tabpanel-0" />
          {(isViewMode || isEditMode) && formData.petId && (
            <Tab label="Lịch sử khám bệnh" id="pet-tab-1" aria-controls="pet-tabpanel-1" />
          )}
        </Tabs>

        <TabPanel value={activeTab} index={0}>
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
            {!isViewMode && (
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
            )}

            {/* Image Display (View Mode) */}
            {isViewMode && formData.imageUrl && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Hình ảnh thú cưng
                </Typography>
                <Box
                  component="img"
                  src={formData.imageUrl}
                  alt={formData.name}
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid #ddd'
                  }}
                />
              </Box>
            )}

            {/* Notes */}
            <TextField
              label="Ghi chú"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => onFormChange('notes', e.target.value)}
              error={!!formErrors.notes}
              helperText={formErrors.notes}
              disabled={isViewMode}
              fullWidth
              placeholder="Thêm ghi chú về thú cưng..."
            />
          </Box>
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
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading || imageUploading}>
          {isViewMode ? 'Đóng' : 'Hủy'}
        </Button>
        
        {!isViewMode && activeTab === 0 && (
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
      </DialogActions>
    </Dialog>
  );
};

export default PetDialog; 