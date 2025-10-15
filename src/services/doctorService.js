import apiService from './apiService';

class DoctorService {
  // Get all doctors (admin)
  async getAllDoctors() {
    try {
      // Backend admin endpoint với pagination
      const params = { page: 1, limit: 100 };
      const result = await apiService.getWithParams('Doctor/admin', params);
      
      // API trả về { doctors: [...], pagination: {...} }
      // Chỉ trả về array doctors
      return result?.doctors || [];
    } catch (error) {
      console.error('DoctorService: getAllDoctors error:', error);
      throw error;
    }
  }

  // Get doctor by ID (admin)
  async getDoctorById(id) {
    return await apiService.getById('Doctor/admin', id);
  }

  // Create new doctor (admin)
  async createDoctor(doctorData) {
    return await apiService.create('Doctor/admin', doctorData);
  }

  // Update doctor (admin)
  async updateDoctor(id, doctorData) {
    return await apiService.update('Doctor/admin', id, doctorData);
  }

  // Delete doctor (admin)
  async deleteDoctor(id) {
    return await apiService.delete('Doctor/admin', id);
  }

  // Search doctors (admin)
  async searchDoctors(searchTerm) {
    try {
      console.log('DoctorService: Searching doctors with term:', searchTerm);
      const params = { 
        query: searchTerm,
        page: 1,
        limit: 100
      };
      const result = await apiService.getWithParams('Doctor/admin/search', params);
      console.log('DoctorService: API response:', result);
      return result?.doctors || [];
    } catch (error) {
      console.error('DoctorService: searchDoctors error:', error);
      throw error;
    }
  }

  // Get specialization options
  getSpecializationOptions() {
    return [
      { 
        value: 'tong-quat', 
        label: 'Thú y tổng quát',
        description: 'Khám chữa bệnh tổng quát cho các loại động vật'
      },
      { 
        value: 'thu-cung', 
        label: 'Thú y thú cưng',
        description: 'Chuyên về chó, mèo và các thú cưng nhỏ'
      },
      { 
        value: 'gia-suc', 
        label: 'Thú y gia súc',
        description: 'Chuyên về bò, heo, gà và các gia súc gia cầm'
      },
      { 
        value: 'phau-thuat', 
        label: 'Phẫu thuật thú y',
        description: 'Phẫu thuật các bệnh lý và chấn thương'
      },
      { 
        value: 'noi-khoa', 
        label: 'Nội khoa thú y',
        description: 'Điều trị các bệnh nội khoa không cần phẫu thuật'
      },
      { 
        value: 'da-lieu', 
        label: 'Da liễu thú y',
        description: 'Chuyên về các bệnh da, lông và móng'
      },
      { 
        value: 'mat-khoa', 
        label: 'Mắt khoa thú y',
        description: 'Chuyên về các bệnh mắt và thị giác'
      },
      { 
        value: 'rang-ham-mat', 
        label: 'Răng hàm mặt thú y',
        description: 'Chăm sóc răng miệng và điều trị bệnh răng'
      },
      { 
        value: 'chan-doan-hinh-anh', 
        label: 'Chẩn đoán hình ảnh',
        description: 'X-quang, siêu âm, CT, MRI'
      },
      { 
        value: 'gay-me-hoi-suc', 
        label: 'Gây mê hồi sức',
        description: 'Gây mê và chăm sóc hậu phẫu'
      },
      { 
        value: 'cap-cuu', 
        label: 'Cấp cứu thú y',
        description: 'Xử lý các trường hợp cấp cứu 24/7'
      },
      { 
        value: 'dinh-duong', 
        label: 'Dinh dưỡng động vật',
        description: 'Tư vấn chế độ ăn và dinh dưỡng'
      },
      { 
        value: 'hanh-vi', 
        label: 'Hành vi động vật',
        description: 'Điều trị các vấn đề hành vi và tâm lý'
      },
      { 
        value: 'sinh-san', 
        label: 'Sinh sản thú y',
        description: 'Chuyên về sinh sản và sản khoa'
      },
      { 
        value: 'benh-truyen-nhiem', 
        label: 'Bệnh truyền nhiễm',
        description: 'Phòng và chữa các bệnh truyền nhiễm'
      },
      { 
        value: 'tiem-chung', 
        label: 'Tiêm chủng và phòng bệnh',
        description: 'Lập lịch tiêm chủng và y học dự phòng'
      },
      { 
        value: 'chan-nuoi', 
        label: 'Chăn nuôi thú y',
        description: 'Tư vấn chăn nuôi và quản lý đàn'
      },
      { 
        value: 'ung-buou', 
        label: 'Ung bướu thú y',
        description: 'Chẩn đoán và điều trị các bệnh ung thư'
      }
    ];
  }

