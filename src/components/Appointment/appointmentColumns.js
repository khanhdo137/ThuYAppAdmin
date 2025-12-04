import React from 'react';
import { APPOINTMENT_TABLE_MIN_WIDTHS } from './appointmentConstants';
import {
    formatAppointmentDate,
    formatAppointmentTime,
    getCustomerName,
    getDoctorName,
    getPetName,
    getServiceName
} from './appointmentUtils';
import StatusSelector from './StatusSelector';

/**
 * Get appointment table columns configuration
 */
export const getAppointmentTableColumns = ({
  pets,
  services,
  customers,
  doctors,
  onStatusUpdate
}) => [
  {
    field: 'appointmentId',
    label: 'ID',
    minWidth: APPOINTMENT_TABLE_MIN_WIDTHS.ID,
    render: (row) => row.AppointmentId || row.appointmentId
  },
  {
    field: 'petName',
    label: 'Thú cưng',
    minWidth: APPOINTMENT_TABLE_MIN_WIDTHS.PET_NAME,
    render: (row) => row.PetName || row.petName || getPetName(row.PetId || row.petId, pets)
  },
  {
    field: 'customerName',
    label: 'Chủ sở hữu',
    minWidth: APPOINTMENT_TABLE_MIN_WIDTHS.CUSTOMER_NAME,
    render: (row) => row.CustomerName || row.customerName || getCustomerName(row.PetId || row.petId, pets, customers)
  },
  {
    field: 'doctorName',
    label: 'Bác sĩ',
    minWidth: APPOINTMENT_TABLE_MIN_WIDTHS.DOCTOR_NAME,
    render: (row) => row.DoctorName || row.doctorName || getDoctorName(row.DoctorId || row.doctorId, doctors)
  },
  {
    field: 'serviceName',
    label: 'Dịch vụ',
    minWidth: APPOINTMENT_TABLE_MIN_WIDTHS.SERVICE_NAME,
    render: (row) => row.ServiceName || row.serviceName || getServiceName(row.ServiceId || row.serviceId, services)
  },
  {
    field: 'appointmentDate',
    label: 'Ngày hẹn',
    minWidth: APPOINTMENT_TABLE_MIN_WIDTHS.DATE,
    render: (row) => {
      const date = row.AppointmentDate || row.appointmentDate;
      return formatAppointmentDate(date);
    }
  },
  {
    field: 'appointmentTime',
    label: 'Giờ hẹn',
    minWidth: APPOINTMENT_TABLE_MIN_WIDTHS.TIME,
    render: (row) => {
      const time = row.AppointmentTime || row.appointmentTime;
      return formatAppointmentTime(time);
    }
  },
  {
    field: 'status',
    label: 'Trạng thái',
    minWidth: APPOINTMENT_TABLE_MIN_WIDTHS.STATUS,
    render: (row) => {
      // Tạo object appointmentData đầy đủ để truyền cho StatusSelector
      const appointmentData = {
        AppointmentId: row.AppointmentId || row.appointmentId,
        PetId: row.PetId || row.petId,
        DoctorId: row.DoctorId || row.doctorId, // Thêm DoctorId
        ServiceId: row.ServiceId || row.serviceId, // Thêm ServiceId
        PetName: row.PetName || row.petName || getPetName(row.PetId || row.petId, pets),
        CustomerName: row.CustomerName || row.customerName || getCustomerName(row.PetId || row.petId, pets, customers),
        DoctorName: row.DoctorName || row.doctorName || getDoctorName(row.DoctorId || row.doctorId, doctors),
        ServiceName: row.ServiceName || row.serviceName || getServiceName(row.ServiceId || row.serviceId, services),
        Notes: row.Notes || row.notes,
        AppointmentDate: row.AppointmentDate || row.appointmentDate,
        AppointmentTime: row.AppointmentTime || row.appointmentTime
      };

      return (
        <StatusSelector
          appointmentId={row.AppointmentId || row.appointmentId}
          currentStatus={row.Status !== undefined ? row.Status : row.status}
          onStatusUpdate={onStatusUpdate}
          appointmentData={appointmentData}
        />
      );
    }
  },
  {
    field: 'createdAt',
    label: 'Giờ đặt',
    minWidth: APPOINTMENT_TABLE_MIN_WIDTHS.CREATED_AT || 150,
    render: (row) => {
      const createdAt = row.CreatedAt || row.createdAt;
      if (!createdAt) return 'N/A';
      
      try {
        const date = new Date(createdAt);
        const dateStr = date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return `${dateStr} ${timeStr}`;
      } catch (error) {
        return 'Invalid date';
      }
    }
  },
  {
    field: 'notes',
    label: 'Ghi chú',
    minWidth: APPOINTMENT_TABLE_MIN_WIDTHS.NOTES,
    render: (row) => (row.Notes || row.notes) || 'Không có'
  }
]; 