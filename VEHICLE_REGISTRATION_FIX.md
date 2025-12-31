# FIX: Lỗi Submit Vehicle Registration Request

## Vấn đề
Không thể submit yêu cầu đăng ký xe do thiếu column `status` và các fields khác trong bảng `vehicle_registration`.

## Nguyên nhân
Bảng `vehicle_registration` cũ không có các column:
- `status` (pending/approved/rejected)
- `created_by`
- `reviewed_by`
- `reviewed_at`
- `rejection_reason`
- `notes`

## Cách Fix (Chọn 1 trong 2)

### Option 1: Migration Script (KHUYẾN NGHỊ) ⭐

Chạy migration để thêm các column mới vào bảng hiện có:

```bash
# Trong Supabase SQL Editor, paste nội dung của file này:
backend/database/migrate_vehicle_registration.sql
```

Script này sẽ:
- ✅ Kiểm tra và thêm các column nếu chưa có
- ✅ Không làm mất dữ liệu cũ
- ✅ Cập nhật RLS policies

### Option 2: Tạo lại bảng từ đầu

⚠️ **CẢNH BÁO**: Sẽ XÓA tất cả dữ liệu trong `vehicle_registration`!

```sql
-- Drop bảng cũ
DROP TABLE IF EXISTS public.vehicle_registration CASCADE;

-- Sau đó chạy:
backend/database/create_vehicles_table.sql
```

## Kiểm tra sau khi fix

### 1. Kiểm tra schema

```sql
-- Kiểm tra columns trong bảng
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vehicle_registration'
ORDER BY ordinal_position;
```

Kết quả nên có:
```
number          | character varying | NO
apt_id          | character varying | NO
owner           | character varying | NO
type            | character varying | NO
color           | character varying | YES
status          | character varying | YES
created_by      | uuid             | YES
reviewed_by     | uuid             | YES
created_at      | timestamp        | YES
reviewed_at     | timestamp        | YES
rejection_reason| text             | YES
notes           | text             | YES
```

### 2. Test submit từ frontend

1. Vào http://localhost:3000/vehicles
2. Click "Đăng ký xe mới"
3. Điền thông tin và submit
4. Kiểm tra request được tạo:

```sql
SELECT * FROM vehicle_registration ORDER BY created_at DESC LIMIT 5;
```

### 3. Test từ API trực tiếp

```bash
curl -X POST http://localhost:3001/api/vehicles/insert-request \
  -H "Content-Type: application/json" \
  -d '{
    "apt_id": "A101",
    "number": "29A-12345",
    "type": "car",
    "color": "Đỏ",
    "owner": "Test User"
  }'
```

Response success:
```json
{
  "message": "Success",
  "new_request": {
    "number": "29A-12345",
    "apt_id": "A101",
    "owner": "Test User",
    "type": "car",
    "color": "Đỏ",
    "status": "pending",
    "created_at": "2025-12-31T..."
  }
}
```

## Nếu vẫn lỗi

### Lỗi: RLS policy violation

Tạm thời disable RLS để test:

```sql
-- CHẠY VỚI CẨN THẬN - chỉ dùng để debug
ALTER TABLE vehicle_registration DISABLE ROW LEVEL SECURITY;
```

Sau khi test xong, enable lại:

```sql
ALTER TABLE vehicle_registration ENABLE ROW LEVEL SECURITY;
```

### Lỗi: Column does not exist

Check xem column nào bị thiếu:

```bash
# Trong terminal backend
psql <connection_string> -c "\d vehicle_registration"
```

Nếu thiếu column, chạy lại migration script.

### Lỗi: FK constraint violation

Nếu gặp lỗi về foreign key với `created_by`, chạy:

```sql
-- Remove FK constraint if exists
ALTER TABLE vehicle_registration 
DROP CONSTRAINT IF EXISTS vehicle_registration_created_by_fkey;

ALTER TABLE vehicle_registration 
DROP CONSTRAINT IF EXISTS vehicle_registration_reviewed_by_fkey;
```

## Files liên quan

- [migrate_vehicle_registration.sql](backend/database/migrate_vehicle_registration.sql) - Migration script
- [create_vehicles_table.sql](backend/database/create_vehicles_table.sql) - Full schema
- [vehicleController.js](backend/src/controllers/vehicleController.js) - Backend API
- [api.ts](frontend/app/helper/api.ts) - Frontend API calls

## Checklist sau khi fix

- [ ] Chạy migration script thành công
- [ ] Kiểm tra columns đã được thêm
- [ ] Test submit request từ frontend - thành công
- [ ] Test approve request - thành công
- [ ] Test reject request - thành công
- [ ] Kiểm tra status hiển thị đúng trong UI
