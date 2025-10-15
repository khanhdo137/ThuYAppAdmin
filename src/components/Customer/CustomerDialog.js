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
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {dialogMode === 'create' && 'Thêm người dùng mới'}
        {dialogMode === 'edit' && 'Chỉnh sửa người dùng'}
        {dialogMode === 'view' && 'Thông tin người dùng'}
      </DialogTitle>
      
      <DialogContent>
        {dialogMode === 'view' ? (
          <CustomerDetailTabs 
            selectedCustomer={selectedCustomer}
            pets={pets}
            appointments={appointments}
            selectedTab={selectedTab}
            onTabChange={onTabChange}
            loadingCustomerDetails={loadingCustomerDetails}
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
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
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