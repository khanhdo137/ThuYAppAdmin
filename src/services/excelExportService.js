import ExcelJS from 'exceljs';

/**
 * Service để xuất dữ liệu ra file Excel với styling đẹp
 */

// Helper function để tính độ rộng cột tự động
const calculateColumnWidth = (data, columnKey, headerText) => {
  let maxLength = headerText ? headerText.length : 10;
  data.forEach(row => {
    const value = row[columnKey];
    if (value !== null && value !== undefined) {
      const strValue = String(value);
      if (strValue.length > maxLength) {
        maxLength = strValue.length;
      }
    }
  });
  // Thêm padding và giới hạn độ rộng
  return Math.min(Math.max(maxLength + 2, 10), 50);
};

// Helper function để style header cell
const styleHeaderCell = (cell) => {
  cell.font = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' } // Màu xanh đẹp
  };
  cell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true
  };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };
};

// Helper function để style data cell
const styleDataCell = (cell, isEvenRow = false) => {
  cell.font = {
    name: 'Arial',
    size: 10
  };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: isEvenRow ? 'FFF2F2F2' : 'FFFFFFFF' } // Zebra striping
  };
  cell.alignment = {
    vertical: 'middle',
    horizontal: 'left',
    wrapText: true
  };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
  };
};

// Helper function để format giá trị
const formatCellValue = (value, columnKey = '') => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  // Kiểm tra nếu là số tiền (có chứa từ khóa như price, revenue, total, spent)
  if (typeof value === 'number' && 
      (columnKey.toLowerCase().includes('price') || 
       columnKey.toLowerCase().includes('revenue') || 
       columnKey.toLowerCase().includes('total') || 
       columnKey.toLowerCase().includes('spent') ||
       columnKey.toLowerCase().includes('doanh'))) {
    return value;
  }
  return value;
};

