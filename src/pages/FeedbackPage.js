import {
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

// Components
import DataTable from '../components/DataTable';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import {
  FEEDBACK_FILTERS,
  FeedbackDialog,
  FeedbackStatistics,
  getFeedbackTableColumns
} from '../components/Feedback';
import PageTemplate from '../components/PageTemplate';
import SearchFilterBar from '../components/SearchFilterBar';
import { ToastProvider, useToast } from '../components/ToastProvider';

// Services
import feedbackService from '../services/feedbackService';

// Utils
import { createLoadingManager } from '../utils/loadingHelper';

const FeedbackPage = () => {
  const { showSuccess, showError } = useToast();
  const loadingManager = createLoadingManager();

  // State
  const [feedbacks, setFeedbacks] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null });
  const [activeTab, setActiveTab] = useState(0);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Load feedbacks
  const loadFeedbacks = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      console.log('Loading feedbacks...', { page, limit, selectedRating, searchTerm });
      
      const result = await feedbackService.getAllFeedbacks(
        page, 
        limit, 
        selectedRating || null,
        searchTerm
      );
      
      console.log('Feedbacks loaded:', result);
      
      // Normalize feedback data
      const normalizedFeedbacks = result.feedbacks.map(feedback => 
        feedbackService.normalizeFeedbackData(feedback)
      );
      
      setFeedbacks(normalizedFeedbacks);
      setPagination(result.pagination);
      loadingManager.markAsLoaded();
      
    } catch (error) {
      console.error('Error loading feedbacks:', error);
      showError('Có lỗi khi tải danh sách đánh giá');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRating, searchTerm, showError, loadingManager]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      console.log('Loading feedback statistics...');
      const stats = await feedbackService.getFeedbackStatistics();
      console.log('Statistics loaded:', stats);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
      showError('Có lỗi khi tải thống kê đánh giá');
    }
  }, [showError]);

  // Initial load
  useEffect(() => {
    const initializePage = async () => {
      await Promise.all([
        loadFeedbacks(1, pagination.limit),
        loadStatistics()
      ]);
    };
    
    initializePage();
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (pagination.page === 1) {
      loadFeedbacks(1, pagination.limit);
    } else {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [selectedRating, searchTerm]);

  // Reload when page changes
  useEffect(() => {
    if (pagination.page > 1) {
      loadFeedbacks(pagination.page, pagination.limit);
    }
  }, [pagination.page]);

  // Handlers
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleRatingFilterChange = (event) => {
    setSelectedRating(event.target.value);
  };

  const handleRefresh = () => {
    loadFeedbacks(pagination.page, pagination.limit);
    loadStatistics();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.item) return;

    try {
      await feedbackService.deleteFeedback(deleteConfirm.item.feedbackId);
      showSuccess('Đã xóa đánh giá thành công');
      
      // Reload data
      loadFeedbacks(pagination.page, pagination.limit);
      loadStatistics();
      
    } catch (error) {
      console.error('Error deleting feedback:', error);
      showError('Có lỗi khi xóa đánh giá');
    } finally {
      setDeleteConfirm({ open: false, item: null });
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Table configuration
  const columns = getFeedbackTableColumns();

  // Handlers for DataTable actions
  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const handleDelete = (feedback) => {
    setDeleteConfirm({ open: true, item: feedback });
  };

  const renderFilters = () => (
    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Lọc theo sao</InputLabel>
        <Select
          value={selectedRating}
          onChange={handleRatingFilterChange}
          label="Lọc theo sao"
        >
          {FEEDBACK_FILTERS.map(filter => (
            <MenuItem key={filter.value} value={filter.value}>
              {filter.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
        disabled={loading}
      >
        Làm mới
      </Button>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Card>
            <Box p={2}>
              <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={handleSearch}
                placeholder="Tìm kiếm theo tên khách hàng, thú cưng, dịch vụ..."
                variant="paper"
              >
                {renderFilters()}
              </SearchFilterBar>

              <DataTable
                columns={columns}
                data={feedbacks}
                onView={handleView}
                onDelete={handleDelete}
                emptyMessage="Không có đánh giá nào"
                sx={{ mt: 2 }}
              />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={(event, value) => handlePageChange(value)}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Box>
          </Card>
        );

      case 1:
        return (
          <FeedbackStatistics statistics={statistics} />
        );

      default:
        return null;
    }
  };

  return (
    <PageTemplate
      title="Quản lý đánh giá"
      subtitle={`${pagination.total} đánh giá`}
    >
      <Box>
        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>Danh sách đánh giá</Typography>
                  {pagination.total > 0 && (
                    <Chip 
                      label={pagination.total} 
                      size="small" 
                      color="primary" 
                    />
                  )}
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>Thống kê</Typography>
                  {statistics?.averageRating > 0 && (
                    <Chip 
                      label={`${statistics.averageRating}/5`} 
                      size="small" 
                      color="warning" 
                    />
                  )}
                </Box>
              } 
            />
          </Tabs>
        </Card>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Dialogs */}
        <FeedbackDialog
          open={!!selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          feedback={selectedFeedback}
        />

        <DeleteConfirmDialog
          open={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, item: null })}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận xóa đánh giá"
          content={
            deleteConfirm.item ? 
              `Bạn có chắc chắn muốn xóa đánh giá ${deleteConfirm.item.rating} sao của khách hàng "${deleteConfirm.item.customerName}"?` :
              ''
          }
        />
      </Box>
    </PageTemplate>
  );
};

const FeedbackPageWithToast = () => (
  <ToastProvider>
    <FeedbackPage />
  </ToastProvider>
);

export default FeedbackPageWithToast; 