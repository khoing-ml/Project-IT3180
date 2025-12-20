# Database Setup Guide

## Issue: "Failed to create user profile"

This error occurs when the `profiles` table doesn't exist or Row Level Security (RLS) policies are preventing profile creation.

## Solution

### Step 1: Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `backend/database/schema.sql`
4. Paste and execute the SQL

This will:
- Create the `profiles` table if it doesn't exist
- Set up all necessary RLS policies
- Create triggers to automatically create profiles when users sign up
- Add proper indexes for performance

### Step 2: Grant Admin Privileges

After setting up the database, you need to give yourself admin privileges:

```bash
cd backend
node setup-admin.js
```

Enter your email address when prompted. This script will:
- Find your user account
- Create or update your profile with admin role
- Update user metadata

### Step 3: Restart the Backend

```bash
# Kill the existing backend process
pkill -f "node src/index.js"

# Start it again
cd backend
npm run dev
```

### Step 4: Refresh Your Browser

The errors should now be resolved, and you should be able to:
- Access the admin users page
- Create new users
- Update user profiles
- Delete users

## Troubleshooting

### Issue: RLS policies blocking operations

**Symptoms:**
- "Failed to create user profile"
- "Permission denied for table profiles"

**Solution:**
The backend now uses `supabaseAdmin` client which bypasses RLS policies for admin operations.

### Issue: Trigger not creating profiles automatically

**Symptoms:**
- User can log in but has no profile
- "User profile not found" errors

**Solution:**
1. Re-run the schema.sql to ensure triggers are properly set up
2. The backend will automatically create profiles if triggers fail
3. Use `setup-admin.js` to manually create/update profiles

### Issue: "Access denied. Admin privileges required"

**Symptoms:**
- Can log in but can't access admin pages
- 403 Forbidden errors

**Solution:**
Run the admin setup script:
```bash
cd backend
node setup-admin.js
```

## Database Schema Overview

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
  apartment_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RLS Policies

- **Users** can view and update their own profile
- **Admins** can view, insert, update, and delete all profiles
- **Triggers** automatically create profiles when new users sign up

## Files Reference

- `backend/database/schema.sql` - Complete database schema
- `backend/setup-admin.js` - Admin privilege setup tool
- `backend/src/middleware/auth.js` - Authentication middleware (updated to handle missing profiles)
- `backend/src/controllers/userController.js` - User management API (updated to use admin client)
