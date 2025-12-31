# Hướng dẫn Hệ thống Quản lý Xe

## Tổng quan

Hệ thống quản lý xe đã được nâng cấp với các tính năng:
1. ✅ Tự động tính phí xe vào hóa đơn hàng tháng
2. ✅ Dân cư yêu cầu đăng ký phương tiện
3. ✅ Ban quản trị xác nhận/từ chối yêu cầu
4. ✅ Quản lý phí gửi xe theo loại xe

## Cài đặt Database

### Bước 1: Chạy SQL Schema

```bash
cd backend
psql -h your-supabase-host -U postgres -d postgres -f database/create_vehicles_table.sql
```

Hoặc sử dụng Supabase SQL Editor và chạy file [create_vehicles_table.sql](backend/database/create_vehicles_table.sql)

### Schema bao gồm:

#### 1. Bảng `vehicles` (Xe đã đăng ký)
- `number` (VARCHAR) - Biển số xe (Primary Key)
- `apt_id` (VARCHAR) - Mã căn hộ
- `owner` (VARCHAR) - Chủ sở hữu
- `type` (VARCHAR) - Loại xe: 'car', 'motorbike', 'bike'
- `color` (VARCHAR) - Màu sắc
- `monthly_fee` (NUMERIC) - Phí hàng tháng
- `status` (VARCHAR) - Trạng thái: 'active', 'inactive', 'suspended'

#### 2. Bảng `vehicle_registration` (Yêu cầu đăng ký)
- `number` (VARCHAR) - Biển số xe (Primary Key)
- `apt_id` (VARCHAR) - Mã căn hộ
- `owner` (VARCHAR) - Chủ sở hữu
- `type` (VARCHAR) - Loại xe
- `color` (VARCHAR) - Màu sắc
- `status` (VARCHAR) - Trạng thái: 'pending', 'approved', 'rejected'
- `created_by` (UUID) - Người tạo yêu cầu
- `reviewed_by` (UUID) - Người xét duyệt
- `rejection_reason` (TEXT) - Lý do từ chối

#### 3. Bảng `vehicle_fee_config` (Cấu hình phí)
Phí mặc định:
- Ô tô: 500,000 VNĐ/tháng
- Xe máy: 100,000 VNĐ/tháng
- Xe đạp: 20,000 VNĐ/tháng

## Tính năng

### 1. Tự động tính phí xe vào hóa đơn

Khi tạo hóa đơn hàng tháng, hệ thống sẽ:
- Tự động đếm số xe của mỗi căn hộ từ bảng `vehicles`
- Tính tổng phí dựa trên `monthly_fee` của từng xe
- Cộng vào cột `vehicles` trong bảng `bills`

