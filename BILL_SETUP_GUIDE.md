# Bill Configuration and Setup Guide

## Overview

The bill setup feature allows administrators and managers to configure and publish bills for all residents (clients). This includes setting up:
- Custom service types (electricity, water, maintenance, etc.)
- Unit costs for each service
- Number of units to charge
- The billing period

When a configuration is published, all residents (users with role='user') are automatically notified with the bill details.

## Database Schema

### Bill Configurations Table

```sql
CREATE TABLE bill_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL UNIQUE,                    -- Format: YYYY-MM (e.g., "2025-01")
  services JSONB NOT NULL,                        -- Array of service objects
  status TEXT DEFAULT 'draft',                    -- 'draft' | 'active' | 'completed'
  created_by UUID NOT NULL,                       -- References profiles(id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE           -- When published
);
```

### Service Object Structure

Each service in the `services` array has the following structure:

```json
{
  "name": "string",              // Service name (e.g., "Điện", "Nước")
  "unit_cost": number,           // Cost per unit (e.g., 3500 for kWh)
  "number_of_units": number,     // Number of units to charge (e.g., 100 kWh)
  "unit": "string"               // Unit of measurement (e.g., "kWh", "m³")
}
```

## API Endpoints

### 1. Create Bill Configuration (Draft)

Create a new bill configuration in draft status.

**Endpoint:** `POST /api/bills/setup`

**Authentication:** Required (Admin/Manager)

