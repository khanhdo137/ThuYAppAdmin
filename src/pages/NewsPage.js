import { Add as AddIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Danh sách tin tức ({news.length})
          </Typography>
          <Box display="flex" gap={1}>
            {/* View Mode Toggle */}
            {viewModeButtons.map((button) => (
              <Button
                key={button.mode}
                variant={viewMode === button.mode ? 'contained' : 'outlined'}
                size="small"
                onClick={() => toggleViewMode(button.mode)}
              >
                {button.label}
              </Button>
            ))}

            {/* Add News Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog(NEWS_DIALOG_MODES.CREATE)}
            >
              Thêm tin tức
            </Button>
          </Box>
        </Box>

        <SearchFilterBar
          searchValue={searchTerm}
          onSearchChange={handleSearch}
          placeholder={NEWS_SEARCH_PLACEHOLDER}
        />

        {/* Render based on view mode */}
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
      </Paper>

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