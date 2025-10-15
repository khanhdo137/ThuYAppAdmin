import {
    Assessment as AssessmentIcon,
    Reviews as ReviewsIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    Rating,
    Typography
} from '@mui/material';
import React from 'react';

const FeedbackStatistics = ({ statistics }) => {
  if (!statistics) return null;

  const {
    totalFeedbacks = 0,
    averageRating = 0,
    ratingDistribution = [],
    recentFeedbacks = []
  } = statistics;

  // Calculate percentage for each rating
  const ratingPercentages = ratingDistribution.reduce((acc, item) => {
    acc[item.Rating || item.rating] = totalFeedbacks > 0 
      ? Math.round((item.Count || item.count || 0) / totalFeedbacks * 100)
      : 0;
    return acc;
  }, {});

  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" color={`${color}.main`} fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: `${color}.50`,
              color: `${color}.main`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Overview Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng đánh giá"
            value={totalFeedbacks}
            subtitle="Tất cả đánh giá"
            icon={<ReviewsIcon />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đánh giá trung bình"
            value={`${averageRating}/5`}
            subtitle={
              <Rating value={averageRating} readOnly size="small" precision={0.1} />
            }
            icon={<StarIcon />}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đánh giá tích cực"
            value={`${(ratingPercentages[4] || 0) + (ratingPercentages[5] || 0)}%`}
            subtitle="4-5 sao"
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đánh giá tiêu cực"
            value={`${(ratingPercentages[1] || 0) + (ratingPercentages[2] || 0)}%`}
            subtitle="1-2 sao"
            icon={<AssessmentIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Rating Distribution */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân bố đánh giá
              </Typography>
              <Box>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = ratingDistribution.find(
                    item => (item.Rating || item.rating) === rating
                  )?.Count || ratingDistribution.find(
                    item => (item.Rating || item.rating) === rating
                  )?.count || 0;
                  
                  const percentage = ratingPercentages[rating] || 0;
                  
                  return (
                    <Box key={rating} display="flex" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" minWidth={60}>
                        <Typography variant="body2" mr={1}>
                          {rating}
                        </Typography>
                        <StarIcon fontSize="small" color="warning" />
                      </Box>
                      
                      <Box flex={1} mx={2}>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: rating >= 4 ? 'success.main' : 
                                     rating >= 3 ? 'info.main' :
                                     rating >= 2 ? 'warning.main' : 'error.main'
                            }
                          }} 
                        />
                      </Box>
                      
                      <Typography variant="body2" minWidth={60} textAlign="right">
                        {count} ({percentage}%)
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Feedbacks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Đánh giá gần đây
              </Typography>
              <Box>
                {recentFeedbacks.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    Chưa có đánh giá nào
                  </Typography>
                ) : (
                  recentFeedbacks.map((feedback, index) => (
                    <Box 
                      key={feedback.feedbackId || index} 
                      py={1.5} 
                      borderBottom={index < recentFeedbacks.length - 1 ? '1px solid' : 'none'}
                      borderColor="grey.200"
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {feedback.customerName || 'Khách hàng'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {feedback.serviceName || 'Dịch vụ'} • {feedback.petName || 'Thú cưng'}
                          </Typography>
                          {feedback.comment && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 200
                              }}
                            >
                              "{feedback.comment}"
                            </Typography>
                          )}
                        </Box>
                        <Box textAlign="right">
                          <Rating 
                            value={feedback.rating || 0} 
                            readOnly 
                            size="small" 
                          />
                          <Typography variant="caption" color="text.secondary" display="block">
                            {feedback.createdAt ? 
                              new Date(feedback.createdAt).toLocaleDateString('vi-VN') : 
                              'Chưa có'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeedbackStatistics; 