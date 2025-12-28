# BlueMoon Notification System - Complete Implementation Guide

## Overview

The BlueMoon notification system is fully implemented with real-time updates, persistent storage, and automatic triggers from various system operations.

## Architecture

### Frontend
- **NotificationContext** (`contexts/NotificationContext.tsx`) - Manages notification state with real-time Supabase subscriptions
- **NotificationPanel** (`components/NotificationPanel.tsx`) - UI component for displaying notifications
- **Notification Library** (`lib/notifications.ts`) - Helper functions for creating notifications from the frontend

### Backend
- **NotificationController** (`backend/src/controllers/notificationController.js`) - API endpoints for notification operations
- **NotificationRoutes** (`backend/src/routes/notificationRoutes.js`) - Express routes for notification API
- **Integrated Notifications** - Automatic notifications triggered from:
  - Bill operations (creation, update, payment collection)
  - Payment processing
  - Visitor registration and approval
  - User management events

### Database
- **Notifications Table** - Supabase table with RLS policies for data security

## Features

✅ Real-time notifications with Supabase subscriptions
✅ Multiple notification types: info, success, warning, error, announcement
✅ Mark as read/unread functionality
✅ Delete notifications
✅ Unread count badge
✅ Clickable notifications with optional links
✅ Metadata support for additional context
✅ Auto-trigger on system events
✅ Responsive dark/light mode support
✅ Vietnamese language support

## Automatic Notifications

### When Bills Are Created
- **Triggered by:** `billController.insert_new_bill()`
- **Recipient:** Apartment owner
- **Type:** Warning
- **Message:** "Hóa đơn mới cho căn hộ [apt_id] đã được tạo. Vui lòng thanh toán kịp thời."
- **Link:** `/payments`

### When Bills Are Updated
- **Triggered by:** `billController.update_exist_bill()`
- **Recipient:** Apartment owner
- **Type:** Info
- **Message:** "Hóa đơn của căn hộ [apt_id] đã được cập nhật. Vui lòng kiểm tra lại."
- **Link:** `/payments`

### When Bills Are Paid (Collected)
- **Triggered by:** `billController.collect_bill()`
- **Recipient:** Apartment owner
- **Type:** Success
- **Message:** "Hóa đơn của căn hộ [apt_id] đã được thanh toán thành công. Số tiền: [amount]đ"
- **Link:** `/payments`

### When Monthly Bills Are Created
- **Triggered by:** `paymentController.createBill()`
- **Recipient:** Apartment owner
- **Type:** Warning
- **Message:** "Hóa đơn tháng [period] của căn hộ [apt_id] đã được tạo"
- **Link:** `/payments`

### When Visitors Are Registered
- **Triggered by:** `visitorController.createVisitor()`
- **Recipients:** All admins and managers
- **Type:** Info
- **Message:** "[Resident Name] ([Apartment]) đã yêu cầu đăng ký khách: [Visitor Name]"
- **Link:** `/admin/visitors`

### When Visitor Requests Are Approved
- **Triggered by:** `visitorController.updateVisitorStatus(status='approved')`
- **Recipient:** Requesting resident
- **Type:** Success
- **Message:** "Yêu cầu đăng ký khách [Visitor Name] của bạn đã được phê duyệt."
- **Link:** `/my-visitors`

### When Visitor Requests Are Rejected
- **Triggered by:** `visitorController.updateVisitorStatus(status='rejected')`
- **Recipient:** Requesting resident
- **Type:** Warning
- **Message:** "Yêu cầu đăng ký khách [Visitor Name] của bạn đã bị từ chối."
- **Link:** `/my-visitors`

## API Endpoints

### Create Notification for Single User
```
POST /api/notifications
Content-Type: application/json

{
  "userId": "uuid",
  "type": "success|info|warning|error|announcement",
  "title": "Notification Title",
  "message": "Notification message",
  "link": "/optional-path",
  "metadata": { "optional": "data" }
}
```

### Create Notifications for Multiple Users
```
POST /api/notifications/bulk
Content-Type: application/json

{
  "userIds": ["uuid1", "uuid2"],
  "type": "success",
  "title": "Title",
  "message": "Message",
  "link": "/optional-path"
}
```

