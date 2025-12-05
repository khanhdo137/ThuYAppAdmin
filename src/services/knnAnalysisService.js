import apiService from './apiService';

class KNNAnalysisService {
  /**
   * Get list of customers for KNN analysis
   * @returns {Promise<Array>} List of customers with appointment history
   */
  async getCustomersForAnalysis() {
    try {
      const response = await apiService.get('KNNAnalysis/customers');
      return response || [];
    } catch (error) {
      console.error('Error fetching customers for KNN analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze a customer using KNN algorithm
   * @param {number} customerId - ID of customer to analyze
   * @param {number} k - Number of similar customers to find (default: 5)
   * @returns {Promise<Object>} Analysis result with similar customers and recommendations
   */
  async analyzeCustomer(customerId, k = 5) {
    try {
      const response = await apiService.get(`KNNAnalysis/analyze/${customerId}?k=${k}`);
      return response;
    } catch (error) {
      console.error('Error analyzing customer:', error);
      throw error;
    }
  }
}

const knnAnalysisService = new KNNAnalysisService();
export default knnAnalysisService;
