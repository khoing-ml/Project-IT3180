# 👥 Hệ thống Quản lý Nhân viên - Hướng dẫn Nhanh

## 📋 Tổng quan

Hệ thống quản lý nhân viên cho phép Admin quản lý các nhân viên trong chung cư bao gồm:
- **Kế toán**: Xử lý các công việc liên quan đến tài chính, hóa đơn
- **Thu ngân**: Xử lý thanh toán, thu tiền
- **Hành chính**: Xử lý các công việc hành chính, giấy tờ

## 🚀 Cài đặt Database

### Bước 1: Chạy SQL Script

Chạy file SQL để tạo bảng employees:

```bash
cd backend
```

Trong Supabase SQL Editor, chạy:

```sql
-- Chạy file này trong Supabase SQL Editor
psql -h your-supabase-host -U postgres -d postgres -f database/create_employees_table.sql
```

Hoặc mở file `backend/database/create_employees_table.sql` và copy/paste vào Supabase SQL Editor.

### Bước 2: Verify Database

Kiểm tra bảng đã được tạo:

```sql
SELECT * FROM employees;
```

## 🎯 Sử dụng API

### 1. Lấy danh sách nhân viên

```bash
GET /api/employees?page=1&limit=10&search=&role=&status=
```

**Query Parameters:**
- `page`: Trang hiện tại (default: 1)
- `limit`: Số lượng mỗi trang (default: 10)
- `search`: Tìm kiếm theo tên, email, số điện thoại
- `role`: Lọc theo vai trò (`accountant`, `cashier`, `administrative`)
- `status`: Lọc theo trạng thái (`active`, `inactive`)

**Response:**
```json
{
  "employees": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "full_name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "phone": "0123456789",
      "role": "accountant",
      "status": "active",
      "notes": "",
      "created_at": "2025-12-31T00:00:00.000Z",
      "updated_at": "2025-12-31T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 2. Tạo nhân viên mới

```bash
POST /api/employees
```

**Body:**
```json
{
  "email": "nguyenvana@example.com",
  "password": "password123",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789",
  "role": "accountant",
  "notes": "Kế toán trưởng"
}
```

**Notes:**
- Email phải unique
- Password tối thiểu 6 ký tự
- Role phải là một trong: `accountant`, `cashier`, `administrative`
- Tự động tạo user account với role `manager` trong bảng profiles
- Tự động tạo employee record

### 3. Cập nhật thông tin nhân viên

```bash
PUT /api/employees/:id
```

**Body:**
```json
{
  "full_name": "Nguyễn Văn A",
  "phone": "0987654321",
  "role": "cashier",
  "status": "inactive",
  "notes": "Chuyển sang vị trí thu ngân"
}
```

### 4. Xóa nhân viên

```bash
DELETE /api/employees/:id
```

**Notes:**
- Xóa employee record
- Xóa luôn auth user account
- Thao tác không thể hoàn tác

### 5. Đặt lại mật khẩu

```bash
POST /api/employees/:id/reset-password
```

**Body:**
```json
{
  "password": "newpassword123"
}
```

### 6. Lấy thông tin nhân viên theo ID

```bash
GET /api/employees/:id
```

### 7. Lấy thông tin nhân viên theo user_id

```bash
GET /api/employees/user/:userId
```

## 💻 Sử dụng Frontend

### 1. Truy cập trang quản lý

- Đăng nhập với tài khoản Admin
- Vào sidebar, click **"Quản lý nhân viên"** (chỉ Admin mới thấy)
- Hoặc truy cập trực tiếp: `http://localhost:3000/admin/employees`

### 2. Tìm kiếm và lọc

- **Tìm kiếm**: Nhập tên, email hoặc số điện thoại
- **Lọc theo vai trò**: Chọn Kế toán, Thu ngân hoặc Hành chính
- **Lọc theo trạng thái**: Chọn Hoạt động hoặc Không hoạt động

### 3. Thêm nhân viên mới

1. Click nút **"Thêm nhân viên"**
2. Điền thông tin:
   - Họ tên (bắt buộc)
   - Email (bắt buộc, unique)
   - Mật khẩu (bắt buộc, tối thiểu 6 ký tự)
   - Số điện thoại
   - Vai trò (bắt buộc)
   - Ghi chú
3. Click **"Thêm nhân viên"**

### 4. Chỉnh sửa nhân viên

1. Click icon **Edit** (✏️) ở hàng nhân viên
2. Cập nhật thông tin
3. Click **"Cập nhật"**