**Request Body:**
```json
{
  "period": "2025-01",
  "services": [
    {
      "name": "Điện",
      "unit_cost": 3500,
      "number_of_units": 100,
      "unit": "kWh"
    },
    {
      "name": "Nước",
      "unit_cost": 8000,
      "number_of_units": 50,
      "unit": "m³"
    },
    {
      "name": "Vệ sinh",
      "unit_cost": 50000,
      "number_of_units": 1,
      "unit": "căn"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Bill configuration created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "period": "2025-01",
    "services": [...],
    "status": "draft",
    "created_by": "user-uuid",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error (500):**
```json
{
  "message": "Error message here"
}
```

### 2. Publish Configuration and Notify Clients

Publish a draft configuration and send notifications to all clients.

**Endpoint:** `POST /api/bills/publish`

**Authentication:** Required (Admin/Manager)

**Request Body:**
```json
{
  "configId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```json
{
  "message": "Bill configuration published and all clients notified",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "period": "2025-01",
    "services": [...],
    "status": "active",
    "created_by": "user-uuid",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:31:00Z",
    "published_at": "2025-01-15T10:31:00Z"
  },
  "totalAmount": 525000,
  "clientsNotified": true
}
```

**What Happens:**
- Configuration status changes from 'draft' to 'active'
- All users with role='user' receive a warning notification
- Notification includes service details and total amount
- Notification includes a link to `/payments`

**Notification Template:**
```
Title: "Cấu hình hóa đơn tháng {period}"
Message: "Vui lòng thanh toán hóa đơn tháng {period}. Dịch vụ: {servicesList}. Tổng tiền: {totalAmount}đ"
```

### 3. Get All Bill Configurations

Retrieve all bill configurations with optional status filter.

**Endpoint:** `GET /api/bills/configs?status={status}`

**Query Parameters:**
- `status` (optional): Filter by status - 'draft', 'active', or 'completed'

**Response (200 OK):**
```json
{
  "message": "Success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "period": "2025-01",
      "services": [...],
      "status": "active",
      "created_by": "user-uuid",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:31:00Z",
      "published_at": "2025-01-15T10:31:00Z"
    }
  ]
}
```

### 4. Get Specific Bill Configuration

Retrieve details of a specific bill configuration.

**Endpoint:** `GET /api/bills/config/{configId}`

**Response (200 OK):**
```json
{
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "period": "2025-01",
    "services": [...],
    "status": "active",
    "created_by": "user-uuid",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:31:00Z",
    "published_at": "2025-01-15T10:31:00Z"
  }
}
```

### 5. Update Bill Configuration

Update an existing bill configuration (only in draft status).

**Endpoint:** `PATCH /api/bills/config/{configId}`

**Authentication:** Required (Admin/Manager)

**Request Body:**
```json
{
  "period": "2025-01",
  "services": [
    {
      "name": "Điện",
      "unit_cost": 3500,
      "number_of_units": 100,
      "unit": "kWh"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Bill configuration updated successfully",
  "data": { ... }
}
```

**Restrictions:**
- Only configurations in 'draft' status can be updated
- Cannot update published (active) configurations

### 6. Delete Bill Configuration

Delete a bill configuration (only in draft status).

**Endpoint:** `DELETE /api/bills/config/{configId}`

**Authentication:** Required (Admin/Manager)

**Response (200 OK):**
```json
{
  "message": "Bill configuration deleted successfully"
}
```

**Restrictions:**
- Only configurations in 'draft' status can be deleted
- Cannot delete published (active) configurations

## Frontend Implementation

### Accessing the Setup Interface

Navigate to: `/admin/bills-setup`

**Requirements:**
- User must have role='admin' or role='manager'
- Page will redirect unauthorized users to `/unauthorized`

### Features

1. **View All Configurations**
   - Lists all bill configurations
   - Shows status (Draft, Active, Completed)
   - Displays services and total amount
   - Shows creation date

2. **Create New Configuration**
   - Click "Tạo mới" button
   - Enter billing period (YYYY-MM format)
   - Add services with:
     - Service name
     - Unit cost
     - Number of units
     - Unit type
   - Click "Tạo mới" to save as draft

3. **Edit Configuration**
   - Only available for draft configurations
   - Click "Sửa" to modify
   - Update services and period
   - Click "Cập nhật" to save changes

4. **Publish Configuration**
   - Only available for draft configurations
   - Click "Công bố & Thông báo"
   - Sends notifications to all clients
   - Configuration status changes to "Đã công bố" (Active)

5. **Delete Configuration**
   - Only available for draft configurations
   - Click delete icon
   - Requires confirmation

### Calculation

Total amount is calculated automatically:
```
Total = Sum of (unit_cost × number_of_units) for all services
```

For example:
- Electricity: 3500 × 100 = 350,000đ
- Water: 8000 × 50 = 400,000đ
- Maintenance: 50000 × 1 = 50,000đ
- **Total: 800,000đ**

## Usage Example

### Step 1: Create Configuration

```javascript
const response = await fetch('http://localhost:3001/api/bills/setup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    period: '2025-01',
    services: [
      { name: 'Điện', unit_cost: 3500, number_of_units: 100, unit: 'kWh' },
      { name: 'Nước', unit_cost: 8000, number_of_units: 50, unit: 'm³' },
      { name: 'Vệ sinh', unit_cost: 50000, number_of_units: 1, unit: 'căn' }
    ]
  })
});
```

### Step 2: Review Configuration

```javascript
const response = await fetch('http://localhost:3001/api/bills/configs');
const data = await response.json();
console.log(data.data); // List of all configurations
```

### Step 3: Publish and Notify

```javascript
const response = await fetch('http://localhost:3001/api/bills/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    configId: 'config-uuid-here'
  })
});
```

All users with role='user' will immediately receive a notification:
- Icon: Bell with warning color
- Title: "Cấu hình hóa đơn tháng 2025-01"
- Message: Details of all services and total amount
- Link: `/payments` page

## Notifications Sent to Clients

When a configuration is published, all clients receive:

**Notification Type:** `warning`
**Title:** "Cấu hình hóa đơn tháng {period}"
**Message:** "Vui lòng thanh toán hóa đơn tháng {period}. Dịch vụ: {servicesList}. Tổng tiền: {totalAmount}đ"
**Link:** `/payments`
**Metadata:**
```json
{
  "period": "2025-01",
  "services": [...],
  "totalAmount": 525000
}
```

## Best Practices

1. **Always Review Before Publishing**
   - Double-check all service details
   - Verify unit costs and quantities
   - Ensure the period is correct

2. **Set Periods Consistently**
   - Use YYYY-MM format
   - Each period should be unique
   - Only one active configuration per period

3. **Plan Ahead**
   - Create configuration in draft status
   - Review for a few days if needed
   - Publish early in the month

4. **Track Published Configurations**
   - Published configurations show "Đã công bố" status
   - Cannot be edited once published
   - Keep records for audit purposes

5. **Service Naming**
   - Use clear, consistent names
   - Examples: "Điện", "Nước", "Vệ sinh", "Bảo trì"
   - Same names should be used across periods for consistency

## Error Handling

### Common Errors

**Period is required:**
```json
{ "message": "Period and services array are required" }
```

**Invalid service data:**
```json
{ "message": "Service 0: name, unit_cost, number_of_units, and unit are required" }
```

**Configuration not found:**
```json
{ "message": "Bill configuration not found" }
```

**Cannot update published configuration:**
```json
{ "message": "Can only update configurations in draft status" }
```

## Security Considerations

1. **Access Control**
   - Only admins and managers can create/publish
   - RLS policies enforce role-based access
   - All users can view active configurations

2. **Data Validation**
   - All numeric values are validated
   - Period format is checked
   - Service names are required

3. **Audit Trail**
   - `created_by` tracks who created the configuration
   - `created_at` and `updated_at` timestamps
   - `published_at` shows when it was published

## Troubleshooting

### Clients Not Receiving Notifications

1. Check that configuration status is 'active'
2. Verify all clients have role='user'
3. Check browser console for errors
4. Verify Supabase notifications table exists

### Wrong Total Amount

1. Verify unit_cost is correct
2. Check number_of_units value
3. Recalculate: total = Σ(unit_cost × number_of_units)

### Cannot Publish Configuration

1. Configuration must be in 'draft' status
2. All services must have valid data
3. Period must be unique

## Future Enhancements

- [ ] Bill history and archival
- [ ] Partial payment tracking per service
- [ ] Payment deadline configuration
- [ ] Automatic bill reminders
- [ ] Multi-period configuration
- [ ] Service templates
- [ ] Export configurations to PDF
