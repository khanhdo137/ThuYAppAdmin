# Hướng Dẫn Sử Dụng API Medical History (Admin)

## Giới Thiệu

API Medical History cung cấp các endpoint để quản lý hồ sơ bệnh án của thú cưng trong hệ thống. Tài liệu này hướng dẫn cách tích hợp và sử dụng API với ReactJS cho phần Admin.

## Cài Đặt

### 1. Tạo Medical History Service

```javascript
// src/services/medicalHistoryService.js
import apiService from './apiService';

class MedicalHistoryService {
  // Lấy danh sách hồ sơ bệnh án của một thú cưng
  async getMedicalHistory(petId, page = 1, limit = 10) {
    try {
      const response = await apiService.get(`Pet/admin/${petId}/medical-history?page=${page}&limit=${limit}`);
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error getting medical history:', error);
      throw error;
    }
  }

  // Thêm mới hồ sơ bệnh án
  async createMedicalHistory(petId, data) {
    try {
      const response = await apiService.post(`Pet/admin/${petId}/medical-history`, data);
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error creating medical history:', error);
      throw error;
    }
  }

  // Cập nhật hồ sơ bệnh án
  async updateMedicalHistory(historyId, data) {
    try {
      const response = await apiService.put(`Pet/admin/medical-history/${historyId}`, data);
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error updating medical history:', error);
      throw error;
    }
  }

  // Xóa hồ sơ bệnh án
  async deleteMedicalHistory(historyId) {
    try {
      const response = await apiService.delete(`Pet/admin/medical-history/${historyId}`);
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error deleting medical history:', error);
      throw error;
    }
  }

  // Tìm kiếm hồ sơ bệnh án
  async searchMedicalHistory(params) {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.searchTerm && { searchTerm: params.searchTerm }),
        ...(params.fromDate && { fromDate: params.fromDate }),
        ...(params.toDate && { toDate: params.toDate }),
        ...(params.petId && { petId: params.petId })
      }).toString();

      const response = await apiService.get(`Pet/admin/medical-history/search?${queryString}`);
      return await apiService.handleResponse(response);
    } catch (error) {
      console.error('Error searching medical history:', error);
      throw error;
    }
  }
}

export default new MedicalHistoryService();
```

### 2. Tạo Custom Hook

```javascript
// src/hooks/useMedicalHistory.js
import { useState, useCallback } from 'react';
import medicalHistoryService from '../services/medicalHistoryService';
import { useToast } from '../components/ToastProvider';

export const useMedicalHistory = (petId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicalHistories, setMedicalHistories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { showToast } = useToast();

  // Lấy danh sách
  const fetchMedicalHistories = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await medicalHistoryService.getMedicalHistory(petId, page, pagination.limit);
      setMedicalHistories(response.histories);
      setPagination({
        ...pagination,
        page: response.pagination.page,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
    } catch (error) {
      setError(error);
      showToast('error', 'Không thể tải hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  }, [petId, pagination.limit, showToast]);

  // Thêm mới
  const createMedicalHistory = async (data) => {
    try {
      setLoading(true);
      await medicalHistoryService.createMedicalHistory(petId, data);
      showToast('success', 'Thêm hồ sơ bệnh án thành công');
      await fetchMedicalHistories(1); // Refresh list
    } catch (error) {
      setError(error);
      showToast('error', 'Không thể thêm hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật
  const updateMedicalHistory = async (historyId, data) => {
    try {
      setLoading(true);
      await medicalHistoryService.updateMedicalHistory(historyId, data);
      showToast('success', 'Cập nhật hồ sơ bệnh án thành công');
      await fetchMedicalHistories(pagination.page); // Refresh current page
    } catch (error) {
      setError(error);
      showToast('error', 'Không thể cập nhật hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  // Xóa
  const deleteMedicalHistory = async (historyId) => {
    try {
      setLoading(true);
      await medicalHistoryService.deleteMedicalHistory(historyId);
      showToast('success', 'Xóa hồ sơ bệnh án thành công');
      await fetchMedicalHistories(pagination.page); // Refresh current page
    } catch (error) {
      setError(error);
      showToast('error', 'Không thể xóa hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm
  const searchMedicalHistories = async (searchParams) => {
    try {
      setLoading(true);
      const response = await medicalHistoryService.searchMedicalHistory(searchParams);
      setMedicalHistories(response.histories);
      setPagination({
        ...pagination,
        page: response.pagination.page,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
    } catch (error) {
      setError(error);
      showToast('error', 'Không thể tìm kiếm hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    medicalHistories,
    pagination,
    fetchMedicalHistories,
    createMedicalHistory,
    updateMedicalHistory,
    deleteMedicalHistory,
    searchMedicalHistories
  };
};
```

### 3. Sử Dụng Trong Component