  // Get experience level options
  getExperienceLevelOptions() {
    return [
      { value: '0-2', label: 'Mới tốt nghiệp (0-2 năm)' },
      { value: '3-5', label: 'Có kinh nghiệm (3-5 năm)' },
      { value: '6-10', label: 'Giàu kinh nghiệm (6-10 năm)' },
      { value: '11-15', label: 'Chuyên gia (11-15 năm)' },
      { value: '16+', label: 'Chuyên gia cao cấp (16+ năm)' }
    ];
  }

  // Get branch/location options
  getBranchOptions() {
    return [
      { 
        value: 'tru-so-chinh', 
        label: 'Trụ sở chính - Số 765, Cách Mạng Tháng 8, Phường Chánh Nghĩa, Thủ Dầu Một, Bình Dương',
        shortLabel: 'Trụ sở chính',
        address: 'Số 765, Cách Mạng Tháng 8, Phường Chánh Nghĩa, Thủ Dầu Một, Bình Dương'
      },
      { 
        value: 'huong-no-ii', 
        label: 'PET SHOP HƯƠNG NỞ II - Số 235 Phú Lợi, Khu 4, Phường Phú Lợi, Thủ Dầu Một, Bình Dương',
        shortLabel: 'PET SHOP HƯƠNG NỞ II',
        address: 'Số 235 Phú Lợi, Khu 4, Phường Phú Lợi, Thủ Dầu Một, Bình Dương'
      },
      { 
        value: 'huong-no-iii', 
        label: 'PET SHOP HƯƠNG NỞ III - 237 Phú Lợi, Khu phố 4, Phường Phú Lợi, Thủ Dầu Một, Bình Dương',
        shortLabel: 'PET SHOP HƯƠNG NỞ III',
        address: '237 Phú Lợi, Khu phố 4, Phường Phú Lợi, Thủ Dầu Một, Bình Dương'
      }
    ];
  }

  // Format doctor data for display
  formatDoctorData(doctor) {
    return {
      ...doctor,
      experienceText: this.formatExperience(doctor.experienceYears),
      specializationText: this.getSpecializationLabel(doctor.specialization),
      branchText: this.getBranchLabel(doctor.branch)
    };
  }

  // Format experience years
  formatExperience(years) {
    if (!years) return 'Chưa có thông tin';
    
    if (years < 1) {
      return 'Dưới 1 năm';
    } else if (years === 1) {
      return '1 năm';
    } else {
      return `${years} năm`;
    }
  }

  // Get specialization label
  getSpecializationLabel(value) {
    const option = this.getSpecializationOptions().find(opt => opt.value === value);
    return option ? option.label : value || 'Chưa xác định';
  }

  // Get branch label
  getBranchLabel(value) {
    const option = this.getBranchOptions().find(opt => opt.value === value);
    return option ? option.label : value || 'Chưa xác định';
  }

