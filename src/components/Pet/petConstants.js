// Dialog modes
export const PET_DIALOG_MODES = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit'
};

// Pet species options
export const PET_SPECIES_OPTIONS = [
  'Chó',
  'Mèo',
  'Chim',
  'Thỏ',
  'Chuột hamster',
  'Khác'
];

// Pet gender options
export const PET_GENDER_OPTIONS = [
  { value: 'Đực', label: 'Đực' },
  { value: 'Cái', label: 'Cái' },
  { value: 'Chưa xác định', label: 'Chưa xác định' }
];

// Species color mapping for chips
export const PET_SPECIES_COLOR_MAP = {
  'Chó': 'primary',
  'Mèo': 'secondary',
  'Chim': 'info',
  'Thỏ': 'warning',
  'Hamster': 'success',
  'Cá': 'error',
  'Rùa': 'default'
};

// Form initial state
export const PET_INITIAL_FORM_DATA = {
  petId: '',
  customerId: '',
  name: '',
  species: '',
  breed: '',
  gender: '',
  birthDate: '',
  imageUrl: '',
  notes: ''
};

// Search placeholder
export const PET_SEARCH_PLACEHOLDER = 'Tìm kiếm theo tên, loài, giống, chủ sở hữu...';

// Table configuration
export const PET_TABLE_MIN_WIDTHS = {
  AVATAR: 80,
  NAME: 150,
  SPECIES: 120,
  BREED: 120,
  GENDER: 100,
  AGE: 100,
  CUSTOMER: 200
};

// Image upload configuration
export const PET_IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_TIMEOUT: 30000 // 30 seconds
};

// Error messages
export const PET_ERROR_MESSAGES = {
  FETCH_FAILED: 'Đã xảy ra lỗi nghiêm trọng khi tải dữ liệu. Vui lòng thử lại.',
  SEARCH_FAILED: 'Không thể tìm kiếm thú cưng. Vui lòng thử lại.',
  CREATE_FAILED: 'Không thể thêm thú cưng',
  UPDATE_FAILED: 'Không thể cập nhật thú cưng',
  DELETE_FAILED: 'Không thể xóa thú cưng',
  CUSTOMERS_LOAD_FAILED: 'Không thể tải danh sách khách hàng',
  PETS_LOAD_FAILED: 'Không thể tải danh sách thú cưng',
  IMAGE_UPLOAD_FAILED: 'Không thể tải lên hình ảnh',
  IMAGE_SIZE_TOO_LARGE: 'Kích thước hình ảnh quá lớn',
  IMAGE_TYPE_NOT_SUPPORTED: 'Định dạng hình ảnh không được hỗ trợ. Vui lòng chọn file JPG, PNG, GIF hoặc WebP.',
  INVALID_IMAGE: 'Hình ảnh không hợp lệ'
};

// Success messages
export const PET_SUCCESS_MESSAGES = {
  CREATE_SUCCESS: 'Thêm thú cưng thành công',
  UPDATE_SUCCESS: 'Cập nhật thú cưng thành công',
  DELETE_SUCCESS: 'Xóa thú cưng thành công',
  IMAGE_UPLOAD_SUCCESS: 'Tải lên hình ảnh thành công'
};

// Debounce timing
export const PET_SEARCH_DEBOUNCE_DELAY = 500;

// Customer loading states
export const PET_CUSTOMER_LOAD_STATES = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

export const PET_GENDERS = {
  MALE: 'Đực',
  FEMALE: 'Cái'
}; 