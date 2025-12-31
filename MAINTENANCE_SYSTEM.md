# Hệ thống Quản lý Bảo trì (Maintenance Management System)

## Tổng quan

Hệ thống quản lý bảo trì đã được nâng cấp hoàn toàn với hai vai trò chính:
- **Người dùng (Cư dân)**: Tạo và theo dõi yêu cầu bảo trì
- **Ban quản lý (Admin/Manager)**: Xác nhận, xử lý và hoàn thành yêu cầu

## Luồng hoạt động

### 1. Người dùng tạo yêu cầu
- Truy cập: `/maintenance`
- Điền thông tin: Số căn hộ, tên cư dân, SĐT, mô tả vấn đề, mức độ ưu tiên
- Trạng thái: `pending` (Chờ xác nhận)

### 2. Ban quản lý xác nhận
- Truy cập: `/admin/maintenance`
- Xem tất cả yêu cầu `pending`
- Xác nhận yêu cầu:
  - Thêm chi phí dự kiến
  - Phân công người phụ trách
  - Thêm ghi chú
- Trạng thái chuyển: `confirmed` (Đã xác nhận)
- Người dùng nhận được thông báo về chi phí dự kiến

### 3. Xử lý yêu cầu
- Admin có thể chuyển trạng thái sang `in_progress` (Đang xử lý)
- Người dùng có thể theo dõi tiến trình

### 4. Hoàn thành yêu cầu
- Admin/Manager đánh dấu hoàn thành
- Nhập chi phí thực tế
- Hệ thống tự động:
  - Cập nhật trạng thái: `completed`
  - **Thêm doanh thu** vào kỳ tương ứng (period)
  - Lưu vào bảng `payments` với `payment_method = 'maintenance'`

## Cấu trúc Database

### Bảng: `maintenance_requests`

```sql
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY,
    apt_id VARCHAR(10),              -- Số căn hộ
    resident_name VARCHAR(255),      -- Tên cư dân
    phone VARCHAR(20),               -- SĐT
    issue_description TEXT,          -- Mô tả vấn đề
    status VARCHAR(20),              -- pending/confirmed/in_progress/completed/cancelled
    priority VARCHAR(20),            -- low/medium/high
    created_at TIMESTAMP,            -- Ngày tạo
    confirmed_at TIMESTAMP,          -- Ngày xác nhận
    completed_at TIMESTAMP,          -- Ngày hoàn thành
    estimated_cost NUMERIC(15,2),    -- Chi phí dự kiến
    actual_cost NUMERIC(15,2),       -- Chi phí thực tế
    notes TEXT,                      -- Ghi chú
    assigned_to VARCHAR(255),        -- Người phụ trách
    period VARCHAR(7),               -- Kỳ (YYYY-MM)
    created_by UUID,                 -- User ID
    updated_at TIMESTAMP
);
```

### Tích hợp với Financial System

Khi hoàn thành yêu cầu, hệ thống tự động tạo record trong bảng `payments`:

```javascript
{
  apt_id: "A101",
  period: "2025-12",
  amount: 250000,
  payment_date: "2025-12-31",
  payment_method: "maintenance",
  notes: "Doanh thu từ bảo trì: Vòi nước bị rò rỉ"
}
```

## API Endpoints

### User Endpoints

```
GET    /api/maintenance              - Lấy danh sách yêu cầu của user
POST   /api/maintenance              - Tạo yêu cầu mới
GET    /api/maintenance/:id          - Chi tiết yêu cầu
PUT    /api/maintenance/:id          - Cập nhật yêu cầu (chỉ pending)
GET    /api/maintenance/stats/summary - Thống kê
```

### Admin Endpoints

```
POST   /api/maintenance/:id/confirm   - Xác nhận yêu cầu + thêm chi phí dự kiến
POST   /api/maintenance/:id/complete  - Hoàn thành + cập nhật doanh thu
DELETE /api/maintenance/:id           - Xóa yêu cầu (admin only)
```

## Frontend Pages

### User Page: `/maintenance`

**Features:**
- ✅ Tạo yêu cầu bảo trì mới
- ✅ Xem danh sách yêu cầu của mình
- ✅ Theo dõi trạng thái (pending/confirmed/in_progress/completed)
- ✅ Xem chi phí dự kiến và thực tế
- ✅ Xem ghi chú từ ban quản lý
- ✅ Thống kê tổng quan

**UI Components:**
- Form tạo yêu cầu
- Danh sách yêu cầu với màu sắc theo trạng thái
- Cards thống kê
- Chi tiết yêu cầu

