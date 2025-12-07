# Admin User Management API - Quick Start Guide

## 🚀 Quick Start

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### 2. Get Admin Token

Login as admin from your frontend, then get the token:
```javascript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

### 3. Test the API

```bash
# Health check
curl http://localhost:3001/api/health

# Get all users (requires admin token)
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📋 API Examples

### Get All Users (with pagination)

```javascript
const response = await fetch('http://localhost:3001/api/users?page=1&limit=10&search=john', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

### Create New User

```javascript
const response = await fetch('http://localhost:3001/api/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'password123',
    username: 'newuser',
    full_name: 'New User',
    role: 'user',
    apartment_number: 'A101'
  })
});
const data = await response.json();
```

### Update User

```javascript
const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    full_name: 'Updated Name',
    role: 'manager',
    apartment_number: 'B202'
  })
});
const data = await response.json();
```

### Delete User

```javascript
const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

### Reset User Password

```javascript
const response = await fetch(`http://localhost:3001/api/users/${userId}/reset-password`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    password: 'newpassword123'
  })
});
const data = await response.json();
```

## 🔐 Important Security Notes

1. **Service Role Key**: Keep your `SUPABASE_SERVICE_ROLE_KEY` secret!
2. **Admin Only**: All these endpoints require admin role
3. **Self-Protection**: 
   - Admins cannot delete themselves
   - Admins cannot change their own role
4. **Password Length**: Minimum 6 characters

## 🎯 Next Steps

To integrate with your frontend, create an admin panel with:
- User list with pagination
- Create user form
- Edit user modal
- Delete confirmation dialog
- Password reset functionality

Example React component structure:
```
frontend/app/admin/users/
├── page.tsx              # Main user management page
├── UserList.tsx          # Table with users
├── CreateUserModal.tsx   # Create user form
├── EditUserModal.tsx     # Edit user form
└── DeleteConfirm.tsx     # Delete confirmation
```
