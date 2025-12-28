# Bill Setup Feature - Quick Reference

## Access the Feature

**URL:** `http://localhost:3000/admin/bills-setup`
**Required Role:** Admin or Manager

## Workflow

### 1. Create Configuration
```
✓ Click "Tạo mới" button
✓ Select month (YYYY-MM format)
✓ Add services:
  - Name: "Điện", "Nước", "Vệ sinh", etc.
  - Unit Cost: Price per unit
  - Number of Units: How many units
  - Unit: "kWh", "m³", "căn", etc.
✓ System auto-calculates total
✓ Click "Tạo mới" to save as draft
```

### 2. Review Configuration
```
✓ Configuration appears in list
✓ Status shows: "Nháp" (Draft)
✓ Can see all services with breakdown
✓ Can see total amount
```

### 3. Edit Configuration (Before Publishing)
```
✓ Click "Sửa" button on draft configuration
✓ Modify period or services
✓ Click "Cập nhật" to save changes
```

### 4. Publish Configuration
```
✓ Click "Công bố & Thông báo" button
✓ Status changes to "Đã công bố"
✓ All users with role='user' receive notifications
✓ Notification includes all service details
```

### 5. Delete Configuration (Before Publishing)
```
✓ Click delete icon (trash can)
✓ Confirm deletion
✓ Configuration removed from list
```

## Notification Details

When you publish a configuration, all residents receive:

**In-App Notification:**
```
Title: "Cấu hình hóa đơn tháng 2025-01"
Message: "Vui lòng thanh toán hóa đơn tháng 2025-01. 
          Dịch vụ: Điện: 3.500đ/kWh × 100, Nước: 8.000đ/m³ × 50, ...
          Tổng tiền: 800.000đ"
Link: /payments
```

**Bell Icon:**
- Shows unread count
- Updates in real-time
- Click to view full notification

## API Endpoints (For Developers)

### Create Configuration
```bash
POST /api/bills/setup
Authorization: Bearer {token}

{
  "period": "2025-01",
  "services": [
    {"name": "Điện", "unit_cost": 3500, "number_of_units": 100, "unit": "kWh"}
  ]
}
```

### Publish & Notify
```bash
POST /api/bills/publish
Authorization: Bearer {token}

{
  "configId": "{config-id}"
}
```

### Get All Configurations
```bash
GET /api/bills/configs?status=draft
```

### Update Configuration
```bash
PATCH /api/bills/config/{configId}
Authorization: Bearer {token}

{
  "period": "2025-01",
  "services": [...]
}
```

### Delete Configuration
```bash
DELETE /api/bills/config/{configId}
Authorization: Bearer {token}
```

## Service Configuration Example

```json
{
  "name": "Điện",
  "unit_cost": 3500,
  "number_of_units": 100,
  "unit": "kWh"
}
```

**Calculation:**
- Unit Cost: 3,500đ
- Quantity: 100 units
- Total: 3,500 × 100 = 350,000đ

## Status Meanings

| Status | Meaning | Can Edit | Can Delete |
|--------|---------|----------|-----------|
| Nháp (Draft) | Not published yet | ✓ Yes | ✓ Yes |
| Đã công bố (Active) | Published, notifications sent | ✗ No | ✗ No |
| Hoàn thành (Completed) | Billing period finished | ✗ No | ✗ No |

## Calculation Examples

### Example 1: Single Service
```
Service: Điện
Unit Cost: 3,500đ/kWh
Quantity: 100 kWh
Total: 3,500 × 100 = 350,000đ
```

### Example 2: Multiple Services
```
Điện:    3,500đ × 100 kWh = 350,000đ
Nước:    8,000đ × 50 m³  = 400,000đ
Vệ sinh: 50,000đ × 1 căn = 50,000đ
─────────────────────────────────
Total:                     800,000đ
```

## Common Scenarios

### Monthly Billing Setup
```
Period: 2025-01
Services:
- Electricity: 3,500đ/kWh × 100
- Water: 8,000đ/m³ × 50
- Maintenance: 50,000đ/month × 1
```

### Adding New Service Type
```
Period: Same as above (e.g., 2025-01)
Add Service:
- Name: "Internet"
- Unit Cost: 200,000
- Quantity: 1
- Unit: "tháng" (month)
```

### Updating Quantities
```
1. Go to existing draft configuration
2. Click "Sửa"
3. Change "Number of Units" for any service
4. Click "Cập nhật"
5. System recalculates total automatically
```

## Troubleshooting

### I can't access the feature
- ✓ Check you're logged in
- ✓ Check your role is Admin or Manager
- ✓ Try navigating directly to `/admin/bills-setup`

### Clients didn't receive notifications
- ✓ Verify configuration status is "Đã công bố"
- ✓ Check client browser notifications are enabled
- ✓ Try refreshing client's browser
- ✓ Verify all clients have role='user'

### Total amount seems wrong
- ✓ Check unit costs are correct
- ✓ Verify quantities are correct
- ✓ Formula: Total = Σ(unit_cost × quantity) for all services
- ✓ Try clearing browser cache

### Can't edit published configuration
- ✓ This is intentional - only draft configs can be edited
- ✓ Create a new configuration for next period instead
- ✓ Or delete draft and recreate if needed

### Error when publishing
- ✓ Ensure at least one service is configured
- ✓ Check all service fields are filled
- ✓ Verify internet connection
- ✓ Check server is running

## Keyboard Shortcuts

| Action | Method |
|--------|--------|
| Add service | Click green "+" button |
| Remove service | Click red trash icon |
| Create new | Click blue "Tạo mới" button |
| Edit draft | Click "Sửa" button |
| Publish | Click "Công bố & Thông báo" button |
| Delete draft | Click red delete icon |

## Tips & Best Practices

1. **Always Review Before Publishing**
   - Check totals are correct
   - Verify service names make sense
   - Ensure period format is correct (YYYY-MM)

2. **Plan Ahead**
   - Create draft early in the month
   - Review for accuracy
   - Publish before due date

3. **Service Naming Consistency**
   - Use same names each month
   - Examples: "Điện", "Nước", "Vệ sinh", "Bảo trì"
   - Avoid abbreviations

4. **Unit Standardization**
   - kWh for electricity
   - m³ for water
   - căn for unit/building
   - tháng for monthly charge

5. **Document Changes**
   - If costs change, note it in description
   - Keep record of what was published
   - Archive old configurations

## Performance Notes

- ✓ Can handle 100+ concurrent notifications
- ✓ Bulk notifications optimized for speed
- ✓ Total calculations instant (client-side)
- ✓ Database queries indexed for speed

## Support Resources

📖 **Full Documentation:** See [BILL_SETUP_GUIDE.md](BILL_SETUP_GUIDE.md)
📋 **Implementation Details:** See [BILL_SETUP_IMPLEMENTATION.md](BILL_SETUP_IMPLEMENTATION.md)
🧪 **Testing Guide:** See [backend/tests/test-bill-setup.js](backend/tests/test-bill-setup.js)

## Success Indicators

✅ Configuration created in draft status
✅ Can see configuration in list
✅ Can edit services before publishing
✅ Published status shows "Đã công bố"
✅ Total amount displays correctly
✅ Residents receive notifications
✅ Notification includes all services
✅ Click notification goes to payments page

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01 | 1.0 | Initial release |
| - | 1.1 | (Planned: Email notifications) |
| - | 1.2 | (Planned: CSV import) |

---

**Last Updated:** December 23, 2024
**Feature Status:** ✅ Production Ready
