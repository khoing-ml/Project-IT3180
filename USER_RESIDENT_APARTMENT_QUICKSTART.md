# Quick Start: User, Resident & Apartment Management Enhancement

## 🚀 Cài Đặt & Chạy

### 1. Apply Database Migration

```bash
cd backend
./apply-enhancement.sh
```

Hoặc thủ công:
```bash
psql <connection-string> -f backend/database/enhance_user_resident_constraints.sql
```

### 2. Khởi Động Backend

```bash
cd backend
npm run dev
```

Backend chạy tại: `http://localhost:3001`

### 3. Khởi Động Frontend

```bash
cd frontend
npm run dev
```

Frontend chạy tại: `http://localhost:3000`

## 📋 Workflow Sử Dụng

### Tạo Cư Dân và User

#### Bước 1: Tạo Căn Hộ
```
Truy cập: http://localhost:3000/apartment
1. Click "Thêm căn hộ"
2. Nhập mã căn hộ (VD: A101)
3. Nhập thông tin chủ hộ
4. Click "Thêm mới"
```

#### Bước 2: Tạo Cư Dân
```
Truy cập: http://localhost:3000/admin/residents
1. Chọn căn hộ từ dropdown
2. Click "Thêm cư dân"
3. Điền thông tin đầy đủ
4. Chọn "Chủ hộ" nếu cần
5. Click "Lưu thông tin"
```

#### Bước 3: Tạo User Account
```
Truy cập: http://localhost:3000/admin/users
1. Click "Create User"
2. Điền email, password, username
3. Chọn role = "user"
4. ⚠️ CHÚ Ý: Phải có resident record trước!
5. Nhập apartment number
6. Click "Create User"
```

### Quản Lý

#### Chỉnh Sửa Cư Dân
```
http://localhost:3000/admin/residents
→ Click nút "Sửa" → Cập nhật thông tin → "Cập nhật"
```

#### Chuyển Chủ Hộ
```
1. Edit resident cần chuyển thành chủ hộ
2. Check vào "Đánh dấu là chủ hộ"
3. Lưu → Chủ hộ cũ tự động bỏ flag
```

#### Xóa Cư Dân
```
⚠️ Nếu là chủ hộ: Hệ thống yêu cầu chỉ định chủ hộ mới
```

## 🔧 API Endpoints Mới

### Residents

```javascript
// Create resident (with optional user_id)
POST /api/residents
{
  "apt_id": "A101",
  "full_name": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "nguyenvana@example.com",
  "is_owner": true,
  "yearOfBirth": 1990,
  "hometown": "Hà Nội",
  "gender": "male",
  "user_id": "uuid-optional"  // NEW
}

// Update resident
PUT /api/residents/:id
{
  "full_name": "Updated Name",
  "phone": "0901234567",
  "is_owner": false
}

// Link resident to user
POST /api/residents/:id/link-user
{
  "user_id": "user-uuid-here"
}

// Delete resident
DELETE /api/residents/:id
// Body (nếu xóa chủ hộ):
{
  "new_owner_id": "another-resident-uuid"
}
```

### Users

```javascript
// Create user - Validation mới
POST /api/users
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "full_name": "Full Name",
  "role": "user",  // Nếu "user" → phải có resident
  "apartment_number": "A101"
}

// Update user - Validation mới
PUT /api/users/:id
{
  "role": "user",  // Check resident exists
  "apartment_number": "A101"  // Check matches resident
}
```

## ⚠️ Validation Rules

### User với role "user"
```
✅ PHẢI có resident record
✅ Apartment number phải khớp với resident's apartment
❌ Không thể tạo/update nếu thiếu resident
```

### Resident
```
✅ Apartment phải tồn tại
✅ Mỗi user chỉ link được 1 resident
✅ Chỉ 1 chủ hộ per apartment
```

### Apartment
```
❌ Không thể xóa nếu còn residents
✅ Phải xóa hết residents trước
```

## 🧪 Test Cases

### Test 1: Tạo User Không Có Resident
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password",
    "username": "testuser",
    "full_name": "Test User",
    "role": "user",
    "apartment_number": "A101"
  }'

# Expected: 400 Error
# "User must be registered as a resident before being assigned role 'user'"
```

### Test 2: Link Resident To User
```bash
# Tạo resident trước
RESIDENT_ID=$(curl -X POST http://localhost:3001/api/residents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"apt_id": "A101", "full_name": "Test Resident"}' \
  | jq -r '.data.id')

# Link với user
curl -X POST "http://localhost:3001/api/residents/$RESIDENT_ID/link-user" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_UUID"}'

# Expected: 200 Success
```

### Test 3: Xóa Apartment Có Residents
```bash
curl -X DELETE http://localhost:3001/api/apartments/A101 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: 400 Error
# "Không được phép xóa căn hộ khi đang có người ở"
```

## 📊 Database Views

### user_resident_info
```sql
-- Xem thông tin kết hợp user + resident
SELECT * FROM user_resident_info WHERE user_id = 'uuid';

-- Các cột:
-- user_id, username, email, user_full_name, role, apartment_number
-- resident_id, apt_id, resident_full_name, phone, is_owner, year_of_birth, ...
```

## 🎨 UI Features

### Residents Page
- ✨ Modern gradient design (blue → purple)
- 🏷️ Badge đặc biệt cho chủ hộ (amber)
- ✏️ Edit modal với full fields
- 🔍 Filter by apartment với tên chủ hộ
- 📍 Hiển thị căn hộ trong table

### Users Page
- ⚠️ Warning khi chọn role "user"
- 💡 Smart hints về resident requirement
- 🎯 Clear error messages

## 🐛 Troubleshooting

### Error: "User must be registered as a resident"
**Giải pháp:**
1. Vào `/admin/residents`
2. Tạo resident cho user
3. Quay lại update user role

### Error: "Apartment does not exist"
**Giải pháp:**
1. Vào `/apartment`
2. Tạo apartment trước
3. Quay lại tạo resident

### Error: "Cannot delete apartment that has residents"
**Giải pháp:**
1. Xóa hết residents trong apartment
2. Sau đó mới xóa apartment

## 📝 Logs & Debugging

```bash
# Backend logs
cd backend && npm run dev

# Frontend logs  
cd frontend && npm run dev

# Database logs
# Check Supabase dashboard → Database → Logs
```

## 🔗 Liên Kết Hữu Ích

- **Apartment Management**: http://localhost:3000/apartment
- **Residents Management**: http://localhost:3000/admin/residents
- **Users Management**: http://localhost:3000/admin/users
- **API Docs**: http://localhost:3001/api-docs (nếu có Swagger)

## 📚 Documentation

Chi tiết đầy đủ: `USER_RESIDENT_APARTMENT_ENHANCEMENT.md`