const excelExportService = {
  /**
   * Xuất dữ liệu dạng bảng ra Excel với styling đẹp
   * @param {Array} data - Mảng dữ liệu
   * @param {Array} columns - Mảng các cột (format: { key: 'fieldName', label: 'Tên cột' })
   * @param {String} fileName - Tên file (không cần .xlsx)
   * @param {String} sheetName - Tên sheet
   */
  exportTableToExcel: async (data, columns, fileName = 'export', sheetName = 'Sheet1') => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Tạo header row
      const headerRow = worksheet.addRow(columns.map(col => col.label));
      headerRow.height = 25;
      
      // Style header row
      headerRow.eachCell((cell, colNumber) => {
        styleHeaderCell(cell);
      });

      // Thêm data rows
      data.forEach((row, rowIndex) => {
        const dataRow = worksheet.addRow(
          columns.map(col => formatCellValue(row[col.key], col.key))
        );
        dataRow.height = 20;
        
        // Style data row với zebra striping
        const isEvenRow = rowIndex % 2 === 0;
        dataRow.eachCell((cell, colNumber) => {
          styleDataCell(cell, isEvenRow);
          
          // Format số tiền
          const column = columns[colNumber - 1];
          if (column && typeof row[column.key] === 'number' && 
              (column.key.toLowerCase().includes('price') || 
               column.key.toLowerCase().includes('revenue') || 
               column.key.toLowerCase().includes('total') || 
               column.key.toLowerCase().includes('spent') ||
               column.key.toLowerCase().includes('doanh'))) {
            cell.numFmt = '#,##0';
            cell.alignment = { ...cell.alignment, horizontal: 'right' };
          }
        });
      });

      // Auto-size columns
      columns.forEach((col, index) => {
        const column = worksheet.getColumn(index + 1);
        column.width = calculateColumnWidth(data, col.key, col.label);
      });

      // Freeze header row
      worksheet.views = [
        { state: 'frozen', ySplit: 1 }
      ];

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  },

  /**
   * Xuất nhiều sheets ra một file Excel với styling đẹp
   * @param {Array} sheets - Mảng các sheet [{ name: 'Sheet1', data: [], columns: [] }, ...]
   * @param {String} fileName - Tên file
   */
  exportMultipleSheets: async (sheets, fileName = 'export') => {
    try {
      const workbook = new ExcelJS.Workbook();

      sheets.forEach(sheet => {
        const worksheet = workbook.addWorksheet(sheet.name);

        // Tạo header row
        const headerRow = worksheet.addRow(sheet.columns.map(col => col.label));
        headerRow.height = 25;
        
        // Style header row
        headerRow.eachCell((cell) => {
          styleHeaderCell(cell);
        });

        // Thêm data rows
        sheet.data.forEach((row, rowIndex) => {
          const dataRow = worksheet.addRow(
            sheet.columns.map(col => formatCellValue(row[col.key], col.key))
          );
          dataRow.height = 20;
          
          // Style data row với zebra striping
          const isEvenRow = rowIndex % 2 === 0;
          dataRow.eachCell((cell, colNumber) => {
            styleDataCell(cell, isEvenRow);
            
            // Format số tiền
            const column = sheet.columns[colNumber - 1];
            if (column && typeof row[column.key] === 'number' && 
                (column.key.toLowerCase().includes('price') || 
                 column.key.toLowerCase().includes('revenue') || 
                 column.key.toLowerCase().includes('total') || 
                 column.key.toLowerCase().includes('spent') ||
                 column.key.toLowerCase().includes('doanh'))) {
              cell.numFmt = '#,##0';
              cell.alignment = { ...cell.alignment, horizontal: 'right' };
            }
          });
        });

        // Auto-size columns
        sheet.columns.forEach((col, index) => {
          const column = worksheet.getColumn(index + 1);
          column.width = calculateColumnWidth(sheet.data, col.key, col.label);
        });

        // Freeze header row
        worksheet.views = [
          { state: 'frozen', ySplit: 1 }
        ];
      });

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting multiple sheets to Excel:', error);
      throw error;
    }
  },

  /**
   * Xuất chart data ra Excel với styling đẹp
   * @param {Array} chartData - Dữ liệu chart
   * @param {Array} chartLabels - Nhãn cho chart
   * @param {String} fileName - Tên file
   * @param {String} chartTitle - Tên sheet
   */
  exportChartDataToExcel: async (chartData, chartLabels, fileName = 'chart-export', chartTitle = 'Chart Data') => {
    try {
      const data = chartLabels.map((label, index) => {
        const row = { 'Nhãn': label };
        if (Array.isArray(chartData)) {
          row['Giá trị'] = chartData[index] || 0;
        } else if (typeof chartData === 'object' && chartData !== null) {
          Object.keys(chartData).forEach(key => {
            row[key] = chartData[key][index] || 0;
          });
        }
        return row;
      });

      const columns = Object.keys(data[0] || {}).map(key => ({
        key: key,
        label: key
      }));

      return await excelExportService.exportTableToExcel(data, columns, fileName, chartTitle);
    } catch (error) {
      console.error('Error exporting chart data:', error);
      throw error;
    }
  },

  /**
   * Format số tiền cho Excel
   */
  formatCurrency: (value) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    }
    return value || '';
  },

  /**
   * Format ngày tháng cho Excel
   */
  formatDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  },

  /**
   * Xuất nhiều sheets với biểu đồ trực quan trong Excel
   * @param {Array} sheets - Mảng các sheet với chart metadata
   * @param {String} fileName - Tên file
   * 
   * Format sheet:
   * {
   *   name: 'Sheet name',
   *   data: [...],
   *   columns: [...],
   *   chartConfig: {
   *     type: 'bar' | 'line' | 'pie' | 'doughnut',
   *     title: 'Chart title',
   *     categoryColumn: 'columnKey',  // Cột làm trục X
   *     valueColumn: 'columnKey'       // Cột làm trục Y
   *   }
   * }
   */
  exportWithCharts: async (sheets, fileName = 'export-with-charts') => {
    try {
      const workbook = new ExcelJS.Workbook();

      sheets.forEach(sheet => {
        const worksheet = workbook.addWorksheet(sheet.name);

        // Tạo header row
        const headerRow = worksheet.addRow(sheet.columns.map(col => col.label));
        headerRow.height = 25;
        
        // Style header row
        headerRow.eachCell((cell) => {
          styleHeaderCell(cell);
        });

        // Thêm data rows
        sheet.data.forEach((row, rowIndex) => {
          const dataRow = worksheet.addRow(
            sheet.columns.map(col => formatCellValue(row[col.key], col.key))
          );
          dataRow.height = 20;
          
          // Style data row
          const isEvenRow = rowIndex % 2 === 0;
          dataRow.eachCell((cell, colNumber) => {
            styleDataCell(cell, isEvenRow);
            
            // Format số tiền
            const column = sheet.columns[colNumber - 1];
            if (column && typeof row[column.key] === 'number' && 
                (column.key.toLowerCase().includes('price') || 
                 column.key.toLowerCase().includes('revenue') || 
                 column.key.toLowerCase().includes('total') || 
                 column.key.toLowerCase().includes('spent') ||
                 column.key.toLowerCase().includes('doanh'))) {
              cell.numFmt = '#,##0';
              cell.alignment = { ...cell.alignment, horizontal: 'right' };
            }
          });
        });

        // Auto-size columns
        sheet.columns.forEach((col, index) => {
          const column = worksheet.getColumn(index + 1);
          column.width = calculateColumnWidth(sheet.data, col.key, col.label);
        });

        // Freeze header row
        worksheet.views = [
          { state: 'frozen', ySplit: 1 }
        ];

        // Thêm biểu đồ nếu có chartConfig
        if (sheet.chartConfig && sheet.data.length > 0) {
          const { type, title, categoryColumn, valueColumn } = sheet.chartConfig;
          
          // Tìm index của category và value column
          const categoryIndex = sheet.columns.findIndex(col => col.key === categoryColumn);
          const valueIndex = sheet.columns.findIndex(col => col.key === valueColumn);
          
          if (categoryIndex !== -1 && valueIndex !== -1) {
            const dataRowCount = sheet.data.length;
            const categoryColLetter = String.fromCharCode(65 + categoryIndex); // A, B, C...
            const valueColLetter = String.fromCharCode(65 + valueIndex);
            
            // Định nghĩa vị trí biểu đồ (bên phải bảng)
            const chartStartCol = sheet.columns.length + 2; // 2 cột spacing
            const chartStartRow = 2;
            
            // Placeholder for chart - will be added after all sheets are created
            // Store chart info for later processing
            if (!worksheet.chartInfo) worksheet.chartInfo = [];
            worksheet.chartInfo.push({
              type,
              title,
              categoryColumn,
              valueColumn,
              data: sheet.data,
              chartStartCol,
              chartStartRow
            });
          }
        }
      });

      // Thêm charts sau khi tất cả sheets đã được tạo
      for (const worksheet of workbook.worksheets) {
        if (worksheet.chartInfo && worksheet.chartInfo.length > 0) {
          for (const chartInfo of worksheet.chartInfo) {
            try {
              const { type, title, categoryColumn, valueColumn, data, chartStartCol, chartStartRow } = chartInfo;
              
              const base64Image = await excelExportService._generateChartImage(
                data, 
                categoryColumn, 
                valueColumn, 
                type,
                title
              );

              const imageId = workbook.addImage({
                base64: base64Image,
                extension: 'png',
              });

              const width = (type === 'pie' || type === 'doughnut') ? 400 : 500;
              const height = 300;

              worksheet.addImage(imageId, {
                tl: { col: chartStartCol, row: chartStartRow },
                ext: { width, height }
              });
            } catch (chartError) {
              console.warn('Could not add chart to sheet:', worksheet.name, chartError);
            }
          }
        }
      }

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting with charts to Excel:', error);
      throw error;
    }
  },

  /**
   * Helper: Generate chart image từ Chart.js
   * @private
   */
  _generateChartImage: async (data, categoryKey, valueKey, chartType, title) => {
    return new Promise((resolve, reject) => {
      try {
        // Tạo canvas tạm
        const canvas = document.createElement('canvas');
        canvas.width = chartType === 'pie' || chartType === 'doughnut' ? 400 : 500;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        // Import Chart.js dynamically
        import('chart.js/auto').then(({ Chart }) => {
          const labels = data.map(row => row[categoryKey]);
          const values = data.map(row => row[valueKey]);

          // Màu cho biểu đồ - khớp với dashboard
          const completionColors = {
            'Hoàn thành': 'rgba(75, 192, 192, 0.8)',    // Xanh lá
            'Đã hủy': 'rgba(255, 99, 132, 0.8)',        // Đỏ
            'Chờ xác nhận': 'rgba(255, 159, 64, 0.8)',  // Cam
            'Đã xác nhận': 'rgba(54, 162, 235, 0.8)'    // Xanh dương
          };

          // Màu mặc định cho các biểu đồ khác
          const defaultColors = [
            'rgba(54, 162, 235, 0.8)',   // Xanh dương
            'rgba(255, 99, 132, 0.8)',   // Đỏ
            'rgba(255, 206, 86, 0.8)',   // Vàng
            'rgba(75, 192, 192, 0.8)',   // Xanh lá
            'rgba(153, 102, 255, 0.8)',  // Tím
            'rgba(255, 159, 64, 0.8)',   // Cam
            'rgba(199, 199, 199, 0.8)',  // Xám
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)',
            'rgba(99, 255, 132, 0.8)',
          ];

          // Xác định màu sắc dựa vào labels
          let backgroundColors;
          let borderColors;
          
          if (chartType === 'pie' || chartType === 'doughnut') {
            // Kiểm tra nếu là biểu đồ completion stats
            const isCompletionChart = labels.every(label => 
              ['Hoàn thành', 'Đã hủy', 'Chờ xác nhận', 'Đã xác nhận'].includes(label)
            );
            
            if (isCompletionChart) {
              backgroundColors = labels.map(label => completionColors[label] || defaultColors[0]);
              borderColors = backgroundColors.map(c => c.replace('0.8', '1'));
            } else {
              backgroundColors = defaultColors.slice(0, labels.length);
              borderColors = backgroundColors.map(c => c.replace('0.8', '1'));
            }
          } else {
            backgroundColors = 'rgba(54, 162, 235, 0.8)';
            borderColors = 'rgba(54, 162, 235, 1)';
          }

          const chartConfig = {
            type: chartType === 'doughnut' ? 'doughnut' : chartType,
            data: {
              labels: labels,
              datasets: [{
                label: title || 'Dữ liệu',
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
              }]
            },
            options: {
              responsive: false,
              animation: false,
              plugins: {
                title: {
                  display: !!title,
                  text: title || '',
                  font: { size: 16, weight: 'bold' }
                },
                legend: {
                  display: chartType === 'pie' || chartType === 'doughnut',
                  position: 'right'
                }
              },
              scales: chartType === 'pie' || chartType === 'doughnut' ? {} : {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return new Intl.NumberFormat('vi-VN').format(value);
                    }
                  }
                }
              }
            }
          };

          const chart = new Chart(ctx, chartConfig);

          // Đợi chart render xong
          setTimeout(() => {
            const base64 = canvas.toDataURL('image/png').split(',')[1];
            chart.destroy();
            resolve(base64);
          }, 500);
        }).catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }
};

export default excelExportService;
