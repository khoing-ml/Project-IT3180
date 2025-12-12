# Notification System Documentation

## Overview
A complete notification system for the Bluemoon apartment management application with real-time updates, persistent storage, and user-friendly UI.

## Features

✅ **Real-time notifications** using Supabase subscriptions
✅ **Notification types**: Info, Success, Warning, Error, Announcement
✅ **Mark as read/unread** functionality
✅ **Delete notifications**
✅ **Unread count badge** on bell icon
✅ **Clickable notifications** with optional links
✅ **Responsive design** with Vietnamese language support
✅ **Auto-refresh** when new notifications arrive
✅ **Time formatting** (e.g., "5 phút trước", "2 giờ trước")

## Database Setup

### 1. Run the SQL Migration

Execute the SQL file in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard > SQL Editor
# Copy and paste the content from: frontend/database/notifications_schema.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 2. Verify the Table

Check that the `notifications` table was created with these columns:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to profiles)
- `type` (TEXT: 'info', 'success', 'warning', 'error', 'announcement')
- `title` (TEXT)
- `message` (TEXT)
- `read` (BOOLEAN)
- `link` (TEXT, optional)
- `metadata` (JSONB, optional)
- `created_at` (TIMESTAMP)

## Usage Examples

### Creating Notifications

#### 1. Create a notification for a specific user

```typescript
import { createNotification } from '@/lib/notifications';
import { NotificationType } from '@/types/notification';

await createNotification({
  userId: 'user-uuid-here',
  type: NotificationType.SUCCESS,
  title: 'Thanh toán thành công',
  message: 'Bạn đã thanh toán phí quản lý tháng 12/2025',
  link: '/payments',
});
```

#### 2. Create notifications for multiple users

```typescript
import { createBulkNotifications } from '@/lib/notifications';
import { NotificationType } from '@/types/notification';

await createBulkNotifications(
  ['user-id-1', 'user-id-2', 'user-id-3'],
  {
    type: NotificationType.ANNOUNCEMENT,
    title: 'Thông báo bảo trì',
    message: 'Hệ thống sẽ bảo trì từ 2h-4h sáng ngày 15/12',
  }
);
```

#### 3. Create notification for all users with a role

```typescript
import { createNotificationForRole } from '@/lib/notifications';
import { NotificationType } from '@/types/notification';

// Notify all residents
await createNotificationForRole('user', {
  type: NotificationType.WARNING,
  title: 'Nhắc nhở thanh toán',
  message: 'Phí quản lý tháng 12 sắp đến hạn',
  link: '/payments',
});

// Notify all managers
await createNotificationForRole('manager', {
  type: NotificationType.INFO,
  title: 'Yêu cầu mới',
  message: 'Có 3 yêu cầu bảo trì mới cần xử lý',
  link: '/admin/maintenance',
});
```

#### 4. Create announcement for all users

```typescript
import { createAnnouncementForAll } from '@/lib/notifications';
import { NotificationType } from '@/types/notification';

await createAnnouncementForAll({
  type: NotificationType.ANNOUNCEMENT,
  title: 'Thông báo quan trọng',
  message: 'Chung cư tổ chức họp cư dân vào 19h ngày 20/12',
  link: '/announcements/123',
});
```

### Using the Notification Hook

```typescript
'use client';

import { useNotifications } from '@/contexts/NotificationContext';

export default function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  // Example: Mark a notification as read
  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  // Example: Mark all as read
  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  // Example: Delete a notification
  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map((notif) => (
        <div key={notif.id}>
          {notif.title}
        </div>
      ))}
    </div>
  );
}
```

## Notification Types

```typescript
export enum NotificationType {
  INFO = "info",          // Blue - General information
  SUCCESS = "success",    // Green - Success messages
  WARNING = "warning",    // Yellow - Warnings
  ERROR = "error",        // Red - Error messages
  ANNOUNCEMENT = "announcement", // Purple - Important announcements
}
```

## Integration Examples

### Example 1: Payment Success Notification

```typescript
// After successful payment
import { createNotification } from '@/lib/notifications';
import { NotificationType } from '@/types/notification';

const handlePaymentSuccess = async (userId: string, amount: number) => {
  await createNotification({
    userId,
    type: NotificationType.SUCCESS,
    title: 'Thanh toán thành công',
    message: `Bạn đã thanh toán ${amount.toLocaleString('vi-VN')}đ`,
    link: '/payments/history',
    metadata: { amount, timestamp: new Date().toISOString() },
  });
};
```

### Example 2: Maintenance Request Notification

```typescript
// When a resident submits a maintenance request
import { createNotificationForRole } from '@/lib/notifications';
import { NotificationType } from '@/types/notification';

const notifyManagersOfRequest = async (requestId: string, apartmentNumber: string) => {
  await createNotificationForRole('manager', {
    type: NotificationType.INFO,
    title: 'Yêu cầu bảo trì mới',
    message: `Căn hộ ${apartmentNumber} cần hỗ trợ bảo trì`,
    link: `/admin/maintenance/${requestId}`,
  });
};
```

### Example 3: System Announcement

```typescript
// Admin sends announcement to all residents
import { createAnnouncementForAll } from '@/lib/notifications';
import { NotificationType } from '@/types/notification';

const sendAnnouncement = async (title: string, message: string) => {
  await createAnnouncementForAll({
    type: NotificationType.ANNOUNCEMENT,
    title,
    message,
  });
};
```

## UI Components

### NotificationPanel
The main notification dropdown component already integrated in the Header. Features:
- Click bell icon to open/close
- Real-time badge showing unread count
- Mark individual notifications as read
- Mark all as read
- Delete notifications
- Click notifications to navigate to linked pages
- Auto-close when clicking outside

### Styling
The notification panel uses Tailwind CSS with a dark theme matching your existing design:
- Slate background colors
- Gradient accents
- Smooth transitions
- Responsive design

## Security

The notification system includes Row Level Security (RLS) policies:
- Users can only view their own notifications
- Users can only update/delete their own notifications
- Only admins and managers can create notifications
- All operations are authenticated via Supabase auth

## Performance

- Notifications are limited to 50 most recent per user
- Real-time subscriptions only for the logged-in user
- Indexed queries for fast retrieval
- Optional auto-cleanup of old read notifications (30+ days)

## Troubleshooting

### Notifications not appearing?
1. Check that the SQL migration was run successfully
2. Verify RLS policies are enabled
3. Check browser console for errors
4. Ensure user is authenticated

### Real-time updates not working?
1. Verify Supabase Realtime is enabled for the notifications table
2. Check that the subscription is active in browser console
3. Ensure user_id filter is correct

### Can't create notifications?
1. Verify the user has 'admin' or 'manager' role
2. Check the RLS policies
3. Verify all required fields are provided

## Future Enhancements

Potential improvements:
- Push notifications (browser/mobile)
- Email notifications
- Notification preferences/settings
- Notification categories/filters
- Sound alerts
- Desktop notifications API
- Batch operations
- Export notification history

## Support

For issues or questions, check:
- Supabase Dashboard logs
- Browser console errors
- Network tab for failed requests
- RLS policy configuration
