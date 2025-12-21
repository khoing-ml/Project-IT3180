# 📁 BlueMoon - Project Structure

## 🎯 Cấu trúc Thư mục (Organized by Quan)

```
Project-IT3180/
│
├── 📂 app/                          # Next.js Frontend (main)
│   ├── 📂 (modules)/                # Route Groups - Chứa các modules
│   │   ├── 📂 building-info/        # Module 1: Thông tin Chung cư
│   │   │   ├── page.tsx             # Page chính (Thông tin, Quy định, Tiện ích)
│   │   │   └── 📂 components/       # Components riêng module
│   │   │
│   │   └── 📂 maintenance/          # Module 2: Quản lý Sửa chữa
│   │       ├── page.tsx             # Page chính (Danh sách, Tạo, Sửa đổi yêu cầu)
│   │       └── 📂 components/       # Components riêng module
│   │
│   ├── 📂 shared/                   # Dùng chung cho toàn bộ app
│   │   └── 📂 components/           
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── SalesChart.tsx
│   │       └── StatsCard.tsx
│   │
│   ├── layout.tsx                   # Root Layout
│   ├── page.tsx                     # Home/Dashboard (landing page)
│   ├── globals.css                  # Global Styles
│   └── favicon.ico
│
├── 📂 backend/                      # Express API Server
│   ├── 📂 src/
│   │   ├── index.js                 # Entry point
│   │   ├── 📂 routes/               # Route definitions
│   │   │   ├── buildingRoutes.js    # API routes cho building-info
│   │   │   └── maintenanceRoutes.js # API routes cho maintenance
│   │   ├── 📂 data/                 # Database/Data files
│   │   │   ├── buildingData.js
│   │   │   └── maintenanceData.js
│   │   ├── 📂 controllers/          # (Optional) Request handlers
│   │   └── 📂 models/               # (Optional) Data models
│   ├── package.json
│   └── README.md
│
├── 📂 public/                       # Static files
│   └── 📂 images/
│       └── 📂 facilities/           # Images cho facilities
│
├── 📂 image/                        # Source images (tạm thời)
│
├── 🔧 Configuration files
│   ├── package.json                 # Root dependencies
│   ├── next.config.ts               # Next.js config
│   ├── tailwind.config.ts           # Tailwind CSS config
│   ├── tsconfig.json                # TypeScript config
│   ├── eslint.config.mjs            # ESLint config
│   ├── postcss.config.mjs           # PostCSS config
│   └── .gitignore
│
└── 📋 Documentation
    └── README.md
```

---

## 👤 Phân công: Quan

**2 Modules chính:**
1. **🏢 Building Info** - Thông tin chung cư & tiện ích
   - Thông tin building (địa chỉ, liên hệ, ...)
   - Nội quy & quy định
   - Danh sách tiện ích (gym, hồ bơi, ...)

2. **🔧 Maintenance** - Quản lý sửa chữa
   - Danh sách yêu cầu sửa chữa
   - Tạo/cập nhật yêu cầu
   - Gán thợ & theo dõi trạng thái

---

## 🔌 API Endpoints (Backend)

### Building Info Routes
```
GET  /api/building         # Lấy thông tin building
PUT  /api/building         # Cập nhật thông tin building
GET  /api/regulations      # Lấy danh sách quy định
GET  /api/facilities       # Lấy danh sách tiện ích
```

### Maintenance Routes
```
GET  /api/maintenance           # Lấy tất cả yêu cầu
POST /api/maintenance           # Tạo yêu cầu mới
GET  /api/maintenance/:id       # Lấy chi tiết yêu cầu
PUT  /api/maintenance/:id       # Cập nhật yêu cầu
DELETE /api/maintenance/:id     # Xóa yêu cầu
```

---

## 🚀 Cách chạy dự án

### Terminal 1: Backend (Port 5001)
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend (Port 3000)
```bash
npm run dev
```

---

## 📦 Dependencies

**Frontend:** Next.js, React, TypeScript, Tailwind CSS, lucide-react
**Backend:** Express.js, Node.js

---

## ✅ Checklist

- [x] Xóa duplicate frontend folder
- [x] Tạo (modules) route groups
- [x] Tổ chức building-info & maintenance
- [x] Tạo shared components folder
- [x] Xóa facilities (không phải module của Quan)
- [ ] Thêm controllers layer (optional)
- [ ] Thêm models layer (optional)
