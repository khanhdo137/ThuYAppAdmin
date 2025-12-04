// Dialog modes
export const DOCTOR_DIALOG_MODES = {
  VIEW: 'view',
  EDIT: 'edit',
  CREATE: 'create'
};

// Form initial state
export const DOCTOR_INITIAL_FORM_DATA = {
  fullName: '',
  specialization: '',
  experienceYears: '',
  branch: ''
};

// Search placeholder
export const DOCTOR_SEARCH_PLACEHOLDER = 'Tìm kiếm theo tên, chuyên khoa, chi nhánh...';

// Table configuration
export const DOCTOR_TABLE_MIN_WIDTHS = {
  AVATAR: 60,
  FULLNAME: 180,
  SPECIALIZATION: 150,
  EXPERIENCE: 120,
  BRANCH: 150,
  ACTIONS: 150
};

// Error messages
export const DOCTOR_ERROR_MESSAGES = {
  FETCH_FAILED: 'Không thể tải danh sách bác sĩ. Vui lòng thử lại.',
  SEARCH_FAILED: 'Không thể tìm kiếm bác sĩ. Vui lòng thử lại.',
  CREATE_FAILED: 'Không thể tạo bác sĩ mới. Vui lòng thử lại.',
  UPDATE_FAILED: 'Không thể cập nhật bác sĩ. Vui lòng thử lại.',
  DELETE_FAILED: 'Không thể xóa bác sĩ. Vui lòng thử lại.'
};

// Success messages
export const DOCTOR_SUCCESS_MESSAGES = {
  CREATE_SUCCESS: 'Đã tạo bác sĩ thành công!',
  UPDATE_SUCCESS: 'Đã cập nhật bác sĩ thành công!',
  DELETE_SUCCESS: 'Đã xóa bác sĩ thành công!'
};

// Debounce timing
export const DOCTOR_SEARCH_DEBOUNCE_DELAY = 500; 