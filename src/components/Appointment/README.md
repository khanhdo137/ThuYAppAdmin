# Appointment Components - Hướng dẫn sử dụng

Thư mục này chứa các component liên quan đến quản lý lịch hẹn.

## AppointmentDialog Component (Đã cải thiện)

Component modal đa chức năng để tạo, chỉnh sửa và xem chi tiết lịch hẹn với giao diện đẹp.

### Import
```jsx
import { AppointmentDialog } from '../components/Appointment';
// hoặc
import AppointmentDialog from '../components/Appointment/AppointmentDialog';
```

### Props

| Prop | Type | Required | Mặc định | Mô tả |
|------|------|----------|----------|-------|
| `open` | boolean | ✅ | - | Trạng thái mở/đóng dialog |
| `onClose` | function | ✅ | - | Hàm callback khi đóng dialog |
| `dialogMode` | string | ✅ | - | Chế độ: 'create', 'edit', 'view' |
| `formData` | object | ✅ | - | Dữ liệu form/lịch hẹn |
| `formErrors` | object | ✅ | {} | Object chứa lỗi validation |
| `onFormChange` | function | ✅ | - | Hàm xử lý thay đổi form |
| `onCreate` | function | ✅ | - | Hàm tạo lịch hẹn mới |
| `onUpdate` | function | ✅ | - | Hàm cập nhật lịch hẹn |
| `loading` | boolean | ✅ | false | Trạng thái loading |
| `pets` | array | ✅ | [] | Danh sách thú cưng |
| `services` | array | ✅ | [] | Danh sách dịch vụ |
| `doctors` | array | ✅ | [] | Danh sách bác sĩ |
| `customers` | array | ✅ | [] | Danh sách khách hàng |
| `feedback` | array | ❌ | [] | Danh sách đánh giá (cho view mode) |

### formData Structure

```javascript
{
  appointmentId: number,          // ID lịch hẹn (view/edit mode)
  petId: number,                  // ID thú cưng
  petName: string,                // Tên thú cưng (view mode)
  serviceId: number,              // ID dịch vụ
  serviceName: string,            // Tên dịch vụ (view mode)
  doctorId: number,               // ID bác sĩ
  doctorName: string,             // Tên bác sĩ (view mode)
  appointmentDate: string,        // Ngày hẹn (ISO format)
  appointmentTime: string,        // Giờ hẹn
  age: number,                    // Tuổi thú cưng
  status: string,                 // Trạng thái: 'Pending', 'Confirmed', 'Completed', 'Cancelled'
  notes: string,                  // Ghi chú
  customerName: string,           // Tên khách hàng (view mode)
  price: number                   // Giá dịch vụ (view mode)
}
```

### feedback Structure

```javascript
[
  {
    feedbackId: number,
    appointmentId: number,
    customerId: number,
    customerName: string,
    rating: number,              // 1-5 stars
    comment: string,
    createdAt: string            // ISO date string
  }
]
```

## Ví dụ sử dụng

### 1. View Mode (Xem chi tiết - Giao diện mới)

```jsx
import React, { useState } from 'react';
import { AppointmentDialog } from '../components/Appointment';

function MyComponent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);

  const handleViewAppointment = async (appointment) => {
    setAppointmentData(appointment);
    
    // Fetch feedback if available
    const feedback = await fetchFeedbackByAppointmentId(appointment.appointmentId);
    setFeedbackData(feedback);
    
    setDialogOpen(true);
  };

  return (
    <>
      <button onClick={() => handleViewAppointment(someAppointment)}>
        Xem chi tiết
      </button>

      <AppointmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        dialogMode="view"
        formData={appointmentData}
        formErrors={{}}
        onFormChange={() => {}}
        onCreate={() => {}}
        onUpdate={() => {}}
        loading={false}
        pets={[]}
        services={[]}
        doctors={[]}
        customers={[]}
        feedback={feedbackData}  // Truyền feedback data
      />
    </>
  );
}
```

### 2. Create Mode (Tạo mới)

```jsx
import React, { useState } from 'react';
import { AppointmentDialog } from '../components/Appointment';
import { useAppointmentForm } from '../components/Appointment';

function CreateAppointment() {
  const {
    dialogOpen,
    dialogMode,
    formData,
    formErrors,
    handleFormChange,
    openCreateDialog,
    closeDialog,
    handleCreate
  } = useAppointmentForm();

  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [customers, setCustomers] = useState([]);

  const handleCreateAppointment = async () => {
    const result = await handleCreate();
    if (result.success) {
      // Refresh list
      fetchAppointments();
    }
  };

  return (
    <>
      <button onClick={openCreateDialog}>
        Thêm lịch hẹn mới
      </button>

      <AppointmentDialog
        open={dialogOpen}
        onClose={closeDialog}
        dialogMode="create"
        formData={formData}
        formErrors={formErrors}
        onFormChange={handleFormChange}
        onCreate={handleCreateAppointment}
        onUpdate={() => {}}
        loading={false}
        pets={pets}
        services={services}
        doctors={doctors}
        customers={customers}
      />
    </>
  );
}
```

### 3. Edit Mode (Chỉnh sửa)

