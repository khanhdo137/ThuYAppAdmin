import { useEffect, useState } from 'react';
import { newsService } from '../../services';
import { useToast } from '../ToastProvider';
import {
    NEWS_ERROR_MESSAGES,
    NEWS_LOADING_TIMEOUT,
    NEWS_SEARCH_DEBOUNCE_DELAY
} from './newsConstants';
import { createSuccessMessage, findNewsById } from './newsUtils';

/**
 * Custom hook for news management
 * Handles all data fetching, CRUD operations, and search
 */
export const useNews = () => {
  // State
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoading, setShowLoading] = useState(true);
  
  const toast = useToast();

  /**
   * Fetch all news
   */
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await newsService.getAllNews();
      setNews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(`${NEWS_ERROR_MESSAGES.FETCH_FAILED}: ${error.message}`);
      toast.showError(NEWS_ERROR_MESSAGES.FETCH_FAILED);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search news with debouncing
   */
  const handleSearch = async (searchValue) => {
    setSearchTerm(searchValue);
    
    // Clear previous timeout
    if (window.newsSearchTimeout) {
      clearTimeout(window.newsSearchTimeout);
    }
    
    // Set new timeout for debouncing
    window.newsSearchTimeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (searchValue.trim()) {
          const data = await newsService.searchNews(searchValue.trim());
          setNews(Array.isArray(data) ? data : []);
        } else {
          await fetchNews();
        }
      } catch (error) {
        console.error('Error searching news:', error);
        setError(`Lỗi tìm kiếm: ${error.message}`);
        toast.showError(NEWS_ERROR_MESSAGES.SEARCH_FAILED);
      } finally {
        setLoading(false);
      }
    }, NEWS_SEARCH_DEBOUNCE_DELAY);
  };

  /**
   * Create new news
   */
  const createNews = async (newsData) => {
    try {
      setLoading(true);
      await newsService.createNews(newsData);
      await fetchNews();
      
      const successMsg = createSuccessMessage('create', newsData.title);
      toast.showSuccess(successMsg);
      return { success: true };
      
    } catch (error) {
      console.error('Error creating news:', error);
      toast.showError(NEWS_ERROR_MESSAGES.CREATE_FAILED);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update existing news
   */
  const updateNews = async (newsId, newsData) => {
    try {
      setLoading(true);
      await newsService.updateNews(newsId, newsData);
      await fetchNews();
      
      const successMsg = createSuccessMessage('update', newsData.title);
      toast.showSuccess(successMsg);
      return { success: true };
      
    } catch (error) {
      console.error('Error updating news:', error);
      toast.showError(NEWS_ERROR_MESSAGES.UPDATE_FAILED);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete news
   */
  const deleteNews = async (newsId) => {
    try {
      // Find news title for success message
      const newsItem = findNewsById(news, newsId);
      const newsTitle = newsItem ? newsItem.title : 'tin tức';
      
      await newsService.deleteNews(newsId);
      
      // Remove from local state immediately
      setNews(prev => prev.filter(n => n.newsId !== newsId && n.NewsId !== newsId));
      
      const successMsg = createSuccessMessage('delete', newsTitle);
      toast.showSuccess(successMsg);
      return { success: true };
      
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.showError(NEWS_ERROR_MESSAGES.DELETE_FAILED);
      return { success: false, error };
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchNews();
  }, []);

  // Loading timeout effect
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), NEWS_LOADING_TIMEOUT);
    if (news.length > 0) setShowLoading(false);
    return () => clearTimeout(timer);
  }, [news.length]);

  return {
    // State
    news,
    loading,
    error,
    searchTerm,
    showLoading,
    
    // Actions
    fetchNews,
    handleSearch,
    createNews,
    updateNews,
    deleteNews,
    
    // Setters for external control
    setError,
    setSearchTerm
  };
}; 