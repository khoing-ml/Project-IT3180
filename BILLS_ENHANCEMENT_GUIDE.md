# Bills Feature Enhancement - Implementation Guide

## Overview
Comprehensive enhancement to the bills management system with payment tracking, analytics, status management, and automated notifications.

## Database Changes

### New Columns Added to `bills` Table
- `due_date`: Payment deadline (DATE)
- `status`: Payment status ('paid', 'unpaid', 'overdue', 'partial')
- `payment_method`: How payment was made (TEXT)
- `notes`: Additional notes (TEXT)
- `late_fee`: Late payment penalty (NUMERIC)
- `discount`: Discount applied (NUMERIC)
- `last_reminder_sent`: Last reminder timestamp (TIMESTAMP)
- `reminder_count`: Number of reminders sent (INTEGER)

### Database Objects Created
1. **Indexes**: For faster queries on status, due_date, and paid fields
2. **Trigger**: `update_bill_status()` - Automatically updates status based on payment and due date
3. **View**: `bill_analytics` - Period-based analytics aggregation
4. **Functions**:
   - `get_payment_stats(period)` - Comprehensive payment statistics
   - `get_apartment_bill_history(apt_id)` - Payment history per apartment

## How to Apply Database Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `backend/database/enhance_bills_table.sql`
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run** to execute

### Option 2: Using PostgreSQL Client
If you have `psql` installed:
```bash
cd backend
psql $DATABASE_URL -f database/enhance_bills_table.sql
```

### Option 3: Supabase CLI
```bash
supabase db push
```

## Backend API Endpoints Added

### Analytics Endpoints
- `GET /api/bills/analytics` - Get bill analytics from view
- `GET /api/bills/payment-stats?period=YYYY-MM` - Get payment statistics
- `GET /api/bills/apartment-history/:apt_id` - Get apartment bill history
- `GET /api/bills/overdue` - Get all overdue bills

### Action Endpoints
- `PATCH /api/bills/mark-paid` - Mark bill as paid with payment method
  ```json
  { "apt_id": "A101", "period": "2024-01", "payment_method": "transfer" }
  ```
- `PATCH /api/bills/add-late-fee` - Add late fee to bill
  ```json
  { "apt_id": "A101", "period": "2024-01", "late_fee": 50000 }
  ```
- `PATCH /api/bills/apply-discount` - Apply discount to bill
  ```json
  { "apt_id": "A101", "period": "2024-01", "discount": 100000 }
  ```
- `POST /api/bills/send-reminder` - Send payment reminder
  ```json
  { "apt_id": "A101", "period": "2024-01" }
  ```
- `PATCH /api/bills/update-status` - Manually update bill status
  ```json
  { "apt_id": "A101", "period": "2024-01", "status": "paid" }
  ```

## Frontend Components Added

### New Components
1. **BillStatsCards** (`/app/bills/components/BillStatsCards.tsx`)
   - Displays 4 gradient cards: Total/Paid/Unpaid/Overdue
   - Shows payment rate percentage
   - Loading skeleton states

2. **BillAnalyticsChart** (`/app/bills/components/BillAnalyticsChart.tsx`)
   - Bar chart: Total vs Paid vs Overdue amounts by period
   - Line chart: Payment rate trend over periods
   - Pie chart: Status distribution

3. **QuickActionsDialog** (`/app/bills/components/QuickActionsDialog.tsx`)
   - Mark bill as paid with payment method selection
   - Add late fee with amount input
   - Apply discount with amount input
   - Send payment reminder
   - Conditional rendering based on paid status

4. **OverdueBillsList** (`/app/bills/components/OverdueBillsList.tsx`)
   - Table of overdue bills
   - Days overdue calculation
   - Color-coded severity badges (red/orange/yellow)
   - Reminder count tracking

### Updated Components
- **admin-bills-view.tsx**:
  - Added analytics toggle button
  - Integrated BillStatsCards and BillAnalyticsChart
  - Added status filter (all/paid/unpaid/overdue)
  - Added due date column to table
  - Added "Hành động" button for unpaid bills
  - Color-coded status badges
  - Integrated QuickActionsDialog

## New Types Added

### TypeScript Interfaces (`/app/bills/types.ts`)
```typescript
interface Bill {
  // ... existing fields ...
  status?: 'paid' | 'unpaid' | 'overdue' | 'partial';
  due_date?: string;
  payment_method?: string;
  payment_date?: string;
  notes?: string;
  late_fee?: number;
  discount?: number;
  last_reminder_sent?: string;
  reminder_count?: number;
}

interface PaymentStats {
  total_bills: number;
  paid_bills: number;
  unpaid_bills: number;
  overdue_bills: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
  overdue_amount?: number;
  payment_rate: number;
}

interface BillAnalytics {
  period: string;
  total_bills: number;
  paid_bills: number;
  overdue_bills: number;
  total_amount: number;
  paid_amount: number;
  overdue_amount: number;
  avg_bill_amount: number;
  total_late_fees: number;
  total_discounts: number;
}
```

