# Cải Tiến Hệ Thống Quản Lý User, Resident và Apartment

## Tổng Quan

Đã cải thiện toàn bộ hệ thống quản lý User, Resident và Apartment với các ràng buộc tốt hơn và logic CRUD hợp lý.

## Các Thay Đổi Chi Tiết

### 1. Database Schema (`backend/database/enhance_user_resident_constraints.sql`)

#### Các Cải Tiến:

- **Thêm cột `user_id`** vào bảng `residents` để liên kết residents với users
- **Unique constraint**: Mỗi user chỉ có thể có 1 resident record
- **View mới**: `user_resident_info` để xem thông tin kết hợp user-resident
- **Trigger tự động**: 
  - Sync apartment_number từ resident sang profiles
  - Validate chỉ 1 owner per apartment
  - Prevent xóa apartment khi còn residents

#### Chạy Migration:

```bash
# Connect to your Supabase database and run:
psql -h <host> -U <user> -d <db> -f backend/database/enhance_user_resident_constraints.sql
```

### 2. Backend API Cập Nhật

#### User Controller (`backend/src/controllers/userController.js`)

**Validation Mới:**
- ✅ User với role "user" PHẢI có resident record trước khi được assign role
- ✅ Apartment number phải khớp với resident's apartment
- ✅ Khi xóa user, tự động unlink resident (không xóa resident)

**Ví dụ Error Messages:**
```javascript
"User must be registered as a resident before being assigned role 'user'. Please create a resident record first."
```

#### Resident Controller (`backend/src/controllers/residentController.js`)

**API Endpoints Mới:**

1. **PUT `/residents/:id`** - Update resident
   ```javascript
   {
     full_name: "Updated Name",
     phone: "0901234567",
     is_owner: true,
     // ... other fields
   }
   ```

2. **POST `/residents/:id/link-user`** - Link resident to user
   ```javascript
   {
     user_id: "uuid-here"
   }
   ```

**Validation Mới:**
- ✅ Apartment phải tồn tại trước khi tạo resident
- ✅ Mỗi user chỉ có thể link với 1 resident
- ✅ Tự động sync apartment info khi link

#### Apartment Service (`backend/src/repositories/apartmentService.js`)

**Validation Mới:**
- ✅ Check duplicate apartment ID
- ✅ Validate required fields
- ✅ Set default values (status, resident_count)

### 3. Frontend Cập Nhật

#### Apartment Management (`/apartment`)

**Cải Tiến:**
- ✅ UI hiện đại hơn với gradients và animations
- ✅ Validation tốt hơn khi tạo/update
- ✅ Error handling rõ ràng

#### Residents Management (`/admin/residents`)

**Tính Năng Mới:**
- ✅ **Chỉnh sửa cư dân** - Modal edit với đầy đủ fields
- ✅ **Filter theo căn hộ** - Hiển thị tên chủ hộ trong dropdown
- ✅ **UI cải tiến** - Gradients, badges đẹp mắt
- ✅ **Validation** - Require apartment khi tạo mới
- ✅ **Hiển thị căn hộ** - Cột apartment_id trong table

**Giao Diện:**
- Modern gradient design (blue to purple)
- Badge đặc biệt cho chủ hộ (amber gradient)
- Icons cho các actions (Edit, Delete)
- Modal responsive với scroll

#### Users Management (`/admin/users`)

**Cải Tiến:**
- ✅ **Warning cho role "user"**: Hiển thị cảnh báo phải có resident record
- ✅ **Validation messages**: Rõ ràng khi thiếu resident
- ✅ **Smart hints**: Gợi ý đảm bảo resident đã tạo

**Giao Diện Warning:**
```tsx
┌─────────────────────────────────────┐
│ ⚠️  Lưu ý:                          │
│ User với role "user" phải đăng ký   │
│ thành cư dân (resident) trước.      │
│ Vui lòng tạo resident record tại    │
│ trang Quản lý cư dân.              │
└─────────────────────────────────────┘
```

### 4. API Client Updates (`frontend/lib/api.ts`)

