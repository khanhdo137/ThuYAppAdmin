import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar
} from '@mui/material';
import {
  EventAvailable,
  HourglassEmpty,
  CheckCircle,
  Cancel,
  Verified,
  TrendingUp,
  TrendingDown,
  CalendarMonth,
  AttachMoney
} from '@mui/icons-material';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from 'chart.js';
import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ContentCard, DataTable, DashboardFilter, PageTemplate } from '../components';
import { useToast } from '../components/ToastProvider';
import {
  authService,
  dashboardService
} from '../services';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip, 
    Legend,
    Title,
    Colors
);

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('Hôm nay');
  
  // Filter states
  const [filterType, setFilterType] = useState('today');
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [dashboardData, setDashboardData] = useState({
    todayStats: {
      totalAppointments: 0,
      pendingAppointments: 0,
      confirmedAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0
    },
    todayAppointments: [],
    completionStats: {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      completionRate: 0,
      cancellationRate: 0
    },
    revenueStats: {
      totalRevenue: 0,
      averageRevenue: 0,
      revenueGrowth: 0
    }
  });

  // Service & Customer statistics states
  const [serviceStats, setServiceStats] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Monthly revenue states (independent from filter)
  const [monthlyRevenueData, setMonthlyRevenueData] = useState(null);
  const [monthlyRevenueYear, setMonthlyRevenueYear] = useState(new Date().getFullYear());
  const [monthlyRevenueLoading, setMonthlyRevenueLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toast hook
  const toast = useToast();

  // Pagination logic
  const totalPages = Math.ceil(dashboardData.todayAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = dashboardData.todayAppointments.slice(startIndex, endIndex);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dashboardData.todayAppointments]);

  // Memoized chart data & options
  const completionStatsChart = useMemo(() => {
    return {
      data: dashboardService.formatChartData(dashboardData.completionStats, 'completion-stats'),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 14
              }
            }
          },
          title: {
            display: false
          }
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        }
      }
    };
  }, [dashboardData.completionStats]);

  // Service charts
  const servicePopularityChart = useMemo(() => {
    if (!serviceStats) return { data: { labels: [], datasets: [] }, options: {} };
    return {
      data: dashboardService.formatServiceChartData(serviceStats, 'popularity'),
      options: dashboardService.getServiceChartOptions('popularity')
    };
  }, [serviceStats]);

  const serviceRevenueChart = useMemo(() => {
    if (!serviceStats) return { data: { labels: [], datasets: [] }, options: {} };
    return {
      data: dashboardService.formatServiceChartData(serviceStats, 'revenue'),
      options: dashboardService.getServiceChartOptions('revenue')
    };
  }, [serviceStats]);

  // Customer charts
  const customerActivityChart = useMemo(() => {
    if (!customerStats) return { data: { labels: [], datasets: [] }, options: {} };
    return {
      data: dashboardService.formatCustomerChartData(customerStats, 'activity'),
      options: dashboardService.getCustomerChartOptions('activity')
    };
  }, [customerStats]);

  const customerGrowthChart = useMemo(() => {
    if (!customerStats) return { data: { labels: [], datasets: [] }, options: {} };
    return {
      data: dashboardService.formatCustomerChartData(customerStats, 'growth'),
      options: dashboardService.getCustomerChartOptions('growth')
    };
  }, [customerStats]);

  // Monthly revenue chart (independent)
  const monthlyRevenueChart = useMemo(() => {
    if (!monthlyRevenueData) return { data: { labels: [], datasets: [] }, options: {} };
    return {
      data: dashboardService.formatMonthlyRevenueChartData(monthlyRevenueData),
      options: dashboardService.getMonthlyRevenueChartOptions(monthlyRevenueData)
    };
  }, [monthlyRevenueData]);

  // Fetch data when filter changes
  useEffect(() => {
    fetchDashboardData();
    fetchServiceAndCustomerStats();
  }, [filterType, specificDate, selectedMonth, selectedYear]);

  // Fetch monthly revenue when year changes (independent)
  useEffect(() => {
    fetchMonthlyRevenue();
  }, [monthlyRevenueYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch(filterType) {
        case 'specific-date':
          response = await dashboardService.getSpecificDateData(specificDate);
          break;
        case 'last-7-days':
          response = await dashboardService.getLast7DaysData();
          break;
        case 'last-30-days':
          response = await dashboardService.getLast30DaysData();
          break;
        case 'this-week':
          response = await dashboardService.getThisWeekData();
          break;
        case 'last-week':
          response = await dashboardService.getLastWeekData();
          break;
        case 'specific-month':
          response = await dashboardService.getSpecificMonthData(selectedMonth, selectedYear);
          break;
        case 'today':
        default:
          response = await dashboardService.getTodayData();
          break;
      }

      // Response structure: { period: "...", data: { todayStats, todayAppointments, completionStats } }
      console.log('📊 Dashboard API Response:', response);
      
      // apiService already unwraps the response, so response is the direct API data
      // Backend returns: { period: "7 ngày gần nhất", data: {...} }
      const period = response.period || 'Hôm nay';
      const data = response.data || response;
      
      console.log('📊 Period extracted:', period);
      console.log('📊 Data extracted:', data);
      
      setPeriod(period);
      
      setDashboardData({
        todayStats: data.todayStats || {
          totalAppointments: 0,
          pendingAppointments: 0,
          confirmedAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0
        },
        todayAppointments: Array.isArray(data.todayAppointments) ? data.todayAppointments : [],
        completionStats: data.completionStats || {
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          completionRate: 0,
          cancellationRate: 0
        },
        revenueStats: data.revenueStats || {
          totalRevenue: 0,
          averageRevenue: 0,
          revenueGrowth: 0
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        toast.showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        authService.clearAuthData();
        window.location.href = '/login';
      } else {
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        toast.showError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceAndCustomerStats = async () => {
    try {
      setStatsLoading(true);
      
      const params = {};
      if (filterType === 'specific-date') params.specificDate = specificDate;
      if (filterType === 'specific-month') {
        params.month = selectedMonth;
        params.year = selectedYear;
      }

      console.log('Fetching service and customer stats with:', { filterType, params });

      const [serviceResponse, customerResponse] = await Promise.all([
        dashboardService.getServiceStats(filterType, params),
        dashboardService.getCustomerStats(filterType, params)
      ]);

      console.log('Service stats response:', serviceResponse);
      console.log('Customer stats response:', customerResponse);

      setServiceStats(serviceResponse);
      setCustomerStats(customerResponse);
    } catch (error) {
      console.error('Error fetching service and customer stats:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.showError('Không thể tải thống kê dịch vụ và khách hàng');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      setMonthlyRevenueLoading(true);
      console.log('Fetching monthly revenue for year:', monthlyRevenueYear);
      
      const response = await dashboardService.getMonthlyRevenue(monthlyRevenueYear);
      console.log('Monthly revenue response:', response);
      
      setMonthlyRevenueData(response);
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      toast.showError('Không thể tải dữ liệu doanh thu theo tháng');
    } finally {
      setMonthlyRevenueLoading(false);
    }
  };

  // Enhanced Stat card component with icons and gradients - COMPACT VERSION
  const StatCard = ({ title, value, color = 'primary', icon, gradient }) => (
    <Card sx={{ 
      height: '100%',
      minHeight: '140px',
      maxHeight: '160px',
      position: 'relative',
      overflow: 'hidden',
      background: gradient || `linear-gradient(135deg, ${
        color === 'primary' ? '#1976d2 0%, #42a5f5 100%' :
        color === 'warning' ? '#ed6c02 0%, #ff9800 100%' :
        color === 'info' ? '#0288d1 0%, #03a9f4 100%' :
        color === 'success' ? '#2e7d32 0%, #4caf50 100%' :
        color === 'error' ? '#d32f2f 0%, #f44336 100%' :
        '#1976d2 0%, #42a5f5 100%'
      })`,
      color: 'white',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px 0 rgba(0,0,0,0.2)'
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.1)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
      },
      '&:hover::before': {
        opacity: 1
      }
    }}>
      <CardContent sx={{ p: 2.5, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9,
                fontWeight: 500,
                mb: 0.5,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                fontSize: '0.7rem'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                lineHeight: 1.2
              }}
            >
              {loading ? <CircularProgress size={28} sx={{ color: 'white' }} /> : dashboardService.formatNumber(value)}
            </Typography>
          </Box>
          {icon && (
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 48, 
              height: 48,
              backdropFilter: 'blur(10px)'
            }}>
              {React.cloneElement(icon, { sx: { fontSize: 28 } })}
            </Avatar>
          )}
        </Box>
      </CardContent>
      {/* Decorative element */}
      <Box sx={{
        position: 'absolute',
        bottom: -15,
        right: -15,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        pointerEvents: 'none'
      }} />
    </Card>
  );

  if (error) {
    return (
      <PageTemplate>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate>
      {/* Filter Section */}
      <DashboardFilter
        filterType={filterType}
        onFilterTypeChange={(e) => setFilterType(e.target.value)}
        specificDate={specificDate}
        onSpecificDateChange={(e) => setSpecificDate(e.target.value)}
        selectedMonth={selectedMonth}
        onMonthChange={(e) => setSelectedMonth(e.target.value)}
        selectedYear={selectedYear}
        onYearChange={(e) => setSelectedYear(e.target.value)}
      />

      {/* Stats Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
          Thống kê: {period}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="Tổng lịch hẹn" 
              value={dashboardData.todayStats.totalAppointments}
              color="primary"
              icon={<EventAvailable sx={{ fontSize: 32 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="Chờ xác nhận" 
              value={dashboardData.todayStats.pendingAppointments}
              color="warning"
              icon={<HourglassEmpty sx={{ fontSize: 32 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="Đã xác nhận" 
              value={dashboardData.todayStats.confirmedAppointments}
              color="info"
              icon={<Verified sx={{ fontSize: 32 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="Hoàn thành" 
              value={dashboardData.todayStats.completedAppointments}
              color="success"
              icon={<CheckCircle sx={{ fontSize: 32 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="Đã hủy" 
              value={dashboardData.todayStats.cancelledAppointments}
              color="error"
              icon={<Cancel sx={{ fontSize: 32 }} />}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Revenue Stats Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
          Thống kê doanh thu: {period}
        </Typography>
        <Grid container spacing={3}>
          {/* Revenue Summary Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%',
              minHeight: '140px',
              maxHeight: '160px',
              background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px 0 rgba(46, 125, 50, 0.3)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px 0 rgba(46, 125, 50, 0.4)'
              }
            }}>
              <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      TỔNG DOANH THU
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.2 }}>
                      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : dashboardService.formatCurrency(dashboardData.revenueStats.totalRevenue || 0)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <AttachMoney sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%',
              minHeight: '140px',
              maxHeight: '160px',
              background: 'linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px 0 rgba(2, 136, 209, 0.3)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px 0 rgba(2, 136, 209, 0.4)'
              }
            }}>
              <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      TB / LỊCH HẸN
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.2 }}>
                      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : dashboardService.formatCurrency(dashboardData.revenueStats.averageRevenue || 0)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <CalendarMonth sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%',
              minHeight: '140px',
              maxHeight: '160px',
              background: dashboardData.revenueStats.revenueGrowth >= 0 
                ? 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)' 
                : 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 20px 0 ${dashboardData.revenueStats.revenueGrowth >= 0 ? 'rgba(46, 125, 50, 0.3)' : 'rgba(211, 47, 47, 0.3)'}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 30px 0 ${dashboardData.revenueStats.revenueGrowth >= 0 ? 'rgba(46, 125, 50, 0.4)' : 'rgba(211, 47, 47, 0.4)'}`
              }
            }}>
              <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      TĂNG TRƯỞNG
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.2 }}>
                      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : `${dashboardService.formatNumber(dashboardData.revenueStats.revenueGrowth || 0)}%`}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    {dashboardData.revenueStats.revenueGrowth >= 0 ? <TrendingUp sx={{ fontSize: 28 }} /> : <TrendingDown sx={{ fontSize: 28 }} />}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Revenue Comparison Chart - Conditional display based on filter type */}
      {dashboardData.revenueStats.multiPeriodComparison && 
       dashboardData.revenueStats.multiPeriodComparison.length > 0 &&
       filterType !== 'specific-month' && 
       filterType !== 'last-30-days' && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            {filterType === 'today' || filterType === 'specific-date' 
              ? 'So sánh doanh thu 7 ngày gần nhất' 
              : filterType === 'this-week' || filterType === 'last-week' || filterType === 'last-7-days'
              ? 'So sánh doanh thu 4 tuần gần nhất'
              : 'So sánh doanh thu'}
          </Typography>
          <Box height={280}>
            <Bar 
              data={{
                labels: dashboardData.revenueStats.multiPeriodComparison.map(p => p.label),
                datasets: [{
                  label: 'Doanh thu (VND)',
                  data: dashboardData.revenueStats.multiPeriodComparison.map(p => p.revenue),
                  backgroundColor: dashboardData.revenueStats.multiPeriodComparison.map((p, index) => {
                    // Highlight the last period (current/selected period)
                    if (index === dashboardData.revenueStats.multiPeriodComparison.length - 1) {
                      return 'rgba(33, 150, 243, 0.7)';  // Blue for current period
                    }
                    return 'rgba(156, 39, 176, 0.5)';  // Purple for other periods
                  }),
                  borderColor: dashboardData.revenueStats.multiPeriodComparison.map((p, index) => {
                    if (index === dashboardData.revenueStats.multiPeriodComparison.length - 1) {
                      return 'rgba(33, 150, 243, 1)';
                    }
                    return 'rgba(156, 39, 176, 0.8)';
                  }),
                  borderWidth: 2,
                  borderRadius: 8
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const period = dashboardData.revenueStats.multiPeriodComparison[context.dataIndex];
                        return [
                          'Doanh thu: ' + dashboardService.formatCurrency(context.raw),
                          'Lịch hẹn hoàn thành: ' + period.completedAppointments
                        ];
                      }
                    },
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 10,
                    titleFont: {
                      size: 12
                    },
                    bodyFont: {
                      size: 11
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return dashboardService.formatCurrency(value);
                      },
                      font: {
                        size: 11
                      }
                    },
                    grid: {
                      color: 'rgba(0,0,0,0.05)'
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        size: 11,
                        weight: 'bold'
                      }
                    },
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Monthly Revenue Chart - Independent */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Tăng trưởng doanh thu theo tháng
          </Typography>
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Chọn năm</InputLabel>
            <Select
              value={monthlyRevenueYear}
              label="Chọn năm"
              onChange={(e) => setMonthlyRevenueYear(e.target.value)}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <MenuItem key={year} value={year}>
                    Năm {year}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>

        {monthlyRevenueLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={40} />
          </Box>
        ) : monthlyRevenueData ? (
          <Box height={320}>
            <Bar {...monthlyRevenueChart} />
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height={250}>
            <Typography variant="body1" color="text.secondary">
              Chưa có dữ liệu doanh thu
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Completion Stats & Today's Appointments */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Completion Stats */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Thống kê tỉ lệ: {period}
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box height={280} sx={{ mb: 2 }}>
                  <Doughnut {...completionStatsChart} />
                </Box>
                <Box sx={{ 
                  bgcolor: 'grey.50', 
                  borderRadius: 2, 
                  p: 2 
                }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                          {dashboardService.formatNumber(dashboardData.completionStats.completionRate || 0)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hoàn thành
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="error.main" sx={{ fontWeight: 700 }}>
                          {dashboardService.formatNumber(dashboardData.completionStats.cancellationRate || 0)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Đã hủy
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="warning.main" sx={{ fontWeight: 700 }}>
                          {dashboardService.formatNumber(dashboardData.completionStats.pendingRate || 0)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Chờ xác nhận
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
                          {dashboardService.formatNumber(dashboardData.completionStats.confirmedRate || 0)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Đã xác nhận
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Appointments List */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Danh sách lịch hẹn: {period}
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <DataTable
                  columns={[
                    { field: 'time', label: 'Thời gian' },
                    { field: 'customerName', label: 'Khách hàng' },
                    { field: 'petName', label: 'Thú cưng' },
                    { field: 'serviceName', label: 'Dịch vụ' },
                    { field: 'doctorName', label: 'Bác sĩ' },
                    { 
                      field: 'status', 
                      label: 'Trạng thái',
                      render: (row) => (
                        <Chip 
                          label={row.statusText || dashboardService.getStatusText(row.status)}
                          color={dashboardService.getStatusColor(row.status)}
                          size="small"
                        />
                      )
                    }
                  ]}
                  data={paginatedAppointments}
                  showActions={false}
                  emptyMessage={`Không có lịch hẹn nào trong ${period.toLowerCase()}`}
                />
                
                {/* Pagination */}
                {dashboardData.todayAppointments.length > itemsPerPage && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(event, page) => setCurrentPage(page)}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
                
                {/* Pagination info */}
                {dashboardData.todayAppointments.length > 0 && (
                  <Box display="flex" justifyContent="center" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Hiển thị {startIndex + 1}-{Math.min(endIndex, dashboardData.todayAppointments.length)} 
                      trong tổng số {dashboardData.todayAppointments.length} lịch hẹn
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Service Statistics Section */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
          Thống kê dịch vụ: {period}
        </Typography>
        {statsLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : serviceStats ? (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Hiển thị thống kê dịch vụ được đặt (không hiển thị doanh thu) */}
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      {serviceStats.topServices?.length || 0}
                    </Typography>
                    <Typography variant="h6">Số loại dịch vụ được đặt</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                      {serviceStats.topServices?.reduce((sum, s) => sum + s.totalAppointments, 0) || 0}
                    </Typography>
                    <Typography variant="h6">Tổng lịch hẹn</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {serviceStats.topServices?.reduce((sum, s) => sum + s.completedAppointments, 0) || 0}
                    </Typography>
                    <Typography variant="h6">Đã hoàn thành</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {/* Service Popularity Chart - Hiển thị full width, không hiển thị biểu đồ doanh thu */}
              <Grid item xs={12}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Top 10 dịch vụ phổ biến</Typography>
                  <Box height={350}>
                    {serviceStats.topServices && serviceStats.topServices.length > 0 ? (
                      <Doughnut {...servicePopularityChart} />
                    ) : (
                      <Typography align="center" color="text.secondary">Không có dữ liệu</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Service Details Table */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Chi tiết dịch vụ</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Tên dịch vụ</strong></TableCell>
                        <TableCell align="right"><strong>Giá</strong></TableCell>
                        <TableCell align="right"><strong>Tổng lịch hẹn</strong></TableCell>
                        <TableCell align="right"><strong>Hoàn thành</strong></TableCell>
                        <TableCell align="right"><strong>Tỷ lệ hoàn thành</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {serviceStats.topServices && serviceStats.topServices.length > 0 ? (
                        serviceStats.topServices.map((service, index) => (
                          <TableRow key={index}>
                            <TableCell>{service.serviceName}</TableCell>
                            <TableCell align="right">{dashboardService.formatCurrency(service.price || 0)}</TableCell>
                            <TableCell align="right">{service.totalAppointments}</TableCell>
                            <TableCell align="right">{service.completedAppointments}</TableCell>
                            <TableCell align="right">{service.completionRate.toFixed(2)}%</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography color="text.secondary">Không có dữ liệu</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <Typography variant="body1" color="text.secondary">
              Chưa có dữ liệu thống kê dịch vụ
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Customer Statistics Section */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
          Thống kê khách hàng: {period}
        </Typography>
        {statsLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : customerStats ? (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      {customerStats.totalCustomers || 0}
                    </Typography>
                    <Typography variant="h6">Tổng khách hàng</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {customerStats.newCustomers || 0}
                    </Typography>
                    <Typography variant="h6">Khách hàng mới</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                      {customerStats.returningCustomers || 0}
                    </Typography>
                    <Typography variant="h6">Khách quay lại</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color={customerStats.customerGrowth >= 0 ? "success.main" : "error.main"} sx={{ fontWeight: 'bold' }}>
                      {customerStats.customerGrowth >= 0 ? '+' : ''}{customerStats.customerGrowth?.toFixed(2) || 0}%
                    </Typography>
                    <Typography variant="h6">Tăng trưởng</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {/* Customer Activity Chart */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Phân loại theo hoạt động</Typography>
                  <Box height={300}>
                    {customerStats.customersByActivity && customerStats.customersByActivity.length > 0 ? (
                      <Doughnut {...customerActivityChart} />
                    ) : (
                      <Typography align="center" color="text.secondary">Không có dữ liệu</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Customer Growth Chart */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Khách hàng mới vs Quay lại</Typography>
                  <Box height={300}>
                    <Doughnut {...customerGrowthChart} />
                  </Box>
                </Box>
              </Grid>

              {/* Top Customers Table */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Top 10 khách hàng</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Tên khách hàng</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>SĐT</strong></TableCell>
                        <TableCell align="right"><strong>Số lịch hẹn</strong></TableCell>
                        <TableCell align="right"><strong>Số thú cưng</strong></TableCell>
                        <TableCell align="right"><strong>Tổng chi tiêu</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerStats.topCustomers && customerStats.topCustomers.length > 0 ? (
                        customerStats.topCustomers.map((customer, index) => (
                          <TableRow key={index}>
                            <TableCell>{customer.customerName}</TableCell>
                            <TableCell>{customer.email || 'N/A'}</TableCell>
                            <TableCell>{customer.phoneNumber || 'N/A'}</TableCell>
                            <TableCell align="right">{customer.totalAppointments}</TableCell>
                            <TableCell align="right">{customer.totalPets}</TableCell>
                            <TableCell align="right">{dashboardService.formatCurrency(customer.totalSpent)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="text.secondary">Không có dữ liệu</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Customer Stats Summary */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Trung bình lịch hẹn/Khách hàng
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {customerStats.averageAppointmentsPerCustomer?.toFixed(2) || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Trung bình thú cưng/Khách hàng
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {customerStats.averagePetsPerCustomer?.toFixed(2) || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <Typography variant="body1" color="text.secondary">
              Chưa có dữ liệu thống kê khách hàng
            </Typography>
          </Box>
        )}
      </Paper>
    </PageTemplate>
  );
}

export default DashboardPage; 