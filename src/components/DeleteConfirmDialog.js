import {
    Warning as WarningIcon
} from '@mui/icons-material';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import React from 'react';

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  loading,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn xóa không?',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle 
        id="delete-dialog-title"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          pb: 1
        }}
      >
        {title}
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          color="inherit"
        >
          Không
        </Button>
        <Button 
          onClick={(e) => {
            e.preventDefault();
            onConfirm();
          }}
          disabled={loading}
          variant="contained"
          color="error"
          startIcon={loading ? <CircularProgress size={20} /> : <WarningIcon />}
        >
          {loading ? 'Đang xóa...' : 'Có'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog; 