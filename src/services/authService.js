// Thử cả HTTPS và HTTP cho localhost
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.1.33:5074/api';
const API_BASE_URL_HTTP = 'http://192.168.1.33:5074/api';

// Role constants - ĐÚNG theo backend
const ROLES = {
  CUSTOMER: 0,
  ADMIN: 1,      // Admin là role 1, không phải 2
  DOCTOR: 2      // Doctor có thể là role 2 hoặc không được sử dụng
};

const ROLE_NAMES = {
  0: 'Customer',
  1: 'Administrator',   // Admin là role 1
  2: 'Doctor'          // Role 2 có thể là Doctor hoặc Unknown
};

class AuthService {
  // Helper method để thử kết nối với cả HTTPS và HTTP
  async fetchWithFallback(url, options) {
    try {
      // Thử HTTP trước (vì server chỉ chạy HTTP)
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.warn('HTTP failed, trying alternative:', error.message);
      // Nếu HTTP fail, thử với localhost
      const localhostUrl = url.replace('192.168.1.33', 'localhost');
      return await fetch(localhostUrl, options);
    }
  }

  // Kiểm tra role có phải Admin không
  isAdminRole(role) {
    return role === ROLES.ADMIN; // Role 1
  }

  // Lấy tên role
  getRoleName(role) {
    return ROLE_NAMES[role] || 'Unknown';
  }

  // Đăng nhập
  async login(username, password) {
    try {
      const response = await this.fetchWithFallback(`${API_BASE_URL}/User/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        } else if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Dữ liệu đăng nhập không hợp lệ');
        } else if (response.status === 500) {
          throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();

      // Kiểm tra có đầy đủ thông tin không
      if (!data.userId || !data.username || data.role === undefined || !data.token) {
        throw new Error('Phản hồi từ máy chủ không hợp lệ');
      }

      // Kiểm tra role admin (role = 1)
      if (!this.isAdminRole(data.role)) {
        throw new Error(`Bạn không có quyền truy cập trang quản trị. Role hiện tại: ${this.getRoleName(data.role)} (${data.role}). Chỉ Administrator (Role = 1) mới được phép truy cập.`);
      }

      // Lưu token và thông tin user
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('isAuthenticated', 'true');

      console.log('Login successful for admin user:', {
        username: data.username,
        role: data.role,
        roleName: this.getRoleName(data.role)
      });

      return data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Xử lý lỗi kết nối mạng
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo API đang chạy.');
      }
      
      throw error;
    }
  }

  // Đăng xuất
  async logout() {
    const token = this.getToken();
    const userInfo = this.getUserInfo();
    
    // Logout ngay lập tức ở frontend trước
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isAuthenticated');
    
    console.log('Local logout completed for user:', userInfo?.username);
    
    // Gọi API logout trong background (không đợi kết quả)
    if (token) {
      this.logoutApi(token).catch((error) => {
        console.warn('API logout failed (but local logout successful):', error);
      });
    }
  }

  // Phương thức riêng để gọi API logout với timeout
  async logoutApi(token) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Logout API timeout')), 3000); // 3 giây timeout
    });

    const logoutPromise = this.fetchWithFallback(`${API_BASE_URL}/User/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    try {
      await Promise.race([logoutPromise, timeoutPromise]);
      console.log('API logout successful');
    } catch (error) {
      console.warn('API logout failed:', error.message);
      // Không throw error vì đã logout local thành công
    }
  }

  // Lấy token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Lấy thông tin user
  getUserInfo() {
    const userInfo = localStorage.getItem('userInfo');
    try {
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error parsing user info:', error);
      this.clearAuthData();
      return null;
    }
  }

  // Clear all auth data
  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isAuthenticated');
  }

  // Kiểm tra đăng nhập (không kiểm tra role)
  isAuthenticated() {
    const token = this.getToken();
    const userInfo = this.getUserInfo();
    
    return !!(token && userInfo);
  }

  // Kiểm tra đăng nhập VÀ có quyền admin
  isAdminAuthenticated() {
    const token = this.getToken();
    const userInfo = this.getUserInfo();
    
    if (!token || !userInfo) {
      return false;
    }

    // Kiểm tra role admin (role = 1)
    const isAdmin = this.isAdminRole(userInfo.role);
    
    if (!isAdmin) {
      console.warn('User is authenticated but not admin:', {
        username: userInfo.username,
        role: userInfo.role,
        roleName: this.getRoleName(userInfo.role)
      });
      // Clear auth data if user is not admin
      this.clearAuthData();
      return false;
    }

    return true;
  }

  // Validate token với server
  async validateToken() {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const response = await this.fetchWithFallback(`${API_BASE_URL}/User/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Token validation failed: Token expired or invalid');
          this.clearAuthData();
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Lấy profile user
  async getProfile() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Không có token xác thực');
      }

      const response = await this.fetchWithFallback(`${API_BASE_URL}/User/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuthData();
          throw new Error('Phiên đăng nhập đã hết hạn');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Lấy thông tin thất bại');
      }

      const data = await response.json();
      
      // Cập nhật thông tin user trong localStorage
      if (data) {
        const currentUserInfo = this.getUserInfo();
        const updatedUserInfo = { ...currentUserInfo, ...data };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      }
      
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Test connection với API
  async testConnection() {
    try {
      console.log('Testing HTTPS connection...');
      const httpsResponse = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      console.log('HTTPS Status:', httpsResponse.status);
      return { protocol: 'HTTPS', status: httpsResponse.status };
    } catch (httpsError) {
      console.log('HTTPS failed, testing HTTP...');
      try {
        const httpResponse = await fetch(`${API_BASE_URL_HTTP}/health`, { method: 'GET' });
        console.log('HTTP Status:', httpResponse.status);
        return { protocol: 'HTTP', status: httpResponse.status };
      } catch (httpError) {
        console.error('Both HTTPS and HTTP failed:', { httpsError, httpError });
        throw new Error('Không thể kết nối với server. Vui lòng kiểm tra API có đang chạy không.');
      }
    }
  }

  // Lấy current role
  getCurrentRole() {
    const userInfo = this.getUserInfo();
    return userInfo ? userInfo.role : null;
  }

  // Lấy current role name
  getCurrentRoleName() {
    const role = this.getCurrentRole();
    return role !== null ? this.getRoleName(role) : null;
  }

  // Constants for external use
  static ROLES = ROLES;
  static ROLE_NAMES = ROLE_NAMES;
}

const authService = new AuthService();
export default authService; 