import apiService from './apiService';

const dashboardService = {
  // Get simple dashboard stats
  getSimpleDashboard: async () => {
    try {
      const response = await apiService.get('/Dashboard/simple');
      return response;
    } catch (error) {
      console.error('Error getting simple dashboard data:', error);
      throw error;
    }
  },

  // Get detailed analytics
  getDashboardAnalytics: async (period = 'month') => {
    try {
      const response = await apiService.getWithParams('/Dashboard/analytics', { period });
      return response;
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      throw error;
    }
  },

  // Get completion trends
  getCompletionTrends: async (period = 'month', periods = 12) => {
    try {
      const response = await apiService.getWithParams('/Dashboard/completion-trends', { period, periods });
      return response;
    } catch (error) {
      console.error('Error getting completion trends:', error);
      throw error;
    }
  },

  // Get performance comparison
  getPerformanceByPeriod: async (period = 'month') => {
    try {
      const response = await apiService.getWithParams('/Dashboard/performance-by-period', { period });
      return response;
    } catch (error) {
      console.error('Error getting performance data:', error);
      throw error;
    }
  },

  // Get today's appointments
  getTodayDashboard: async () => {
    try {
      const response = await apiService.get('/Dashboard/today');
      return response;
    } catch (error) {
      console.error('Error getting today dashboard:', error);
      throw error;
    }
  },

  // Format number with commas
  formatNumber: (number) => {
    if (number === undefined || number === null) return '0';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  // Get status text
  getStatusText: (status) => {
    const statusMap = {
      0: 'Chờ xác nhận',
      1: 'Đã xác nhận',
      2: 'Hoàn thành',
      3: 'Đã hủy',
      4: 'Không đến'
    };
    return statusMap[status] || 'Không xác định';
  },

  // Get status color
  getStatusColor: (status) => {
    const colorMap = {
      0: 'warning',
      1: 'info',
      2: 'success',
      3: 'error',
      4: 'default'
    };
    return colorMap[status] || 'default';
  },

  // Format chart data for Chart.js
  formatChartData: (data, type = 'line') => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    switch (type) {
      case 'completion-stats':
        return {
          labels: ['Hoàn thành', 'Đã hủy', 'Khác'],
          datasets: [{
            data: [
              data.completedAppointments || 0,
              data.cancelledAppointments || 0,
              (data.totalAppointments || 0) - (data.completedAppointments || 0) - (data.cancelledAppointments || 0)
            ],
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 205, 86, 0.8)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 205, 86, 1)'
            ],
            borderWidth: 1
          }]
        };

      case 'completion-trend':
        return {
          labels: data.map(item => item.period || ''),
          datasets: [
            {
              label: 'Tỷ lệ hoàn thành (%)',
              data: data.map(item => item.completionRate || 0),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
              fill: true
            },
            {
              label: 'Tổng số lịch hẹn',
              data: data.map(item => item.totalAppointments || 0),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              yAxisID: 'y1',
              tension: 0.1
            }
          ]
        };

      case 'doctor-analysis':
        return {
          labels: data.map(item => item.doctorName || 'Unknown'),
          datasets: [
            {
              label: 'Tỷ lệ hoàn thành (%)',
              data: data.map(item => item.completionRate || 0),
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 205, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
              ],
              borderWidth: 1
            }
          ]
        };

      case 'service-analysis':
        return {
          labels: data.map(item => item.serviceName || 'Unknown'),
          datasets: [
            {
              label: 'Số lượng lịch hẹn',
              data: data.map(item => item.totalAppointments || 0),
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
              ],
              borderWidth: 1
            }
          ]
        };

      default:
        return {
          labels: [],
          datasets: []
        };
    }
  },

  // Get chart options for Chart.js
  getChartOptions: (type = 'line') => {
    const baseOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false
        }
      }
    };

    switch (type) {
      case 'completion-stats':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: 'right'
            }
          }
        };

      case 'completion-trend':
        return {
          ...baseOptions,
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Tỷ lệ hoàn thành (%)'
              },
              min: 0,
              max: 100
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Số lượng lịch hẹn'
              },
              grid: {
                drawOnChartArea: false,
              },
            }
          }
        };

      case 'doctor-analysis':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Tỷ lệ hoàn thành (%)'
              },
              max: 100
            }
          }
        };

      case 'service-analysis':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: 'right'
            }
          }
        };

      default:
        return baseOptions;
    }
  },

  // Format period display
  formatPeriodDisplay: (period) => {
    const periods = {
      'day': 'Ngày',
      'week': 'Tuần', 
      'month': 'Tháng',
      'quarter': 'Quý',
      'year': 'Năm'
    };
    return periods[period] || 'Tháng';
  },

  getTodayAppointments: async () => {
    try {
      console.log('Calling API for today appointments...');
      const response = await apiService.get('/Dashboard/today');
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default dashboardService; 