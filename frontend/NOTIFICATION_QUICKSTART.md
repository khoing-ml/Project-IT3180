# Quick Start Guide - Notification System

## 🚀 Setup (One-time)

### 1. Run Database Migration
```sql
-- Go to Supabase Dashboard > SQL Editor
-- Copy content from: frontend/database/notifications_schema.sql
-- Execute the SQL
```

### 2. Verify Installation
- Check the notification bell in the header (top right)
- Visit `/test-notifications` to test the system

## 📝 Creating Notifications

### Send to Current User
```typescript
import { createNotification } from '@/lib/notifications';
import { NotificationType } from '@/types/notification';

await createNotification({
  userId: user.id,
  type: NotificationType.SUCCESS,
  title: 'Payment Successful',
  message: 'You have paid the management fee',
  link: '/payments', // optional
});
```

### Send to All Users
```typescript
import { createAnnouncementForAll } from '@/lib/notifications';

await createAnnouncementForAll({
  type: NotificationType.ANNOUNCEMENT,
  title: 'Important Notice',
  message: 'Meeting at 7 PM on Dec 20',
});
```

### Send to Role (admin/manager/user)
```typescript
import { createNotificationForRole } from '@/lib/notifications';

await createNotificationForRole('manager', {
  type: NotificationType.INFO,
  title: 'New Request',
  message: 'Apartment 101 needs maintenance',
  link: '/admin/requests/123',
});
```

### Send to Multiple Users
```typescript
import { createBulkNotifications } from '@/lib/notifications';

await createBulkNotifications(
  ['user-id-1', 'user-id-2'],
  {
    type: NotificationType.WARNING,
    title: 'Payment Due',
    message: 'Please pay by Dec 15',
  }
);
```

## 🎨 Notification Types

| Type | Color | Use Case |
|------|-------|----------|
| `INFO` | Blue | General information |
| `SUCCESS` | Green | Successful actions |
| `WARNING` | Yellow | Important warnings |
| `ERROR` | Red | Error messages |
| `ANNOUNCEMENT` | Purple | Important announcements |

## 🎯 Use in Components

```typescript
'use client';

import { useNotifications } from '@/contexts/NotificationContext';

export default function MyComponent() {
  const {
    notifications,     // All notifications
    unreadCount,      // Number of unread
    isLoading,        // Loading state
    markAsRead,       // Mark one as read
    markAllAsRead,    // Mark all as read
    deleteNotification, // Delete one
    refreshNotifications, // Refresh list
  } = useNotifications();

  return <div>Unread: {unreadCount}</div>;
}
```

## 🧪 Testing

1. Visit `/test-notifications` in your browser
2. Click "Quick Tests" buttons to create sample notifications
3. Check the bell icon in the header
4. Click notifications to test interactions

## 📦 What's Included

✅ Real-time updates via Supabase subscriptions
✅ Notification panel in header (auto-integrated)
✅ TypeScript types
✅ Context API for state management
✅ Utility functions for creating notifications
✅ Test page
✅ Complete documentation
✅ Database schema with RLS policies

## 🔒 Security

- Only admins and managers can create notifications
- Users can only see their own notifications
- All operations require authentication
- Row Level Security (RLS) enabled

## 📚 Full Documentation

See `NOTIFICATION_SYSTEM.md` for complete documentation with examples and troubleshooting.
