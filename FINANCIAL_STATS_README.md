# Hệ thống Thống kê Tài chính

## Tổng quan
Hệ thống thống kê tài chính toàn diện cho quản lý chung cư, bao gồm 3 module chính:

### 🎯 **Module 3.1: Quản lý Doanh thu**
- **3.1.1 Biểu đồ tăng trưởng**: Theo dõi tốc độ tăng trưởng doanh thu theo tháng
- **3.1.2 Doanh thu theo loại phí**: Phân tích chi tiết từng loại phí (điện, nước, dịch vụ, xe)
- **3.1.3 Phân tích theo tầng/khu**: Thống kê doanh thu theo tầng hoặc khu vực

### ⚠️ **Module 3.2: Kiểm soát Nợ đọng**
- **3.2.1 Lọc căn hộ chưa đóng phí**: Bộ lọc mạnh mẽ với nhiều tiêu chí
- **3.2.2 Tính tổng nợ dư kiện**: Tổng hợp nợ toàn tòa nhà
- **3.2.3 Theo dõi lịch sử trả nợ**: Xem chi tiết lịch sử thanh toán từng căn hộ

### 📊 **Module 3.3: Báo cáo Quyết toán**
- **3.3.1 Tổng hợp thu chi tháng**: Báo cáo chi tiết đầy đủ
- **3.3.2 Xuất báo cáo PDF/Excel**: Export dữ liệu dễ dàng
- **3.3.3 Lưu trữ hồ sơ**: Lưu trữ báo cáo để tra cứu

---

## 🚀 Backend APIs

### Module 3.1: Revenue Management

#### GET `/api/payments/revenue/growth`
Lấy dữ liệu tăng trưởng doanh thu
```
Query params:
- start_period: YYYY-MM (bắt buộc)
- end_period: YYYY-MM (bắt buộc)

Response:
{
  "data": [
    {
      "period": "2024-01",
      "total_income": 50000000,
      "growth_rate": "5.2",
      "previous_income": 47500000
    }
  ]
}
```

#### GET `/api/payments/revenue/by-fee-type`
Phân tích doanh thu theo loại phí
```
Query params:
- period: YYYY-MM (optional)

Response:
{
  "data": {
    "period": "2024-12",
    "total_revenue": 100000000,
    "breakdown": [
      {
        "type": "electric",
        "name": "Tiền điện",
        "total": 30000000,
        "percentage": "30",
        "apartment_count": 50
      }
    ]
  }
}
```

#### GET `/api/payments/revenue/by-floor-area`
Phân tích doanh thu theo tầng/khu
```
Query params:
- period: YYYY-MM (optional)
- group_by: "floor" | "area" (default: "floor")

Response:
{
  "data": {
    "group_by": "floor",
    "total_revenue": 100000000,
    "groups": [
      {
        "group": 5,
        "total_revenue": 15000000,
        "electric": 5000000,
        "water": 3000000,
        "service": 5000000,
        "vehicles": 2000000,
        "apartment_count": 10,
        "percentage": "15",
        "average_per_apartment": "1500000"
      }
    ]
  }
}
```

### Module 3.2: Debt Control

#### GET `/api/payments/debt/unpaid-apartments`
Lấy danh sách căn hộ chưa thanh toán
```
Query params:
- period: YYYY-MM (optional)
- floor: number (optional)
- min_debt: number (optional)
- max_debt: number (optional)
- sort_by: string (default: "debt")
- sort_order: "asc" | "desc" (default: "desc")
- offset: number (default: 0)
- limit: number (default: 50)

Response:
{
  "data": [
    {
      "apt_id": "101",
      "period": "2024-12",
      "owner_name": "Nguyễn Văn A",
      "floor": 5,
      "total_bill": 2000000,
      "paid_amount": 500000,
      "unpaid_amount": 1500000,
      "pre_debt": 300000,
      "payment_status": "Thanh toán một phần"
    }
  ],
  "total": 25,
  "summary": {
    "total_unpaid_apartments": 25,
    "total_unpaid_amount": 37500000,
    "total_pre_debt": 7500000
  }
}
```

#### GET `/api/payments/debt/total-outstanding`
Tổng hợp nợ dư kiện
```
Response:
{
  "data": {
    "total_outstanding_debt": 50000000,
    "total_pre_debt": 10000000,
    "apartments_with_debt": 30,
    "debt_by_period": [
      {
        "period": "2024-12",
        "total_debt": 15000000,
        "apartment_count": 10
      }
    ]
  }
}
```

#### GET `/api/payments/debt/payment-history/:apt_id`
Lịch sử trả nợ của căn hộ
```
Response:
{
  "data": {
    "apt_id": "101",
    "current_debt": 1500000,
    "history": [
      {
        "period": "2024-12",
        "billed": 2000000,
        "pre_debt": 300000,
        "paid": 500000,
        "balance": 1800000,
        "payment_count": 1,
        "payments": [...],
        "status": "Thanh toán một phần"
      }
    ]
  }
}
```

