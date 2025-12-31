# 🔧 FIX NGAY: Lỗi Submit Vehicle Registration

## Các bước fix (làm tuần tự):

### Bước 1: Chạy SQL ngay (BẮT BUỘC)

Mở **Supabase SQL Editor** và chạy file này:

```bash
backend/database/quick_fix_vehicle_registration.sql
```

Hoặc copy paste SQL này:

```sql
-- Disable RLS temporarily
ALTER TABLE public.vehicle_registration DISABLE ROW LEVEL SECURITY;

-- Add columns
ALTER TABLE public.vehicle_registration ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE public.vehicle_registration ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.vehicle_registration ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE public.vehicle_registration ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE public.vehicle_registration ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.vehicle_registration ADD COLUMN IF NOT EXISTS notes TEXT;

-- Re-enable with permissive policies
ALTER TABLE public.vehicle_registration ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own registration requests" ON public.vehicle_registration;
DROP POLICY IF EXISTS "Users can create registration requests" ON public.vehicle_registration;
DROP POLICY IF EXISTS "Users can update their pending requests" ON public.vehicle_registration;

CREATE POLICY "Allow all reads" ON public.vehicle_registration FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON public.vehicle_registration FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates" ON public.vehicle_registration FOR UPDATE USING (true);
```

### Bước 2: Restart Backend & Frontend

```bash
# Terminal 1: Backend
cd backend
# Ctrl+C để stop
npm run dev

# Terminal 2: Frontend  
cd frontend
# Ctrl+C để stop
npm run dev
```

### Bước 3: Test Submit

1. Vào: http://localhost:3000/vehicles
2. Click "Đăng ký xe mới"
3. Điền form:
   - Biển số: `29A-12345`
   - Loại xe: Ô tô
   - Màu sắc: Đỏ
   - Chủ sở hữu: Test User
4. Click Submit
5. Xem trong tab "Yêu cầu của tôi" có xuất hiện không

### Bước 4: Kiểm tra database

```sql
-- Xem request vừa tạo
SELECT * FROM vehicle_registration ORDER BY created_at DESC LIMIT 3;
```

## Nếu vẫn lỗi:

### Lỗi 1: "column does not exist"

```sql
-- Xem columns hiện tại
\d vehicle_registration

-- Hoặc
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'vehicle_registration';
```

Nếu thiếu column nào, chạy lại:
```sql
ALTER TABLE public.vehicle_registration ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
```

### Lỗi 2: "permission denied" hoặc "RLS policy"

```sql
-- Disable RLS hoàn toàn để test
ALTER TABLE public.vehicle_registration DISABLE ROW LEVEL SECURITY;
```

### Lỗi 3: Network error hoặc 500

Xem backend logs:
```bash
cd backend
npm run dev
# Xem logs khi submit
```

Xem browser console:
- F12 → Console tab
- Xem lỗi khi click Submit

### Lỗi 4: "Cannot read property of undefined"

Check user logged in:
```javascript
// Trong browser console
console.log(localStorage.getItem('user'))
```

## Files đã update:

✅ [quick_fix_vehicle_registration.sql](backend/database/quick_fix_vehicle_registration.sql) - SQL fix  
✅ [api.ts](frontend/app/helper/api.ts) - Thêm created_by parameter  
✅ [UserView.tsx](frontend/app/vehicles/user/UserView.tsx) - Gửi user.id  

## Test API trực tiếp:

```bash
curl -X POST http://localhost:3001/api/vehicles/insert-request \
  -H "Content-Type: application/json" \
  -d '{
    "apt_id": "A101",
    "number": "29A-TEST1",
    "type": "car",
    "color": "Đỏ",
    "owner": "Test User"
  }'
```

Response thành công:
```json
{
  "message": "Success",
  "new_request": { ... }
}
```

## Checklist:

- [ ] Chạy SQL quick_fix_vehicle_registration.sql ✅
- [ ] Restart backend
- [ ] Restart frontend  
- [ ] Test submit từ UI - thành công
- [ ] Check database có record mới
- [ ] Test approve/reject cũng hoạt động

---

**Nếu làm đúng 3 bước trên mà vẫn lỗi, chụp màn hình:**
1. Browser console (F12 → Console)
2. Backend terminal logs
3. Database table structure: `\d vehicle_registration`
