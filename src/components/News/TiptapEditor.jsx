import {
    Image as ImageIcon,
    Link as LinkIcon,
    VideoFile as VideoIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { cloudinaryService } from '../../services';

// Utility function to extract YouTube video ID
const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const MediaToolbar = ({ onImageUpload, onVideoInsert, onUrlInsert, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [urlDialog, setUrlDialog] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const imageUrl = await cloudinaryService.uploadImage(file);
      onImageUpload(imageUrl);
    } catch (error) {
      console.error('Image upload failed:', error);
      setError('Không thể tải lên hình ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      setError('Video không được vượt quá 100MB');
      event.target.value = '';
      return;
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Chỉ hỗ trợ định dạng video: MP4, WebM, OGG');
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      const videoUrl = await cloudinaryService.uploadVideo(file, (progress) => {
        setUploadProgress(progress);
      });
      
      onVideoInsert(videoUrl);
    } catch (error) {
      console.error('Video upload failed:', error);
      setError('Không thể tải lên video. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput) {
      if (isImageUrl(urlInput)) {
        onImageUpload(urlInput);
      } else if (isVideoUrl(urlInput)) {
        onVideoInsert(urlInput);
      }
      setUrlInput('');
      setUrlDialog(false);
    }
  };

  const isImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) || url.includes('cloudinary.com');
  };

  const isVideoUrl = (url) => {
    return url.match(/\.(mp4|webm|ogv)$/) || 
           url.includes('cloudinary.com') ||
           url.includes('youtube.com') || 
           url.includes('youtu.be');
  };

  const renderVideoPreview = (url) => {
    // Check if it's a YouTube URL
    const youtubeId = extractYouTubeId(url);
    if (youtubeId) {
      return (
        <Box
          component="iframe"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          width="100%"
          height="200"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sx={{ maxWidth: '100%', maxHeight: '200px' }}
        />
      );
    }

    // For other video URLs
    return (
      <Box
        component="video"
        src={url}
        controls
        sx={{
          maxWidth: '100%',
          maxHeight: '200px'
        }}
      >
        Your browser does not support the video tag.
      </Box>
    );
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {/* Image Upload */}
        <input
          accept="image/*"
          id="image-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
          disabled={disabled || uploading}
        />
        <label htmlFor="image-upload">
          <Tooltip title="Tải lên hình ảnh">
            <span>
              <IconButton
                component="span"
                disabled={disabled || uploading}
                color="primary"
              >
                {uploading && !uploadProgress ? <CircularProgress size={24} /> : <ImageIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </label>

        {/* Video Upload */}
        <input
          accept="video/mp4,video/webm,video/ogg"
          id="video-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={handleVideoUpload}
          disabled={disabled || uploading}
        />
        <label htmlFor="video-upload">
          <Tooltip title="Tải lên video (MP4, WebM, OGG - Tối đa 100MB)">
            <span>
              <IconButton
                component="span"
                disabled={disabled || uploading}
                color="primary"
              >
                {uploading && uploadProgress > 0 ? <CircularProgress size={24} /> : <VideoIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </label>

        {/* URL Insert */}
        <Tooltip title="Chèn từ URL">
          <span>
            <IconButton
              onClick={() => {
                setError(null);
                setUrlDialog(true);
              }}
              disabled={disabled || uploading}
              color="primary"
            >
              <LinkIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* Error Message */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      {/* Upload Progress */}
      {uploading && uploadProgress > 0 && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Đang tải lên: {uploadProgress}%
          </Typography>
        </Box>
      )}

      {/* URL Input Dialog */}
      <Dialog open={urlDialog} onClose={() => setUrlDialog(false)}>
        <DialogTitle>Chèn media từ URL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL hình ảnh hoặc video"
            type="url"
            fullWidth
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg, video.mp4 hoặc YouTube URL"
          />
          {urlInput && (
            <Box sx={{ mt: 2 }}>
              {isImageUrl(urlInput) && (
                <Box
                  component="img"
                  src={urlInput}
                  alt="Preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              {isVideoUrl(urlInput) && renderVideoPreview(urlInput)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUrlDialog(false)}>Hủy</Button>
          <Button onClick={handleUrlSubmit} variant="contained">
            Chèn
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const TiptapEditor = ({ value, onChange, disabled }) => {
  const handleImageUpload = (imageUrl) => {
    const newContent = value ? `${value}\n${imageUrl}` : imageUrl;
    onChange(newContent);
  };

  const handleVideoInsert = (videoUrl) => {
    const newContent = value ? `${value}\n${videoUrl}` : videoUrl;
    onChange(newContent);
  };

  // Function to render preview content
  const renderPreview = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Check for YouTube links
      const youtubeId = extractYouTubeId(line);
      if (youtubeId) {
        return (
          <Box key={index} sx={{ my: 2 }}>
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        );
      }
      
      // Check for other video URLs
      if (line.match(/\.(mp4|webm|ogv)$/) || (line.includes('cloudinary.com') && line.match(/\.(mp4|webm|ogv)$/))) {
        return (
          <Box key={index} sx={{ my: 2 }}>
            <video
              controls
              width="100%"
              style={{ maxHeight: '200px' }}
            >
              <source src={line} type={`video/${line.split('.').pop()}`} />
              Your browser does not support the video tag.
            </video>
          </Box>
        );
      }
      
      // Check for image links
      if (line.match(/\.(jpeg|jpg|gif|png)$/) || (line.includes('cloudinary.com') && !line.match(/\.(mp4|webm|ogv)$/))) {
        return (
          <Box key={index} sx={{ my: 2 }}>
            <Box
              component="img"
              src={line}
              alt="Content"
              sx={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                borderRadius: 1
              }}
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
    <Box>
      <MediaToolbar
        onImageUpload={handleImageUpload}
        onVideoInsert={handleVideoInsert}
        disabled={disabled}
      />
      <Box
        component="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        sx={{
          width: '100%',
          minHeight: '200px',
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          fontFamily: 'inherit',
          fontSize: 'inherit',
          resize: 'vertical',
          '&:focus': {
            outline: 'none',
            borderColor: 'primary.main',
          },
          '&:disabled': {
            bgcolor: 'action.disabledBackground',
            color: 'text.disabled'
          }
        }}
        placeholder="Nhập nội dung tin tức. Sử dụng các nút phía trên để chèn hình ảnh hoặc video."
      />
      {/* Preview Area */}
      {value && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.default'
          }}
        >
          <Box sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
            Xem trước:
          </Box>
          {renderPreview(value)}
        </Box>
      )}
    </Box>
  );
};

export default TiptapEditor; 