import apiService from './apiService';

export const medicalHistoryService = {
  // Lấy danh sách hồ sơ bệnh án (admin)
  getAllMedicalHistories: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.petId) queryParams.append('petId', params.petId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    return apiService.get(`/medicalhistory/admin?${queryParams.toString()}`);
  },

  // Lấy chi tiết hồ sơ bệnh án
  getMedicalHistoryById: (id) => {
    return apiService.get(`/medicalhistory/admin/${id}`);
  },

  // Tạo hồ sơ bệnh án mới
  createMedicalHistory: (data) => {
    return apiService.post('/medicalhistory/admin', data);
  },

  // Cập nhật hồ sơ bệnh án
  updateMedicalHistory: (id, data) => {
    return apiService.put(`/medicalhistory/admin/${id}`, data);
  },

  // Xóa hồ sơ bệnh án
  deleteMedicalHistory: (id) => {
    return apiService.delete(`/medicalhistory/admin/${id}`);
  },

  // Lấy hồ sơ bệnh án theo pet ID
  getMedicalHistoriesByPetId: (petId, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('petId', petId);
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    return apiService.get(`/medicalhistory/admin?${queryParams.toString()}`);
  }
};

export default medicalHistoryService; 