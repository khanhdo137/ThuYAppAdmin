import { Alert, Slide, Snackbar } from '@mui/material';
import React, { createContext, useCallback, useContext, useState } from 'react';

// Toast Context
const ToastContext = createContext();

// Slide transition component
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add toast function
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      open: true
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  // Remove toast function
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Helper functions for different toast types
  const showSuccess = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  // Clear all toasts
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
    toasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Render all toasts */}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={toast.open}
          autoHideDuration={null} // We handle this manually
          onClose={() => removeToast(toast.id)}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            top: `${80 + index * 70}px !important`, // Stack toasts vertically
            zIndex: 9999
          }}
        >
          <Alert 
            onClose={() => removeToast(toast.id)}
            severity={toast.type}
            variant="filled"
            sx={{
              minWidth: '300px',
              maxWidth: '500px',
              boxShadow: 3,
              '& .MuiAlert-message': {
                fontSize: '0.9rem',
                fontWeight: 500
              }
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider; 