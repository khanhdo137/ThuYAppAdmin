import apiService from './apiService';

class FeedbackService {
  // Get all feedbacks (admin)
  async getAllFeedbacks(page = 1, limit = 10, rating = null, searchTerm = '') {
    try {
      console.log('Getting all feedbacks...');
      let url = `/feedback/admin?page=${page}&limit=${limit}`;
      
      if (rating && rating >= 1 && rating <= 5) {
        url += `&rating=${rating}`;
      }
      
      if (searchTerm && searchTerm.trim()) {
        url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
      }
      
      const result = await apiService.get(url);
      console.log('getAllFeedbacks response:', result);
      
      return {
        feedbacks: Array.isArray(result.feedbacks) ? result.feedbacks : [],
        pagination: result.pagination || {
          page: 1,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Error in getAllFeedbacks:', error);
      return {
        feedbacks: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  // Search feedbacks (admin)
  async searchFeedbacks(searchTerm, page = 1, limit = 10) {
    try {
      console.log('Searching feedbacks with term:', searchTerm);
      return await this.getAllFeedbacks(page, limit, null, searchTerm);
    } catch (error) {
      console.error('Error in searchFeedbacks:', error);
      return {
        feedbacks: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  // Get feedback statistics (admin)
  async getFeedbackStatistics() {
    try {
      console.log('Getting feedback statistics...');
      const result = await apiService.get('/feedback/admin/statistics');
      console.log('getFeedbackStatistics response:', result);
      
      return {
        totalFeedbacks: result.totalFeedbacks || 0,
        averageRating: result.averageRating || 0,
        ratingDistribution: result.ratingDistribution || [],
        recentFeedbacks: result.recentFeedbacks || []
      };
    } catch (error) {
      console.error('Error in getFeedbackStatistics:', error);
      return {
        totalFeedbacks: 0,
        averageRating: 0,
        ratingDistribution: [],
        recentFeedbacks: []
      };
    }
  }

  // Delete feedback (admin)
  async deleteFeedback(feedbackId) {
    try {
      console.log('Deleting feedback:', feedbackId);
      await apiService.delete(`/feedback/admin/${feedbackId}`);
      console.log('Feedback deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }

  // Filter feedbacks by rating
  async getFeedbacksByRating(rating, page = 1, limit = 10) {
    try {
      console.log('Getting feedbacks by rating:', rating);
      return await this.getAllFeedbacks(page, limit, rating);
    } catch (error) {
      console.error('Error in getFeedbacksByRating:', error);
      return {
        feedbacks: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  // Format rating as stars
  formatRatingStars(rating) {
    if (!rating || rating < 1 || rating > 5) return '☆☆☆☆☆';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  // Get rating text
  getRatingText(rating) {
    switch (rating) {
      case 1: return 'Rất không hài lòng';
      case 2: return 'Không hài lòng';
      case 3: return 'Bình thường';
      case 4: return 'Hài lòng';
      case 5: return 'Rất hài lòng';
      default: return 'Chưa đánh giá';
    }
  }

  // Get rating color
  getRatingColor(rating) {
    switch (rating) {
      case 1: return 'error';
      case 2: return 'warning';
      case 3: return 'default';
      case 4: return 'info';
      case 5: return 'success';
      default: return 'default';
    }
  }

  // Normalize feedback data
  normalizeFeedbackData(feedback) {
    return {
      feedbackId: feedback.feedbackId || feedback.FeedbackId,
      appointmentId: feedback.appointmentId || feedback.AppointmentId,
      rating: feedback.rating || feedback.Rating || 0,
      comment: feedback.comment || feedback.Comment || '',
      createdAt: feedback.createdAt || feedback.CreatedAt,
      customerName: feedback.customerName || feedback.CustomerName || '',
      petName: feedback.petName || feedback.PetName || '',
      serviceName: feedback.serviceName || feedback.ServiceName || '',
      appointmentDate: feedback.appointmentDate || feedback.AppointmentDate,
      appointmentTime: feedback.appointmentTime || feedback.AppointmentTime,
      doctorName: feedback.doctorName || feedback.DoctorName || '',
      ratingText: feedback.ratingText || this.getRatingText(feedback.rating || feedback.Rating || 0),
      ratingStars: feedback.ratingStars || this.formatRatingStars(feedback.rating || feedback.Rating || 0)
    };
  }
}

const feedbackService = new FeedbackService();
export default feedbackService; 