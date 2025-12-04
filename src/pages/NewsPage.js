import { 
  Add as AddIcon,
  Article as ArticleIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Fade,
  Slide
} from '@mui/material';
import React, { useState } from 'react';
import { DataTable, DeleteConfirmDialog, PageTemplate, SearchFilterBar } from '../components';
import {
  NEWS_DIALOG_MODES,
  NEWS_SEARCH_PLACEHOLDER,
  NEWS_VIEW_MODES,
  NEWS_VIEW_MODE_LABELS,
  NewsCard,
  NewsDialog,
  getNewsTableColumns,
  useNews,
  useNewsForm
} from '../components/News';

const NewsPage = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use custom hooks for state management
  const {
    news,
    loading,
    error,
    searchTerm,
    showLoading,
    handleSearch,
    createNews,
    updateNews,
    deleteNews,
    fetchNews,
    setError
  } = useNews();

  const {
    dialogOpen,
    dialogMode,
    selectedNews,
    formData,
    formErrors,
    viewMode,
    openDialog,
    closeDialog,
    handleFormChange,
    validateForm,
    getSubmissionData,
    toggleViewMode
  } = useNewsForm();

  // Handle form submission
  const handleCreateNews = async () => {
    if (!validateForm()) return;
    
    const result = await createNews(getSubmissionData());
    if (result.success) {
      closeDialog();
    }
  };

  const handleUpdateNews = async () => {
    if (!validateForm()) return;
    
    const newsId = selectedNews.newsId || selectedNews.NewsId;
    const result = await updateNews(newsId, getSubmissionData());
    if (result.success) {
      closeDialog();
    }
  };

  const handleDeleteClick = (newsItem) => {
    setNewsToDelete(newsItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!newsToDelete) return;
    
    try {
      const newsId = newsToDelete.newsId || newsToDelete.NewsId;
      if (!newsId) {
        setError('Không thể xác định ID tin tức để xóa');
        return;
      }

      const result = await deleteNews(newsId);
      
      if (result.success) {
        // Close the dialog first
        setDeleteDialogOpen(false);
        setNewsToDelete(null);
        
        // Show success message if available
        if (result.message) {
          setError(null); // Clear any existing error
        }
        
        // Refresh the news list
        await fetchNews();
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      setError(error.message || 'Đã xảy ra lỗi khi xóa tin tức');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNews();
    } catch (error) {
      console.error('Error refreshing news:', error);
    }
    setRefreshing(false);
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const newsArray = Array.isArray(news) ? news : [];
    const categoryCount = {};
    let totalViews = 0;
    let recentNews = 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    newsArray.forEach(newsItem => {
      // Count by tags/category
      const tags = newsItem.tags || newsItem.Tags || '';
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      tagArray.forEach(tag => {
        categoryCount[tag] = (categoryCount[tag] || 0) + 1;
      });

      // Sum views
      const views = parseInt(newsItem.views || newsItem.Views || 0);
      totalViews += views;

      // Count recent news
      const createdAt = new Date(newsItem.createdAt || newsItem.CreatedAt);
      if (createdAt >= oneWeekAgo) {
        recentNews++;
      }
    });

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      total: newsArray.length,
      byCategory: categoryCount,
      topCategories,
      averageViews: newsArray.length > 0 ? Math.round(totalViews / newsArray.length) : 0,
      recentNews
    };
  }, [news]);

  // Render statistics cards - Always show full layout
  const renderStatisticsCards = () => {
    const cards = [
      {
        title: 'Tổng số tin tức',
        value: stats.total,
        icon: ArticleIcon,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        title: 'Lượt xem TB',
        value: stats.averageViews,
        icon: VisibilityIcon,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        title: 'Tin mới (7 ngày)',
        value: stats.recentNews,
        icon: ScheduleIcon,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        title: 'Chủ đề',
        value: Object.keys(stats.byCategory).length,
        icon: CategoryIcon,
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      }
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Show all 4 cards */}
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%',
              minHeight: '120px',
              background: card.gradient,
              color: 'white',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                  <card.icon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        {/* Always show trending card if data available */}
        {stats.topCategories.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#667eea' }} />
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Chủ đề tin tức phổ biến nhất
                    </Typography>
                    <Box display="flex" gap={3} flexWrap="wrap">
                      {stats.topCategories.map(([category, count], index) => (
                        <Box key={category} display="flex" alignItems="center" gap={1}>
                          <ArticleIcon sx={{ color: '#667eea', fontSize: 20 }} />
                          <Typography variant="body1" fontWeight="bold" color="primary">
                            {category}: {count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  // Get table columns with handlers
  const columns = getNewsTableColumns({
    onView: (row) => openDialog(NEWS_DIALOG_MODES.VIEW, row),
    onEdit: (row) => openDialog(NEWS_DIALOG_MODES.EDIT, row),
    onDelete: handleDeleteClick
  });

  // View mode buttons configuration
  const viewModeButtons = [
    { mode: NEWS_VIEW_MODES.TABLE, label: NEWS_VIEW_MODE_LABELS[NEWS_VIEW_MODES.TABLE] },
    { mode: NEWS_VIEW_MODES.CARDS, label: NEWS_VIEW_MODE_LABELS[NEWS_VIEW_MODES.CARDS] }
  ];

  if (loading && news.length === 0 && showLoading) {
    return (
      <PageTemplate title="Quản lý tin tức" subtitle="Quản lý bài viết và tin tức cho khách hàng">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Quản lý tin tức" subtitle="Quản lý bài viết và tin tức cho khách hàng">
      <Fade in={true} timeout={600}>
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Statistics Cards - Dynamic based on layout mode */}
          {renderStatisticsCards()}

          {/* Main Content */}
          <Paper sx={{ 
            p: 3,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,1))',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            {/* Header with Actions */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <ArticleIcon sx={{ fontSize: 32, color: '#667eea' }} />
                <Typography variant="h5" fontWeight="bold">
                  Danh sách tin tức ({stats.total})
                </Typography>
              </Box>
              
              <Box display="flex" gap={1}>
                <Tooltip title="Làm mới dữ liệu">
                  <IconButton 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        transform: 'rotate(180deg)',
                        transition: 'transform 0.6s ease'
                      }
                    }}
                  >
                    <RefreshIcon sx={{ 
                      animation: refreshing ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }} />
                  </IconButton>
                </Tooltip>
                
                {/* View Mode Toggle */}
                {viewModeButtons.map((button) => (
                  <Button
                    key={button.mode}
                    variant={viewMode === button.mode ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => toggleViewMode(button.mode)}
                    sx={{
                      ...(viewMode === button.mode && {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 'bold'
                      })
                    }}
                  >
                    {button.label}
                  </Button>
                ))}

                {/* Add News Button */}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openDialog(NEWS_DIALOG_MODES.CREATE)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    px: 3,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Thêm tin tức
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={handleSearch}
                placeholder={NEWS_SEARCH_PLACEHOLDER}
              />
            </Box>

            {/* Render based on view mode */}
            <Slide direction="up" in={true} timeout={800}>
              <Box>
                {viewMode === NEWS_VIEW_MODES.TABLE ? (
                  <DataTable
                    columns={columns}
                    data={news}
                    loading={loading}
                    emptyMessage="Không có tin tức nào"
                  />
                ) : (
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    {news.map((newsItem) => (
                      <Grid item xs={12} sm={6} md={4} key={newsItem.newsId}>
                        <NewsCard
                          newsItem={newsItem}
                          onView={(item) => openDialog(NEWS_DIALOG_MODES.VIEW, item)}
                          onEdit={(item) => openDialog(NEWS_DIALOG_MODES.EDIT, item)}
                          onDelete={handleDeleteClick}
                        />
                      </Grid>
                    ))}
                    {news.length === 0 && !loading && (
                      <Grid item xs={12}>
                        <Box textAlign="center" py={4}>
                          <Typography color="text.secondary">
                            Không có tin tức nào
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Box>
            </Slide>
          </Paper>
        </Box>
      </Fade>

      <NewsDialog
        open={dialogOpen} 
        onClose={closeDialog}
        dialogMode={dialogMode}
        formData={formData}
        formErrors={formErrors}
        onFormChange={handleFormChange}
        onCreate={handleCreateNews}
        onUpdate={handleUpdateNews}
        loading={loading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setNewsToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={loading}
        title="Xác nhận xóa"
      />
    </PageTemplate>
  );
};

export default NewsPage; 