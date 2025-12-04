import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const PrivateRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra authentication local trước với quyền admin
        const localAuth = authService.isAdminAuthenticated();
        
        if (!localAuth) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Nếu có token, validate với server
        const isValidToken = await authService.validateToken();
        
        if (!isValidToken) {
          console.warn('Token validation failed, redirecting to login');
          authService.clearAuthData();
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
          console.log('Authentication successful for admin user');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.clearAuthData();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);
  
  // Hiển thị loading trong khi kiểm tra auth
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: 'white',
            mb: 2
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white',
            fontWeight: 300
          }}
        >
          Đang kiểm tra quyền truy cập...
        </Typography>
      </Box>
    );
  }

  // Nếu không có quyền, redirect về login
  if (!isAuthenticated) {
    const userInfo = authService.getUserInfo();
    
    // Log lý do redirect
    if (userInfo) {
      console.warn('Access denied - User role insufficient:', {
        username: userInfo.username,
        role: userInfo.role,
        roleName: authService.getRoleName(userInfo.role)
      });
    } else {
      console.warn('Access denied - No valid authentication');
    }
    
    return <Navigate to="/login" replace />;
  }
  
  // Nếu có quyền admin, render component được bảo vệ
  return children;
};

export default PrivateRoute; 