## Features Implemented

### 1. Payment Status Tracking
- Automatic status updates via database trigger
- Manual status override capability
- Status-based filtering in admin view

### 2. Analytics Dashboard
- Toggle analytics view on/off
- Summary cards with key metrics
- Multi-chart analytics (bar/line/pie)
- Period-based comparison

### 3. Quick Actions
- Single-click access to common bill operations
- Payment method recording
- Late fee application
- Discount management
- Reminder system

### 4. Overdue Management
- Automatic overdue detection
- Visual severity indicators
- Reminder tracking
- Days overdue calculation

### 5. Payment Tracking
- Payment method recording
- Payment date timestamp
- Payment history per apartment

## User Notifications

All bill actions trigger user notifications:
- Payment confirmation
- Late fee application
- Discount applied
- Payment reminder

Notifications are sent to residents via the notification system.

## Testing Checklist

### Database
- [ ] Migration applied successfully
- [ ] Trigger works (status updates automatically)
- [ ] View returns data
- [ ] Functions execute without errors

### Backend
- [ ] All new endpoints return 200 OK
- [ ] Mark paid updates both `paid` and `status`
- [ ] Late fee adds to total correctly
- [ ] Discount subtracts from total correctly
- [ ] Reminder increments counter

### Frontend
- [ ] Analytics toggle shows/hides stats
- [ ] Stats cards display correct data
- [ ] Charts render properly
- [ ] Filter by status works
- [ ] Quick actions dialog opens
- [ ] Mark paid action works
- [ ] Late fee action works
- [ ] Discount action works
- [ ] Reminder action works
- [ ] Table shows due date and status badges

## Configuration

### Environment Variables
No new environment variables required. Uses existing:
- `NEXT_PUBLIC_API_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Dependencies
All dependencies already installed:
- `recharts`: For charts
- `date-fns`: For date manipulation
- `lucide-react`: For icons

## Security

### Authorization
All new endpoints require:
- JWT authentication (`verifyToken`)
- Admin or Manager role (`requireAdminOrManager`)

### RLS (Row Level Security)
- Existing RLS policies apply to new columns
- View has proper grants for `authenticated` role
- Functions have proper grants

## Performance

### Optimizations
- Indexes on `status`, `due_date`, `paid`
- Materialized view for analytics (optional upgrade)
- Pagination on overdue bills list

### Caching
- Frontend caches analytics data
- Refetches on bill actions
- Conditional refetch (only when analytics visible)

## Future Enhancements

### Suggested Improvements
1. Bulk operations (mark multiple bills paid)
2. Automated reminder scheduling
3. Payment plan support (partial status)
4. Export overdue bills to CSV
5. Email/SMS integration for reminders
6. Payment gateway integration
7. Receipt generation
8. Late fee calculation rules
9. Discount approval workflow
10. Bill comparison between periods

## Support

### Common Issues

**Q: Analytics not showing data**
- Ensure database migration applied
- Check browser console for API errors
- Verify backend routes are registered

**Q: Quick actions not working**
- Check user role (must be Admin/Manager)
- Verify JWT token is valid
- Check network tab for API errors

**Q: Status not updating automatically**
- Verify trigger was created successfully
- Check `due_date` is set correctly
- Ensure `paid` field updates trigger the function

## Rollback

If you need to rollback the migration:
```sql
-- Remove added columns
ALTER TABLE bills DROP COLUMN IF EXISTS due_date;
ALTER TABLE bills DROP COLUMN IF EXISTS status;
ALTER TABLE bills DROP COLUMN IF EXISTS payment_method;
ALTER TABLE bills DROP COLUMN IF EXISTS notes;
ALTER TABLE bills DROP COLUMN IF EXISTS late_fee;
ALTER TABLE bills DROP COLUMN IF EXISTS discount;
ALTER TABLE bills DROP COLUMN IF EXISTS last_reminder_sent;
ALTER TABLE bills DROP COLUMN IF EXISTS reminder_count;

-- Drop created objects
DROP VIEW IF EXISTS bill_analytics;
DROP FUNCTION IF EXISTS get_payment_stats(TEXT);
DROP FUNCTION IF EXISTS get_apartment_bill_history(TEXT);
DROP FUNCTION IF EXISTS update_bill_status();
DROP TRIGGER IF EXISTS bill_status_update ON bills;
DROP INDEX IF EXISTS idx_bills_status;
DROP INDEX IF EXISTS idx_bills_due_date;
DROP INDEX IF EXISTS idx_bills_paid;
```

## Credits

Implementation Date: 2024
Stack: Next.js, TypeScript, Node.js, Express, PostgreSQL, Supabase
Charts: Recharts library
