import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  IconButton,
  Typography
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { useToast } from './ToastProvider';

const DirectImageUpload = ({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  uploading = false,
  disabled = false,
  accept = "image/*",
  maxSize = 5 // MB
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const toast = useToast();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Vui lòng chọn file hình ảnh';
    }

    // Check file size (convert maxSize from MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      return `Kích thước file không được vượt quá ${maxSize}MB`;
    }

    return null;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    const error = validateFile(file);
    if (error) {
      toast.showError(error);
      return;
    }

    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Image upload error:', error);
      toast.showError(error.message || 'Không thể tải lên hình ảnh');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  // Calculate container dimensions based on image size
  const getContainerStyle = () => {
    if (!imageSize.width || !imageSize.height) {
      return {
        minHeight: 200,
        maxHeight: 400
      };
    }

    const aspectRatio = imageSize.width / imageSize.height;
    const maxWidth = 800; // Maximum width we want to allow
    const maxHeight = 600; // Maximum height we want to allow

    let width, height;

    if (aspectRatio > 1) {
      // Landscape image
      width = Math.min(imageSize.width, maxWidth);
      height = width / aspectRatio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
    } else {
      // Portrait image
      height = Math.min(imageSize.height, maxHeight);
      width = height * aspectRatio;
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
    }

    return {
      width: '100%',
      height: Math.round(height),
      maxWidth: Math.round(width)
    };
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {!currentImageUrl ? (
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            bgcolor: dragActive ? 'action.hover' : 'background.paper',
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              bgcolor: disabled || uploading ? 'background.paper' : 'action.hover'
            }
          }}
          onClick={disabled || uploading ? undefined : handleButtonClick}
        >
          {uploading ? (
            <CircularProgress size={40} />
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography>
                Kéo thả hình ảnh vào đây hoặc click để chọn file
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Hỗ trợ JPG, PNG, GIF (tối đa {maxSize}MB)
              </Typography>
            </>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            position: 'relative',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            ...getContainerStyle()
          }}
        >
          <Box
            component="img"
            src={currentImageUrl}
            alt="Uploaded"
            onLoad={handleImageLoad}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          {!disabled && (
            <IconButton
              onClick={onImageRemove}
              disabled={uploading}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'common.white'
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DirectImageUpload; 