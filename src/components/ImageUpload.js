import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Image as ImageIcon,
    Link as LinkIcon
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { cloudinaryService } from '../services';

const ImageUpload = ({ 
  value, 
  onChange, 
  disabled = false, 
  label = "Ảnh thú cưng",
  placeholder = "Chưa có ảnh",
  size = 100,
  variant = "avatar" // "avatar" or "card"
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleCloudinaryUpload = () => {
    if (disabled) return;

    setError(null);
    setUploading(true);

    cloudinaryService.openUploadWidget(
      (result) => {
        // Success callback
        console.log('Upload successful:', result);
        onChange(result.secure_url);
        setUploading(false);
      },
      (error) => {
        // Error callback
        console.error('Upload error:', error);
        setError('Tải ảnh lên không thành công. Vui lòng thử lại.');
        setUploading(false);
      }
    );
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setUrlDialogOpen(false);
    }
  };

  const handleRemoveImage = () => {
    if (disabled) return;
    onChange('');
    setError(null);
  };

  const openUrlDialog = () => {
    if (disabled) return;
    setUrlInput(value || '');
    setUrlDialogOpen(true);
  };

  const closeUrlDialog = () => {
    setUrlDialogOpen(false);
    setUrlInput('');
  };

  if (variant === "card") {
    return (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
          {label}
        </Typography>
        
        <Paper
          sx={{
            p: 2,
            border: '2px dashed',
            borderColor: value ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: disabled ? 'grey.50' : 'transparent',
            cursor: disabled ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': disabled ? {} : {
              borderColor: 'primary.main',
              bgcolor: 'primary.50'
            }
          }}
        >
          {value ? (
            <Box>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <img
                  src={value}
                  alt="Preview"
                  style={{
                    width: size,
                    height: size,
                    objectFit: 'cover',
                    borderRadius: 8
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    setError('Không thể tải ảnh. URL có thể không hợp lệ.');
                  }}
                />
                {!disabled && (
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                    onClick={handleRemoveImage}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ảnh đã được tải lên
              </Typography>
              
              {!disabled && (
                <Box display="flex" gap={1} justifyContent="center">
                  <Button
                    size="small"
                    startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    onClick={handleCloudinaryUpload}
                    disabled={uploading}
                  >
                    Đổi ảnh
                  </Button>
                  <Button
                    size="small"
                    startIcon={<LinkIcon />}
                    onClick={openUrlDialog}
                  >
                    URL
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {placeholder}
              </Typography>
              
              {!disabled && (
                <Box display="flex" gap={1} justifyContent="center">
                  <Button
                    variant="contained"
                    startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    onClick={handleCloudinaryUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LinkIcon />}
                    onClick={openUrlDialog}
                  >
                    Từ URL
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 1 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* URL Dialog */}
        <Dialog open={urlDialogOpen} onClose={closeUrlDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Nhập URL ảnh</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="URL ảnh"
              fullWidth
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              helperText="Nhập link ảnh từ internet hoặc từ Cloudinary"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeUrlDialog}>Hủy</Button>
            <Button 
              onClick={handleUrlSubmit} 
              variant="contained"
              disabled={!urlInput.trim()}
            >
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Avatar variant (default)
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={value}
          sx={{ 
            width: size, 
            height: size,
            border: '2px solid',
            borderColor: value ? 'primary.main' : 'grey.300',
            bgcolor: 'grey.100'
          }}
        >
          <ImageIcon sx={{ fontSize: size * 0.4 }} />
        </Avatar>
        
        {!disabled && value && (
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' }
            }}
            onClick={handleRemoveImage}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {!disabled && (
        <Box display="flex" gap={1}>
          <Button
            size="small"
            startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
            onClick={handleCloudinaryUpload}
            disabled={uploading}
          >
            {uploading ? 'Đang tải...' : 'Tải lên'}
          </Button>
          <Button
            size="small"
            startIcon={<LinkIcon />}
            onClick={openUrlDialog}
          >
            URL
          </Button>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1, width: '100%' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* URL Dialog */}
      <Dialog open={urlDialogOpen} onClose={closeUrlDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nhập URL ảnh</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL ảnh"
            fullWidth
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            helperText="Nhập link ảnh từ internet hoặc từ Cloudinary"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUrlDialog}>Hủy</Button>
          <Button 
            onClick={handleUrlSubmit} 
            variant="contained"
            disabled={!urlInput.trim()}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUpload; 