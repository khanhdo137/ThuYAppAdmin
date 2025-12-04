import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Layout
import DashboardLayout from './layout/DashboardLayout';

// Pages
import AppointmentsPage from './pages/AppointmentsPage';
import ChatPage from './pages/ChatPage';
import CustomersPage from './pages/CustomersPage';
import DashboardPage from './pages/DashboardPage';
import DoctorsPage from './pages/DoctorsPage';
import FeedbackPage from './pages/FeedbackPage';
import LoginPage from './pages/LoginPage';
import Logout from './pages/Logout';
import MedicalHistoryPage from './pages/MedicalHistoryPage';
import NewsPage from './pages/NewsPage';
import PetsPage from './pages/PetsPage';
import RemindersPage from './pages/RemindersPage';
import ServicesPage from './pages/ServicesPage';

// Components
import PrivateRoute from './components/PrivateRoute';
import { ToastProvider } from './components/ToastProvider';

// Context
import { NotificationProvider } from './context/NotificationContext';

// Create Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#f44336',
      dark: '#c62828',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <Router>
          <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Admin Routes with NotificationProvider */}
          <Route path="/admin" element={
            <NotificationProvider>
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            </NotificationProvider>
          }>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="doctors" element={<DoctorsPage />} />
            <Route path="pets" element={<PetsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="feedbacks" element={<FeedbackPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="medical-histories" element={<MedicalHistoryPage />} />
          </Route>
          
          {/* Logout Route */}
          <Route path="/logout" element={<Logout />} />
          
          {/* Legacy Routes - Redirect to new structure */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/appointments" element={<Navigate to="/admin/appointments" replace />} />
          <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />
          <Route path="/doctors" element={<Navigate to="/admin/doctors" replace />} />
          <Route path="/pets" element={<Navigate to="/admin/pets" replace />} />
          <Route path="/services" element={<Navigate to="/admin/services" replace />} />
          <Route path="/news" element={<Navigate to="/admin/news" replace />} />
          <Route path="/feedbacks" element={<Navigate to="/admin/feedbacks" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
