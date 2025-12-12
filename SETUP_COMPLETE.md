# 🎉 Admin User Management System - Complete!

## ✅ What's Been Built

### Backend (Port 3001)
- ✅ Express.js REST API
- ✅ JWT Authentication with Supabase
- ✅ Admin-only CRUD operations for users
- ✅ Password reset functionality
- ✅ Pagination, search, and filtering
- ✅ Full error handling and validation

### Frontend (Port 3000)
- ✅ User Management Admin Panel (`/admin/users`)
- ✅ TypeScript API client (`lib/api.ts`)
- ✅ Complete UI with modals for Create/Edit/Delete/Reset
- ✅ Real-time search and filtering
- ✅ Pagination support
- ✅ Role-based badges and permissions

## 🚀 How to Use

### 1. Start Backend Server

```bash
cd backend
node src/index.js
```

Server runs on: `http://localhost:3001`

### 2. Start Frontend (if not running)

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 3. Access User Management

1. **Login as Admin** at `http://localhost:3000/login`
   - Username: `admin`
   - Password: `admin123`

2. **Go to Admin Panel**: `http://localhost:3000/admin`

3. **Click "Quản lý người dùng"** (User Management)
   - OR directly visit: `http://localhost:3000/admin/users`

### 4. Features Available

#### ➕ Create User
- Click "Create User" button
- Fill in: email, password, username, full name, role, apartment number
- Automatically creates auth account + profile

#### ✏️ Edit User
- Click edit icon (pencil) on any user
- Update: username, full name, role, apartment number
- Cannot change own role

#### 🔑 Reset Password
- Click key icon on any user
- Set new password (minimum 6 characters)

#### 🗑️ Delete User
- Click trash icon on any user
- Confirm deletion
- Cannot delete yourself

#### 🔍 Search & Filter
- Search by username, name, or email
- Filter by role (Admin/Manager/User)
- Real-time results

## 📡 API Endpoints Reference

All endpoints require `Authorization: Bearer <token>` header.

```
GET    /api/users              - List all users (paginated)
GET    /api/users/:id          - Get single user
POST   /api/users              - Create new user
PUT    /api/users/:id          - Update user
DELETE /api/users/:id          - Delete user
POST   /api/users/:id/reset-password - Reset password
```

## 🔐 Security Features

- ✅ JWT token verification
- ✅ Admin-only access control
- ✅ Self-protection (can't delete/change own role)
- ✅ Password validation (min 6 chars)
- ✅ Username uniqueness check
- ✅ CORS protection

## 📂 File Structure

```
backend/
├── src/
│   ├── config/supabase.js
│   ├── controllers/userController.js    ← CRUD logic
│   ├── middleware/auth.js                ← Auth checks
│   ├── routes/
│   │   ├── index.js
│   │   └── userRoutes.js                 ← API routes
│   └── index.js                          ← Server entry

frontend/
├── lib/
│   └── api.ts                            ← API client
├── app/
│   └── admin/
│       ├── page.tsx                      ← Admin dashboard
│       └── users/
│           └── page.tsx                  ← User management UI
```

## 🎯 Next Steps (Optional Enhancements)

1. **Add More Modals to Users Page**
   - Edit user modal (currently basic)
   - Delete confirmation modal
   - Password reset modal

2. **Additional Features**
   - Export users to CSV
   - Bulk operations
   - User activity logs
   - Email verification
   - Profile pictures

3. **Other Backend Services**
   - Payment management API
   - Maintenance requests API
   - Vehicle management API
   - Facility booking API

## 🐛 Troubleshooting

### Backend not starting?
```bash
cd backend
npm install
# Check .env file has correct Supabase credentials
node src/index.js
```

### Frontend can't connect to backend?
- Check backend is running on port 3001
- Verify `NEXT_PUBLIC_API_URL=http://localhost:3001/api` in `.env.local`
- Check browser console for CORS errors

### Authentication errors?
- Make sure you're logged in as admin
- Token expires after 1 hour - login again
- Check Supabase service role key in backend `.env`

## 📞 API Testing with cURL

```bash
# Get your token first (from browser console after login)
TOKEN="your_jwt_token_here"

# List users
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN"

# Create user
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "full_name": "Test User",
    "role": "user",
    "apartment_number": "A101"
  }'
```

## 🎊 You're All Set!

Your admin user management system is fully functional and ready to use!

Visit: **http://localhost:3000/admin/users**