### Create Notification for Role
```
POST /api/notifications/role
Content-Type: application/json

{
  "role": "admin|manager|user",
  "type": "success",
  "title": "Title",
  "message": "Message",
  "link": "/optional-path"
}
```

### Create Announcement for All Users
```
POST /api/notifications/announcement
Content-Type: application/json

{
  "type": "announcement",
  "title": "Title",
  "message": "Message",
  "link": "/optional-path"
}
```

### Get User's Notifications
```
GET /api/notifications/user/:userId?limit=50&offset=0
```

### Mark Notification as Read
```
PATCH /api/notifications/:notificationId/read
```

### Delete Notification
```
DELETE /api/notifications/:notificationId
```

## Frontend Usage

### Using the Notification Hook
```typescript
import { useNotifications } from '@/contexts/NotificationContext';

export function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(notif => (
        <div key={notif.id}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id)}>
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Creating Notifications from Frontend
```typescript
import { createNotification } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';

export function MyComponent() {
  const { user } = useAuth();

  const handleCreateNotification = async () => {
    await createNotification({
      userId: user.id,
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully',
      link: '/dashboard',
      metadata: { operation: 'test' }
    });
  };

  return <button onClick={handleCreateNotification}>Create</button>;
}
```

## Backend Usage Examples

### In Controllers
```javascript
const { supabaseAdmin } = require('../config/supabase');

// Helper function already added to each controller
const createNotification = async (userId, type, title, message, link, metadata) => {
  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      metadata,
      read: false,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Usage
await createNotification(
  userId,
  'success',
  'Payment Received',
  'Payment of 1,000,000đ received',
  '/payments',
  { amount: 1000000 }
);
```

### Creating Notifications via API
```javascript
// Example: Send notification to a user via API
const response = await fetch('http://localhost:3001/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid',
    type: 'success',
    title: 'Payment Successful',
    message: 'Your payment has been processed',
    link: '/payments',
    metadata: { transactionId: 'TX123' }
  })
});
```

## Database Table Structure

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security

- RLS policies ensure users can only see and modify their own notifications
- Only admins and managers can create notifications via API
- All user-triggered notifications are automatically routed to correct recipients
- Sensitive data is never included in notification messages

## Best Practices

1. **Always include a link** - Let users navigate to relevant content
2. **Use appropriate types** - Choose the right notification type for context
3. **Include metadata** - Add structured data for context and tracking
4. **Keep messages concise** - Users should understand the message at a glance
5. **Use Vietnamese** - All messages should be in Vietnamese for residents
6. **Don't break functionality** - Notifications should never cause system failures

## Testing

### Test Page
Access the notification test page at: `/test-notifications`

This page allows you to:
- Create notifications for yourself
- Create bulk notifications
- Create notifications by role
- Create announcements for all users
- View all system notifications in real-time

### Manual Testing Checklist
- [ ] New bill notification appears when bill is created
- [ ] Payment success notification appears when bill is paid
- [ ] Visitor approval notification sent to residents
- [ ] Visitor rejection notification sent to residents
- [ ] Admin receives visitor registration notifications
- [ ] Notifications appear in real-time
- [ ] Mark as read functionality works
- [ ] Delete functionality works
- [ ] Unread count badge updates correctly
- [ ] Notifications persist after page reload
- [ ] Dark/light mode styling works correctly

## Troubleshooting

### Notifications Not Appearing
1. Check browser console for errors
2. Verify Supabase connection is active
3. Check RLS policies in Supabase
4. Ensure notification table exists

### Real-time Updates Not Working
1. Check Supabase Realtime is enabled
2. Verify channel subscription in NotificationContext
3. Check browser console for connection errors
4. Try refreshing the page

### Missing Notifications
1. Verify user IDs are correct UUIDs
2. Check apartment owner_id is set correctly
3. Ensure supabaseAdmin is properly configured
4. Check backend controller for errors in console

## Future Enhancements

- [ ] Email notifications
- [ ] SMS notifications for critical alerts
- [ ] Notification preferences per user
- [ ] Notification scheduling
- [ ] Notification templates
- [ ] Bulk notification delivery
- [ ] Analytics on notification engagement
- [ ] Push notifications for mobile app
- [ ] In-app notification sounds
- [ ] Notification expiration policies