  // Validate doctor data
  validateDoctorData(doctorData) {
    const errors = {};

    // FullName - bắt buộc
    if (!doctorData.fullName?.trim()) {
      errors.fullName = 'Họ tên bác sĩ là bắt buộc';
    } else if (doctorData.fullName.length > 100) {
      errors.fullName = 'Họ tên không được vượt quá 100 ký tự';
    }

    // Specialization - không bắt buộc nhưng nếu có thì kiểm tra độ dài
    if (doctorData.specialization && doctorData.specialization.length > 100) {
      errors.specialization = 'Chuyên khoa không được vượt quá 100 ký tự';
    }

    // ExperienceYears - không bắt buộc nhưng nếu có thì phải hợp lệ
    if (doctorData.experienceYears !== null && doctorData.experienceYears !== undefined) {
      if (doctorData.experienceYears < 0) {
        errors.experienceYears = 'Số năm kinh nghiệm phải lớn hơn hoặc bằng 0';
      }
      if (doctorData.experienceYears > 50) {
        errors.experienceYears = 'Số năm kinh nghiệm không được vượt quá 50 năm';
      }
    }

    // Branch - không bắt buộc nhưng nếu có thì kiểm tra độ dài
    if (doctorData.branch && doctorData.branch.length > 100) {
      errors.branch = 'Chi nhánh không được vượt quá 100 ký tự';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Get working time slots
  getTimeSlotOptions() {
    return [
      { value: '07:00', label: '07:00' },
      { value: '07:30', label: '07:30' },
      { value: '08:00', label: '08:00' },
      { value: '08:30', label: '08:30' },
      { value: '09:00', label: '09:00' },
      { value: '09:30', label: '09:30' },
      { value: '10:00', label: '10:00' },
      { value: '10:30', label: '10:30' },
      { value: '11:00', label: '11:00' },
      { value: '11:30', label: '11:30' },
      { value: '12:00', label: '12:00' },
      { value: '13:00', label: '13:00' },
      { value: '13:30', label: '13:30' },
      { value: '14:00', label: '14:00' },
      { value: '14:30', label: '14:30' },
      { value: '15:00', label: '15:00' },
      { value: '15:30', label: '15:30' },
      { value: '16:00', label: '16:00' },
      { value: '16:30', label: '16:30' },
      { value: '17:00', label: '17:00' },
      { value: '17:30', label: '17:30' },
      { value: '18:00', label: '18:00' },
      { value: '18:30', label: '18:30' },
      { value: '19:00', label: '19:00' },
      { value: '19:30', label: '19:30' },
      { value: '20:00', label: '20:00' },
      { value: '20:30', label: '20:30' },
      { value: '21:00', label: '21:00' }
    ];
  }

  // Get working day options
  getWorkingDayOptions() {
    return [
      { value: 'monday', label: 'Thứ 2', shortLabel: 'T2' },
      { value: 'tuesday', label: 'Thứ 3', shortLabel: 'T3' },
      { value: 'wednesday', label: 'Thứ 4', shortLabel: 'T4' },
      { value: 'thursday', label: 'Thứ 5', shortLabel: 'T5' },
      { value: 'friday', label: 'Thứ 6', shortLabel: 'T6' },
      { value: 'saturday', label: 'Thứ 7', shortLabel: 'T7' },
      { value: 'sunday', label: 'Chủ nhật', shortLabel: 'CN' }
    ];
  }

  // Get shift options
  getShiftOptions() {
    return [
      { 
        value: 'morning', 
        label: 'Ca sáng', 
        defaultStart: '07:00',
        defaultEnd: '12:00',
        description: 'Làm việc buổi sáng'
      },
      { 
        value: 'afternoon', 
        label: 'Ca chiều', 
        defaultStart: '13:00',
        defaultEnd: '17:00',
        description: 'Làm việc buổi chiều'
      },
      { 
        value: 'evening', 
        label: 'Ca tối', 
        defaultStart: '17:30',
        defaultEnd: '21:00',
        description: 'Làm việc buổi tối'
      },
      { 
        value: 'fullday', 
        label: 'Cả ngày', 
        defaultStart: '07:00',
        defaultEnd: '21:00',
        description: 'Làm việc cả ngày (có nghỉ trưa 12:00-13:00)'
      }
    ];
  }

  // Validate working schedule
  validateWorkingSchedule(schedule) {
    const errors = {};

    if (!schedule.workingDays || schedule.workingDays.length === 0) {
      errors.workingDays = 'Phải chọn ít nhất một ngày làm việc';
    }

    if (!schedule.startTime) {
      errors.startTime = 'Giờ bắt đầu là bắt buộc';
    }

    if (!schedule.endTime) {
      errors.endTime = 'Giờ kết thúc là bắt buộc';
    }

    if (schedule.startTime && schedule.endTime) {
      const startHour = parseInt(schedule.startTime.split(':')[0]);
      const startMinute = parseInt(schedule.startTime.split(':')[1]);
      const endHour = parseInt(schedule.endTime.split(':')[0]);
      const endMinute = parseInt(schedule.endTime.split(':')[1]);

      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;

      if (startTotal >= endTotal) {
        errors.timeRange = 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc';
      }

      // Check minimum working time (at least 1 hour)
      if (endTotal - startTotal < 60) {
        errors.timeRange = 'Thời gian làm việc tối thiểu là 1 giờ';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Format working schedule for display
  formatWorkingSchedule(schedule) {
    if (!schedule) return 'Chưa có lịch làm việc';

    const workingDays = schedule.workingDays || [];
    const dayOptions = this.getWorkingDayOptions();
    
    const dayLabels = workingDays.map(day => {
      const dayOption = dayOptions.find(opt => opt.value === day);
      return dayOption ? dayOption.shortLabel : day;
    }).join(', ');

    const timeRange = `${schedule.startTime || '00:00'} - ${schedule.endTime || '00:00'}`;

    return `${dayLabels}: ${timeRange}`;
  }

  // Get default working schedule
  getDefaultWorkingSchedule() {
    return {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      startTime: '08:00',
      endTime: '17:00',
      breakTime: {
        start: '12:00',
        end: '13:00'
      },
      shift: 'fullday'
    };
  }

  // Check if doctor is available at specific time
  isDoctorAvailable(doctor, dayOfWeek, time) {
    if (!doctor.workingSchedule) return false;

    const schedule = doctor.workingSchedule;
    const workingDays = schedule.workingDays || [];

    // Check if working on this day
    if (!workingDays.includes(dayOfWeek)) return false;

    // Convert time to minutes for comparison
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(schedule.startTime);
    const endMinutes = this.timeToMinutes(schedule.endTime);

    // Check if within working hours
    if (timeMinutes < startMinutes || timeMinutes > endMinutes) return false;

    // Check break time if exists
    if (schedule.breakTime) {
      const breakStartMinutes = this.timeToMinutes(schedule.breakTime.start);
      const breakEndMinutes = this.timeToMinutes(schedule.breakTime.end);
      
      if (timeMinutes >= breakStartMinutes && timeMinutes <= breakEndMinutes) {
        return false;
      }
    }

    return true;
  }

  // Helper function to convert time to minutes
  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get doctor statistics
  getDoctorStats(doctors) {
    // Ensure doctors is an array
    if (!Array.isArray(doctors)) {
      console.warn('DoctorService: getDoctorStats received non-array data:', doctors);
      return {
        total: 0,
        bySpecialization: {},
        byExperience: {
          'newbie': 0, // 0-2 years
          'experienced': 0, // 3-10 years
          'expert': 0 // 11+ years
        },
        averageExperience: 0
      };
    }

    const stats = {
      total: doctors.length,
      bySpecialization: {},
      byExperience: {
        'newbie': 0, // 0-2 years
        'experienced': 0, // 3-10 years
        'expert': 0 // 11+ years
      },
      averageExperience: 0
    };

    doctors.forEach(doctor => {
      // Count by specialization
      const spec = doctor.specialization || 'unknown';
      stats.bySpecialization[spec] = (stats.bySpecialization[spec] || 0) + 1;

      // Count by experience level
      const years = doctor.experienceYears || 0;
      if (years <= 2) {
        stats.byExperience.newbie++;
      } else if (years <= 10) {
        stats.byExperience.experienced++;
      } else {
        stats.byExperience.expert++;
      }
    });

    // Calculate average experience
    const totalExperience = doctors.reduce((sum, doctor) => sum + (doctor.experienceYears || 0), 0);
    stats.averageExperience = doctors.length > 0 ? Math.round(totalExperience / doctors.length * 10) / 10 : 0;

    return stats;
  }
}

const doctorService = new DoctorService();
export default doctorService; 