### 5. Đặt lại mật khẩu

1. Click icon **Key** (🔑) ở hàng nhân viên
2. Nhập mật khẩu mới (tối thiểu 6 ký tự)
3. Click **"Đặt lại mật khẩu"**

### 6. Xóa nhân viên

1. Click icon **Trash** (🗑️) ở hàng nhân viên
2. Xác nhận xóa
3. Click **"Xóa"**

## 🔐 Phân quyền

### Bảng profiles (System roles)

Khi tạo nhân viên, họ sẽ được gán:
- `role = 'manager'` trong bảng `profiles` → Có quyền truy cập các API hệ thống
- `role` tương ứng trong bảng `employees` → Xác định vai trò công việc cụ thể

### Bảng employees (Job roles)

- `accountant`: Kế toán
- `cashier`: Thu ngân
- `administrative`: Hành chính

### Middleware Authorization

Backend cung cấp các middleware để kiểm tra quyền:

```javascript
const { 
  requireEmployee,      // Kiểm tra là nhân viên (bất kỳ)
  requireAccountant,    // Kiểm tra là kế toán
  requireCashier,       // Kiểm tra là thu ngân
} = require('../middleware/auth');

// Ví dụ sử dụng
router.get('/bills', verifyToken, requireAccountant, getBills);
router.post('/payments', verifyToken, requireCashier, createPayment);
```

## 📊 Database Schema

```sql
employees (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('accountant', 'cashier', 'administrative')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Helper Functions

```sql
-- Lấy role của employee theo user_id
SELECT public.get_employee_role(user_id);

-- Kiểm tra user có phải employee không
SELECT public.is_employee(user_id);
```

## 🎨 UI Components

### Role Badges

- **Kế toán**: 🔵 Blue badge với icon Calculator
- **Thu ngân**: 🟢 Green badge với icon CreditCard  
- **Hành chính**: 🟣 Purple badge với icon FileText

### Status Badges

- **Hoạt động**: 🟢 Green badge với icon UserCheck
- **Không hoạt động**: ⚫ Gray badge với icon UserX

## ⚠️ Lưu ý quan trọng

1. **Email unique**: Mỗi email chỉ có thể tạo 1 nhân viên
2. **Auto profile creation**: Khi tạo nhân viên, hệ thống tự động tạo:
   - Auth user với email/password
   - Profile record với role='manager'
   - Employee record với role cụ thể
3. **Cascade delete**: Khi xóa nhân viên, auth user cũng bị xóa
4. **Password requirement**: Mật khẩu tối thiểu 6 ký tự
5. **Admin only**: Chỉ Admin mới có quyền quản lý nhân viên

## 🧪 Testing

### Test API với curl

```bash
# Lấy danh sách nhân viên
curl -X GET "http://localhost:3001/api/employees" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Tạo nhân viên mới
curl -X POST "http://localhost:3001/api/employees" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test Employee",
    "role": "accountant"
  }'
```

## 📝 Flow đăng nhập của nhân viên

1. Nhân viên đăng nhập bằng email/password
2. Hệ thống xác thực qua Supabase Auth
3. Load profile → role = 'manager'
4. Load employee record → role = 'accountant'/'cashier'/'administrative'
5. Có quyền truy cập các chức năng dựa trên cả 2 roles

## 🔄 Next Steps

Để mở rộng hệ thống, bạn có thể:

1. **Thêm permissions chi tiết hơn** cho từng role
2. **Tạo dashboard riêng** cho từng loại nhân viên
3. **Thêm chức năng chấm công** cho nhân viên
4. **Thêm báo cáo hiệu suất** công việc
5. **Tích hợp với hệ thống lương**

## 🆘 Troubleshooting

### Lỗi "Email already exists"
- Email đã được sử dụng trong hệ thống
- Kiểm tra bảng employees và auth.users

### Lỗi "Failed to create profile"
- Trigger `handle_new_user()` có thể có vấn đề
- Kiểm tra logs trong Supabase

### Không thấy menu "Quản lý nhân viên"
- Đảm bảo đăng nhập với tài khoản Admin
- Role phải là 'admin' trong bảng profiles

### Lỗi 403 khi gọi API
- Kiểm tra token có hợp lệ không
- Kiểm tra role của user
- Đảm bảo đã thêm route vào backend

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:
- Backend logs: `npm run dev` trong thư mục backend
- Browser console: F12 trong browser
- Supabase logs: Dashboard → Logs
