// Dialog modes
export const APPOINTMENT_DIALOG_MODES = {
  VIEW: 'view',
  EDIT: 'edit',
  CREATE: 'create'
};

// Status filter options for tabs
export const APPOINTMENT_STATUS_FILTERS = {
  ALL: 'all',
  PENDING: '0',
  CONFIRMED: '1', 
  COMPLETED: '2',
  CANCELLED: '3'
};

// Status filter labels
export const APPOINTMENT_STATUS_FILTER_LABELS = {
  [APPOINTMENT_STATUS_FILTERS.ALL]: 'Tất cả',
  [APPOINTMENT_STATUS_FILTERS.PENDING]: 'Chờ xác nhận',
  [APPOINTMENT_STATUS_FILTERS.CONFIRMED]: 'Đã xác nhận',
  [APPOINTMENT_STATUS_FILTERS.COMPLETED]: 'Hoàn thành',
  [APPOINTMENT_STATUS_FILTERS.CANCELLED]: 'Đã hủy'
};

// Form initial state
export const APPOINTMENT_INITIAL_FORM_DATA = {
  petId: '',
  serviceId: '',
  doctorId: '',
  appointmentDate: '',
  appointmentTime: '',
  weight: '',
  age: '',
  isNewPet: false,
  notes: '',
  status: 0
};

// Common time slots
export const APPOINTMENT_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

// Search placeholder text
export const APPOINTMENT_SEARCH_PLACEHOLDER = 'Tìm kiếm theo tên thú cưng, chủ sở hữu, dịch vụ...';

// Table configuration
export const APPOINTMENT_TABLE_MIN_WIDTHS = {
  ID: 70,
  PET_NAME: 120,
  CUSTOMER_NAME: 150,
  DOCTOR_NAME: 150,
  SERVICE_NAME: 150,
  DATE: 120,
  TIME: 100,
  STATUS: 180,
  NOTES: 200
};

// Error messages
export const APPOINTMENT_ERROR_MESSAGES = {
  FETCH_FAILED: 'Đã xảy ra lỗi nghiêm trọng khi tải dữ liệu. Vui lòng thử lại.',
  SEARCH_FAILED: 'Không thể tìm kiếm lịch hẹn. Vui lòng thử lại.',
  CREATE_FAILED: 'Không thể tạo lịch hẹn. Vui lòng thử lại.',
  UPDATE_FAILED: 'Không thể cập nhật lịch hẹn. Vui lòng thử lại.',
  DELETE_FAILED: 'Không thể xóa lịch hẹn. Vui lòng thử lại.',
  STATUS_UPDATE_FAILED: 'Không thể cập nhật trạng thái. Vui lòng thử lại.'
};

// Success messages
export const APPOINTMENT_SUCCESS_MESSAGES = {
  CREATE_SUCCESS: 'Đã tạo lịch hẹn thành công!',
  UPDATE_SUCCESS: 'Đã cập nhật lịch hẹn thành công!',
  DELETE_SUCCESS: 'Đã xóa lịch hẹn thành công!',
  STATUS_UPDATE_SUCCESS: 'Đã cập nhật trạng thái thành công!'
}; 