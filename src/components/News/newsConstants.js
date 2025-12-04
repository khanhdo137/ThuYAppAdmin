// Dialog modes
export const NEWS_DIALOG_MODES = {
  VIEW: 'view',
  EDIT: 'edit',
  CREATE: 'create'
};

// View modes for news display
export const NEWS_VIEW_MODES = {
  TABLE: 'table',
  CARDS: 'cards'
};

// View mode labels
export const NEWS_VIEW_MODE_LABELS = {
  [NEWS_VIEW_MODES.TABLE]: 'Bảng',
  [NEWS_VIEW_MODES.CARDS]: 'Thẻ'
};

// Form initial state
export const NEWS_INITIAL_FORM_DATA = {
  title: '',
  content: '',
  tags: '',
  imageUrl: ''
};

// Search placeholder
export const NEWS_SEARCH_PLACEHOLDER = 'Tìm kiếm theo tiêu đề, nội dung, tags...';

// Table configuration
export const NEWS_TABLE_MIN_WIDTHS = {
  ID: 70,
  TITLE: 250,
  CONTENT: 300,
  TAGS: 150,
  CREATED_AT: 120,
  ACTIONS: 180
};

// Card configuration
export const NEWS_CARD_CONFIG = {
  IMAGE_HEIGHT: 200,
  MAX_TAGS_DISPLAY: 3,
  PREVIEW_LENGTH: 100
};

// Error messages
export const NEWS_ERROR_MESSAGES = {
  FETCH_FAILED: 'Không thể tải danh sách tin tức. Vui lòng thử lại.',
  SEARCH_FAILED: 'Không thể tìm kiếm tin tức. Vui lòng thử lại.',
  CREATE_FAILED: 'Không thể tạo tin tức mới. Vui lòng thử lại.',
  UPDATE_FAILED: 'Không thể cập nhật tin tức. Vui lòng thử lại.',
  DELETE_FAILED: 'Không thể xóa tin tức. Vui lòng thử lại.'
};

// Success messages
export const NEWS_SUCCESS_MESSAGES = {
  CREATE_SUCCESS: 'Đã tạo tin tức thành công!',
  UPDATE_SUCCESS: 'Đã cập nhật tin tức thành công!',
  DELETE_SUCCESS: 'Đã xóa tin tức thành công!'
};

// Debounce timing
export const NEWS_SEARCH_DEBOUNCE_DELAY = 500;

// Loading timeout
export const NEWS_LOADING_TIMEOUT = 5000; 