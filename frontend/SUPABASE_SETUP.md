# Supabase Database Setup

This document explains how to set up your Supabase database for the BlueMoon apartment management system.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Copy your project URL and anon key to `.env.local`

## Database Schema

### 1. Users/Profiles Table

Since Supabase has built-in `auth.users` table, we'll create a `profiles` table for additional user information:

\`\`\`sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  apartment_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
\`\`\`

### 2. Insert Demo Users

\`\`\`sql
-- Note: You'll need to use Supabase auth.signUp() to create users properly
-- Or use the Supabase Dashboard to create test users manually

-- After creating auth users, you can insert their profiles:
-- (Replace the UUIDs with actual user IDs from auth.users)

-- Example profile insertions (after creating auth users):
INSERT INTO profiles (id, username, full_name, email, role) VALUES
  ('uuid-of-admin-user', 'admin', 'Quản trị viên', 'admin@bluemoon.com', 'admin'),
  ('uuid-of-manager-user', 'manager', 'Trần Thị B', 'manager@bluemoon.com', 'manager'),
  ('uuid-of-regular-user', 'user', 'Nguyễn Văn A', 'user@bluemoon.com', 'user');
\`\`\`

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the schema SQL above
4. Execute the SQL to create tables and policies
5. Create test users using Supabase Auth or the dashboard
6. Update your `.env.local` with your Supabase credentials

## Next Steps

After setting up the database:
1. Install Supabase client: `npm install @supabase/supabase-js`
2. Configure environment variables
3. The app will use Supabase for authentication automatically
