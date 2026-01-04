# Cách thêm mã nhân viên vào hệ thống

## Bước 1: Chạy Migration SQL

Bạn cần chạy file migration SQL để thêm cột `employee_code` vào bảng `employees`:

### Cách 1: Sử dụng Supabase Dashboard (Khuyến nghị)

1. Truy cập Supabase Dashboard: https://app.supabase.com
2. Chọn project của bạn
3. Vào **SQL Editor** (menu bên trái)
4. Copy toàn bộ nội dung file `backend/database/add_employee_code.sql`
5. Paste vào SQL Editor
6. Click **Run** để thực thi

### Cách 2: Sử dụng psql

```bash
# Thay đổi connection string theo project của bạn
psql "postgresql://postgres:[YOUR-PASSWORD]@db.dgkjyyyibseafqgyxvfr.supabase.co:5432/postgres" \
  -f backend/database/add_employee_code.sql
```

## Bước 2: Tạo nhân viên mẫu

Sau khi chạy migration thành công, chạy lệnh sau:

```bash
cd backend
node manage-employees.js create-sample
```

## Kiểm tra

Xem danh sách nhân viên với mã nhân viên:

```bash
node manage-employees.js list
```

Expected output:
```
=== Danh sách Nhân viên ===

Mã NV           Role                    Họ tên                          Email                                   Điện thoại      Trạng thái
NV-2026-0001    Kế toán                 Nguyễn Văn An                   nv.ketoan01@bluemoon-staff.com          0901234567      ✓ Hoạt động
NV-2026-0002    Kế toán                 Trần Thị Bình                   nv.ketoan02@bluemoon-staff.com          0901234568      ✓ Hoạt động
...
```

## Troubleshooting

### Lỗi: "Could not find the 'employee_code' column"

**Nguyên nhân**: Chưa chạy migration SQL

**Giải pháp**: Chạy file `backend/database/add_employee_code.sql` trong Supabase SQL Editor

### Lỗi: "A user with this email address has already been registered"

**Nguyên nhân**: Email đã được sử dụng cho user khác

**Giải pháp**: Script sẽ tự động sử dụng lại user đã tồn tại và chỉ tạo employee record mới

### Xóa nhân viên test để tạo lại

```sql
-- Chạy trong Supabase SQL Editor
DELETE FROM employees WHERE email LIKE '%@bluemoon-staff.com';
DELETE FROM profiles WHERE email LIKE '%@bluemoon-staff.com';
```