**Backend Code**: [billController.js](backend/src/controllers/billController.js#L735-L750)

```javascript
// Calculate vehicle fees automatically from vehicles table
let vehicleFees = 0;
const { data: vehiclesData, error: vehiclesErr } = await supabaseAdmin
    .from('vehicles')
    .select('monthly_fee')
    .eq('apt_id', apt.apt_id)
    .eq('status', 'active');

if (!vehiclesErr && vehiclesData && vehiclesData.length > 0) {
    vehicleFees = vehiclesData.reduce((sum, v) => sum + Number(v.monthly_fee || 0), 0);
}

billObj.vehicles = vehicleFees;
servicesSum += vehicleFees;
```

### 2. Dân cư đăng ký phương tiện

**URL**: http://localhost:3000/vehicles

#### Quy trình cho dân cư:
1. Vào trang "Quản lý xe"
2. Click nút "Đăng ký xe mới"
3. Điền thông tin:
   - Biển số xe
   - Loại xe (Ô tô / Xe máy / Xe đạp)
   - Màu sắc
   - Tên chủ sở hữu
4. Gửi yêu cầu
5. Xem trạng thái yêu cầu trong tab "Yêu cầu của tôi"

**Trạng thái yêu cầu**:
- 🟡 **Đang chờ**: Yêu cầu đã gửi, chờ ban quản trị xét duyệt
- 🟢 **Đã duyệt**: Yêu cầu được chấp nhận, xe đã được đăng ký
- 🔴 **Đã từ chối**: Yêu cầu bị từ chối (có hiển thị lý do)

### 3. Ban quản trị xác nhận yêu cầu

**URL**: http://localhost:3000/vehicles (Admin view)

#### Quy trình cho admin:
1. Vào tab "Yêu cầu đăng ký"
2. Xem danh sách yêu cầu chờ duyệt
3. Click "Chi tiết" để xem thông tin đầy đủ
4. Trong dialog:
   - **Chấp nhận**: 
     - Nhập phí hàng tháng (hoặc dùng phí mặc định)
     - Click "Chấp nhận"
     - Xe sẽ được thêm vào hệ thống và tự động tính phí từ tháng sau
   - **Từ chối**:
     - Click "Từ chối"
     - Nhập lý do từ chối
     - Click "Xác nhận từ chối"

## API Endpoints

### Vehicle Registration Requests

#### Tạo yêu cầu đăng ký (Resident)
```
POST /api/vehicles/insert-request
Body: {
  apt_id: string,
  number: string,
  type: 'car' | 'motorbike' | 'bike',
  color: string,
  owner: string
}
```

#### Lấy yêu cầu theo căn hộ (Resident)
```
GET /api/vehicles/query-request-by-apt?apt_id=A101
```

#### Lấy tất cả yêu cầu (Admin)
```
GET /api/vehicles/query-all-request?page_number=1&page_size=10
```

#### Chấp nhận yêu cầu (Admin only)
```
POST /api/vehicles/approve-request
Headers: Authorization: Bearer <admin_token>
Body: {
  number: string,
  monthly_fee?: number  // Optional, uses default if not provided
}
```

#### Từ chối yêu cầu (Admin only)
```
POST /api/vehicles/reject-request
Headers: Authorization: Bearer <admin_token>
Body: {
  number: string,
  rejection_reason?: string
}
```

### Vehicle Management

#### Lấy xe theo căn hộ
```
GET /api/vehicles/query-by-apt?apt_id=A101
```

#### Đếm xe theo loại và căn hộ
```
GET /api/vehicles/count-by-apt-type?apt_id=A101&type=car
```

## Cách tính phí xe trong hóa đơn

### Ví dụ:

**Căn hộ A101 có:**
- 1 ô tô: 500,000 VNĐ/tháng
- 2 xe máy: 100,000 VNĐ/tháng × 2 = 200,000 VNĐ/tháng

**Tổng phí xe**: 700,000 VNĐ/tháng

**Khi tạo hóa đơn tháng 1/2025:**
```json
{
  "apt_id": "A101",
  "period": "2025-01",
  "electric": 500000,
  "water": 200000,
  "service": 300000,
  "vehicles": 700000,  // ← Tự động tính từ vehicles table
  "total": 1700000
}
```

## Testing

### Test tạo yêu cầu đăng ký:
```bash
curl -X POST http://localhost:3001/api/vehicles/insert-request \
  -H "Content-Type: application/json" \
  -d '{
    "apt_id": "A101",
    "number": "29A-12345",
    "type": "car",
    "color": "Đỏ",
    "owner": "Nguyễn Văn A"
  }'
```

### Test approve request (Admin):
```bash
curl -X POST http://localhost:3001/api/vehicles/approve-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "number": "29A-12345",
    "monthly_fee": 500000
  }'
```

### Test reject request (Admin):
```bash
curl -X POST http://localhost:3001/api/vehicles/reject-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "number": "29A-12345",
    "rejection_reason": "Biển số không hợp lệ"
  }'
```

## Troubleshooting

### Vấn đề: Phí xe không được tính vào hóa đơn
**Giải pháp:**
1. Kiểm tra xe có `status = 'active'` trong bảng `vehicles`
2. Kiểm tra `monthly_fee` không null hoặc 0
3. Chạy lại tạo hóa đơn cho kỳ đó

### Vấn đề: Không thể approve yêu cầu
**Giải pháp:**
1. Kiểm tra user có role 'admin' hoặc 'manager'
2. Kiểm tra biển số xe chưa tồn tại trong bảng `vehicles`
3. Xem logs backend để biết lỗi chi tiết

### Vấn đề: RLS policies block access
**Giải pháp:**
```sql
-- Kiểm tra policies
SELECT * FROM pg_policies WHERE tablename IN ('vehicles', 'vehicle_registration');

-- Disable RLS tạm thời để test (KHÔNG dùng production)
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
```

## Lưu ý quan trọng

1. ⚠️ **Phí xe chỉ được tính cho xe có `status = 'active'`**
2. ⚠️ **Khi approve request, xe sẽ được tạo với `status = 'active'` ngay lập tức**
3. ⚠️ **Phí xe sẽ được tính vào hóa đơn từ kỳ tiếp theo**
4. ⚠️ **Admin có thể chỉnh sửa `monthly_fee` khi approve request**
5. ⚠️ **Resident chỉ có thể xem và tạo yêu cầu, không thể tự approve**

## Files đã thay đổi

### Backend:
- ✅ `backend/database/create_vehicles_table.sql` - Schema mới
- ✅ `backend/src/controllers/billController.js` - Tự động tính phí xe
- ✅ `backend/src/controllers/vehicleController.js` - API approve/reject
- ✅ `backend/src/repositories/vehicleRepository.js` - Thêm query methods
- ✅ `backend/src/routes/vehicleRoute.js` - Routes mới

### Frontend:
- ✅ `frontend/app/helper/api.ts` - API calls mới
- ✅ `frontend/app/helper/type.ts` - Types cho request status
- ✅ `frontend/app/vehicles/user/UserView.tsx` - UI cho resident
- ✅ `frontend/app/vehicles/components/vehicles/requests-tab.tsx` - UI cho admin

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs backend: `npm run dev` trong terminal
2. Kiểm tra console browser (F12)
3. Xem file này để tham khảo API và workflow
