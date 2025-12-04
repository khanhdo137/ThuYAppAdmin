import { Box, Button } from '@mui/material';
import React from 'react';

const ActionButton = ({ 
  children,
  icon,
  onClick,
  variant = "contained",
  color = "primary",
  size = "medium",
  position = "right", // "left" | "right" | "center"
  ...props 
}) => {
  const justifyContent = {
    left: 'flex-start',
    center: 'center', 
    right: 'flex-end'
  }[position];

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent,
      mb: 2
    }}>
      <Button
        variant={variant}
        color={color}
        size={size}
        startIcon={icon}
        onClick={onClick}
        sx={{ 
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 2,
          px: 3,
          py: 1,
          boxShadow: variant === 'contained' ? 2 : 0,
          '&:hover': {
            boxShadow: variant === 'contained' ? 4 : 1,
            transform: 'translateY(-1px)'
          },
          transition: 'all 0.2s ease-in-out',
          ...props.sx
        }}
        {...props}
      >
        {children}
      </Button>
    </Box>
  );
};

export default ActionButton; 