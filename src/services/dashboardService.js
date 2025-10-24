import apiService from './apiService';

const dashboardService = {
  // Get simple dashboard stats
  getSimpleDashboard: async () => {
    try {
      const response = await apiService.get('Dashboard/simple');
      return response;
    } catch (error) {
      console.error('Error getting simple dashboard data:', error);
      throw error;
    }
  },

  // Get detailed analytics
  getDashboardAnalytics: async (period = 'month') => {
    try {
      const response = await apiService.getWithParams('Dashboard/analytics', { period });
      return response;
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      throw error;
    }
  },

  // Get completion trends
  getCompletionTrends: async (period = 'month', periods = 12) => {
    try {
      const response = await apiService.getWithParams('Dashboard/completion-trends', { period, periods });
      return response;
    } catch (error) {
      console.error('Error getting completion trends:', error);
      throw error;
    }
  },

  // Get performance comparison
  getPerformanceByPeriod: async (period = 'month') => {
    try {
      const response = await apiService.getWithParams('Dashboard/performance-by-period', { period });
      return response;
    } catch (error) {
      console.error('Error getting performance data:', error);
      throw error;
    }
  },

  // Get today's appointments
  getTodayDashboard: async () => {
    try {
      const response = await apiService.get('Dashboard/today');
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
          labels: ['Hoàn thành', 'Đã hủy', 'Chờ xác nhận', 'Đã xác nhận'],
          datasets: [{
            data: [
              data.completedAppointments || 0,
              data.cancelledAppointments || 0,
              data.pendingAppointments || 0,
              data.confirmedAppointments || 0
            ],
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)',    // Xanh lá - Hoàn thành
              'rgba(255, 99, 132, 0.8)',    // Đỏ - Đã hủy
              'rgba(255, 159, 64, 0.8)',    // Cam - Chờ xác nhận
              'rgba(54, 162, 235, 0.8)'     // Xanh dương - Đã xác nhận
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(54, 162, 235, 1)'
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
  },

  // === FLEXIBLE DASHBOARD FILTERS ===
  
  // Get dashboard with flexible filter
  getFlexibleDashboard: async (filterType = 'today', params = {}) => {
    try {
      const queryParams = { filterType, ...params };
      const response = await apiService.getWithParams('Dashboard/flexible', queryParams);
      return response;
    } catch (error) {
      console.error('Error getting flexible dashboard:', error);
      throw error;
    }
  },

  // Specific filter methods
  getTodayData: async () => {
    return await dashboardService.getFlexibleDashboard('today');
  },

  getSpecificDateData: async (date) => {
    return await dashboardService.getFlexibleDashboard('specific-date', { specificDate: date });
  },

  getLast7DaysData: async () => {
    return await dashboardService.getFlexibleDashboard('last-7-days');
  },

  getLast30DaysData: async () => {
    return await dashboardService.getFlexibleDashboard('last-30-days');
  },

  getThisWeekData: async () => {
    return await dashboardService.getFlexibleDashboard('this-week');
  },

  getLastWeekData: async () => {
    return await dashboardService.getFlexibleDashboard('last-week');
  },

  getSpecificMonthData: async (month, year = new Date().getFullYear()) => {
    return await dashboardService.getFlexibleDashboard('specific-month', { month, year });
  },

  // Format filter display for UI
  getFilterTypeLabel: (filterType) => {
    const labels = {
      'today': 'Hôm nay',
      'specific-date': 'Ngày cụ thể',
      'last-7-days': '7 ngày gần nhất',
      'last-30-days': '30 ngày gần nhất',
      'this-week': 'Tuần này',
      'last-week': 'Tuần trước',
      'specific-month': 'Tháng cụ thể'
    };
    return labels[filterType] || 'Hôm nay';
  },

  // Format currency for Vietnamese Dong
  formatCurrency: (amount) => {
    if (amount === 0) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // === SERVICE STATISTICS ===
  
  // Get service statistics with flexible filter
  getServiceStats: async (filterType = 'today', params = {}) => {
    try {
      const queryParams = { filterType, ...params };
      const response = await apiService.getWithParams('Dashboard/service-stats', queryParams);
      return response;
    } catch (error) {
      console.error('Error getting service statistics:', error);
      throw error;
    }
  },

  // Format service chart data
  formatServiceChartData: (data, type = 'popularity') => {
    if (!data || !data.topServices || data.topServices.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    switch (type) {
      case 'popularity':
        return {
          labels: data.topServices.map(s => s.serviceName || 'Unknown'),
          datasets: [{
            label: 'Số lượng lịch hẹn',
            data: data.topServices.map(s => s.totalAppointments || 0),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(199, 199, 199, 0.8)',
              'rgba(83, 102, 255, 0.8)',
              'rgba(255, 99, 255, 0.8)',
              'rgba(99, 255, 132, 0.8)'
            ],
            borderWidth: 1
          }]
        };

      case 'revenue':
        return {
          labels: data.revenueByService.map(s => s.serviceName || 'Unknown'),
          datasets: [{
            label: 'Doanh thu (VNĐ)',
            data: data.revenueByService.map(s => s.revenue || 0),
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(199, 199, 199, 0.8)',
              'rgba(83, 102, 255, 0.8)',
              'rgba(255, 99, 255, 0.8)',
              'rgba(99, 255, 132, 0.8)'
            ],
            borderWidth: 1
          }]
        };

      case 'completion':
        return {
          labels: data.topServices.map(s => s.serviceName || 'Unknown'),
          datasets: [{
            label: 'Tỷ lệ hoàn thành (%)',
            data: data.topServices.map(s => s.completionRate || 0),
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        };

      default:
        return {
          labels: [],
          datasets: []
        };
    }
  },

  // === CUSTOMER STATISTICS ===
  
  // Get customer statistics with flexible filter
  getCustomerStats: async (filterType = 'today', params = {}) => {
    try {
      const queryParams = { filterType, ...params };
      const response = await apiService.getWithParams('Dashboard/customer-stats', queryParams);
      return response;
    } catch (error) {
      console.error('Error getting customer statistics:', error);
      throw error;
    }
  },

  // Format customer chart data
  formatCustomerChartData: (data, type = 'activity') => {
    if (!data) {
      return {
        labels: [],
        datasets: []
      };
    }

    switch (type) {
      case 'activity':
        if (!data.customersByActivity || data.customersByActivity.length === 0) {
          return { labels: [], datasets: [] };
        }
        return {
          labels: data.customersByActivity.map(a => a.activityLevel || 'Unknown'),
          datasets: [{
            label: 'Số lượng khách hàng',
            data: data.customersByActivity.map(a => a.customerCount || 0),
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)',   // Cao - xanh lá
              'rgba(255, 205, 86, 0.8)',   // Trung bình - vàng
              'rgba(255, 99, 132, 0.8)'    // Thấp - đỏ
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }]
        };

      case 'growth':
        return {
          labels: ['Khách hàng mới', 'Khách hàng quay lại'],
          datasets: [{
            data: [
              data.newCustomers || 0,
              data.returningCustomers || 0
            ],
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 159, 64, 0.8)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        };

      case 'top-customers':
        if (!data.topCustomers || data.topCustomers.length === 0) {
          return { labels: [], datasets: [] };
        }
        return {
          labels: data.topCustomers.map(c => c.customerName || 'Unknown'),
          datasets: [{
            label: 'Tổng chi tiêu (VNĐ)',
            data: data.topCustomers.map(c => c.totalSpent || 0),
            backgroundColor: 'rgba(153, 102, 255, 0.8)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        };

      default:
        return {
          labels: [],
          datasets: []
        };
    }
  },

  // Get service chart options
  getServiceChartOptions: (type = 'popularity') => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
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
      case 'popularity':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: 'right'
            }
          }
        };

      case 'revenue':
        return {
          ...baseOptions,
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
        };

      case 'completion':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        };

      default:
        return baseOptions;
    }
  },

  // Get customer chart options
  getCustomerChartOptions: (type = 'activity') => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
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
      case 'activity':
      case 'growth':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: 'right'
            }
          }
        };

      case 'top-customers':
        return {
          ...baseOptions,
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
        };

      default:
        return baseOptions;
    }
  },

  // === MONTHLY REVENUE CHART ===
  getMonthlyRevenue: async (year) => {
    try {
      const response = await apiService.getWithParams('Dashboard/monthly-revenue', { year });
      return response;
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      throw error;
    }
  },

  formatMonthlyRevenueChartData: (data) => {
    if (!data || !data.monthlyData || data.monthlyData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    return {
      labels: data.monthlyData.map(m => m.monthName),
      datasets: [{
        label: `Doanh thu năm ${data.year}`,
        data: data.monthlyData.map(m => m.revenue),
        backgroundColor: data.monthlyData.map(m => 
          m.growthPercentage >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)'
        ),
        borderColor: data.monthlyData.map(m => 
          m.growthPercentage >= 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'
        ),
        borderWidth: 2
      }]
    };
  },

  getMonthlyRevenueChartOptions: (data) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: `Tổng doanh thu: ${dashboardService.formatCurrency(data?.totalRevenue || 0)} | Trung bình: ${dashboardService.formatCurrency(data?.averageMonthlyRevenue || 0)}/tháng`,
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const monthIndex = context.dataIndex;
              const monthData = data.monthlyData[monthIndex];
              return [
                `Doanh thu: ${dashboardService.formatCurrency(monthData.revenue)}`,
                `Tăng trưởng: ${dashboardService.formatNumber(monthData.growthPercentage)}% (so với cùng kỳ năm trước)`
              ];
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
    };
  }
};

export default dashboardService; 