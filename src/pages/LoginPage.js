import {
    Login as LoginIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    IconButton, InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import authService from '../services/authService';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Toast hook
  const toast = useToast();

  // Kiểm tra nếu đã đăng nhập thì redirect
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Kiểm tra input
      if (!formData.username.trim() || !formData.password.trim()) {
        toast.showError('Vui lòng nhập đầy đủ thông tin đăng nhập');
        return;
      }

      // Gọi API login
      const userData = await authService.login(formData.username.trim(), formData.password);
      
      console.log('Login successful:', userData);
      
      // Show success toast
      toast.showSuccess(`Đăng nhập thành công! Chào mừng ${userData.customerName || userData.username}!`);
      
      // Small delay để hiển thị toast trước khi chuyển trang
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 1000);
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      
      if (err.message.includes('không đúng')) {
        errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
      } else if (err.message.includes('không có quyền')) {
        errorMessage = 'Bạn không có quyền truy cập trang quản trị. Chỉ dành cho Admin.';
      } else if (err.message.includes('kết nối')) {
        errorMessage = 'Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else if (err.message.includes('HTTP 500')) {
        errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.showError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
              p: 4,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Box sx={{ 
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img 
                src="/logo-home.png" 
                alt="Thú Y Bình Dương Logo" 
                style={{
                  maxWidth: '120px',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 700,
              fontSize: '2.2rem',
              mb: 1
            }}>
              Thú Y Bình Dương
            </Typography>
            <Typography variant="h6" sx={{ 
              opacity: 0.9,
              fontWeight: 300
            }}>
              Hệ thống quản trị phòng khám thú y
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                margin="normal"
                autoComplete="username"
                autoFocus
                disabled={loading}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                autoComplete="current-password"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                        size="small"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                  },
                  '&:disabled': {
                    background: '#cccccc',
                    color: '#888888'
                  },
                }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Box>

            <Divider sx={{ my: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Đăng nhập để truy cập hệ thống quản trị
              </Typography>
            </Divider>

            {/* Additional Info */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Chỉ dành cho quản trị viên hệ thống
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Role yêu cầu: Administrator (Role = 1)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage; 