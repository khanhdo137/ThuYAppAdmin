import { 
  Add as AddIcon, 
  Refresh,
  LocalHospital,
  History,
  Description,
  MedicalServices,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Divider,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Pets as PetsIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  LocalHospital as TreatmentIcon,
  Notes as NotesIcon,
  MedicalServices as DoctorIcon
} from '@mui/icons-material';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DataTable, DeleteConfirmDialog, PageTemplate, SearchFilterBar } from '../components';
import { medicalHistoryService } from '../services/medicalHistoryService';
import petService from '../services/petService';
import { doctorService } from '../services';
import { useToast } from '../components/ToastProvider';
import excelExportService from '../services/excelExportService';

const MedicalHistoryPage = () => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'edit', 'create'
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [pets, setPets] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  
  // Excel Preview Dialog states
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewDateFilter, setPreviewDateFilter] = useState({ fromDate: '', toDate: '' });
  
  // Filter states
  const [dateFilter, setDateFilter] = useState({ fromDate: '', toDate: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    petId: '',
    doctorId: '',
    recordDate: '',
    description: '',
    treatment: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const toast = useToast();
  const searchTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const searchTermRef = useRef(searchTerm);

  // Load pets and doctors for dropdown
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load pets
        const petsResponse = await petService.getAllPets({ page: 1, limit: 1000 });
        if (petsResponse && petsResponse.pets) {
          setPets(petsResponse.pets);
        }
        
        // Load doctors
        const doctorsResponse = await doctorService.getAllDoctors();
        const doctorsData = doctorsResponse?.doctors || doctorsResponse || [];
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, []);

  // Fetch medical histories
  const fetchHistories = useCallback(async (overrides = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current values from state/ref, but allow overrides
      const currentSearchTerm = overrides.searchTerm !== undefined ? overrides.searchTerm : searchTermRef.current;
      const currentFromDate = overrides.fromDate !== undefined ? overrides.fromDate : dateFilter.fromDate;
      const currentToDate = overrides.toDate !== undefined ? overrides.toDate : dateFilter.toDate;
      
      const queryParams = {
        page: overrides.page !== undefined ? overrides.page : pagination.page,
        limit: overrides.limit !== undefined ? overrides.limit : pagination.limit,
        ...(currentSearchTerm ? { searchTerm: currentSearchTerm } : {}),
        ...(currentFromDate ? { fromDate: currentFromDate } : {}),
        ...(currentToDate ? { toDate: currentToDate } : {}),
      };
      
      console.log('Fetching with queryParams:', queryParams);
      
      const response = await medicalHistoryService.getAllMedicalHistories(queryParams);
      
      console.log('Medical History API Response:', response);
      
      // API trả về trực tiếp { histories: [...], pagination: {...} }
      if (response) {
        // Normalize histories: ensure a flat customerName field exists for table rendering
        const raw = response.histories || [];
        const normalizeOwner = (row) => {
          if (!row) return null;

          // Try explicit common shapes (both camelCase and PascalCase)
          const candidates = [
            // top-level
            row.customerName,
            row.CustomerName,
            row.ownerName,
            row.OwnerName,
            // direct customer object
            row.customer?.customerName,
            row.customer?.CustomerName,
            row.customer?.fullName,
            row.Customer?.customerName,
            row.Customer?.CustomerName,
            row.Customer?.fullName,
            // nested under pet
            row.pet?.customer?.customerName,
            row.pet?.customer?.CustomerName,
            row.pet?.Customer?.CustomerName,
            row.Pet?.Customer?.CustomerName,
            row.pet?.customerName,
            row.pet?.CustomerName,
            row.Pet?.CustomerName,
            row.pet?.Customer?.customerName,
            // fallback name fields
            row.customer?.name,
            row.Customer?.name,
            row.pet?.name,
            row.Pet?.Name,
          ];

          for (const v of candidates) {
            if (v) return v;
          }

          // Try to extract from nested owner/customer objects if present (cover other shapes)
          const ownerObj = row.pet?.customer || row.pet?.Customer || row.customer || row.Customer || row.owner || row.Owner || row.Pet?.Customer;
          if (ownerObj) {
            return ownerObj.customerName || ownerObj.CustomerName || ownerObj.fullName || ownerObj.name || ownerObj.Name || null;
          }

          return null;
        };

        const normalized = raw.map(r => ({ ...r, customerName: normalizeOwner(r) }));
        
        // Add petName, petId, doctorName for table and Excel export
        const withPetDoctor = normalized.map(h => ({
          ...h,
          petName: h.pet?.Name || h.pet?.name || h.Pet?.Name || '',
          petId: h.pet?.PetId || h.pet?.petId || h.PetId || h.petId || '',
          doctorName: h.Doctor?.FullName || h.Doctor?.fullName || h.doctor?.FullName || h.doctor?.fullName || h.doctor?.name || h.doctor?.Name || ''
        }));
        
        setHistories(withPetDoctor);
        console.log('MedicalHistory: with pet/doctor names:', withPetDoctor[0]);
        setPagination(prev => ({
          page: response.pagination?.page || prev.page,
          limit: response.pagination?.limit || prev.limit,
          // backend may return total or totalCount
          total: response.pagination?.total ?? response.pagination?.totalCount ?? response.totalCount ?? 0,
          totalPages: response.pagination?.totalPages ?? response.pagination?.total_pages ?? 1
        }));
      } else {
        setHistories([]);
      }
    } catch (err) {
      console.error('Error fetching medical histories:', err);
      setError('Không thể tải danh sách bệnh án. Vui lòng thử lại.');
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [dateFilter.fromDate, dateFilter.toDate, pagination.page, pagination.limit, toast]);

  // Sync searchTermRef với searchTerm state
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  // Initial load only
  useEffect(() => {
    // Initial load
    (async () => {
      await fetchHistories();
      // mark initial mount completed so pagination changes will trigger fetch
      isInitialMount.current = false;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  // Reload when pagination changes
  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      return;
    }
    fetchHistories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  // Reload when date filters change
  useEffect(() => {
    // Skip initial mount - handled by initial useEffect
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // When date filter changes, reset to page 1 and fetch
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [dateFilter.fromDate, dateFilter.toDate]);

  // Debounced search - chỉ update state, không gọi API ngay
  const handleSearch = useCallback((searchValue) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Update search term immediately for UI feedback (không gây re-fetch)
    setSearchTerm(searchValue);
    searchTermRef.current = searchValue; // Update ref để fetchHistories có thể đọc giá trị mới nhất
    
    // Debounce the API call - chỉ gọi sau khi user ngừng gõ 600ms
    searchTimeoutRef.current = setTimeout(() => {
      // Reset pagination và fetch với search term mới
      setPagination(prev => {
        const newPage = 1;
        // Gọi fetch với search term mới
        fetchHistories({ searchTerm: searchValue || '', page: newPage });
        return { ...prev, page: newPage };
      });
    }, 600);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistories();
    setRefreshing(false);
  }, [fetchHistories]);

  // Function để mở preview dialog
  const handleOpenPreview = useCallback(async () => {
    try {
      // Nếu đang lọc dữ liệu theo khoảng thời gian, lấy toàn bộ dữ liệu
      let exportData = histories;
      
      if (dateFilter.fromDate || dateFilter.toDate) {
        toast.showInfo('Đang tải toàn bộ dữ liệu bệnh án...');
        const response = await medicalHistoryService.getAllMedicalHistories({
          fromDate: dateFilter.fromDate,
          toDate: dateFilter.toDate,
          page: 1,
          limit: 10000 // Lấy nhiều dữ liệu
        });
        exportData = response.data || response.histories || [];
      }

      if (!exportData || exportData.length === 0) {
        toast.showError('Không có dữ liệu để xuất');
        return;
      }

      const columns = [
        { key: 'historyId', label: 'ID Bệnh Án' },
        { key: 'petId', label: 'ID Thú Cưng' },
        { key: 'petName', label: 'Thú Cưng' },
        { key: 'customerName', label: 'Chủ Sở Hữu' },
        { key: 'doctorName', label: 'Bác Sĩ' },
        { key: 'recordDate', label: 'Ngày Khám' },
        { key: 'description', label: 'Mô Tả' },
        { key: 'treatment', label: 'Điều Trị' },
        { key: 'notes', label: 'Ghi Chú' }
      ];

      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `BenhAn_${currentDate}`;

      setPreviewData(exportData); // exportData đã được filter từ API
      setPreviewColumns(columns);
      setPreviewFileName(fileName);
      setPreviewDateFilter({ fromDate: dateFilter.fromDate || '', toDate: dateFilter.toDate || '' }); // Copy filter từ page
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error('Error preparing preview:', error);
      toast.showError('Lỗi khi chuẩn bị dữ liệu: ' + (error.message || 'Unknown error'));
    }
  }, [histories, dateFilter, toast]);

  // Function để filter dữ liệu theo date range
  const filterDataByDateRange = useCallback((data) => {
    if (!previewDateFilter.fromDate && !previewDateFilter.toDate) {
      return data;
    }

    return data.filter(row => {
      const rowDate = row.recordDate || row.RecordDate || '';
      if (!rowDate) return false;

      const date = new Date(rowDate);
      const fromDate = previewDateFilter.fromDate ? new Date(previewDateFilter.fromDate) : null;
      const toDate = previewDateFilter.toDate ? new Date(previewDateFilter.toDate) : null;

      if (fromDate && date < fromDate) return false;
      if (toDate) {
        const toDateEnd = new Date(toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        if (date > toDateEnd) return false;
      }
      return true;
    });
  }, [previewDateFilter]);

  // Function để xuất Excel sau khi preview
  const handleConfirmExport = useCallback(async () => {
    try {
      const filteredData = filterDataByDateRange(previewData);
      await excelExportService.exportTableToExcel(filteredData, previewColumns, previewFileName, 'Bệnh án');
      toast.showSuccess('Xuất Excel thành công!');
      setPreviewDialogOpen(false);
    } catch (error) {
      console.error('Error exporting medical histories:', error);
      toast.showError('Lỗi khi xuất Excel: ' + (error.message || 'Unknown error'));
    }
  }, [previewData, previewColumns, previewFileName, filterDataByDateRange, toast]);

  // Dialog handlers
  const openDialog = async (mode, history = null) => {
    setDialogMode(mode);
    setSelectedHistory(history);
    
    if (mode === 'create') {
      setFormData({
        petId: '',
        doctorId: '',
        recordDate: new Date().toISOString().split('T')[0],
        description: '',
        treatment: '',
        notes: ''
      });
    } else if (history) {
      // Nếu có pet info từ API nhưng chưa có trong pets list, load thêm
      const petId = history.petId || history.PetId;
      if (petId && !pets.find(p => (p.petId || p.PetId) === parseInt(petId))) {
        try {
          const petDetail = await petService.getPetById(petId);
          if (petDetail) {
            setPets(prev => {
              // Kiểm tra xem pet đã tồn tại chưa
              if (!prev.find(p => (p.petId || p.PetId) === parseInt(petId))) {
                return [...prev, petService.normalizePetData(petDetail)];
              }
              return prev;
            });
          }
        } catch (err) {
          console.error('Error loading pet detail:', err);
        }
      }
      
      setFormData({
        petId: petId || '',
        doctorId: history.doctorId || history.DoctorId || '',
        recordDate: history.recordDate 
          ? new Date(history.recordDate).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        description: history.description || history.Description || '',
        treatment: history.treatment || history.Treatment || '',
        notes: history.notes || history.Notes || ''
      });
    }
    
    setFormErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedHistory(null);
    setFormData({
      petId: '',
      doctorId: '',
      recordDate: new Date().toISOString().split('T')[0],
      description: '',
      treatment: '',
      notes: ''
    });
    setFormErrors({});
  };

  // Form handlers
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.petId) errors.petId = 'Vui lòng chọn thú cưng';
    if (!formData.recordDate) errors.recordDate = 'Vui lòng chọn ngày khám';
    if (!formData.description || !formData.description.trim()) {
      errors.description = 'Vui lòng nhập mô tả bệnh án';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD operations
  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      const historyData = {
        petId: parseInt(formData.petId),
        recordDate: formData.recordDate,
        description: formData.description.trim(),
        treatment: formData.treatment?.trim() || null,
        notes: formData.notes?.trim() || null
      };
      
      await medicalHistoryService.createMedicalHistory(historyData);
      toast.success('Thêm bệnh án thành công!');
      closeDialog();
      await fetchHistories();
    } catch (err) {
      console.error('Error creating medical history:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi thêm bệnh án');
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    try {
      const historyId = selectedHistory.historyId || selectedHistory.HistoryId;
      const historyData = {
        petId: parseInt(formData.petId),
        doctorId: formData.doctorId ? parseInt(formData.doctorId) : null,
        recordDate: formData.recordDate,
        description: formData.description.trim(),
        treatment: formData.treatment?.trim() || null,
        notes: formData.notes?.trim() || null
      };
      
      await medicalHistoryService.updateMedicalHistory(historyId, historyData);
      toast.success('Cập nhật bệnh án thành công!');
      closeDialog();
      await fetchHistories();
    } catch (err) {
      console.error('Error updating medical history:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật bệnh án');
    }
  };

  const handleDeleteClick = (history) => {
    setHistoryToDelete(history);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!historyToDelete) return;
    
    try {
      const historyId = historyToDelete.historyId || historyToDelete.HistoryId;
      await medicalHistoryService.deleteMedicalHistory(historyId);
      toast.success('Xóa bệnh án thành công!');
      setDeleteDialogOpen(false);
      setHistoryToDelete(null);
      await fetchHistories();
    } catch (err) {
      console.error('Error deleting medical history:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi xóa bệnh án');
    }
  };

  // Pagination handlers
  const handlePageChange = (pageOrEvent, maybeNewPage) => {
    // Support two calling conventions:
    // - DataTable => onPageChange(pageNumber) where pageNumber is 1-based
    // - MUI TablePagination => onPageChange(event, newPage) where newPage is 0-based
    let newPage;
    if (typeof pageOrEvent === 'number') {
      newPage = pageOrEvent;
    } else if (typeof maybeNewPage === 'number') {
      // received (event, newPage) -> convert 0-based to 1-based
      newPage = maybeNewPage + 1;
    } else {
      // Fallback: keep current page
      newPage = pagination.page || 1;
    }

    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event) => {
    setPagination(prev => ({ ...prev, limit: parseInt(event.target.value), page: 1 }));
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = histories.length;
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthCount = histories.filter(h => {
      const date = new Date(h.recordDate || h.RecordDate);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }).length;
    
    return {
      total,
      thisMonth: thisMonthCount
    };
  }, [histories]);

  // Table columns
  const columns = useMemo(() => [
    {
      label: 'ID',
      field: 'historyId',
      render: (row) => row.historyId || row.HistoryId || 'N/A',
      align: 'center',
      width: '80px'
    },
    {
      label: 'Thú cưng',
      field: 'pet',
      render: (row) => {
        const petName = row.pet?.Name || row.pet?.name || row.Pet?.Name || 'N/A';
        return petName;
      }
    },
    {
      label: 'Bác sĩ',
      field: 'doctor',
      render: (row) => {
        // Try multiple shapes: nested Doctor object, doctorName fields, or lookup from doctors list
        const candidate = row.doctor?.fullName || row.Doctor?.FullName || row.doctorName || row.DoctorName || row.doctor?.name || row.Doctor?.name || row.doctor?.full_name || null;
        if (candidate) return candidate;

        // Fallback: try to find by id in loaded doctors state
        const docId = row.doctorId || row.DoctorId || row.Doctor?.DoctorId || row.doctor?.DoctorId || row.Doctor?.doctorId || row.doctor?.doctorId || null;
        if (docId && Array.isArray(doctors) && doctors.length > 0) {
          const found = doctors.find(d => (d.doctorId || d.DoctorId) === parseInt(docId));
          if (found) return found.fullName || found.FullName || found.name || found.Name || 'N/A';
        }

        return 'N/A';
      }
    },
    {
      label: 'Chủ sở hữu',
      field: 'customer',
      render: (row) => {
        // Robust owner lookup: try several common shapes returned by API and nested objects
        if (!row) return 'N/A';

        const ownerCandidates = [
          row.customerName,
          row.CustomerName,
          row.ownerName,
          row.OwnerName,
          row.customer?.name,
          row.customer?.fullName,
          row.customer?.CustomerName,
          row.Customer?.fullName,
          row.owner?.name,
          row.owner?.fullName,
          row.pet?.customerName,
          row.pet?.Customer?.CustomerName,
          row.Pet?.Customer?.CustomerName,
          row.Pet?.CustomerName,
          row.pet?.CustomerName,
          // some APIs return nested objects
          row.pet?.customer?.name,
          row.pet?.customer?.fullName,
          row.pet?.Customer?.CustomerName,
        ];

        for (const v of ownerCandidates) {
          if (v) return v;
        }

        // Try to extract from nested owner/customer objects if present
        const ownerObj = row.pet?.customer || row.pet?.Customer || row.customer || row.Customer || row.owner || row.Owner || row.Pet?.Customer;
        if (ownerObj) {
          const name = ownerObj.fullName || ownerObj.CustomerName || ownerObj.name || ownerObj.Name || (ownerObj.firstName && ownerObj.lastName ? `${ownerObj.firstName} ${ownerObj.lastName}` : null);
          if (name) return name;
        }

        return 'N/A';
      }
    },
    {
      label: 'Ngày khám',
      field: 'recordDate',
      render: (row) => {
        const date = row.recordDate || row.RecordDate;
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    {
      label: 'Mô tả',
      field: 'description',
      render: (row) => {
        const desc = row.description || row.Description || '';
        return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc || 'N/A';
      }
    }
  ], []);

  if (loading && histories.length === 0) {
    return (
      <PageTemplate title="Quản lý bệnh án" subtitle="Quản lý hồ sơ bệnh án của thú cưng">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Quản lý bệnh án" subtitle="Quản lý hồ sơ bệnh án của thú cưng">
      <Fade in={true} timeout={600}>
        <Box>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
              }} 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Statistics Cards */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  flex: 1, 
                  minWidth: '200px',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    borderRadius: 2, 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <History sx={{ fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="600">
                      {pagination.total}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng số hồ sơ
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  flex: 1, 
                  minWidth: '200px',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    borderRadius: 2, 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <LocalHospital sx={{ fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="600">
                      {stats.thisMonth}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tháng này
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Search and Filter Bar */}
          <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <SearchFilterBar
                  placeholder="Tìm kiếm theo tên thú cưng, chủ sở hữu, mô tả..."
                  searchValue={searchTerm}
                  onSearchChange={handleSearch}
                />
              </Box>
              
              <TextField
                label="Từ ngày"
                type="date"
                value={dateFilter.fromDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setDateFilter(prev => ({ ...prev, fromDate: newDate }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
                size="small"
              />

              <TextField
                label="Đến ngày"
                type="date"
                value={dateFilter.toDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setDateFilter(prev => ({ ...prev, toDate: newDate }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
                size="small"
              />

              {(dateFilter.fromDate || dateFilter.toDate) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setDateFilter({ fromDate: '', toDate: '' });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}

              <Tooltip title="Xuất Excel">
                <IconButton 
                  onClick={handleOpenPreview}
                  disabled={histories.length === 0}
                  sx={{
                    color: '#667eea',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Làm mới">
                <IconButton onClick={handleRefresh} disabled={refreshing}>
                  <Refresh />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openDialog('create')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #556ee6 0%, #654b92 100%)'
                  }
                }}
              >
                Thêm mới
              </Button>
            </Box>
          </Paper>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={histories}
            onView={(row) => openDialog('view', row)}
            onEdit={(row) => openDialog('edit', row)}
            onDelete={handleDeleteClick}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            loading={loading}
            emptyMessage="Chưa có bệnh án nào"
          />

          {/* Create/Edit Dialog */}
          <Dialog 
            open={dialogOpen} 
            onClose={closeDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
              }
            }}
          >
            <DialogTitle
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                py: 2.5,
                fontSize: '1.5rem',
                fontWeight: 600
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History sx={{ fontSize: 28 }} />
                {dialogMode === 'create' ? 'Thêm bệnh án mới' : 
                 dialogMode === 'edit' ? 'Chỉnh sửa bệnh án' : 
                 'Chi tiết bệnh án'}
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3, pb: 2, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { bgcolor: '#f5f5f5' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: '4px', '&:hover': { bgcolor: '#999' } } }}>
              <Grid container spacing={2.5}>
                {/* Section 1: Thông tin cơ bản */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: 'rgba(102, 126, 234, 0.03)', borderColor: 'rgba(102, 126, 234, 0.2)', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#667eea', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PetsIcon sx={{ fontSize: 22 }} />
                        Thông tin cơ bản
                      </Typography>
                      <Grid container spacing={2.5}>
                        {/* Thú cưng */}
                        <Grid item xs={12}>
                          <Autocomplete
                            options={(() => {
                              // Thêm pet từ selectedHistory vào options nếu chưa có
                              if (selectedHistory?.pet || selectedHistory?.Pet) {
                                const petFromHistory = selectedHistory.pet || selectedHistory.Pet;
                                const petIdFromHistory = petFromHistory.PetId || petFromHistory.petId;
                                
                                if (petIdFromHistory && !pets.find(p => (p.petId || p.PetId) === parseInt(petIdFromHistory))) {
                                  return [...pets, {
                                    petId: petIdFromHistory,
                                    PetId: petIdFromHistory,
                                    name: petFromHistory.Name || petFromHistory.name || 'Chưa có tên',
                                    Name: petFromHistory.Name || petFromHistory.name || 'Chưa có tên',
                                    customerName: petFromHistory.Customer?.CustomerName || petFromHistory.CustomerName || '',
                                    CustomerName: petFromHistory.Customer?.CustomerName || petFromHistory.CustomerName || ''
                                  }];
                                }
                              }
                              return pets;
                            })()}
                            getOptionLabel={(pet) => {
                              const petName = pet.name || pet.Name || 'Chưa có tên';
                              const customerName = pet.customerName || pet.CustomerName || pet.Customer?.CustomerName || '';
                              return customerName ? `${petName} - ${customerName}` : petName;
                            }}
                            value={
                              (() => {
                                if (!formData.petId) return null;
                                const petIdNum = parseInt(formData.petId);
                                
                                // Tìm trong pets list trước
                                let foundPet = pets.find(p => (p.petId || p.PetId) === petIdNum);
                                if (foundPet) return foundPet;
                                
                                // Nếu không tìm thấy, thử lấy từ selectedHistory
                                if (selectedHistory?.pet || selectedHistory?.Pet) {
                                  const petFromHistory = selectedHistory.pet || selectedHistory.Pet;
                                  const petName = petFromHistory.Name || petFromHistory.name || 'Chưa có tên';
                                  const customerName = petFromHistory.Customer?.CustomerName || petFromHistory.CustomerName || '';
                                  
                                  // Tạo object tạm để hiển thị
                                  return {
                                    petId: petIdNum,
                                    PetId: petIdNum,
                                    name: petName,
                                    Name: petName,
                                    customerName: customerName,
                                    CustomerName: customerName
                                  };
                                }
                                return null;
                              })()
                            }
                            onChange={(event, newValue) => {
                              handleFormChange('petId', newValue ? (newValue.petId || newValue.PetId) : '');
                            }}
                            disabled={dialogMode === 'view'}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Thú cưng"
                                placeholder="Tìm kiếm thú cưng..."
                                error={!!formErrors.petId}
                                helperText={formErrors.petId || 'Gõ để tìm kiếm hoặc chọn từ danh sách'}
                                required
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: dialogMode === 'view' ? 'action.disabledBackground' : 'background.paper',
                                    '&:hover': {
                                      bgcolor: dialogMode === 'view' ? 'action.disabledBackground' : 'background.paper'
                                    }
                                  }
                                }}
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <PetsIcon sx={{ mr: 1.5, color: '#667eea', fontSize: 22 }} />
                                      {params.InputProps.startAdornment}
                                    </>
                                  )
                                }}
                              />
                            )}
                            renderOption={(props, pet) => {
                              const petName = pet.name || pet.Name || 'Chưa có tên';
                              const customerName = pet.customerName || pet.CustomerName || pet.Customer?.CustomerName || '';
                              return (
                                <Box component="li" {...props} key={pet.petId || pet.PetId} sx={{ py: 1.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                    <Box sx={{ 
                                      bgcolor: '#e3f2fd', 
                                      p: 1, 
                                      borderRadius: 1.5, 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center' 
                                    }}>
                                      <PetsIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body1" fontWeight="600">
                                        {petName}
                                      </Typography>
                                      {customerName && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                          Chủ: {customerName}
                                        </Typography>
                                      )}
                                    </Box>
                                    {(pet.species || pet.Species) && (
                                      <Chip 
                                        label={pet.species || pet.Species} 
                                        size="small" 
                                        sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              );
                            }}
                          />
                        </Grid>

                        {/* Bác sĩ và Ngày khám */}
                        <Grid item xs={12} sm={6}>
                          <Autocomplete
                            options={doctors}
                            getOptionLabel={(doctor) => {
                              return doctor.fullName || doctor.FullName || doctor.name || doctor.Name || 'Chưa có tên';
                            }}
                            value={
                              (() => {
                                if (!formData.doctorId) return null;
                                // Tìm trong doctors list
                                const foundDoctor = doctors.find(d => (d.doctorId || d.DoctorId) === parseInt(formData.doctorId));
                                if (foundDoctor) return foundDoctor;
                                
                                // Nếu không tìm thấy nhưng có selectedHistory với Doctor object (nếu API trả về)
                                if (selectedHistory?.doctor || selectedHistory?.Doctor) {
                                  const doctorFromHistory = selectedHistory.doctor || selectedHistory.Doctor;
                                  return {
                                    doctorId: doctorFromHistory.DoctorId || doctorFromHistory.doctorId || formData.doctorId,
                                    DoctorId: doctorFromHistory.DoctorId || doctorFromHistory.doctorId || formData.doctorId,
                                    fullName: doctorFromHistory.FullName || doctorFromHistory.fullName || doctorFromHistory.Name || 'Chưa có tên',
                                    FullName: doctorFromHistory.FullName || doctorFromHistory.fullName || doctorFromHistory.Name || 'Chưa có tên'
                                  };
                                }
                                return null;
                              })()
                            }
                            onChange={(event, newValue) => {
                              handleFormChange('doctorId', newValue ? (newValue.doctorId || newValue.DoctorId) : '');
                            }}
                            disabled={dialogMode === 'view'}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Bác sĩ"
                                placeholder="Tìm kiếm bác sĩ..."
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: dialogMode === 'view' ? 'action.disabledBackground' : 'background.paper',
                                    '&:hover': {
                                      bgcolor: dialogMode === 'view' ? 'action.disabledBackground' : 'background.paper'
                                    }
                                  }
                                }}
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <DoctorIcon sx={{ mr: 1.5, color: '#9c27b0', fontSize: 22 }} />
                                      {params.InputProps.startAdornment}
                                    </>
                                  )
                                }}
                              />
                            )}
                            renderOption={(props, doctor) => {
                              const doctorName = doctor.fullName || doctor.FullName || doctor.name || doctor.Name || 'Chưa có tên';
                              const specialization = doctor.specialization || doctor.Specialization || '';
                              return (
                                <Box component="li" {...props} key={doctor.doctorId || doctor.DoctorId} sx={{ py: 1.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                    <Box sx={{ 
                                      bgcolor: '#f3e5f5', 
                                      p: 1, 
                                      borderRadius: 1.5, 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center' 
                                    }}>
                                      <DoctorIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body1" fontWeight="600">
                                        {doctorName}
                                      </Typography>
                                      {specialization && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                          {specialization}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                              );
                            }}
                          />
                        </Grid>

                        {/* Ngày khám */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Ngày khám"
                            type="date"
                            value={formData.recordDate}
                            onChange={(e) => handleFormChange('recordDate', e.target.value)}
                            error={!!formErrors.recordDate}
                            helperText={formErrors.recordDate}
                            disabled={dialogMode === 'view'}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: dialogMode === 'view' ? 'action.disabledBackground' : 'background.paper',
                                '&:hover': {
                                  bgcolor: dialogMode === 'view' ? 'action.disabledBackground' : 'background.paper'
                                }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <CalendarIcon sx={{ mr: 1.5, color: '#ff9800', fontSize: 22 }} />
                              )
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Section 2: Chi tiết bệnh án */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: 'rgba(33, 150, 243, 0.03)', borderColor: 'rgba(33, 150, 243, 0.2)', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2196f3', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon sx={{ fontSize: 22 }} />
                        Mô tả bệnh án <Chip label="Bắt buộc" size="small" sx={{ ml: 1, height: 20, bgcolor: '#ffebee', color: '#c62828', fontSize: '0.7rem', fontWeight: 600 }} />
                      </Typography>
                      <TextField
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        error={!!formErrors.description}
                        helperText={formErrors.description || 'Nhập mô tả chi tiết về tình trạng bệnh của thú cưng'}
                        disabled={dialogMode === 'view'}
                        fullWidth
                        required
                        placeholder="Nhập mô tả về tình trạng bệnh, triệu chứng, chẩn đoán..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: dialogMode === 'view' ? 'action.disabledBackground' : 'background.paper',
                            '& fieldset': {
                              borderColor: formErrors.description ? 'error.main' : 'rgba(33, 150, 243, 0.3)'
                            },
                            '&:hover fieldset': {
                              borderColor: formErrors.description ? 'error.main' : 'rgba(33, 150, 243, 0.5)'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#2196f3',
                              borderWidth: 2
                            }
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Section 3: Điều trị và ghi chú */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: 'rgba(76, 175, 80, 0.03)', borderColor: 'rgba(76, 175, 80, 0.2)', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Box sx={{ 
                              bgcolor: '#e8f5e9', 
                              p: 0.75, 
                              borderRadius: 1.5, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              <TreatmentIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                            </Box>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#4caf50' }}>
                              Phương pháp điều trị
                            </Typography>
                          </Box>
                          <TextField
                            multiline
                            rows={4}
                            value={formData.treatment}
                            onChange={(e) => handleFormChange('treatment', e.target.value)}
                            disabled={dialogMode === 'view'}
                            fullWidth
                            placeholder="Nhập phương pháp điều trị, thuốc được kê, liều lượng..."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: dialogMode === 'view' ? 'action.disabledBackground' : 'background.paper',
                                '& fieldset': {
                                  borderColor: 'rgba(76, 175, 80, 0.3)'
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(76, 175, 80, 0.5)'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#4caf50',
                                  borderWidth: 2
                                }
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, mt: 2 }}>
                            <Box sx={{ 
                              bgcolor: '#fff3e0', 
                              p: 0.75, 
                              borderRadius: 1.5, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              <NotesIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                            </Box>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#ff9800' }}>
                              Ghi chú
                            </Typography>
                          </Box>
                          <TextField
                            multiline
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => handleFormChange('notes', e.target.value)}
                            disabled={dialogMode === 'view'}
                            fullWidth
                            placeholder="Nhập ghi chú thêm, lời dặn, tái khám..."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: dialogMode === 'view' ? 'action.disabledBackground' : 'background.paper',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 152, 0, 0.3)'
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 152, 0, 0.5)'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#ff9800',
                                  borderWidth: 2
                                }
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ 
              px: 3, 
              pb: 2.5, 
              pt: 2.5, 
              borderTop: '1px solid', 
              borderColor: 'divider',
              bgcolor: 'rgba(0,0,0,0.02)',
              gap: 1.5
            }}>
              <Button 
                onClick={closeDialog}
                sx={{ 
                  px: 3.5,
                  py: 1.25,
                  borderRadius: 2,
                  color: 'text.secondary',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'divider'
                  }
                }}
              >
                {dialogMode === 'view' ? 'Đóng' : 'Hủy'}
              </Button>
              {dialogMode !== 'view' && (
                <Button
                  variant="contained"
                  onClick={dialogMode === 'create' ? handleCreate : handleUpdate}
                  sx={{
                    px: 4,
                    py: 1.25,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #556ee6 0%, #654b92 100%)',
                      boxShadow: '0 6px 20px rgba(102,126,234,0.5)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {dialogMode === 'create' ? 'Thêm mới' : 'Cập nhật'}
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setHistoryToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Xác nhận xóa"
            message={`Bạn có chắc chắn muốn xóa bệnh án #${historyToDelete?.historyId || historyToDelete?.HistoryId || ''}?`}
          />
        </Box>
      </Fade>

      {/* Excel Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#2e7d32',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileDownloadIcon />
            <Typography variant="h6" component="span">
              Xem trước dữ liệu Excel
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Tên file: {previewFileName}.xlsx
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {/* Date Filter */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Lọc theo khoảng thời gian
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={previewDateFilter.fromDate}
                  onChange={(e) => setPreviewDateFilter(prev => ({ ...prev, fromDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={previewDateFilter.toDate}
                  onChange={(e) => setPreviewDateFilter(prev => ({ ...prev, toDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>

          {previewData.length > 0 && (
            <Box sx={{ p: 2, maxHeight: '60vh', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Bệnh án
                </Typography>
                <Chip 
                  label={`${filterDataByDateRange(previewData).length} / ${previewData.length} dòng`}
                  color="primary"
                  size="small"
                />
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {previewColumns.map((col, colIndex) => (
                        <TableCell 
                          key={colIndex}
                          sx={{ 
                            fontWeight: 600,
                            bgcolor: 'grey.100'
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filterDataByDateRange(previewData).slice(0, 50).map((row, rowIndex) => (
                      <TableRow key={rowIndex} hover>
                        {previewColumns.map((col, colIndex) => (
                          <TableCell key={colIndex}>
                            {row[col.key] !== null && row[col.key] !== undefined 
                              ? String(row[col.key]) 
                              : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {filterDataByDateRange(previewData).length > 50 && (
                      <TableRow>
                        <TableCell 
                          colSpan={previewColumns.length}
                          align="center"
                          sx={{ 
                            fontStyle: 'italic',
                            color: 'text.secondary',
                            py: 2
                          }}
                        >
                          ... và {filterDataByDateRange(previewData).length - 50} dòng khác
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                Hiển thị {Math.min(50, filterDataByDateRange(previewData).length)} / {filterDataByDateRange(previewData).length} dòng
                {previewDateFilter.fromDate || previewDateFilter.toDate ? ' (đã lọc)' : ''}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider />
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setPreviewDialogOpen(false)}
            variant="outlined"
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmExport}
            variant="contained"
            startIcon={<FileDownloadIcon />}
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Tải file Excel
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
};

export default MedicalHistoryPage;

