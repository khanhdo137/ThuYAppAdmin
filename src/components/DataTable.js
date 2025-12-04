import { Delete, Edit, Visibility, FirstPage, LastPage, ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
    Box,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TablePagination,
    FormControl,
    Select,
    MenuItem,
    InputLabel
} from '@mui/material';
import React from 'react';

function DataTable({ 
  columns = [], 
  data = [], 
  onView,
  onEdit, 
  onDelete,
  showActions = true,
  emptyMessage = "Không có dữ liệu",
  pagination = null,
  onPageChange = null,
  onLimitChange = null,
  loading = false,
  ...props 
}) {
  // Only show actions if showActions is true AND at least one action handler is provided
  const shouldShowActions = showActions && (onView || onEdit || onDelete);

  return (
    <Box>
      <TableContainer 
        component={Paper} 
        variant="outlined" 
        sx={{ 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          ...props.sx
        }}
      >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            {columns.map((column, index) => (
              <TableCell 
                key={index}
                align={column.align || 'left'}
                sx={{ 
                  fontWeight: 600, 
                  py: 2,
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  ...column.headerSx
                }}
              >
                {column.label}
              </TableCell>
            ))}
            {shouldShowActions && (
              <TableCell 
                align="center" 
                sx={{ 
                  fontWeight: 600, 
                  py: 2,
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}
              >
                Thao tác
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (shouldShowActions ? 1 : 0)} 
                align="center"
                sx={{ py: 6 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow 
                key={row.id || rowIndex}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'grey.50' 
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                {columns.map((column, colIndex) => (
                  <TableCell 
                    key={colIndex}
                    align={column.align || 'left'}
                    sx={{ 
                      py: 2,
                      ...column.cellSx
                    }}
                  >
                    {column.render ? column.render(row, rowIndex) : row[column.field]}
                  </TableCell>
                ))}
                {shouldShowActions && (
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      {onView && (
                        <IconButton 
                          size="small" 
                          onClick={() => onView(row)}
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': { 
                              bgcolor: 'primary.50',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      )}
                      {onEdit && (
                        <IconButton 
                          size="small" 
                          onClick={() => onEdit(row)}
                          sx={{ 
                            color: 'warning.main',
                            '&:hover': { 
                              bgcolor: 'warning.50',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton 
                          size="small" 
                          onClick={() => onDelete(row)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { 
                              bgcolor: 'error.50',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
    
    {/* Pagination */}
    {pagination && onPageChange && (
      <>
        {/* Removed noisy console log to avoid spam during form typing */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} mục
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => onPageChange(1)} 
            disabled={pagination.page === 1 || loading}
            size="small"
          >
            <FirstPage />
          </IconButton>
          
          <IconButton 
            onClick={() => onPageChange(pagination.page - 1)} 
            disabled={pagination.page === 1 || loading}
            size="small"
          >
            <ChevronLeft />
          </IconButton>
          
          <Typography variant="body2" sx={{ mx: 1, minWidth: 60, textAlign: 'center' }}>
            {pagination.page} / {Math.max(pagination.totalPages, 1)}
          </Typography>
          
          <IconButton 
            onClick={() => onPageChange(pagination.page + 1)} 
            disabled={pagination.page === pagination.totalPages || loading}
            size="small"
          >
            <ChevronRight />
          </IconButton>
          
          <IconButton 
            onClick={() => onPageChange(pagination.totalPages)} 
            disabled={pagination.page === pagination.totalPages || loading}
            size="small"
          >
            <LastPage />
          </IconButton>
        </Box>
      </Box>
      </>
    )}
  </Box>
);
};

// Lightweight memo: only re-render when data or pagination object reference changes
export default React.memo(DataTable, (prev, next) => {
  if (prev.loading !== next.loading) return false;
  if (prev.data !== next.data) return false;
  if (prev.pagination !== next.pagination) return false;
  return true;
});