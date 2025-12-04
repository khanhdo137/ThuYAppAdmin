import { Box, Chip, Typography } from '@mui/material';
import React from 'react';
import { newsService } from '../../services';

/**
 * Validate news form data
 */
export const validateNewsForm = (formData) => {
  return newsService.validateNewsData(formData);
};

/**
 * Format news date for display
 */
export const formatNewsDate = (date) => {
  return date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa có';
};

/**
 * Format news content preview
 */
export const formatContentPreview = (content, maxLength = 100) => {
  if (!content) return 'Chưa có nội dung';
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
};

/**
 * Parse and format tags array
 */
export const formatTagsArray = (tags) => {
  if (!tags) return [];
  return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
};

/**
 * Render tags as chips
 */
export const renderTagsChips = (tags, maxTags = 3) => {
  if (!tags) return 'Chưa có';
  
  const tagsArray = formatTagsArray(tags);
  const displayTags = tagsArray.slice(0, maxTags);
  
  return (
    <Box>
      {displayTags.map((tag, index) => (
        <Chip 
          key={index}
          label={tag} 
          size="small"
          variant="outlined"
          sx={{ mr: 0.5, mb: 0.5 }}
        />
      ))}
      {tagsArray.length > maxTags && (
        <Typography variant="caption" color="text.secondary">
          +{tagsArray.length - maxTags} thêm
        </Typography>
      )}
    </Box>
  );
};

/**
 * Format title display with fallback
 */
export const formatTitle = (title) => {
  return title || 'Chưa có tiêu đề';
};

/**
 * Get news data with fallbacks and formatting
 */
export const getFormattedNewsData = (newsItem) => {
  return newsService.formatNewsData(newsItem);
};

/**
 * Create search timeout handler for debouncing
 */
export const createSearchHandler = (searchCallback, delay = 500) => {
  let timeoutId = null;
  
  return (searchValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      searchCallback(searchValue);
    }, delay);
    
    return timeoutId;
  };
};

/**
 * Generate news success message
 */
export const createSuccessMessage = (action, title) => {
  const actions = {
    create: 'tạo',
    update: 'cập nhật',
    delete: 'xóa'
  };
  
  const actionText = actions[action] || action;
  return `Đã ${actionText} tin tức "${title}" thành công!`;
};

/**
 * Find news by ID with case-insensitive field lookup
 */
export const findNewsById = (newsList, newsId) => {
  return newsList.find(n => n.newsId === newsId || n.NewsId === newsId);
}; 