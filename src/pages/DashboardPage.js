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
  Paper
} from '@mui/material';
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

      {/* Revenue Stats Section */}
      <ContentCard title={`Thống kê doanh thu: ${period}`} sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          {/* Revenue Summary Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Tổng doanh thu" 
              value={dashboardService.formatCurrency(dashboardData.revenueStats.totalRevenue || 0)}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Doanh thu trung bình/Lịch hẹn" 
              value={dashboardService.formatCurrency(dashboardData.revenueStats.averageRevenue || 0)}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Tăng trưởng doanh thu" 
              value={`${dashboardService.formatNumber(dashboardData.revenueStats.revenueGrowth || 0)}%`}
              color={dashboardData.revenueStats.revenueGrowth >= 0 ? "success" : "error"}
            />
          </Grid>

          {/* Revenue Comparison Chart */}
          {dashboardData.revenueStats.comparison && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>So sánh doanh thu</Typography>
                <Box height={300}>
                  <Bar 
                    data={{
                      labels: [
                        dashboardData.revenueStats.comparison.previousPeriodLabel,
                        dashboardData.revenueStats.comparison.currentPeriodLabel
                      ],
                      datasets: [{
                        label: 'Doanh thu (VND)',
                        data: [
                          dashboardData.revenueStats.comparison.previousPeriodRevenue,
                          dashboardData.revenueStats.comparison.currentPeriodRevenue
                        ],
                        backgroundColor: [
                          'rgba(156, 39, 176, 0.6)',  // Purple for previous
                          dashboardData.revenueStats.revenueGrowth >= 0 
                            ? 'rgba(76, 175, 80, 0.6)'   // Green for positive growth
                            : 'rgba(244, 67, 54, 0.6)'   // Red for negative growth
                        ],
                        borderColor: [
                          'rgba(156, 39, 176, 1)',
                          dashboardData.revenueStats.revenueGrowth >= 0 
                            ? 'rgba(76, 175, 80, 1)' 
                            : 'rgba(244, 67, 54, 1)'
                        ],
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        title: {
                          display: true,
                          text: `Tăng trưởng: ${dashboardService.formatNumber(dashboardData.revenueStats.revenueGrowth)}% (${dashboardData.revenueStats.revenueGrowth >= 0 ? '+' : ''}${dashboardService.formatCurrency(dashboardData.revenueStats.comparison.revenueDifference)})`,
                          font: {
                            size: 14,
                            weight: 'bold'
                          },
                          color: dashboardData.revenueStats.revenueGrowth >= 0 ? '#4caf50' : '#f44336'
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return 'Doanh thu: ' + dashboardService.formatCurrency(context.raw);
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return dashboardService.formatCurrency(value);
                            }
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          )}

        </Grid>
      </ContentCard>

      {/* Monthly Revenue Chart - Independent */}
      <ContentCard title="Tăng trưởng doanh thu theo tháng" sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          {/* Year Selector */}
          <Grid item xs={12}>
            <FormControl sx={{ minWidth: 200 }}>
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
          </Grid>

          {/* Chart */}
          <Grid item xs={12}>
            {monthlyRevenueLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : monthlyRevenueData ? (
              <Box height={400}>
                <Bar {...monthlyRevenueChart} />
              </Box>
            ) : (
              <Typography align="center" color="text.secondary">
                Chưa có dữ liệu doanh thu
              </Typography>
            )}
          </Grid>
        </Grid>
      </ContentCard>

      {/* Completion Stats & Today's Appointments */}
      <Grid container spacing={3}>
        {/* Completion Stats */}
        <Grid item xs={12} md={4}>
          <ContentCard title={`Thống kê tỉ lệ: ${period}`}>
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
                  <Typography variant="body1" align="center" sx={{ mb: 1 }}>
                    <strong>Tỷ lệ theo trạng thái:</strong>
                  </Typography>
                  <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2}>
                    <Typography variant="body2" align="center">
                      Hoàn thành: {dashboardService.formatNumber(dashboardData.completionStats.completionRate || 0)}%
                    </Typography>
                    <Typography variant="body2" align="center">
                      Đã hủy: {dashboardService.formatNumber(dashboardData.completionStats.cancellationRate || 0)}%
                    </Typography>
                    <Typography variant="body2" align="center">
                      Chờ xác nhận: {dashboardService.formatNumber(dashboardData.completionStats.pendingRate || 0)}%
                    </Typography>
                    <Typography variant="body2" align="center">
                      Đã xác nhận: {dashboardService.formatNumber(dashboardData.completionStats.confirmedRate || 0)}%
                    </Typography>
                  </Box>
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
          </ContentCard>
        </Grid>
      </Grid>

      {/* Service Statistics Section */}
      <ContentCard title={`Thống kê dịch vụ: ${period}`} sx={{ mb: 3, mt: 3 }}>
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
          <Typography align="center" color="text.secondary">Chưa có dữ liệu thống kê dịch vụ</Typography>
        )}
      </ContentCard>

      {/* Customer Statistics Section */}
      <ContentCard title={`Thống kê khách hàng: ${period}`} sx={{ mb: 3 }}>
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
          <Typography align="center" color="text.secondary">Chưa có dữ liệu thống kê khách hàng</Typography>
        )}
      </ContentCard>
    </PageTemplate>
  );
}

export default DashboardPage; 