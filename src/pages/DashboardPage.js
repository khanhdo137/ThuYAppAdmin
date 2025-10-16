import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography
} from '@mui/material';
import {
  ArcElement,
  Chart as ChartJS,
  Colors,
  Legend,
  Title,
  Tooltip
} from 'chart.js';
import React, { useEffect, useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ContentCard, DataTable, DashboardFilter, PageTemplate } from '../components';
import { useToast } from '../components/ToastProvider';
import {
  authService,
  dashboardService
} from '../services';

// Register Chart.js components
ChartJS.register(
    ArcElement, 
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
    }
  });

  // Toast hook
  const toast = useToast();

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

  // Fetch data when filter changes
  useEffect(() => {
    fetchDashboardData();
  }, [filterType, specificDate, selectedMonth, selectedYear]);

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

      const apiData = response?.data || response;
      setPeriod(apiData.period || 'Hôm nay');
      
      const data = apiData.data || apiData;
      
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

  // Stat card component
  const StatCard = ({ title, value, color = 'primary' }) => (
    <Card sx={{ 
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="h3" 
          component="div" 
          color={`${color}.main`}
          sx={{ 
            fontWeight: 'bold', 
            mb: 1,
            fontSize: '2rem'
          }}
        >
          {loading ? <CircularProgress size={32} color={color} /> : dashboardService.formatNumber(value)}
        </Typography>
        <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </CardContent>
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
      <ContentCard title={`Thống kê: ${period}`} sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="Tổng lịch hẹn" 
              value={dashboardData.todayStats.totalAppointments}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="Chờ xác nhận" 
              value={dashboardData.todayStats.pendingAppointments}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="Đã xác nhận" 
              value={dashboardData.todayStats.confirmedAppointments}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="Hoàn thành" 
              value={dashboardData.todayStats.completedAppointments}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="Đã hủy" 
              value={dashboardData.todayStats.cancelledAppointments}
              color="error"
            />
          </Grid>
        </Grid>
      </ContentCard>

      {/* Completion Stats & Today's Appointments */}
      <Grid container spacing={3}>
        {/* Completion Stats */}
        <Grid item xs={12} md={4}>
          <ContentCard title="Thống kê tỉ lệ (30 ngày gần nhất)">
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box height={300}>
                  <Doughnut {...completionStatsChart} />
                </Box>
                <Box mt={2}>
                  <Typography variant="body1" align="center">
                    Tỉ lệ hoàn thành: {dashboardService.formatNumber(dashboardData.completionStats.completionRate)}%
                  </Typography>
                  <Typography variant="body1" align="center">
                    Tỉ lệ hủy: {dashboardService.formatNumber(dashboardData.completionStats.cancellationRate)}%
                  </Typography>
                </Box>
              </>
            )}
          </ContentCard>
        </Grid>

        {/* Appointments List */}
        <Grid item xs={12} md={8}>
          <ContentCard title={`Danh sách lịch hẹn: ${period}`}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
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
                data={dashboardData.todayAppointments}
                showActions={false}
                emptyMessage={`Không có lịch hẹn nào trong ${period.toLowerCase()}`}
              />
            )}
          </ContentCard>
        </Grid>
      </Grid>
    </PageTemplate>
  );
}

export default DashboardPage; 