### Module 3.3: Settlement Report

#### GET `/api/payments/settlement/:period`
Báo cáo quyết toán tháng
```
Response:
{
  "data": {
    "period": "2024-12",
    "generated_at": "2024-12-15T10:30:00Z",
    "summary": {
      "total_income": 95000000,
      "total_charges": 100000000,
      "total_debt": 10000000,
      "collection_rate": "95%",
      "bill_count": 50,
      "payment_count": 120,
      "fee_breakdown": {
        "electric": 30000000,
        "water": 20000000,
        "service": 40000000,
        "vehicles": 10000000,
        "total": 100000000
      }
    },
    "by_floor": [...],
    "apartments": [
      {
        "apt_id": "101",
        "owner_name": "Nguyễn Văn A",
        "floor": 5,
        "electric": 500000,
        "water": 300000,
        "service": 800000,
        "vehicles": 200000,
        "pre_debt": 300000,
        "total_bill": 2100000,
        "total_paid": 2100000,
        "balance": 0,
        "status": "Đã thanh toán"
      }
    ],
    "statistics": {
      "total_apartments": 50,
      "paid_apartments": 35,
      "partial_paid": 10,
      "unpaid_apartments": 5,
      "total_outstanding": 5000000
    }
  }
}
```

---

## 💻 Frontend Usage

### Truy cập
Đường dẫn: `/financial-stats`

### Phân quyền
Chỉ Admin và Manager mới có quyền truy cập

### Sử dụng

1. **Module Quản lý Doanh thu**
   - Chọn khoảng thời gian để xem biểu đồ tăng trưởng
   - Chọn tháng cụ thể để phân tích loại phí
   - Chuyển đổi giữa phân tích theo tầng/khu

2. **Module Kiểm soát Nợ**
   - Sử dụng bộ lọc để tìm căn hộ nợ theo nhiều tiêu chí
   - Xem tổng quan nợ dư kiện
   - Click nút "👁️" để xem lịch sử chi tiết của từng căn hộ

3. **Module Báo cáo Quyết toán**
   - Chọn tháng cần báo cáo
   - Click "Tạo báo cáo" để generate
   - Xuất PDF bằng cách click "In / Xuất PDF"
   - Xuất Excel (CSV) để xử lý dữ liệu thêm

---

## 📦 Installation

### Backend
Các services đã được thêm vào:
- `/backend/src/repositories/paymentService.js`
- `/backend/src/controllers/paymentController.js`
- `/backend/src/routes/paymentRoutes.js`

### Frontend
```bash
# Cài đặt dependencies (nếu chưa có)
cd frontend
npm install recharts date-fns
```

Các files đã được tạo:
- `/frontend/app/financial-stats/page.tsx`
- `/frontend/app/financial-stats/components/RevenueManagement.tsx`
- `/frontend/app/financial-stats/components/DebtControl.tsx`
- `/frontend/app/financial-stats/components/SettlementReport.tsx`
- `/frontend/lib/financialApi.ts` (updated)

---

## 🎨 Features

### Biểu đồ & Visualization
- Line Chart: Tăng trưởng doanh thu
- Pie Chart: Phân bố loại phí
- Bar Chart: Doanh thu theo tầng/khu
- Stacked Bar Chart: Chi tiết từng loại phí theo tầng

### Bộ lọc
- Lọc theo kỳ (tháng)
- Lọc theo tầng
- Lọc theo mức nợ (min/max)
- Sắp xếp linh hoạt

### Export
- In / PDF: Sử dụng window.print()
- Excel (CSV): Export dữ liệu với encoding UTF-8

### UI/UX
- Responsive design
- Loading states
- Error handling
- Modal cho chi tiết
- Color-coded badges
- Gradient cards

---

## 🔧 Technical Stack

### Backend
- Node.js + Express
- Supabase PostgreSQL
- RESTful APIs

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Recharts (charts)
- Radix UI (components)
- date-fns (date handling)

---

## 📝 Notes

1. **Dữ liệu**: Cần có dữ liệu bills và payments trong database
2. **Permissions**: Chỉ Admin/Manager có quyền truy cập
3. **Performance**: Các API đã được optimize với pagination
4. **Export**: PDF sử dụng print, CSV có encoding UTF-8 cho tiếng Việt

---

## 🐛 Troubleshooting

### Lỗi "No authentication token"
→ Đảm bảo đã đăng nhập với tài khoản Admin/Manager

### Biểu đồ không hiển thị
→ Kiểm tra có dữ liệu trong khoảng thời gian đã chọn

### Export CSV lỗi font tiếng Việt
→ Mở file bằng Excel và chọn encoding UTF-8

---

## 📞 Support

Nếu có vấn đề, vui lòng:
1. Check console log (F12)
2. Kiểm tra network tab để xem API response
3. Verify dữ liệu trong database

---

**Chúc bạn sử dụng hiệu quả! 🎉**