### Admin Page: `/admin/maintenance`

**Features:**
- ✅ Xem tất cả yêu cầu trong hệ thống
- ✅ Lọc theo trạng thái, mức độ ưu tiên
- ✅ Tìm kiếm theo căn hộ, cư dân
- ✅ Xác nhận yêu cầu:
  - Thêm chi phí dự kiến
  - Phân công người phụ trách
  - Thêm ghi chú
- ✅ Chuyển trạng thái "Đang xử lý"
- ✅ Hoàn thành yêu cầu:
  - Nhập chi phí thực tế
  - Tự động cập nhật doanh thu vào kỳ
- ✅ Thống kê chi tiết

**UI Components:**
- Bảng quản lý với actions
- Modal xác nhận/hoàn thành
- Filters và search
- Statistics cards

## Cài đặt và Triển khai

### 1. Chạy SQL Schema

```bash
# Trong Supabase SQL Editor
cat backend/database/create_maintenance_requests_table.sql | psql
```

### 2. Cấu hình Backend

File đã được tạo:
- `backend/src/controllers/maintenanceController.js`
- `backend/src/routes/maintenanceRoutes.js`

Routes đã được kích hoạt trong `backend/src/index.js`

### 3. Frontend

Files đã được tạo:
- `frontend/lib/maintenanceApi.ts` - API wrapper
- `frontend/app/(modules)/maintenance/page.tsx` - User page
- `frontend/app/admin/maintenance/page.tsx` - Admin page

### 4. Khởi động

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Truy cập

- **User Page**: http://localhost:3000/maintenance
- **Admin Page**: http://localhost:3000/admin/maintenance

## Flow hoàn chỉnh

```
[User] 
  ↓ Tạo yêu cầu
[Status: pending]
  ↓
[Admin] Xác nhận + Chi phí dự kiến
  ↓
[Status: confirmed]
  ↓
[Admin] Bắt đầu xử lý
  ↓
[Status: in_progress]
  ↓
[Admin] Hoàn thành + Chi phí thực tế
  ↓
[Status: completed]
  ↓
[System] Tự động thêm vào payments → Cập nhật doanh thu kỳ
```

## Security & Permissions

### Row Level Security (RLS)

- **Users**: Chỉ xem/tạo/sửa yêu cầu của mình (khi pending)
- **Admin/Manager**: Xem và sửa tất cả yêu cầu
- **Admin**: Xóa yêu cầu

### Authentication

Tất cả endpoints yêu cầu authentication token từ Supabase.

## Tích hợp với Notification System

Có thể mở rộng với thông báo tự động:

```typescript
// Khi user tạo yêu cầu
await createNotificationForRole('manager', {
  type: NotificationType.INFO,
  title: 'Yêu cầu bảo trì mới',
  message: `Căn hộ ${apt_id} cần hỗ trợ bảo trì`,
  link: `/admin/maintenance`,
});

// Khi admin xác nhận
await createNotificationForUser(user_id, {
  type: NotificationType.SUCCESS,
  title: 'Yêu cầu đã được xác nhận',
  message: `Chi phí dự kiến: ${formatCost(estimated_cost)}`,
  link: `/maintenance`,
});
```

## Testing

### Test User Flow
1. Login as regular user
2. Tạo yêu cầu bảo trì
3. Kiểm tra trạng thái "Chờ xác nhận"

### Test Admin Flow
1. Login as admin/manager
2. Xem yêu cầu mới
3. Xác nhận + thêm chi phí dự kiến
4. Chuyển sang "Đang xử lý"
5. Hoàn thành + chi phí thực tế
6. Kiểm tra payments table

### Verify Financial Integration
```sql
SELECT * FROM payments 
WHERE payment_method = 'maintenance' 
ORDER BY created_at DESC;
```

## Troubleshooting

### Lỗi: "No authentication token"
- Kiểm tra user đã login chưa
- Verify Supabase session

### Lỗi: "Permission denied"
- Kiểm tra RLS policies
- Verify user role

### Doanh thu không cập nhật
- Kiểm tra `actual_cost` > 0
- Verify `period` field có giá trị
- Check payments table

## Future Enhancements

- [ ] Upload hình ảnh vấn đề
- [ ] Chat/Comments giữa user và admin
- [ ] Email notifications
- [ ] Export báo cáo PDF
- [ ] Dashboard analytics
- [ ] Mobile app integration
- [ ] Rating system sau hoàn thành

## Support

Nếu có vấn đề, liên hệ team phát triển hoặc tạo issue trong repository.