```jsx
const handleEditAppointment = (appointment) => {
  openEditDialog(appointment);
};

<AppointmentDialog
  open={dialogOpen}
  onClose={closeDialog}
  dialogMode="edit"
  formData={formData}
  formErrors={formErrors}
  onFormChange={handleFormChange}
  onCreate={() => {}}
  onUpdate={handleUpdateAppointment}
  loading={loading}
  pets={pets}
  services={services}
  doctors={doctors}
  customers={customers}
/>
```

## AppointmentDetailView Component (Mới)

Component hiển thị chi tiết lịch hẹn với giao diện đẹp, được sử dụng bên trong AppointmentDialog ở view mode.

### Features

#### Tab 1: Chi tiết lịch hẹn
- ✅ Header với gradient tím đẹp mắt
- ✅ Avatar lớn hiển thị icon lịch với màu theo trạng thái
- ✅ Chips hiển thị: trạng thái, ngày, giờ
- ✅ Card "Thông tin dịch vụ":
  - Tên dịch vụ với icon
  - Giá dịch vụ
  - Bác sĩ phụ trách
- ✅ Card "Thông tin thú cưng":
  - Tên thú cưng
  - Tuổi
  - Chủ sở hữu
- ✅ Card "Ghi chú" (nếu có)

#### Tab 2: Đánh giá
- ✅ Hiển thị danh sách feedback với:
  - Avatar khách hàng
  - Rating (1-5 sao)
  - Comment
  - Thời gian đánh giá
- ✅ Empty state khi chưa có đánh giá

### Status Colors

| Trạng thái | Border | Background | Text Color |
|-----------|--------|------------|------------|
| Đang chờ / Pending | `#ff9800` | `#fff3e0` | `#ff9800` |
| Đã xác nhận / Confirmed | `#2196f3` | `#e3f2fd` | `#2196f3` |
| Hoàn thành / Completed | `#4caf50` | `#e8f5e9` | `#4caf50` |
| Đã hủy / Cancelled | `#f44336` | `#ffebee` | `#f44336` |

## Dialog Modes

### Create Mode
- Form để tạo lịch hẹn mới
- Validate tất cả các trường bắt buộc
- Button "Lưu" để submit

### Edit Mode
- Form để chỉnh sửa lịch hẹn
- Giống create nhưng pre-fill dữ liệu
- Button "Lưu" để cập nhật

### View Mode (NEW!)
- Giao diện đẹp với tabs
- Hiển thị đầy đủ thông tin
- Có thể xem feedback/đánh giá
- Button "Đóng" với gradient
- Dialog rộng hơn (maxWidth="lg")
- Có scroll với custom scrollbar

## Styling Highlights

### View Mode
- **Dialog**:
  - maxWidth: `lg` (rộng hơn)
  - borderRadius: `3`
  - boxShadow: `0 20px 60px rgba(0,0,0,0.15)`
  - Gradient background
  
- **Header**:
  - Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
  - Tabs với indicator trắng
  - Avatar lớn (80x80)

- **Cards**:
  - Hover effect: nổi lên
  - Icons màu sắc theo category
  - Spacing hợp lý

- **Button Đóng**:
  - Gradient button
  - Font weight: 600
  - Padding: `px={4}`

### Create/Edit Mode
- Standard form layout
- Material-UI TextField
- Validation errors hiển thị đỏ

## Integration với Pages khác

Component này đã được tích hợp sẵn trong:
- ✅ **AppointmentsPage.js** - Trang quản lý lịch hẹn
- ✅ **CustomerDetailTabs.js** - Tab lịch hẹn trong thông tin khách hàng

Bạn có thể sử dụng tương tự trong:
- DoctorsPage - Xem lịch hẹn của bác sĩ
- PetsPage - Xem lịch hẹn của thú cưng
- DashboardPage - Xem lịch hẹn gần đây

## Best Practices

1. **Luôn truyền feedback prop trong view mode** để hiển thị đánh giá
2. **Fetch feedback data riêng** khi mở view mode để giảm tải
3. **Sử dụng loading state** khi gọi API
4. **Validate form** trước khi submit
5. **Handle errors** và hiển thị thông báo thân thiện
6. **Refresh list** sau khi create/update/delete thành công

## Constants

Các constants có sẵn trong `appointmentConstants.js`:
- `APPOINTMENT_DIALOG_MODES` - Create, Edit, View
- `APPOINTMENT_TIME_SLOTS` - Danh sách khung giờ
- `APPOINTMENT_STATUS_FILTERS` - Filters theo trạng thái

## Utils

Các utility functions trong `appointmentUtils.js`:
- `formatPetDisplay(pet, customers)` - Format hiển thị thú cưng
- `formatServiceDisplay(service)` - Format hiển thị dịch vụ

## Hooks

Custom hook `useAppointmentForm()` cung cấp:
- State management cho dialog
- Form validation
- CRUD operations
- Error handling

## Migration Guide

Nếu bạn đang dùng AppointmentDialog phiên bản cũ:

```jsx
// CŨ - Chỉ có form cơ bản
<AppointmentDialog
  open={open}
  onClose={onClose}
  // ... props
/>

// MỚI - Thêm feedback prop
<AppointmentDialog
  open={open}
  onClose={onClose}
  // ... props
  feedback={feedbackData}  // ← Thêm dòng này
/>
```

View mode sẽ tự động hiển thị giao diện mới với tabs!



