import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import React from 'react';
import { NEWS_TABLE_MIN_WIDTHS } from './newsConstants';
import { formatContentPreview, formatNewsDate, formatTitle, renderTagsChips } from './newsUtils';

/**
 * Get news table columns configuration
 */
export const getNewsTableColumns = ({
  onView,
  onEdit,
  onDelete
}) => [
  {
    field: 'newsId',
    label: 'ID',
    minWidth: NEWS_TABLE_MIN_WIDTHS.ID,
    render: (row) => row.newsId || row.NewsId || 'N/A'
  },
  {
    field: 'title',
    label: 'Tiêu đề',
    minWidth: NEWS_TABLE_MIN_WIDTHS.TITLE,
    render: (row) => (
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {formatTitle(row.title)}
      </Typography>
    )
  },
  {
    field: 'content',
    label: 'Nội dung',
    minWidth: NEWS_TABLE_MIN_WIDTHS.CONTENT,
    render: (row) => (
      <Typography variant="body2" color="text.secondary">
        {formatContentPreview(row.content)}
      </Typography>
    )
  },
  {
    field: 'tags',
    label: 'Tags',
    minWidth: NEWS_TABLE_MIN_WIDTHS.TAGS,
    render: (row) => renderTagsChips(row.tags)
  },
  {
    field: 'createdAt',
    label: 'Ngày tạo',
    minWidth: NEWS_TABLE_MIN_WIDTHS.CREATED_AT,
    render: (row) => formatNewsDate(row.createdAt)
  },
  {
    field: 'actions',
    label: 'Thao tác',
    minWidth: NEWS_TABLE_MIN_WIDTHS.ACTIONS,
    render: (row) => (
      <Box display="flex" gap={0.5}>
        <IconButton 
          size="small" 
          onClick={() => onView(row)}
          color="primary"
          title="Xem chi tiết"
        >
          <ViewIcon />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => onEdit(row)}
          color="warning"
          title="Chỉnh sửa"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => onDelete(row)}
          color="error"
          title="Xóa"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    )
  }
]; 