```javascript
// src/components/MedicalHistory/MedicalHistoryTable.jsx
import React, { useEffect, useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, IconButton, Button, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useMedicalHistory } from '../../hooks/useMedicalHistory';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';
import { MedicalHistoryDialog } from './MedicalHistoryDialog';

export const MedicalHistoryTable = ({ petId }) => {
  const {
    loading,
    medicalHistories,
    pagination,
    fetchMedicalHistories,
    createMedicalHistory,
    updateMedicalHistory,
    deleteMedicalHistory
  } = useMedicalHistory(petId);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  useEffect(() => {
    fetchMedicalHistories(1);
  }, [fetchMedicalHistories]);

  const handleCreate = async (data) => {
    await createMedicalHistory(data);
    setOpenDialog(false);
  };

  const handleUpdate = async (data) => {
    await updateMedicalHistory(selectedHistory.historyId, data);
    setOpenDialog(false);
    setSelectedHistory(null);
  };

  const handleDelete = async () => {
    if (selectedHistory) {
      await deleteMedicalHistory(selectedHistory.historyId);
      setOpenDeleteDialog(false);
      setSelectedHistory(null);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
      >
        Thêm Hồ Sơ Bệnh Án
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ngày Ghi Nhận</TableCell>
              <TableCell>Mô Tả</TableCell>
              <TableCell>Điều Trị</TableCell>
              <TableCell>Ghi Chú</TableCell>
              <TableCell>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medicalHistories.map((history) => (
              <TableRow key={history.historyId}>
                <TableCell>{new Date(history.recordDate).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>{history.description}</TableCell>
                <TableCell>{history.treatment}</TableCell>
                <TableCell>{history.notes}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedHistory(history);
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedHistory(history);
                      setOpenDeleteDialog(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <MedicalHistoryDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedHistory(null);
        }}
        onSubmit={selectedHistory ? handleUpdate : handleCreate}
        initialData={selectedHistory}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setSelectedHistory(null);
        }}
        onConfirm={handleDelete}
        title="Xóa Hồ Sơ Bệnh Án"
        content="Bạn có chắc chắn muốn xóa hồ sơ bệnh án này không?"
      />
    </>
  );
};
```

```javascript
// src/components/MedicalHistory/MedicalHistoryDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { useForm } from 'react-hook-form';

export const MedicalHistoryDialog = ({ open, onClose, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: initialData || {
      recordDate: new Date().toISOString().split('T')[0],
      description: '',
      treatment: '',
      notes: ''
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? 'Cập Nhật Hồ Sơ Bệnh Án' : 'Thêm Hồ Sơ Bệnh Án'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Ngày Ghi Nhận"
            type="date"
            {...register('recordDate', { required: 'Vui lòng chọn ngày' })}
            error={!!errors.recordDate}
            helperText={errors.recordDate?.message}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Mô Tả"
            multiline
            rows={3}
            {...register('description', { required: 'Vui lòng nhập mô tả' })}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Điều Trị"
            multiline
            rows={3}
            {...register('treatment', { required: 'Vui lòng nhập phương pháp điều trị' })}
            error={!!errors.treatment}
            helperText={errors.treatment?.message}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Ghi Chú"
            multiline
            rows={2}
            {...register('notes')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Cập Nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
```

## Sử Dụng Component

```javascript
// src/pages/PetDetailPage.js
import React from 'react';
import { MedicalHistoryTable } from '../components/MedicalHistory/MedicalHistoryTable';

export const PetDetailPage = () => {
  const { petId } = useParams(); // Lấy petId từ URL

  return (
    <div>
      <h1>Chi Tiết Thú Cưng</h1>
      {/* Các thông tin khác của thú cưng */}
      
      <h2>Hồ Sơ Bệnh Án</h2>
      <MedicalHistoryTable petId={petId} />
    </div>
  );
};
```

## Tính Năng

1. **Xem Danh Sách**
   - Hiển thị danh sách hồ sơ bệnh án theo trang
   - Sắp xếp theo ngày ghi nhận mới nhất
   - Hiển thị thông tin chi tiết: ngày, mô tả, điều trị, ghi chú

2. **Thêm Mới**
   - Form nhập liệu với validation
   - Tự động cập nhật danh sách sau khi thêm
   - Thông báo kết quả thành công/thất bại

3. **Cập Nhật**
   - Form chỉnh sửa với dữ liệu hiện tại
   - Validation dữ liệu
   - Cập nhật danh sách sau khi sửa

4. **Xóa**
   - Dialog xác nhận trước khi xóa
   - Cập nhật danh sách sau khi xóa
   - Thông báo kết quả

5. **Tìm Kiếm**
   - Tìm theo từ khóa
   - Lọc theo khoảng thời gian
   - Lọc theo thú cưng

## Lưu Ý

1. **Quyền Truy Cập**
   - Chỉ admin mới có quyền truy cập các API này
   - Cần đảm bảo gửi token trong header của request

2. **Xử Lý Lỗi**
   - Hiển thị thông báo lỗi phù hợp
   - Log lỗi để debug
   - Xử lý các trường hợp mạng không ổn định

3. **Performance**
   - Sử dụng debounce cho tìm kiếm
   - Tối ưu số lượng request
   - Cache dữ liệu khi cần thiết

4. **UI/UX**
   - Hiển thị loading state
   - Disable các nút khi đang xử lý
   - Có thông báo phản hồi cho mọi thao tác

## Dependencies

```json
{
  "@mui/material": "^5.x.x",
  "@mui/icons-material": "^5.x.x",
  "react-hook-form": "^7.x.x",
  "date-fns": "^2.x.x"
}
```

## Cập Nhật

Khi có thay đổi về API hoặc thêm tính năng mới, cần cập nhật:
1. Service methods
2. Custom hook
3. Components
4. Documentation 