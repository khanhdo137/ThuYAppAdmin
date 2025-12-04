import { Clear as ClearIcon, Search } from '@mui/icons-material';
import {
    Box,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField
} from '@mui/material';
import React from 'react';

const SearchFilterBar = ({ 
  searchValue, 
  onSearchChange, 
  placeholder = "Tìm kiếm...",
  filters = [],
  children,
  variant = "standard", // "standard" | "paper"
  onClear
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onSearchChange) {
      onSearchChange('');
    }
  };

  const content = (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <TextField
        fullWidth
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          endAdornment: searchValue ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
      
      {filters.map((filter, index) => (
        <FormControl key={index} sx={{ minWidth: filter.minWidth || 120 }} size="small">
          <InputLabel>{filter.label}</InputLabel>
          <Select
            value={filter.value}
            onChange={filter.onChange}
            label={filter.label}
            sx={{ borderRadius: 2 }}
          >
            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
      
      {children}
    </Box>
  );

  if (variant === "paper") {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          border: '1px solid', 
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        {content}
      </Paper>
    );
  }

  return content;
};

export default SearchFilterBar; 