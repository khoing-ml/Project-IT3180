-- Fix infinite recursion in RLS policies for profiles table
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Create a function in public schema to get current user role
-- This uses SECURITY DEFINER to bypass RLS when checking the role
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

-- Create new policies without recursion

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow admins to view all profiles (using the security definer function)
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
