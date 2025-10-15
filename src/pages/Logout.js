import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const Logout = () => {
  useEffect(() => {
    // Gọi logout - nhanh vì không đợi API response
    const performLogout = async () => {
      try {
        await authService.logout(); // Chỉ mất vài ms vì đã tối ưu
        console.log('Logout completed');
      } catch (error) {
        console.error('Logout error:', error);
        // Vẫn redirect ngay cả khi có lỗi
      }
    };
    
    performLogout();
  }, []);

  // Redirect ngay lập tức vì logout đã nhanh
  return <Navigate to="/login" replace />;
};

export default Logout; 