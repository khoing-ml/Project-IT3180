# Hướng dẫn nâng cấp bảng Residents với thông tin Sổ hộ khẩu

## Bước 1: Chạy SQL để thêm các cột mới

Vào **Supabase Dashboard** → **SQL Editor** và chạy nội dung file:
```
backend/database/enhance_residents_table.sql
```

Hoặc copy và paste trực tiếp SQL này:

```sql
-- Add additional columns to residents table
ALTER TABLE public.residents
ADD COLUMN IF NOT EXISTS cccd TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS hometown TEXT,
ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT DEFAULT 'Kinh',
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Việt Nam',
ADD COLUMN IF NOT EXISTS relationship_to_owner TEXT,
ADD COLUMN IF NOT EXISTS previous_residence TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS workplace TEXT,
ADD COLUMN IF NOT EXISTS registration_date DATE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_residents_cccd ON public.residents(cccd);
CREATE INDEX IF NOT EXISTS idx_residents_date_of_birth ON public.residents(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_residents_gender ON public.residents(gender);
CREATE INDEX IF NOT EXISTS idx_residents_user_id ON public.residents(user_id);
```

## Bước 2: Tạo bảng population_movements

Chạy SQL:
```sql
CREATE TABLE IF NOT EXISTS public.population_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  apt_id TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  reason TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  requested_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_population_movements_resident_id ON public.population_movements(resident_id);
CREATE INDEX IF NOT EXISTS idx_population_movements_apt_id ON public.population_movements(apt_id);
CREATE INDEX IF NOT EXISTS idx_population_movements_status ON public.population_movements(status);
```

## Bước 3: Tạo resident cho tài khoản admin

Chạy script:
```bash
cd backend
node create-admin-resident.js
```

## Danh sách các trường trong Sổ hộ khẩu

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| `full_name` | TEXT | Họ và tên |
| `cccd` | TEXT | Số Căn cước công dân/CMND |
| `date_of_birth` | DATE | Ngày sinh |
| `gender` | TEXT | Giới tính (Nam/Nữ) |
| `hometown` | TEXT | Quê quán |
| `place_of_birth` | TEXT | Nơi sinh |
| `ethnicity` | TEXT | Dân tộc (mặc định: Kinh) |
| `religion` | TEXT | Tôn giáo |
| `nationality` | TEXT | Quốc tịch (mặc định: Việt Nam) |
| `relationship_to_owner` | TEXT | Quan hệ với chủ hộ |
| `previous_residence` | TEXT | Nơi thường trú trước khi chuyển đến |
| `occupation` | TEXT | Nghề nghiệp |
| `workplace` | TEXT | Nơi làm việc |
| `registration_date` | DATE | Ngày đăng ký thường trú |
| `phone` | TEXT | Số điện thoại |
| `email` | TEXT | Email |
| `is_owner` | BOOLEAN | Là chủ hộ |
| `user_id` | UUID | Liên kết với tài khoản người dùng |

## Lưu ý

- Sau khi chạy SQL, Supabase sẽ tự động cập nhật schema cache
- Các cột được thêm với `IF NOT EXISTS` nên có thể chạy nhiều lần
- Chỉ số (indexes) được tạo cho các trường hay tra cứu
- `user_id` liên kết với bảng `auth.users` để mapping cư dân với tài khoản
