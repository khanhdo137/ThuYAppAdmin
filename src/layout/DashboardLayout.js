import {
    Article,
    Chat,
    Dashboard,
    KeyboardArrowDown,
    LocalHospital,
    Logout,
    MedicalServices,
    Menu as MenuIcon,
    People,
    Pets,
    Schedule,
    Star,
    Notifications,
    Settings,
    ScheduleSend,
    History,
    Psychology
} from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Chip,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
    Badge,
    Tooltip
} from '@mui/material';
import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useNotifications } from '../context/NotificationContext';

const drawerWidth = 280;

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get notifications from context
  const { notifications, refreshNotifications } = useNotifications();
  
  // Debug function
  const debugNotifications = () => {
    console.log('Current notifications:', notifications);
    refreshNotifications();
  };

  // Menu items with dynamic badges
  const menuItems = useMemo(() => [
    { text: 'Thống kê', icon: <Dashboard />, path: '/admin/dashboard', badge: 0 },
    { text: 'Lịch Hẹn', icon: <Schedule />, path: '/admin/appointments', badge: notifications.appointments },
    { text: 'Chat trực tiếp', icon: <Chat />, path: '/admin/chat', badge: 0 },
    { text: 'Khách hàng', icon: <People />, path: '/admin/customers', badge: 0 },
    { text: 'Bác sĩ', icon: <MedicalServices />, path: '/admin/doctors', badge: 0 },
    { text: 'Thú cưng', icon: <Pets />, path: '/admin/pets', badge: 0 },
    { text: 'Bệnh án', icon: <History />, path: '/admin/medical-histories', badge: 0 },
    { text: 'Dịch vụ', icon: <LocalHospital />, path: '/admin/services', badge: 0 },
    { text: 'Tin tức', icon: <Article />, path: '/admin/news', badge: 0 },
    { text: 'Đánh giá', icon: <Star />, path: '/admin/feedbacks', badge: notifications.feedbacks },
    { text: 'Nhắc hẹn', icon: <ScheduleSend />, path: '/admin/reminders', badge: 0 },
    { text: 'Phân tích KNN', icon: <Psychology />, path: '/admin/knn-analysis', badge: 0 },
  ], [notifications]);

  // Load user info on component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const user = authService.getUserInfo();
        setUserInfo(user);
        
        // Optionally refresh user info from API
        if (user && authService.isAuthenticated()) {
          try {
            const freshUserData = await authService.getProfile();
            setUserInfo(freshUserData);
          } catch (error) {
            console.warn('Could not refresh user profile:', error);
            // Continue with local user info
          }
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };

    loadUserInfo();
  }, []);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  // Get user display name and avatar
  const getUserDisplayName = () => {
    if (!userInfo) return 'Quản trị viên';
    return userInfo.username || 'Admin';
  };

  const getUserAvatar = () => {
    if (!userInfo) return 'A';
    return userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'A';
  };

  const getUserRoleName = () => {
    if (!userInfo) return 'Administrator';
    // Ưu tiên roleName từ backend, fallback về mapping từ authService
    return userInfo.roleName || authService.getRoleName(userInfo.role) || 'Administrator';
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          zIndex: 0
        }} />
        
        <Box sx={{ 
          mb: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <img 
            src="/logo-home.png" 
            alt="Thú Y Bình Dương Logo" 
            style={{
              maxWidth: '80px',
              height: 'auto',
              borderRadius: '12px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          />
        </Box>
        <Typography variant="h6" sx={{ 
          fontWeight: 700,
          mb: 0.5,
          fontSize: '1.2rem',
          lineHeight: 1.2,
          position: 'relative',
          zIndex: 1
        }}>
          Thú Y Bình Dương
        </Typography>
        <Typography variant="body2" sx={{ 
          opacity: 0.9,
          fontSize: '0.875rem',
          fontWeight: 300,
          position: 'relative',
          zIndex: 1
        }}>
          Hệ thống quản trị
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={item.text} placement="right" arrow>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      px: 2,
                      mx: 0.5,
                      backgroundColor: isActive ? 'primary.main' : 'transparent',
                      color: isActive ? 'primary.contrastText' : 'text.primary',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        backgroundColor: isActive 
                          ? 'primary.dark' 
                          : theme.palette.action.hover,
                        transform: 'translateX(6px)',
                        boxShadow: isActive 
                          ? '0 4px 12px rgba(25, 118, 210, 0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: isActive ? '4px' : '0px',
                        backgroundColor: 'primary.main',
                        transition: 'width 0.3s ease',
                        borderRadius: '0 2px 2px 0'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? 'primary.contrastText' : 'text.secondary',
                        minWidth: 40,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {item.badge > 0 ? (
                        <Badge badgeContent={item.badge} color="error" max={99}>
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.95rem',
                        transition: 'font-weight 0.3s ease',
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: drawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            height: '100vh',
            position: 'relative',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* App Bar */}
        <AppBar
          position="static"
          sx={{
            backgroundColor: 'white',
            color: 'text.primary',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 2,
                  color: 'text.primary',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" noWrap component="div" sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '1.25rem'
                }}>
                  {menuItems.find(item => item.path === location.pathname)?.text || 'Thống kê'}
                </Typography>
                <Chip
                  label="Admin"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: 24
                  }}
                />
              </Box>
            </Box>

            {/* Right side - Notifications and User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Notifications */}
              <Tooltip title="Thông báo">
                <IconButton
                  onClick={handleNotificationMenuOpen}
                  sx={{
                    color: 'text.secondary',
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      color: 'primary.main',
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <Badge badgeContent={notifications.total} color="error" max={99}>
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Debug Button */}
              <Tooltip title="Debug Notifications">
                <IconButton
                  onClick={debugNotifications}
                  sx={{
                    color: 'text.secondary',
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      color: 'primary.main',
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
                    DEBUG
                  </Typography>
                </IconButton>
              </Tooltip>

              {/* Settings */}
              <Tooltip title="Cài đặt">
                <IconButton
                  sx={{
                    color: 'text.secondary',
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      color: 'primary.main',
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <Settings />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

              {/* User Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={getUserRoleName()}
                  size="small"
                  color="primary"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: 24
                  }}
                />
                <Button
                  onClick={handleUserMenuOpen}
                  startIcon={
                    <Avatar sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'primary.main',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                    }}>
                      {getUserAvatar()}
                    </Avatar>
                  }
                  endIcon={<KeyboardArrowDown />}
                  sx={{
                    textTransform: 'none',
                    color: 'text.primary',
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  {getUserDisplayName()}
                </Button>
              </Box>
              
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '1px solid',
                    borderColor: 'divider',
                    minWidth: 200
                  }
                }}
              >
                <MenuItem onClick={handleUserMenuClose} sx={{ py: 1.5 }}>
                  <Avatar sx={{ mr: 2, width: 24, height: 24 }}>
                    {getUserAvatar()}
                  </Avatar>
                  Thông tin cá nhân
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5 }}>
                  <Logout sx={{ mr: 2 }} />
                  Đăng xuất
                </MenuItem>
              </Menu>

              {/* Notification Menu */}
              <Menu
                anchorEl={notificationMenuAnchor}
                open={Boolean(notificationMenuAnchor)}
                onClose={handleNotificationMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '1px solid',
                    borderColor: 'divider',
                    minWidth: 300,
                    maxHeight: 400
                  }
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Thông báo
                  </Typography>
                </Box>
                <MenuItem 
                  onClick={() => {
                    handleNotificationMenuClose();
                    navigate('/admin/appointments');
                  }}
                  disabled={notifications.appointments === 0}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ mr: 2 }}>
                      <Badge badgeContent={notifications.appointments} color="error">
                        <Schedule color="primary" />
                      </Badge>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Lịch hẹn mới
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notifications.appointments > 0 
                          ? `Có ${notifications.appointments} lịch hẹn chưa xác nhận hôm nay`
                          : 'Không có lịch hẹn mới'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem 
                  onClick={() => {
                    handleNotificationMenuClose();
                    navigate('/admin/feedbacks');
                  }}
                  disabled={notifications.feedbacks === 0}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ mr: 2 }}>
                      <Badge badgeContent={notifications.feedbacks} color="error">
                        <Star color="warning" />
                      </Badge>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Đánh giá mới
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notifications.feedbacks > 0 
                          ? `Có ${notifications.feedbacks} đánh giá mới hôm nay`
                          : 'Không có đánh giá mới'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: 'grey.50',
            p: 3,
            overflow: 'auto',
            backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: 'calc(100vh - 64px)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(25, 118, 210, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(66, 165, 245, 0.05) 0%, transparent 50%)',
              pointerEvents: 'none',
              zIndex: 0
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 