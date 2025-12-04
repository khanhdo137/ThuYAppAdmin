import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    IconButton,
    Paper,
    Typography,
    styled
} from '@mui/material';
import React, { useRef, useState } from 'react';

// Styled component for drag & drop area
const DropZone = styled(Paper)(({ theme, isDragActive, hasImage }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragActive ? theme.palette.primary[50] : 'transparent',
  position: 'relative',
  minHeight: hasImage ? 'auto' : 120,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary[50]
  }
}));

const HiddenInput = styled('input')({
  display: 'none'
});

const LocalImagePreview = ({ 
  value, // URL string hoặc File object
  onChange, 
  disabled = false, 
  label = "Ảnh thú cưng",
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Validate file
  const validateFile = (file) => {
    if (!acceptedFormats.includes(file.type)) {
      return 'Định dạng file không được hỗ trợ. Vui lòng chọn file JPG, PNG, GIF hoặc WebP.';
    }
    
    if (file.size > maxSize) {
      return `File quá lớn. Kích thước tối đa là ${Math.round(maxSize / 1024 / 1024)}MB.`;
    }
    
    return null;
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setError(null);
    onChange(file); // Trả về File object thay vì upload ngay
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
    // Reset input value
    e.target.value = '';
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    if (disabled) return;
    onChange('');
    setError(null);
  };

  // Get image preview URL
  const getPreviewUrl = () => {
    if (!value) return null;
    
    if (typeof value === 'string') {
      // Existing URL
      return value;
    } else if (value instanceof File) {
      // Local file - create blob URL
      return URL.createObjectURL(value);
    }
    
    return null;
  };

  const previewUrl = getPreviewUrl();
  const isLocalFile = value instanceof File;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
        {label}
      </Typography>

      <DropZone
        isDragActive={dragActive}
        hasImage={!!value}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        sx={{ 
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'default' : 'pointer'
        }}
      >
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
        />

        {previewUrl ? (
          // Show image preview
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={previewUrl}
              alt="Preview"
              sx={{
                width: '100%',
                maxWidth: 200,
                height: 150,
                objectFit: 'cover',
                borderRadius: 1,
                mb: 1
              }}
              onError={() => setError('Không thể hiển thị ảnh')}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}

            <Box display="flex" alignItems="center" justifyContent="center" gap={1} sx={{ mt: 1 }}>
              {isLocalFile && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <PhotoCameraIcon fontSize="small" color="primary" />
                  <Typography variant="caption" color="primary">
                    Ảnh mới (chưa lưu)
                  </Typography>
                </Box>
              )}
              {!isLocalFile && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CloudUploadIcon fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main">
                    Đã lưu trên cloud
                  </Typography>
                </Box>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Click để thay đổi ảnh
            </Typography>
          </Box>
        ) : (
          // Show upload area
          <Box>
            <PhotoCameraIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Kéo thả ảnh vào đây
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              hoặc click để chọn file
            </Typography>
            <Box display="flex" gap={1} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<PhotoCameraIcon />}
                disabled={disabled}
                size="small"
              >
                Chọn ảnh
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Hỗ trợ: JPG, PNG, GIF, WebP (tối đa {Math.round(maxSize / 1024 / 1024)}MB)
            </Typography>
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
              📌 Ảnh sẽ được lưu khi bạn ấn "Thêm" hoặc "Cập nhật"
            </Typography>
          </Box>
        )}
      </DropZone>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default LocalImagePreview; 