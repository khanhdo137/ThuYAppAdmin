// Feedback rating options
export const FEEDBACK_RATINGS = [
  { value: 1, label: '1 sao - Rất không hài lòng', color: 'error' },
  { value: 2, label: '2 sao - Không hài lòng', color: 'warning' },
  { value: 3, label: '3 sao - Bình thường', color: 'default' },
  { value: 4, label: '4 sao - Hài lòng', color: 'info' },
  { value: 5, label: '5 sao - Rất hài lòng', color: 'success' }
];

// Filter options
export const FEEDBACK_FILTERS = [
  { value: '', label: 'Tất cả đánh giá' },
  { value: 5, label: '5 sao' },
  { value: 4, label: '4 sao' },
  { value: 3, label: '3 sao' },
  { value: 2, label: '2 sao' },
  { value: 1, label: '1 sao' }
];

// Format feedback date
export const formatFeedbackDate = (dateString) => {
  if (!dateString) return 'Chưa có';
  
  try {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      full: date.toLocaleString('vi-VN')
    };
  } catch (error) {
    return 'Ngày không hợp lệ';
  }
};

// Get feedback status color based on rating
export const getFeedbackStatusColor = (rating) => {
  switch (rating) {
    case 1: return 'error';
    case 2: return 'warning';
    case 3: return 'default';
    case 4: return 'info';
    case 5: return 'success';
    default: return 'default';
  }
};

// Get rating text
export const getRatingText = (rating) => {
  switch (rating) {
    case 1: return 'Rất không hài lòng';
    case 2: return 'Không hài lòng';
    case 3: return 'Bình thường';
    case 4: return 'Hài lòng';
    case 5: return 'Rất hài lòng';
    default: return 'Chưa đánh giá';
  }
};

// Format rating as stars
export const formatRatingStars = (rating) => {
  if (!rating || rating < 1 || rating > 5) return '☆☆☆☆☆';
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

// Calculate average rating
export const calculateAverageRating = (feedbacks) => {
  if (!feedbacks || feedbacks.length === 0) return 0;
  
  const total = feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
  return Math.round((total / feedbacks.length) * 10) / 10;
};

// Group feedbacks by rating
export const groupFeedbacksByRating = (feedbacks) => {
  const groups = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  feedbacks.forEach(feedback => {
    const rating = feedback.rating || 0;
    if (rating >= 1 && rating <= 5) {
      groups[rating]++;
    }
  });
  
  return groups;
};

// Validate feedback form
export const validateFeedbackForm = (formData) => {
  const errors = {};
  
  if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
    errors.rating = 'Vui lòng chọn đánh giá từ 1 đến 5 sao';
  }
  
  if (formData.comment && formData.comment.length > 1000) {
    errors.comment = 'Nhận xét không được vượt quá 1000 ký tự';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 