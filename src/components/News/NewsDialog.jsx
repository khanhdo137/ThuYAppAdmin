import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
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
import { cloudinaryService } from '../../services';
import { NEWS_DIALOG_MODES } from './newsConstants';
import TiptapEditor from './TiptapEditor';

const NewsDialog = ({
  open,
  onClose,
  dialogMode,
  formData,
  formErrors,
  onFormChange,
  onCreate,
  onUpdate,
  loading
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const isViewMode = dialogMode === NEWS_DIALOG_MODES.VIEW;
  const isCreateMode = dialogMode === NEWS_DIALOG_MODES.CREATE;
  const isEditMode = dialogMode === NEWS_DIALOG_MODES.EDIT;

  const handleSubmit = () => {
    if (isCreateMode) {
      onCreate();
    } else if (isEditMode) {
      onUpdate();
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setUploadError('Kích thước ảnh không được vượt quá 5MB');
      event.target.value = '';
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF');
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      const imageUrl = await cloudinaryService.uploadImage(file);
      onFormChange('imageUrl', imageUrl);
    } catch (error) {
      console.error('Image upload failed:', error);
      setUploadError('Không thể tải lên hình ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    onFormChange('imageUrl', '');
    setUploadError(null);
  };

  const getDialogTitle = () => {
    switch (dialogMode) {
      case NEWS_DIALOG_MODES.CREATE:
        return 'Thêm tin tức mới';
      case NEWS_DIALOG_MODES.EDIT:
        return 'Chỉnh sửa tin tức';
      case NEWS_DIALOG_MODES.VIEW:
        return 'Chi tiết tin tức';
      default:
        return '';
    }
  };

  // Function to render content with auto-detected media
  const renderContent = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Check for YouTube links
      if (line.includes('youtube.com/watch?v=')) {
        const videoId = line.split('v=')[1]?.split('&')[0];
        if (videoId) {
          return (
            <Box key={index} sx={{ my: 2 }}>
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          );
        }
      }
      
      // Check for Cloudinary videos
      if (line.includes('cloudinary.com') && line.match(/\.(mp4|webm|ogv)$/)) {
        return (
          <Box key={index} sx={{ my: 2 }}>
            <video
              controls
              width="100%"
              style={{ maxHeight: '315px' }}
              preload="metadata"
            >
              <source src={line} type={`video/${line.split('.').pop()}`} />
              Trình duyệt của bạn không hỗ trợ xem video.
            </video>
          </Box>
        );
      }
      
      // Check for image links (including Cloudinary)
      if (line.match(/\.(jpeg|jpg|gif|png)$/) || (line.includes('cloudinary.com') && !line.match(/\.(mp4|webm|ogv)$/))) {
        return (
          <Box key={index} sx={{ my: 2 }}>
            <Box
              component="img"
              src={line}
              alt="Content"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 1
              }}
              loading="lazy"
            />
          </Box>
        );
      }

      // Regular text
      return line.trim() ? (
        <Box key={index} sx={{ my: 1 }}>
          {line}
        </Box>
      ) : null;
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {getDialogTitle()}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Title */}
          <TextField
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            error={!!formErrors.title}
            helperText={formErrors.title}
            disabled={isViewMode}
            fullWidth
            required
          />

          {/* Featured Image Upload */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Ảnh đại diện {!isViewMode && <Typography component="span" color="error">*</Typography>}
            </Typography>
            
            {isViewMode ? (
              formData.imageUrl ? (
                <Box
                  component="img"
                  src={formData.imageUrl}
                  alt="Ảnh đại diện"
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid #ddd'
                  }}
                />
              ) : (
                <Typography color="text.secondary">
                  Không có ảnh đại diện
                </Typography>
              )
            ) : (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  bgcolor: 'background.default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                {formData.imageUrl ? (
                  <Box sx={{ width: '100%', position: 'relative' }}>
                    <Box
                      component="img"
                      src={formData.imageUrl}
                      alt="Ảnh đại diện"
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        setUploadError('Không thể tải ảnh. Vui lòng kiểm tra URL.');
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'common.white'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <input
                      accept="image/jpeg,image/png,image/gif"
                      id="featured-image-upload"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <label htmlFor="featured-image-upload">
                      <Button
                        component="span"
                        variant="outlined"
                        disabled={uploading}
                        startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      >
                        {uploading ? 'Đang tải lên...' : 'Tải lên ảnh đại diện'}
                      </Button>
                    </label>
                    <Typography variant="caption" color="text.secondary" align="center">
                      Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF
                    </Typography>
                  </>
                )}
                {uploadError && (
                  <Typography color="error" variant="caption">
                    {uploadError}
                  </Typography>
                )}
              </Paper>
            )}
          </Box>

          {/* Content */}
          {isViewMode ? (
            <Box 
              sx={{ 
                mt: 2,
                p: 2, 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                whiteSpace: 'pre-wrap'
              }}
            >
              {renderContent(formData.content)}
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Nội dung
              </Typography>
              <TiptapEditor
            value={formData.content}
                onChange={(newContent) => onFormChange('content', newContent)}
            disabled={isViewMode}
          />
            </>
          )}

          {/* Tags */}
          <TextField
            label="Tags"
            value={formData.tags}
            onChange={(e) => onFormChange('tags', e.target.value)}
            error={!!formErrors.tags}
            helperText={formErrors.tags || 'Phân tách các tag bằng dấu phẩy. Ví dụ: sức khỏe, thú cưng, chăm sóc'}
            disabled={isViewMode}
            fullWidth
            placeholder="sức khỏe, thú cưng, chăm sóc..."
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading || uploading}>
          {isViewMode ? 'Đóng' : 'Hủy'}
        </Button>
        {!isViewMode && (
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || uploading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isCreateMode ? (
              'Thêm mới'
            ) : (
              'Cập nhật'
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NewsDialog; 