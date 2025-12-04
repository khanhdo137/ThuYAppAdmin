# Shared Components - Hướng dẫn sử dụng

Thư mục này chứa các component có thể tái sử dụng ở nhiều nơi trong ứng dụng.

## PetCard Component

Component hiển thị thông tin thú cưng dạng card với ảnh và thông tin cơ bản.

### Import
```jsx
import PetCard from '../shared/PetCard';
```

### Props
- `pet` (object, required): Đối tượng thú cưng với các thuộc tính:
  - `petId` hoặc `pet_id`: ID thú cưng
  - `petName` hoặc `pet_name`: Tên thú cưng
  - `imageUrl` hoặc `image_url`: URL ảnh thú cưng
  - `species`: Loài (chó, mèo, v.v.)
  - `breed`: Giống
  - `birthday`: Ngày sinh
  - `gender`: Giới tính
  - `weight`: Cân nặng (kg)
- `onClick` (function, optional): Hàm xử lý khi click vào card
- `showViewButton` (boolean, optional): Hiển thị nút xem chi tiết (mặc định: true)

### Ví dụ sử dụng
```jsx
// Basic usage
<PetCard 
  pet={petData} 
  onClick={() => handleViewPet(petData)}
/>

// Without view button
<PetCard 
  pet={petData} 
  onClick={() => handleViewPet(petData)}
  showViewButton={false}
/>

// In a grid
<Grid container spacing={3}>
  {pets.map((pet) => (
    <Grid item xs={12} sm={6} md={4} key={pet.petId}>
      <PetCard 
        pet={pet} 
        onClick={() => handleViewPet(pet)}
      />
    </Grid>
  ))}
</Grid>
```

### Features
- ✅ Hiển thị ảnh thú cưng từ database
- ✅ Gradient placeholder khi không có ảnh
- ✅ Hover effect với icon "Xem chi tiết"
- ✅ Responsive design
- ✅ Hiển thị thông tin: tên, loài, giống, ngày sinh, giới tính, cân nặng

## AppointmentCard Component

Component hiển thị thông tin lịch hẹn dạng card với màu sắc theo trạng thái.

### Import
```jsx
import AppointmentCard from '../shared/AppointmentCard';
```

### Props
- `appointment` (object, required): Đối tượng lịch hẹn với các thuộc tính:
  - `appointmentId` hoặc `appointment_id`: ID lịch hẹn
  - `serviceName` hoặc `service_name`: Tên dịch vụ
  - `petName` hoặc `pet_name`: Tên thú cưng
  - `doctorName` hoặc `doctor_name`: Tên bác sĩ
  - `appointmentDate` hoặc `appointment_date`: Ngày giờ hẹn
  - `status`: Trạng thái (Pending, Confirmed, Completed, Cancelled)
  - `notes` (optional): Ghi chú
- `onClick` (function, optional): Hàm xử lý khi click vào card
- `showViewButton` (boolean, optional): Hiển thị nút xem chi tiết (mặc định: true)

### Ví dụ sử dụng
```jsx
// Basic usage
<AppointmentCard 
  appointment={appointmentData} 
  onClick={() => handleViewAppointment(appointmentData)}
/>

// Without view button
<AppointmentCard 
  appointment={appointmentData} 
  onClick={() => handleViewAppointment(appointmentData)}
  showViewButton={false}
/>

// In a list
<Grid container spacing={2}>
  {appointments.map((appointment) => (
    <Grid item xs={12} key={appointment.appointmentId}>
      <AppointmentCard 
        appointment={appointment} 
        onClick={() => handleViewAppointment(appointment)}
      />
    </Grid>
  ))}
</Grid>
```

### Features
- ✅ Màu border theo trạng thái (xanh = Hoàn thành, đỏ = Đã hủy, cam = Đang chờ/Đã xác nhận)
- ✅ Avatar với màu theo trạng thái
- ✅ Chip hiển thị trạng thái với màu phù hợp
- ✅ Hover effect: trượt sang phải
- ✅ Hiển thị đầy đủ thông tin: dịch vụ, thú cưng, bác sĩ, thời gian, ghi chú

## Status Colors

Cả hai component đều sử dụng hệ thống màu sắc nhất quán:

### Appointment Status Colors
- **Hoàn thành / Completed**: 
  - Border: `#4caf50` (xanh lá)
  - Background: `#e8f5e9`
  - Text: `#4caf50`
- **Đã hủy / Cancelled**: 
  - Border: `#f44336` (đỏ)
  - Background: `#ffebee`
  - Text: `#f44336`
- **Đang chờ / Pending, Đã xác nhận / Confirmed**: 
  - Border: `#ff9800` (cam)
  - Background: `#fff3e0`
  - Text: `#ff9800`

## Styling

Cả hai component đều có:
- Border radius: `2-3px` để bo góc mềm mại
- Box shadow: `0 2px-4px 12px-20px rgba(0,0,0,0.08)` cho độ sâu
- Transition: `all 0.3s` cho hiệu ứng mượt mà
- Custom scrollbar styling (nếu cần)

## Integration với Dialog

Các component này được thiết kế để hoạt động tốt với PetDialog và AppointmentDialog:

```jsx
const [selectedPet, setSelectedPet] = useState(null);
const [petDialogOpen, setPetDialogOpen] = useState(false);

const handlePetClick = (pet) => {
  setSelectedPet(pet);
  setPetDialogOpen(true);
};

// Usage
<PetCard 
  pet={pet} 
  onClick={() => handlePetClick(pet)}
/>

<PetDialog
  open={petDialogOpen}
  onClose={() => {
    setPetDialogOpen(false);
    setSelectedPet(null);
  }}
  dialogMode="view"
  formData={selectedPet}
  // ... other props
/>
```

## Responsive Design

- **PetCard**: Hoạt động tốt trong grid layout
  - `xs={12}`: Full width trên mobile
  - `sm={6}`: 2 cột trên tablet
  - `md={4}`: 3 cột trên desktop
  
- **AppointmentCard**: Luôn full width (`xs={12}`) để hiển thị đầy đủ thông tin

## Best Practices

1. **Sử dụng PetCard khi**:
   - Hiển thị danh sách thú cưng
   - Cần xem nhanh thông tin cơ bản
   - Trong grid layout

2. **Sử dụng AppointmentCard khi**:
   - Hiển thị danh sách lịch hẹn
   - Cần phân biệt trạng thái bằng màu sắc
   - Trong vertical list

3. **Pagination**:
   - Nên kết hợp với pagination khi có nhiều items
   - Khuyến nghị: 6 pets/page, 5 appointments/page

4. **Scroll Container**:
   - Đặt trong container có `maxHeight` và `overflow-y: auto`
   - Thêm custom scrollbar styling cho đẹp hơn

## Example: Complete Implementation

Xem ví dụ đầy đủ tại:
- `src/components/Customer/CustomerDetailTabs.js` - Sử dụng cả PetCard và AppointmentCard với pagination và scroll



