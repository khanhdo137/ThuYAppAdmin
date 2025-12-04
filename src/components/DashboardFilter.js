import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Grid,
  Button
} from '@mui/material';
import { FilterList, Search } from '@mui/icons-material';

const DashboardFilter = ({ 
  filterType, 
  onFilterTypeChange,
  specificDate,
  onSpecificDateChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  dateRange,
  onDateRangeChange,
  onApplyDateRange
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  return (
    <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff', borderRadius: 2, boxShadow: 1 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Filter Type */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="filter-type-label">
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterList sx={{ mr: 1, fontSize: 18 }} />
                Thống kê theo
              </Box>
            </InputLabel>
            <Select
              labelId="filter-type-label"
              value={filterType}
              onChange={onFilterTypeChange}
              label="Thống kê theo"
            >
              <MenuItem value="today">Hôm nay</MenuItem>
              <MenuItem value="specific-date">Ngày cụ thể</MenuItem>
              <MenuItem value="last-7-days">7 ngày gần nhất</MenuItem>
              <MenuItem value="last-30-days">30 ngày gần nhất</MenuItem>
              <MenuItem value="this-week">Tuần này</MenuItem>
              <MenuItem value="last-week">Tuần trước</MenuItem>
              <MenuItem value="specific-month">Tháng cụ thể</MenuItem>
              <MenuItem value="date-range">Khoảng thời gian</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Date Range Picker (for date-range) */}
        {filterType === 'date-range' && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Từ ngày"
                value={dateRange?.fromDate || ''}
                onChange={(e) => onDateRangeChange && onDateRangeChange({ ...dateRange, fromDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Đến ngày"
                value={dateRange?.toDate || ''}
                onChange={(e) => onDateRangeChange && onDateRangeChange({ ...dateRange, toDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<Search />}
                onClick={onApplyDateRange}
                sx={{ height: '40px' }}
              >
                Áp dụng
              </Button>
            </Grid>
          </>
        )}

        {/* Date Picker (for specific-date) */}
        {filterType === 'specific-date' && (
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Chọn ngày"
              value={specificDate}
              onChange={onSpecificDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}

        {/* Month & Year Picker (for specific-month) */}
        {filterType === 'specific-month' && (
          <>
            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tháng</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={onMonthChange}
                  label="Tháng"
                >
                  {months.map(month => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Năm</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={onYearChange}
                  label="Năm"
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default DashboardFilter;


