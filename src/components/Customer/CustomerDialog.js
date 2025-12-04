import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import React from 'react';
import CustomerDetailTabs from './CustomerDetailTabs';
import CustomerForm from './CustomerForm';

const CustomerDialog = ({
  open,
  onClose,
  dialogMode,
  formData,
  formErrors,
  onFormChange,
  onCreateCustomer,
  onUpdateCustomer,
  loading,
  loadingCustomerDetails,
  selectedCustomer,
  pets,
  appointments,
  selectedTab,
  onTabChange
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={dialogMode === 'view' ? 'lg' : 'md'}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          maxHeight: dialogMode === 'view' ? '90vh' : 'auto',
          ...(dialogMode === 'view' && {
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(255,255,255,1))',
            backdropFilter: 'blur(10px)'
          })
        }
      }}
    >
      <DialogTitle sx={{
        background: dialogMode === 'view' 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'transparent',
        color: dialogMode === 'view' ? 'white' : 'inherit',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        pb: 2
      }}>
        {dialogMode === 'create' && 'Thêm người dùng mới'}
        {dialogMode === 'edit' && 'Chỉnh sửa người dùng'}
        {dialogMode === 'view' && 'Thông tin người dùng'}
      </DialogTitle>
      
      <DialogContent sx={{ 
        p: 0,
        ...(dialogMode === 'view' && { 
          overflow: 'auto',
          maxHeight: 'calc(90vh - 120px)',
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
            '&:hover': {
              background: '#555',
            },
          },
        }),
        ...(dialogMode !== 'view' && { p: 3 })
      }}>
        {dialogMode === 'view' ? (
          <CustomerDetailTabs 
            selectedCustomer={selectedCustomer}
            pets={pets}
            appointments={appointments}
            selectedTab={selectedTab}
            onTabChange={onTabChange}
            loadingCustomerDetails={loadingCustomerDetails}
            onPetClick={onClose} // Pass handler to close parent dialog when opening pet dialog
            onAppointmentClick={onClose} // Pass handler to close parent dialog when opening appointment dialog
          />
        ) : (
          <CustomerForm
            formData={formData}
            formErrors={formErrors}
            dialogMode={dialogMode}
            onFormChange={onFormChange}
          />
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2.5,
        borderTop: dialogMode === 'view' ? '1px solid rgba(0,0,0,0.08)' : 'none',
        background: dialogMode === 'view' ? 'rgba(248, 249, 250, 0.8)' : 'transparent'
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            ...(dialogMode === 'view' && {
              background: 'white',
              color: '#667eea',
              border: '1px solid #667eea',
              '&:hover': {
                background: '#f5f7ff'
              }
            })
          }}
        >
          {dialogMode === 'view' ? 'Đóng' : 'Hủy'}
        </Button>
        {dialogMode === 'create' && (
          <Button 
            variant="contained" 
            onClick={onCreateCustomer}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang thêm...' : 'Thêm người dùng'}
          </Button>
        )}
        {dialogMode === 'edit' && (
          <Button 
            variant="contained" 
            onClick={onUpdateCustomer}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật người dùng'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDialog; 