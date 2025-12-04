import { createTheme } from '@mui/material/styles';

// Custom color palette
const colors = {
  primary: {
    main: '#3498db',
    light: '#5dade2',
    dark: '#2980b9',
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#3498db',
    600: '#2196f3',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1'
  },
  secondary: {
    main: '#2c3e50',
    light: '#34495e',
    dark: '#1a252f'
  },
  success: {
    main: '#27ae60',
    light: '#2ecc71',
    dark: '#1e8449'
  },
  error: {
    main: '#e74c3c',
    light: '#ec7063',
    dark: '#c0392b'
  },
  warning: {
    main: '#f39c12',
    light: '#f7dc6f',
    dark: '#d68910'
  },
  info: {
    main: '#17a2b8',
    light: '#5bc0de',
    dark: '#138496'
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  }
};

// Create theme
const AppTheme = createTheme({
  palette: {
    ...colors,
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d'
    },
    divider: '#ecf0f1'
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#2c3e50'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#2c3e50'
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#2c3e50'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2c3e50'
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2c3e50'
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2c3e50'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#2c3e50'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#2c3e50'
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#7f8c8d'
    }
  },
  
  shape: {
    borderRadius: 8
  },
  
  spacing: 8,
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 24px',
          transition: 'all 0.2s ease-in-out'
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)'
          }
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            transform: 'translateY(-1px)'
          }
        }
      }
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #ecf0f1',
          padding: '12px 16px'
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8f9fa',
          color: '#7f8c8d',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: 0.5
        }
      }
    },
    
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f8f9fa !important'
          },
          transition: 'background-color 0.2s ease'
        }
      }
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)'
            }
          }
        }
      }
    },
    
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500
        }
      }
    },
    
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
        }
      }
    },
    
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }
      }
    }
  },
  
  // Custom theme extensions
  custom: {
    layout: {
      headerHeight: 64,
      sidebarWidth: 280,
      spacing: {
        xs: 8,
        sm: 16,
        md: 24,
        lg: 32,
        xl: 40
      }
    },
    shadows: {
      light: '0 1px 3px rgba(0,0,0,0.1)',
      medium: '0 4px 12px rgba(0,0,0,0.15)',
      heavy: '0 10px 40px rgba(0,0,0,0.2)'
    }
  }
});

export default AppTheme; 