# HƯỚNG DẪN NHANH - HỆ THỐNG BẢO TRÌ

## 🎯 Đã hoàn thành

✅ **Database**: Tạo bảng `maintenance_requests` với đầy đủ triggers và RLS policies
✅ **Backend API**: Controllers và routes cho user và admin
✅ **Frontend User**: Trang `/maintenance` để người dùng tạo và theo dõi yêu cầu
✅ **Frontend Admin**: Trang `/admin/maintenance` để quản lý yêu cầu
✅ **Tích hợp Financial**: Tự động cập nhật doanh thu khi hoàn thành

## 🚀 Cách sử dụng

### Bước 1: Chạy SQL trong Supabase

```sql
-- Copy và chạy file này trong Supabase SQL Editor
backend/database/create_maintenance_requests_table.sql
```

### Bước 2: Khởi động hệ thống

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Bước 3: Truy cập

- **Người dùng**: http://localhost:3000/maintenance
- **Admin**: http://localhost:3000/admin/maintenance

## 📋 Quy trình

### Người dùng (Cư dân)
1. Vào trang `/maintenance`
2. Nhấn "Yêu cầu mới"
3. Điền thông tin và gửi
4. Theo dõi trạng thái và chi phí

### Admin/Manager
1. Vào trang `/admin/maintenance`
2. Xem yêu cầu mới (màu vàng)
3. Nhấn "Xác nhận":
   - Nhập chi phí dự kiến
   - Phân công người phụ trách
   - Thêm ghi chú
4. Nhấn "Bắt đầu" khi bắt đầu xử lý
5. Nhấn "Hoàn thành" khi xong:
   - Nhập chi phí thực tế
   - **Tự động cập nhật vào doanh thu**

## 💰 Tích hợp Financial

Khi admin hoàn thành yêu cầu:
- Chi phí thực tế được thêm vào bảng `payments`
- `payment_method = 'maintenance'`
- Tự động tính vào doanh thu của kỳ đó

## 🎨 Màu sắc trạng thái

- 🟡 **Vàng**: Chờ xác nhận (pending)
- 🔵 **Xanh dương**: Đã xác nhận (confirmed)
- 🟣 **Tím**: Đang xử lý (in_progress)
- 🟢 **Xanh lá**: Hoàn thành (completed)

## 📱 Tính năng chính

### User Page
- Tạo yêu cầu bảo trì
- Xem danh sách yêu cầu của mình
- Theo dõi chi phí dự kiến và thực tế
- Thống kê tổng quan

### Admin Page
- Quản lý tất cả yêu cầu
- Tìm kiếm và lọc
- Xác nhận với chi phí dự kiến
- Hoàn thành với chi phí thực tế
- Tự động cập nhật doanh thu

## 🔒 Phân quyền

- **User**: Chỉ xem/tạo/sửa yêu cầu của mình (khi pending)
- **Manager**: Xem và xử lý tất cả yêu cầu
- **Admin**: Full quyền, bao gồm xóa

## ✅ Test nhanh

1. **Login as user** → Tạo yêu cầu
2. **Login as admin** → Xác nhận yêu cầu
3. **Login as admin** → Hoàn thành yêu cầu
4. **Kiểm tra payments** → Doanh thu đã cập nhật

```sql
-- Kiểm tra trong Supabase
SELECT * FROM payments 
WHERE payment_method = 'maintenance'
ORDER BY created_at DESC;
```

## 📁 Files đã tạo

**Backend:**
- `backend/database/create_maintenance_requests_table.sql`
- `backend/src/controllers/maintenanceController.js`
- `backend/src/routes/maintenanceRoutes.js` (đã update)

**Frontend:**
- `frontend/lib/maintenanceApi.ts`
- `frontend/app/(modules)/maintenance/page.tsx` (đã update)
- `frontend/app/admin/maintenance/page.tsx` (mới)

**Documentation:**
- `MAINTENANCE_SYSTEM.md`
- `MAINTENANCE_QUICK_START.md` (file này)

## 🐛 Xử lý lỗi thường gặp

**"No authentication token"**
→ Chưa login, vào `/login`

**"Permission denied"**  
→ User thường không thể vào `/admin/maintenance`

**Doanh thu không cập nhật**
→ Kiểm tra `actual_cost` > 0 và `period` có giá trị

## 📞 Hỗ trợ

Xem chi tiết trong file `MAINTENANCE_SYSTEM.md`

---

**🎉 Hệ thống đã sẵn sàng sử dụng!**
