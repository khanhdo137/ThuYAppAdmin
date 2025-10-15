import { Box, MenuItem, TextField } from '@mui/material';
import React, { useRef, useState } from 'react';
import { ConfirmDialog, MedicalHistoryDialog } from '../';
import { appointmentService } from '../../services';
import medicalHistoryService from '../../services/medicalHistoryService';
import { useToast } from '../ToastProvider';
import {
  APPOINTMENT_STATUS_FILTER_LABELS
} from './appointmentConstants';
import { getStatusChip } from './appointmentUtils';

const StatusSelector = ({ appointmentId, currentStatus, onStatusUpdate, appointmentData }) => {
  const { showSuccess, showError } = useToast();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    newStatus: null,
    title: '',
    message: ''
  });
  const [medicalHistoryDialog, setMedicalHistoryDialog] = useState({
    open: false,
    appointmentData: null,
    existingMedicalHistory: null,
    isEdit: false
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingMedicalHistory, setIsSavingMedicalHistory] = useState(false);
  const [isLoadingMedicalHistory, setIsLoadingMedicalHistory] = useState(false);
  const lastUpdateRef = useRef(null);

  // Tải hồ sơ bệnh án hiện có của appointment
  const loadExistingMedicalHistory = async (petId, appointmentDate) => {
    try {
      setIsLoadingMedicalHistory(true);
      console.log('Loading medical history for:', { petId, appointmentDate });
      
      // Lấy danh sách hồ sơ bệnh án theo petId
      const response = await medicalHistoryService.getMedicalHistoriesByPetId(petId, {
        page: 1,
        limit: 50 // Lấy nhiều để tìm theo ngày
      });
      
      console.log('Medical history response:', response);
      
      const histories = response?.histories || [];
      console.log('Medical histories found:', histories);
      
      // Tìm hồ sơ bệnh án có ngày gần với ngày appointment
      const appointmentDateStr = new Date(appointmentDate).toDateString();
      console.log('Looking for appointment date:', appointmentDateStr);
      
      const existingHistory = histories.find(history => {
        const recordDate = history.recordDate || history.RecordDate;
        const historyDateStr = new Date(recordDate).toDateString();
        console.log('Comparing dates:', { historyDateStr, appointmentDateStr, recordDate });
        return historyDateStr === appointmentDateStr;
      });
      
      // Nếu không tìm thấy theo ngày chính xác, tìm hồ sơ mới nhất
      const resultHistory = existingHistory || (histories.length > 0 ? histories[0] : null);
      
      console.log('Found existing history:', resultHistory);
      return resultHistory;
      
    } catch (error) {
      console.error('Error loading existing medical history:', error);
      return null;
    } finally {
      setIsLoadingMedicalHistory(false);
    }
  };

  const handleStatusChange = async (event) => {
    const newStatus = parseInt(event.target.value);
    
    if (newStatus !== currentStatus && !isUpdating) {
      // Trường hợp 1: Chuyển sang trạng thái "Hoàn thành" (status = 2)
      if (newStatus === 2) {
        setConfirmDialog({
          open: true,
          newStatus,
          title: 'Xác nhận hoàn thành lịch hẹn',
          message: `Bạn có chắc chắn muốn đánh dấu lịch hẹn này là "Hoàn thành"? Sau đó bạn sẽ cần nhập thông tin hồ sơ bệnh án.`
        });
      }
      // Trường hợp 2: Từ trạng thái "Hoàn thành" chuyển sang trạng thái khác
      else if (currentStatus === 2) {
        if (newStatus === 3) {
          // Chuyển từ "Hoàn thành" sang "Hủy" → hỏi có muốn xóa hồ sơ bệnh án không
          setConfirmDialog({
            open: true,
            newStatus,
            title: 'Xác nhận hủy lịch hẹn',
            message: `Bạn có chắc chắn muốn chuyển lịch hẹn từ "Hoàn thành" sang "Đã hủy"? Hồ sơ bệnh án liên quan sẽ bị xóa.`
          });
        } else {
          // Chuyển từ "Hoàn thành" sang trạng thái khác → cho phép cập nhật hồ sơ bệnh án
          setConfirmDialog({
            open: true,
            newStatus,
            title: 'Xác nhận thay đổi trạng thái',
            message: `Bạn có chắc chắn muốn thay đổi trạng thái từ "Hoàn thành" sang "${APPOINTMENT_STATUS_FILTER_LABELS[newStatus.toString()]}"? Bạn sẽ có thể cập nhật hồ sơ bệnh án.`
          });
        }
      }
      // Trường hợp 3: Các thay đổi trạng thái bình thường khác
      else {
        setConfirmDialog({
          open: true,
          newStatus,
          title: 'Xác nhận thay đổi trạng thái',
          message: `Bạn có chắc chắn muốn thay đổi trạng thái từ "${APPOINTMENT_STATUS_FILTER_LABELS[currentStatus.toString()]}" thành "${APPOINTMENT_STATUS_FILTER_LABELS[newStatus.toString()]}"?`
        });
      }
    }
  };

  const handleConfirmStatusChange = async () => {
    // Prevent duplicate calls
    if (isUpdating) return;
    
    const updateKey = `${appointmentId}-${confirmDialog.newStatus}`;
    if (lastUpdateRef.current === updateKey) return;
    
    setIsUpdating(true);
    lastUpdateRef.current = updateKey;
    
    try {
      // Trường hợp 1: Chuyển sang trạng thái "Hoàn thành" → tạo mới hồ sơ bệnh án
      if (confirmDialog.newStatus === 2) {
        // Đóng confirm dialog và mở medical history dialog
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setMedicalHistoryDialog({
          open: true,
          appointmentData: appointmentData,
          existingMedicalHistory: null,
          isEdit: false
        });
        return; // Không cập nhật status ngay, đợi sau khi nhập xong medical history
      }
      // Trường hợp 2: Từ "Hoàn thành" chuyển sang "Hủy" → xóa hồ sơ bệnh án và cập nhật status
      else if (currentStatus === 2 && confirmDialog.newStatus === 3) {
        // Tìm và xóa hồ sơ bệnh án hiện có
        const existingHistory = await loadExistingMedicalHistory(
          appointmentData.PetId || appointmentData.petId,
          appointmentData.AppointmentDate || appointmentData.appointmentDate
        );
        
        if (existingHistory) {
          await medicalHistoryService.deleteMedicalHistory(existingHistory.HistoryId || existingHistory.historyId);
          showSuccess('Đã xóa hồ sơ bệnh án và cập nhật trạng thái thành công!');
        }
        
        // Cập nhật status appointment
        await onStatusUpdate(appointmentId, confirmDialog.newStatus);
      }
      // Trường hợp 3: Từ "Hoàn thành" chuyển sang trạng thái khác → cho phép chỉnh sửa hồ sơ bệnh án
      else if (currentStatus === 2) {
        // Load hồ sơ bệnh án hiện có
        const existingHistory = await loadExistingMedicalHistory(
          appointmentData.PetId || appointmentData.petId,
          appointmentData.AppointmentDate || appointmentData.appointmentDate
        );
        
        console.log('About to open MedicalHistoryDialog with:', {
          existingHistory,
          appointmentData,
          isEdit: true
        });
        
        // Đóng confirm dialog và mở medical history dialog với dữ liệu có sẵn
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setMedicalHistoryDialog({
          open: true,
          appointmentData: appointmentData,
          existingMedicalHistory: existingHistory,
          isEdit: true,
          targetStatus: confirmDialog.newStatus
        });
        return; // Không cập nhật status ngay, đợi sau khi cập nhật xong medical history
      }
      // Trường hợp 4: Cập nhật status bình thường cho các trạng thái khác
      else {
        await onStatusUpdate(appointmentId, confirmDialog.newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
      setConfirmDialog({
        open: false,
        newStatus: null,
        title: '',
        message: ''
      });
      // Clear the last update reference after a delay
      setTimeout(() => {
        lastUpdateRef.current = null;
      }, 1000);
    }
  };

  const handleSaveMedicalHistory = async (medicalHistoryData) => {
    setIsSavingMedicalHistory(true);
    
    try {
      const isEdit = medicalHistoryDialog.isEdit && medicalHistoryDialog.existingMedicalHistory;
      
      if (isEdit) {
        // Cập nhật hồ sơ bệnh án hiện có
        await medicalHistoryService.updateMedicalHistory(
          medicalHistoryDialog.existingMedicalHistory.HistoryId || medicalHistoryDialog.existingMedicalHistory.historyId,
          {
            petId: medicalHistoryData.petId,
            recordDate: medicalHistoryData.recordDate.toISOString(),
            description: medicalHistoryData.description,
            treatment: medicalHistoryData.treatment,
            notes: medicalHistoryData.notes
          }
        );
        
        // Cập nhật status appointment sau khi cập nhật hồ sơ bệnh án
        await onStatusUpdate(appointmentId, medicalHistoryDialog.targetStatus);
        
        showSuccess('Đã cập nhật hồ sơ bệnh án và trạng thái thành công!');
      } else {
        // Tạo hồ sơ bệnh án mới
        await medicalHistoryService.createMedicalHistory({
          petId: medicalHistoryData.petId,
          recordDate: medicalHistoryData.recordDate.toISOString(),
          description: medicalHistoryData.description,
          treatment: medicalHistoryData.treatment,
          notes: medicalHistoryData.notes
        });

        // Sau khi tạo thành công hồ sơ bệnh án, mới cập nhật status appointment
        await onStatusUpdate(appointmentId, 2); // Status = 2 (Hoàn thành)
        
        showSuccess('Đã hoàn thành lịch hẹn và tạo hồ sơ bệnh án thành công!');
      }
      
      // Đóng dialog
      setMedicalHistoryDialog({ 
        open: false, 
        appointmentData: null, 
        existingMedicalHistory: null, 
        isEdit: false 
      });
      
    } catch (error) {
      console.error('Error saving medical history:', error);
      showError('Có lỗi xảy ra khi lưu hồ sơ bệnh án. Vui lòng thử lại.');
    } finally {
      setIsSavingMedicalHistory(false);
      setIsUpdating(false);
      // Clear the last update reference
      setTimeout(() => {
        lastUpdateRef.current = null;
      }, 1000);
    }
  };

  const handleCancelStatusChange = () => {
    if (isUpdating) return;
    
    setConfirmDialog({
      open: false,
      newStatus: null,
      title: '',
      message: ''
    });
  };

  const handleCloseMedicalHistoryDialog = () => {
    setMedicalHistoryDialog({ 
      open: false, 
      appointmentData: null, 
      existingMedicalHistory: null, 
      isEdit: false 
    });
    setIsUpdating(false);
    // Clear the last update reference
    setTimeout(() => {
      lastUpdateRef.current = null;
    }, 1000);
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={1}>
        {getStatusChip(currentStatus)}
        <TextField
          select
          size="small"
          value={currentStatus}
          onChange={handleStatusChange}
          disabled={isUpdating || isSavingMedicalHistory || isLoadingMedicalHistory}
          sx={{ 
            minWidth: 120,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none'
              }
            }
          }}
        >
          {appointmentService.getStatusOptions().map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <ConfirmDialog
        open={confirmDialog.open && !isUpdating}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        confirmButtonProps={{
          disabled: isUpdating || isSavingMedicalHistory || isLoadingMedicalHistory
        }}
        cancelButtonProps={{
          disabled: isUpdating || isSavingMedicalHistory || isLoadingMedicalHistory
        }}
      />

      <MedicalHistoryDialog
        open={medicalHistoryDialog.open}
        onClose={handleCloseMedicalHistoryDialog}
        onSave={handleSaveMedicalHistory}
        appointmentData={medicalHistoryDialog.appointmentData}
        existingMedicalHistory={medicalHistoryDialog.existingMedicalHistory}
        isEdit={medicalHistoryDialog.isEdit}
        loading={isSavingMedicalHistory}
      />
    </>
  );
};

export default StatusSelector; 