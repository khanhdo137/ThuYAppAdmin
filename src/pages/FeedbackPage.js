import {
  Refresh as RefreshIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  FormatListBulleted as ListIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Tab,
  Tabs,
  Typography,
  Grid,
  Paper,
  Avatar,
  Divider,
  Rating,
  Skeleton,
  Stack,
  LinearProgress
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

// Context
import { useNotifications } from '../context/NotificationContext';

// Utils
import { createLoadingManager } from '../utils/loadingHelper';

const FeedbackPage = () => {
  const { showSuccess, showError } = useToast();
  const loadingManager = createLoadingManager();
  const { markFeedbackAsRead } = useNotifications();

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
    
    // Mark feedback as read to decrease notification count
    const feedbackId = feedback.feedbackId || feedback.FeedbackId;
    if (feedbackId) {
      markFeedbackAsRead(feedbackId);
    }
  };

  const handleDelete = (feedback) => {
    setDeleteConfirm({ open: true, item: feedback });
  };

  // Enhanced feedback card component
  const FeedbackCard = ({ feedback }) => {
    const ratingColor = feedbackService.getRatingColor(feedback.rating);
    
    return (
      <Card 
        sx={{ 
          mb: 2, 
          transition: 'all 0.3s ease',
          '&:hover': { 
            boxShadow: 6,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            {/* Left side - Customer info */}
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: `${ratingColor}.main`,
                    width: 56,
                    height: 56
                  }}
                >
                  {feedback.customerName?.charAt(0) || 'K'}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="h6" fontWeight="600">
                      {feedback.customerName || 'Khách hàng'}
                    </Typography>
                    <Chip 
                      label={feedbackService.getRatingText(feedback.rating)}
                      color={ratingColor}
                      size="small"
                    />
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Rating 
                      value={feedback.rating} 
                      readOnly 
                      size="small"
                      icon={<StarIcon fontSize="inherit" />}
                      emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({feedback.rating}/5)
                    </Typography>
                  </Box>

                  {feedback.comment && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontStyle: 'italic',
                        pl: 1,
                        borderLeft: 3,
                        borderColor: `${ratingColor}.light`
                      }}
                    >
                      "{feedback.comment}"
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Right side - Details */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Thú cưng
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {feedback.petName || '-'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Dịch vụ
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {feedback.serviceName || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ngày đánh giá
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          {/* Actions */}
          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleView(feedback)}
            >
              Chi tiết
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleDelete(feedback)}
            >
              Xóa
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Enhanced statistics card
  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="700" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const renderFilters = () => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        bgcolor: 'background.default',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider'
      }}
    >
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <FilterListIcon color="action" />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo đánh giá</InputLabel>
          <Select
            value={selectedRating}
            onChange={handleRatingFilterChange}
            label="Lọc theo đánh giá"
          >
            {FEEDBACK_FILTERS.map(filter => (
              <MenuItem key={filter.value} value={filter.value}>
                <Box display="flex" alignItems="center" gap={1}>
                  {filter.value && (
                    <Rating value={parseInt(filter.value)} readOnly size="small" />
                  )}
                  <span>{filter.label}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
          sx={{ ml: 'auto' }}
        >
          Làm mới
        </Button>
      </Box>
    </Paper>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box>
            {/* Search and Filters */}
            <Card sx={{ mb: 3 }}>
              <Box p={2.5}>
                <SearchFilterBar
                  searchValue={searchTerm}
                  onSearchChange={handleSearch}
                  placeholder="Tìm kiếm theo tên khách hàng, thú cưng, dịch vụ..."
                  variant="standard"
                />
              </Box>
            </Card>

            {renderFilters()}

            {/* Loading State */}
            {loading && (
              <Box mt={3}>
                {[1, 2, 3].map((i) => (
                  <Card key={i} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" gap={2}>
                        <Skeleton variant="circular" width={56} height={56} />
                        <Box flex={1}>
                          <Skeleton width="60%" height={32} />
                          <Skeleton width="40%" height={24} sx={{ mt: 1 }} />
                          <Skeleton width="80%" height={20} sx={{ mt: 1 }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Feedback List */}
            {!loading && (
              <Box mt={3}>
                {feedbacks.length > 0 ? (
                  feedbacks.map((feedback) => (
                    <FeedbackCard 
                      key={feedback.feedbackId} 
                      feedback={feedback} 
                    />
                  ))
                ) : (
                  <Paper 
                    sx={{ 
                      p: 8, 
                      textAlign: 'center',
                      bgcolor: 'background.default'
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: 'action.hover'
                      }}
                    >
                      <StarBorderIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Không có đánh giá nào
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || selectedRating 
                        ? 'Thử thay đổi bộ lọc hoặc tìm kiếm'
                        : 'Chưa có đánh giá nào từ khách hàng'
                      }
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={(event, value) => handlePageChange(value)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 500
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            {/* Overview Stats */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Tổng đánh giá"
                  value={statistics?.totalFeedbacks || 0}
                  subtitle="Tất cả đánh giá"
                  icon={<AssessmentIcon />}
                  color="primary"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Điểm trung bình"
                  value={statistics?.averageRating?.toFixed(1) || '0.0'}
                  subtitle="Trên 5 sao"
                  icon={<StarIcon />}
                  color="warning"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="5 sao"
                  value={statistics?.ratingDistribution?.find(r => r.rating === 5)?.count || 0}
                  subtitle="Rất hài lòng"
                  icon={<TrendingUpIcon />}
                  color="success"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="1-2 sao"
                  value={
                    (statistics?.ratingDistribution?.find(r => r.rating === 1)?.count || 0) +
                    (statistics?.ratingDistribution?.find(r => r.rating === 2)?.count || 0)
                  }
                  subtitle="Cần cải thiện"
                  icon={<StarBorderIcon />}
                  color="error"
                />
              </Grid>
            </Grid>

            {/* Rating Distribution */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Phân bố đánh giá
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Stack spacing={2}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const ratingData = statistics?.ratingDistribution?.find(r => r.rating === star);
                    const count = ratingData?.count || 0;
                    const percentage = statistics?.totalFeedbacks > 0 
                      ? (count / statistics.totalFeedbacks) * 100 
                      : 0;

                    return (
                      <Box key={star}>
                        <Box display="flex" alignItems="center" gap={2} mb={0.5}>
                          <Box display="flex" alignItems="center" gap={0.5} minWidth={100}>
                            <Typography variant="body2" fontWeight="500">
                              {star}
                            </Typography>
                            <StarIcon fontSize="small" color="warning" />
                          </Box>
                          
                          <Box flex={1}>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: feedbackService.getRatingColor(star) + '.main'
                                }
                              }}
                            />
                          </Box>
                          
                          <Typography 
                            variant="body2" 
                            fontWeight="600" 
                            minWidth={80}
                            textAlign="right"
                          >
                            {count} ({percentage.toFixed(0)}%)
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Feedbacks */}
            {statistics?.recentFeedbacks && statistics.recentFeedbacks.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Đánh giá gần đây
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    {statistics.recentFeedbacks.slice(0, 5).map((feedback, index) => {
                      const normalizedFeedback = feedbackService.normalizeFeedbackData(feedback);
                      return (
                        <Box 
                          key={index}
                          sx={{ 
                            p: 2, 
                            bgcolor: 'background.default',
                            borderRadius: 2,
                            border: 1,
                            borderColor: 'divider'
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="600">
                                {normalizedFeedback.customerName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(normalizedFeedback.createdAt).toLocaleDateString('vi-VN')}
                              </Typography>
                            </Box>
                            <Rating 
                              value={normalizedFeedback.rating} 
                              readOnly 
                              size="small"
                            />
                          </Box>
                          {normalizedFeedback.comment && (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              "{normalizedFeedback.comment}"
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <PageTemplate
      title="Quản lý đánh giá"
      subtitle={`Tổng ${pagination.total} đánh giá từ khách hàng`}
    >
      <Box>
        {/* Header Stats */}
        {statistics && (
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <StarIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" color="white" fontWeight="700">
                        {statistics.averageRating?.toFixed(1) || '0.0'}
                      </Typography>
                      <Rating 
                        value={statistics.averageRating || 0} 
                        readOnly 
                        precision={0.1}
                        sx={{ color: 'white' }}
                      />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        Điểm đánh giá trung bình
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box textAlign={{ xs: 'left', md: 'right' }}>
                    <Typography variant="h4" color="white" fontWeight="600">
                      {statistics.totalFeedbacks || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      Tổng số đánh giá
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                fontWeight: 600
              }
            }}
          >
            <Tab 
              icon={<ListIcon />}
              iconPosition="start"
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography fontWeight="600">Danh sách đánh giá</Typography>
                  {pagination.total > 0 && (
                    <Chip 
                      label={pagination.total} 
                      size="small" 
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
              } 
            />
            <Tab 
              icon={<AssessmentIcon />}
              iconPosition="start"
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography fontWeight="600">Thống kê & Phân tích</Typography>
                  {statistics?.averageRating > 0 && (
                    <Chip 
                      label={`${statistics.averageRating.toFixed(1)}/5`} 
                      size="small" 
                      color="warning"
                      sx={{ fontWeight: 600 }}
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