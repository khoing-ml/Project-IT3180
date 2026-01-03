# Hướng dẫn cài đặt tính năng Biến động nhân khẩu

## Tổng quan
Tính năng này cho phép:
- Cư dân khai báo các biến động nhân khẩu (tạm vắng, tạm trú, chuyển hộ khẩu, v.v.)
- Admin xem và phê duyệt/từ chối các khai báo
- Theo dõi lịch sử biến động của từng cư dân

## Bước 1: Cài đặt Database

### 1.1. Thêm cột CCCD vào bảng residents
```bash
psql -h <host> -U <user> -d <database> -f backend/database/add_cccd_column.sql
```

Hoặc chạy trực tiếp SQL:
```sql
ALTER TABLE IF EXISTS public.residents
ADD COLUMN IF NOT EXISTS cccd TEXT;

CREATE INDEX IF NOT EXISTS idx_residents_cccd ON public.residents(cccd);

ALTER TABLE IF EXISTS public.residents
ADD CONSTRAINT IF NOT EXISTS unique_cccd UNIQUE(cccd) WHERE cccd IS NOT NULL;
```

### 1.2. Tạo bảng population_movements
```bash
psql -h <host> -U <user> -d <database> -f backend/database/create_population_movements_table.sql
```

## Bước 2: Khởi động Backend

Backend đã được cập nhật với:
- Controller: `/backend/src/controllers/populationMovementController.js`
- Service: `/backend/src/repositories/populationMovementService.js`
- Routes: `/backend/src/routes/populationMovementRoutes.js`

Khởi động lại server:
```bash
cd backend
npm run dev
```

## Bước 3: Khởi động Frontend

Frontend đã có sẵn các trang:
- Trang cư dân: `/population-movements`
- Trang admin: `/admin/population-movements`

Khởi động:
```bash
cd frontend
npm run dev
```

## API Endpoints

### Cho cư dân:
- `POST /api/population-movements` - Tạo khai báo mới
- `GET /api/population-movements/resident/:resident_id` - Xem lịch sử khai báo của mình

### Cho admin:
- `GET /api/population-movements/pending` - Xem danh sách chờ duyệt
- `GET /api/population-movements/apartment/:apt_id` - Xem theo căn hộ
- `PUT /api/population-movements/:id/status` - Phê duyệt/từ chối
- `GET /api/population-movements/:id` - Chi tiết một khai báo
- `DELETE /api/population-movements/:id` - Xóa khai báo

## Loại biến động hỗ trợ

- `temporary_absence` - Tạm vắng
- `temporary_residency` - Tạm trú
- `permanent_move` - Chuyển hộ khẩu
- `visit` - Thăm viếng
- `other` - Khác

## Trạng thái

- `pending` - Chờ duyệt (màu vàng)
- `approved` - Đã duyệt (màu xanh)
- `rejected` - Từ chối (màu đỏ)

## Sử dụng

### Cư dân:
1. Đăng nhập vào hệ thống
2. Chọn menu "Biến động nhân khẩu" (trong mục Cá nhân)
3. Click "Khai báo mới"
4. Điền thông tin và gửi yêu cầu
5. Theo dõi trạng thái phê duyệt

### Admin:
1. Đăng nhập với quyền Admin
2. Chọn menu "Biến động nhân khẩu" (trong mục Admin)
3. Xem danh sách khai báo chờ duyệt
4. Click "Chi tiết" để xem thông tin đầy đủ
5. Click "Duyệt" hoặc "Từ chối"

## Lưu ý

- Mỗi cư dân cần có CCCD để khai báo
- Admin có thể xem tất cả khai báo và lọc theo trạng thái
- Hệ thống lưu lịch sử phê duyệt (người duyệt, thời gian)
- Có thể thêm filter theo apartment, resident, hoặc status
