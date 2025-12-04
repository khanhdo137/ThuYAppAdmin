/**
 * API Configuration
 * Tập trung quản lý IP và URL của API backend
 * 
 * CÁCH THAY ĐỔI IP:
 * 1. Thay đổi giá trị mặc định bên dưới: '192.168.1.49' -> IP mới
 * 2. Hoặc tạo file .env và thêm:
 *    REACT_APP_API_IP=192.168.1.49
 *    REACT_APP_API_PORT=5074
 *    REACT_APP_API_BASE_URL=http://192.168.1.49:5074/api
 */

// IP của server backend (THAY ĐỔI IP Ở ĐÂY)
const API_IP = process.env.REACT_APP_API_IP || '192.168.1.12';
const API_PORT = process.env.REACT_APP_API_PORT || '5074';

// Base URL của API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || `http://${API_IP}:${API_PORT}/api`;
const API_BASE_URL_HTTP = `http://${API_IP}:${API_PORT}/api`;

// Export để các service khác sử dụng
export {
  API_IP,
  API_PORT,
  API_BASE_URL,
  API_BASE_URL_HTTP
};

// Helper function để get API URL (tương thích với các service cũ)
export const getApiUrl = () => {
  return API_BASE_URL;
};

export default {
  API_IP,
  API_PORT,
  API_BASE_URL,
  API_BASE_URL_HTTP,
  getApiUrl
};

