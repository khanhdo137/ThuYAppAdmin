class CloudinaryService {
  constructor() {
    // These should be set in your environment variables
    this.cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
    this.uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';
  }

  getUploadUrl(resourceType = 'image') {
    return `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;
  }

  // Upload file directly to Cloudinary without widget
  async uploadImage(file) {
    if (!this.cloudName || !this.uploadPreset) {
      throw new Error('Cloudinary chưa được cấu hình. Vui lòng kiểm tra file .env');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);

      console.log('Uploading to Cloudinary...', {
        cloudName: this.cloudName,
        fileName: file.name,
        fileSize: file.size
      });

      const response = await fetch(this.getUploadUrl('image'), {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Upload thất bại');
      }

      const result = await response.json();
      console.log('Cloudinary upload successful:', result);
      
      // Return the secure URL for the uploaded image
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Không thể tải lên hình ảnh. Vui lòng thử lại.');
    }
  }

  // Delete uploaded image from Cloudinary
  async deleteImage(publicId) {
    // Note: This requires server-side implementation with API secret
    // For unsigned uploads, you might want to implement this on your backend
    console.log('Delete image with public_id:', publicId);
    // Implementation would require backend API call
  }

  // Initialize and open Cloudinary upload widget
  openUploadWidget(onSuccess, onError = null) {
    // Check if Cloudinary script is loaded
    if (!window.cloudinary) {
      this.loadCloudinaryScript(() => {
        this.createWidget(onSuccess, onError);
      });
    } else {
      this.createWidget(onSuccess, onError);
    }
  }

  // Load Cloudinary script dynamically
  loadCloudinaryScript(callback) {
    if (document.getElementById('cloudinary-script')) {
      callback();
      return;
    }

    const script = document.createElement('script');
    script.id = 'cloudinary-script';
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.onload = callback;
    script.onerror = () => {
      console.error('Failed to load Cloudinary script');
    };
    document.head.appendChild(script);
  }

  // Create and configure the upload widget
  createWidget(onSuccess, onError) {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: this.cloudName,
        uploadPreset: this.uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
        maxFileSize: 10000000, // 10MB
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        theme: 'minimal',
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#1976d2',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#1976d2',
            action: '#1976d2',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44336',
            inProgress: '#1976d2',
            complete: '#4CAF50',
            sourceBg: '#E4EBF1'
          },
          fonts: {
            default: null,
            "'Roboto', sans-serif": {
              url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
              active: true
            }
          }
        },
        text: {
          'local.browse': 'Chọn ảnh từ máy',
          'local.dd_title_single': 'Kéo thả ảnh vào đây',
          'local.dd_title_multi': 'Kéo thả ảnh vào đây',
          'camera.title': 'Chụp ảnh',
          'url.title': 'Từ URL',
          'url.inner_title': 'Nhập URL ảnh',
          'url.input_placeholder': 'https://example.com/image.jpg',
          'progress.uploading': 'Đang tải lên...',
          'progress.processing': 'Đang xử lý...',
          'close': 'Đóng',
          'retry': 'Thử lại',
          'remove': 'Xóa',
          'advanced': 'Nâng cao',
          'done': 'Hoàn thành'
        }
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          if (onError) {
            onError(error);
          }
          return;
        }

        if (result && result.event === 'success') {
          console.log('Cloudinary upload success:', result.info);
          onSuccess(result.info);
        }
      }
    );

    widget.open();
  }

  // Generate optimized image URL
  getOptimizedImageUrl(publicId, options = {}) {
    const {
      width = 400,
      height = 400,
      crop = 'fill',
      quality = 'auto',
      format = 'auto'
    } = options;

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
  }

  // Get thumbnail URL
  getThumbnailUrl(publicId, size = 150) {
    return this.getOptimizedImageUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill'
    });
  }

  // Validate image URL format
  isValidCloudinaryUrl(url) {
    if (!url) return false;
    
    const cloudinaryUrlPattern = new RegExp(
      `^https://res\\.cloudinary\\.com/${this.cloudName}/image/upload/.*`
    );
    
    return cloudinaryUrlPattern.test(url) || url.startsWith('http');
  }

  // Extract public_id from Cloudinary URL
  extractPublicId(url) {
    if (!url) return null;
    
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    return match ? match[1] : null;
  }

  // Upload video to Cloudinary
  async uploadVideo(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    try {
      const xhr = new XMLHttpRequest();
      
      // Return promise that resolves with upload URL or rejects with error
      return new Promise((resolve, reject) => {
        xhr.open('POST', this.getUploadUrl('video'), true);

        // Track upload progress
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded * 100) / e.total);
            if (onProgress) onProgress(progress);
          }
        };

        // Handle response
        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            reject(new Error('Upload failed'));
          }
        };

        // Handle errors
        xhr.onerror = () => {
          reject(new Error('Upload failed'));
        };

        // Start upload
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Không thể tải lên video. Vui lòng thử lại.');
    }
  }

  extractCloudinaryId(url) {
    const match = url.match(/\/v\d+\/([^/]+)\./);
    return match ? match[1] : null;
  }
}

export const cloudinaryService = new CloudinaryService(); 