import { Box, Card, Typography } from '@mui/material';
import React from 'react';

const ContentCard = ({ 
  title,
  subtitle,
  children,
  actions,
  variant = "outlined", // "outlined" | "elevation"
  padding = 3,
  ...props 
}) => {
  return (
    <Card 
      elevation={variant === "elevation" ? 2 : 0}
      variant={variant === "outlined" ? "outlined" : undefined}
      sx={{ 
        border: variant === "outlined" ? '1px solid' : 'none',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: variant === "elevation" ? 4 : 2,
        },
        ...props.sx
      }}
      {...props}
    >
      {(title || subtitle || actions) && (
        <Box sx={{ 
          p: padding,
          pb: title || subtitle ? 2 : padding,
          borderBottom: (title || subtitle) && children ? '1px solid' : 'none',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <Box>
            {title && (
              <Typography variant="h6" component="h2" sx={{ 
                fontWeight: 600,
                mb: subtitle ? 0.5 : 0,
                color: 'text.primary'
              }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 2 }}>
              {actions}
            </Box>
          )}
        </Box>
      )}
      
      {children && (
        <Box sx={{ p: padding }}>
          {children}
        </Box>
      )}
    </Card>
  );
};

export default ContentCard; 