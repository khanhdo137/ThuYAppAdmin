import apiService from './apiService';

class NewsService {
  // Get all news (for admin)
  async getAllNews() {
    try {
      // Try admin endpoint first
      let response = await apiService.getWithParams('News/admin', { limit: 100 });
      
      // Backend trả về { news: [...], pagination: {...} }
      if (response && response.news) {
        return response.news;
      }
      
      // Fallback: nếu admin endpoint không có data, thử endpoint thường
      response = await apiService.getWithParams('News', { limit: 100 });
      
      // Endpoint thường có thể trả về { data: [...] } hoặc trực tiếp array
      if (response && response.data) {
        return response.data;
      }
      
      // Fallback: nếu response trực tiếp là array
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching news:', error);
      
      // Last attempt: try without any query params
      try {
        const basicResponse = await apiService.get('News');
        
        if (Array.isArray(basicResponse)) {
          return basicResponse;
        }
        if (basicResponse && basicResponse.data && Array.isArray(basicResponse.data)) {
          return basicResponse.data;
        }
        if (basicResponse && basicResponse.news && Array.isArray(basicResponse.news)) {
          return basicResponse.news;
        }
      } catch (basicError) {
        console.error('Basic endpoint also failed:', basicError);
      }
      
      throw error;
    }
  }

  // Get news by ID (for admin)
  async getNewsById(id) {
    try {
      return await apiService.get(`News/admin/${id}`);
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  // Create new news (for admin)
  async createNews(newsData) {
    try {
      // Map frontend fields to backend fields (only fields that exist in backend)
      const mappedData = {
        title: newsData.title,
        content: newsData.content,
        imageUrl: newsData.imageUrl || null,
        tags: newsData.tags || null
      };

      return await apiService.post('News/admin', mappedData);
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  }

  // Update news (for admin)
  async updateNews(id, newsData) {
    try {
      // Map frontend fields to backend fields (only fields that exist in backend)
      const mappedData = {
        title: newsData.title,
        content: newsData.content,
        imageUrl: newsData.imageUrl || null,
        tags: newsData.tags || null
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5074/api'}/News/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(mappedData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  }

  // Delete news (for admin)
  async deleteNews(id) {
    try {
      const response = await apiService.delete('News/admin', id);
      return { success: true, message: response?.message || 'Xóa tin tức thành công' };
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }

  // Search news (for admin)
  async searchNews(searchTerm) {
    try {
      console.log(`Searching news with term: "${searchTerm}"`);
      
      const response = await apiService.getWithParams('News/admin/search', { 
        query: searchTerm,
        limit: 100 
      });
      
      console.log('Search response:', response);
      
      // Backend trả về { news: [...], pagination: {...} }
      if (response && response.news) {
        console.log(`Found ${response.news.length} news articles`);
        return response.news;
      }
      
      // Fallback: nếu response trực tiếp là array
      if (Array.isArray(response)) {
        console.log(`Found ${response.length} news articles (direct array)`);
        return response;
      }
      
      console.log('No news found in response');
      return [];
    } catch (error) {
      console.error('Error searching news:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      throw error;
    }
  }

  // Filter news by tags
  async getNewsByTag(tag) {
    return await apiService.search('News', { tag });
  }

  // Get news categories
  getNewsCategories() {
    return [
      { value: 'thong-bao', label: 'Thông báo' },
      { value: 'kien-thuc', label: 'Kiến thức thú y' },
      { value: 'cham-soc', label: 'Chăm sóc thú cưng' },
      { value: 'dich-vu', label: 'Dịch vụ mới' },
      { value: 'su-kien', label: 'Sự kiện' },
      { value: 'khac', label: 'Khác' }
    ];
  }

  // Format news data for display
  formatNewsData(news) {
    return {
      ...news,
      createdAt: news.createdAt ? 
        new Date(news.createdAt).toLocaleDateString('vi-VN') : 'Chưa có',
      preview: news.content ? 
        news.content.substring(0, 150) + (news.content.length > 150 ? '...' : '') : '',
      tagsArray: news.tags ? news.tags.split(',').map(tag => tag.trim()) : []
    };
  }

  // Extract tags from content
  extractTagsFromContent(content, title) {
    const commonWords = ['thú', 'cưng', 'chó', 'mèo', 'khám', 'bệnh', 'chăm sóc', 'tiêm', 'phòng'];
    const tags = [];
    
    const text = (title + ' ' + content).toLowerCase();
    commonWords.forEach(word => {
      if (text.includes(word) && !tags.includes(word)) {
        tags.push(word);
      }
    });
    
    return tags.slice(0, 5); // Limit to 5 tags
  }

  // Generate SEO-friendly slug
  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-');
  }

  // Validate news data
  validateNewsData(newsData) {
    const errors = {};
    
    if (!newsData.title || newsData.title.trim().length === 0) {
      errors.title = 'Tiêu đề là bắt buộc';
    } else if (newsData.title.length > 200) {
      errors.title = 'Tiêu đề không được vượt quá 200 ký tự';
    }
    
    if (!newsData.content || newsData.content.trim().length === 0) {
      errors.content = 'Nội dung là bắt buộc';
    } else if (newsData.content.length < 50) {
      errors.content = 'Nội dung phải có ít nhất 50 ký tự';
    }
    
    if (newsData.tags && newsData.tags.length > 500) {
      errors.tags = 'Tags không được vượt quá 500 ký tự';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }


}

const newsService = new NewsService();
export default newsService; 