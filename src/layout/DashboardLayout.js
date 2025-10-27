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
    Star
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
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const drawerWidth = 280;

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Thống kê', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Lịch khám', icon: <Schedule />, path: '/admin/appointments' },
    { text: 'Chat trực tiếp', icon: <Chat />, path: '/admin/chat' },
    { text: 'Khách hàng', icon: <People />, path: '/admin/customers' },
    { text: 'Bác sĩ', icon: <MedicalServices />, path: '/admin/doctors' },
    { text: 'Thú cưng', icon: <Pets />, path: '/admin/pets' },
    { text: 'Dịch vụ', icon: <LocalHospital />, path: '/admin/services' },
    { text: 'Tin tức', icon: <Article />, path: '/admin/news' },
    { text: 'Đánh giá', icon: <Star />, path: '/admin/feedbacks' },
  ];

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
        alignItems: 'center'
      }}>
        <Box sx={{ 
          mb: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src="/logo-home.png" 
            alt="Thú Y Bình Dương Logo" 
            style={{
              maxWidth: '80px',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
          />
        </Box>
        <Typography variant="h6" sx={{ 
          fontWeight: 700,
          mb: 0.5,
          fontSize: '1.2rem',
          lineHeight: 1.2
        }}>
          Thú Y Bình Dương
        </Typography>
        <Typography variant="body2" sx={{ 
          opacity: 0.9,
          fontSize: '0.875rem',
          fontWeight: 300
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
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    mx: 0.5,
                    backgroundColor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: isActive 
                        ? 'primary.dark' 
                        : theme.palette.action.hover,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.95rem',
                    }}
                  />
                </ListItemButton>
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 2,
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
              
              <Typography variant="h6" noWrap component="div" sx={{ 
                fontWeight: 500,
                color: 'text.primary'
              }}>
                {menuItems.find(item => item.path === location.pathname)?.text || 'Thống kê'}
              </Typography>
            </Box>

            {/* User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={getUserRoleName()}
                size="small"
                color="primary"
                sx={{ fontWeight: 500 }}
              />
              <Button
                onClick={handleUserMenuOpen}
                startIcon={
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem'
                  }}>
                    {getUserAvatar()}
                  </Avatar>
                }
                endIcon={<KeyboardArrowDown />}
                sx={{
                  textTransform: 'none',
                  color: 'text.primary',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                {getUserDisplayName()}
              </Button>
              
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleUserMenuClose}>
                  <Avatar sx={{ mr: 1, width: 20, height: 20 }}>
                    {getUserAvatar()}
                  </Avatar>
                  Thông tin cá nhân
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <Logout sx={{ mr: 1 }} />
                  Đăng xuất
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
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 