**residentAPI Mới:**
```typescript
residentAPI.update(id, payload)      // Update resident
residentAPI.linkToUser(id, user_id)  // Link to user
```

## Workflow Đề Xuất

### Tạo User Là Cư Dân:

1. **Bước 1**: Tạo Apartment (nếu chưa có)
   - Vào `/apartment`
   - Click "Thêm căn hộ"
   - Điền thông tin

2. **Bước 2**: Tạo Resident
   - Vào `/admin/residents`
   - Click "Thêm cư dân"
   - Chọn căn hộ
   - Điền thông tin cư dân
   - Đánh dấu "Chủ hộ" nếu cần

3. **Bước 3**: Link Resident với User (Optional)
   - Gọi API: `POST /residents/:id/link-user`
   - Body: `{ user_id: "uuid" }`

4. **Bước 4**: Tạo hoặc Update User
   - Vào `/admin/users`
   - Tạo user mới hoặc edit user hiện tại
   - Set role = "user"
   - Apartment number sẽ tự động sync

### Xóa User/Resident:

**Xóa User:**
- Resident sẽ được unlink (user_id = null)
- Resident KHÔNG bị xóa
- Có thể link lại với user khác

**Xóa Resident:**
- Nếu là chủ hộ: PHẢI chỉ định chủ hộ mới
- System sẽ reject nếu không có new_owner_id

**Xóa Apartment:**
- KHÔNG THỂ xóa nếu còn residents
- Phải xóa hết residents trước

## Ràng Buộc Dữ Liệu

### Database Level:
```sql
-- 1 user = 1 resident max
UNIQUE INDEX idx_residents_user_id_unique

-- Apartment với residents không thể xóa
TRIGGER prevent_apartment_delete_trigger

-- Auto sync apartment_number
TRIGGER sync_user_apartment_trigger

-- Chỉ 1 owner per apartment
TRIGGER validate_apartment_owner_trigger
```

### Application Level:
- User role "user" → MUST have resident
- Resident → MUST have valid apartment
- Delete owner → MUST assign new owner

## Error Messages Tiếng Việt

```
❌ "Vui lòng chọn căn hộ trước khi thêm cư dân"
❌ "Apartment A101 does not exist. Please create the apartment first."
❌ "This user already has a resident record. Each user can only have one resident profile."
❌ "User must be registered as a resident before being assigned role 'user'"
❌ "Cannot delete apartment that has residents. Remove residents first."
❌ "Cannot delete household owner without assigning a new owner"
```

## Testing Checklist

- [ ] Tạo apartment mới
- [ ] Tạo resident cho apartment
- [ ] Đánh dấu resident là chủ hộ
- [ ] Link resident với user account
- [ ] Tạo user với role "user" (có resident)
- [ ] Thử tạo user "user" không có resident (should fail)
- [ ] Update resident info
- [ ] Chuyển chủ hộ sang resident khác
- [ ] Xóa resident (không phải chủ hộ)
- [ ] Xóa resident chủ hộ (với new_owner_id)
- [ ] Thử xóa apartment có residents (should fail)
- [ ] Xóa user → check resident unlinked

## UI/UX Improvements

### Colors & Design:
- **Primary Gradient**: Blue (#3B82F6) → Purple (#9333EA)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Icons:
- UsersIcon for residents
- Edit for modify actions
- Trash2 for delete actions
- UserPlus for add resident
- Shield for admin role

### Animations:
- Hover: scale(1.05) + shadow
- Transitions: all 300ms
- Fade in: backdrop blur

## Kết Luận

Hệ thống đã được cải tiến toàn diện với:
- ✅ Ràng buộc dữ liệu chặt chẽ hơn
- ✅ Validation tốt hơn ở cả backend và frontend
- ✅ UI/UX hiện đại và thân thiện
- ✅ CRUD logic hợp lý và an toàn
- ✅ Error handling rõ ràng

**Luồng công việc chính:**
Apartment → Resident → User (nếu cần)

**Nguyên tắc:** Resident là trung tâm. User chỉ là account để login.
