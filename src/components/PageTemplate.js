import { Container } from '@mui/material';
import React from 'react';

const PageTemplate = ({ 
  children,
  maxWidth = "xl",
  spacing = 3,
  ...props 
}) => {
  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{ 
        py: 2,
        px: { xs: 2, sm: 3 },
        '& > *:not(:last-child)': {
          mb: spacing
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

export default PageTemplate; 