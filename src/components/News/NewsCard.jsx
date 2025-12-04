import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Typography
} from '@mui/material';
import React from 'react';
import { NEWS_CARD_CONFIG } from './newsConstants';
import { getFormattedNewsData, renderTagsChips } from './newsUtils';

const NewsCard = ({ 
  newsItem, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const formattedNews = getFormattedNewsData(newsItem);
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* News Image */}
      {formattedNews.imageUrl && (
        <Box
          component="img"
          src={formattedNews.imageUrl}
          alt={formattedNews.title}
          sx={{
            height: NEWS_CARD_CONFIG.IMAGE_HEIGHT,
            objectFit: 'cover',
            width: '100%'
          }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Date */}
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1}>
          <Typography variant="caption" color="text.secondary">
            {formattedNews.createdAt}
          </Typography>
        </Box>
        
        {/* Title */}
        <Typography variant="h6" component="h3" gutterBottom>
          {formattedNews.title}
        </Typography>
        
        {/* Content Preview */}
        <Typography variant="body2" color="text.secondary" mb={2}>
          {formattedNews.preview}
        </Typography>
        
        {/* Tags */}
        {formattedNews.tagsArray.length > 0 && (
          <Box mb={2}>
            {renderTagsChips(newsItem.tags, NEWS_CARD_CONFIG.MAX_TAGS_DISPLAY)}
          </Box>
        )}
      </CardContent>
      
      {/* Action Buttons */}
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button 
          size="small" 
          onClick={() => onView(newsItem)}
          startIcon={<ViewIcon />}
          color="primary"
        >
          Xem
        </Button>
        <Button
          size="small"
          onClick={() => onEdit(newsItem)}
          startIcon={<EditIcon />}
          color="warning"
        >
          Sửa
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => onDelete(newsItem.newsId)}
          startIcon={<DeleteIcon />}
        >
          Xóa
        </Button>
      </CardActions>
    </Card>
  );
};

export default NewsCard; 