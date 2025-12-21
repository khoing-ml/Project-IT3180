-- BlueMoon Apartment Management System - Database Schema
-- Run this in your Supabase SQL Editor

-- ==============================================
-- 1. PROFILES TABLE
-- ==============================================

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Create a function to get current user role from profiles
-- This uses SECURITY DEFINER to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- Create policies
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow admins to view all profiles (using security definer function to avoid recursion)
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (public.get_my_role() = 'admin');

-- Allow admins to insert profiles
CREATE POLICY "Admins can insert profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (public.get_my_role() = 'admin');

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" 
  ON profiles FOR UPDATE 
  USING (public.get_my_role() = 'admin');

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" 
  ON profiles FOR DELETE 
  USING (public.get_my_role() = 'admin');

-- ==============================================
-- 2. TRIGGERS AND FUNCTIONS
-- ==============================================

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, role, apartment_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'apartment_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==============================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ==============================================
-- 4. VISITOR MANAGEMENT TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT,
  visitor_email TEXT,
  purpose TEXT NOT NULL,
  expected_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_departure TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for visitors
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Visitors RLS Policies
DROP POLICY IF EXISTS "Residents can view their own visitors" ON visitors;
DROP POLICY IF EXISTS "Residents can create visitor requests" ON visitors;
DROP POLICY IF EXISTS "Admins can view all visitors" ON visitors;
DROP POLICY IF EXISTS "Admins can update visitor status" ON visitors;

CREATE POLICY "Residents can view their own visitors" 
  ON visitors FOR SELECT 
  USING (auth.uid() = resident_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Residents can create visitor requests" 
  ON visitors FOR INSERT 
  WITH CHECK (auth.uid() = resident_id);

CREATE POLICY "Admins can view all visitors" 
  ON visitors FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Admins can update visitor status" 
  ON visitors FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Indexes for visitors
CREATE INDEX IF NOT EXISTS idx_visitors_resident_id ON visitors(resident_id);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);

-- Trigger for visitors updated_at
DROP TRIGGER IF EXISTS update_visitors_updated_at ON visitors;
CREATE TRIGGER update_visitors_updated_at 
  BEFORE UPDATE ON visitors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 5. ACCESS CONTROL (CARDS) TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS access_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_number TEXT UNIQUE NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'resident' CHECK (card_type IN ('resident', 'guest', 'staff')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lost', 'blocked')),
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  issued_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expiry_date TIMESTAMP WITH TIME ZONE,
  reason_for_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for access_cards
ALTER TABLE access_cards ENABLE ROW LEVEL SECURITY;

-- Access Cards RLS Policies
DROP POLICY IF EXISTS "Residents can view their own cards" ON access_cards;
DROP POLICY IF EXISTS "Admins can view all cards" ON access_cards;
DROP POLICY IF EXISTS "Admins can manage cards" ON access_cards;

CREATE POLICY "Residents can view their own cards" 
  ON access_cards FOR SELECT 
  USING (auth.uid() = resident_id);

CREATE POLICY "Admins can view all cards" 
  ON access_cards FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Admins can manage cards" 
  ON access_cards FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Indexes for access_cards
CREATE INDEX IF NOT EXISTS idx_access_cards_resident_id ON access_cards(resident_id);
CREATE INDEX IF NOT EXISTS idx_access_cards_card_number ON access_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_access_cards_status ON access_cards(status);

-- Trigger for access_cards updated_at
DROP TRIGGER IF EXISTS update_access_cards_updated_at ON access_cards;
CREATE TRIGGER update_access_cards_updated_at 
  BEFORE UPDATE ON access_cards 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- SETUP COMPLETE
-- ==============================================
-- Next steps:
-- 1. Create your first admin user using the backend API or manually
-- 2. Use the backend/setup-admin.js script to grant admin privileges
