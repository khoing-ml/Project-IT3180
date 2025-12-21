-- Activity Logs Table Schema
-- Run this in your Supabase SQL Editor

-- ==============================================
-- ACTIVITY LOGS TABLE
-- ==============================================

-- Create activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'warning')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_status ON activity_logs(status);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Managers can view all activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Service can insert activity logs" ON activity_logs;

-- Create policies
-- Allow admins to view all activity logs
CREATE POLICY "Admins can view all activity logs" 
  ON activity_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow managers to view all activity logs
CREATE POLICY "Managers can view all activity logs" 
  ON activity_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- Allow users to view their own activity logs
CREATE POLICY "Users can view own activity logs" 
  ON activity_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow service role to insert activity logs (for backend logging)
CREATE POLICY "Service can insert activity logs" 
  ON activity_logs FOR INSERT 
  WITH CHECK (true);

-- ==============================================
-- COMMON ACTIVITY LOG ACTIONS
-- ==============================================

-- Authentication:
-- - 'login', 'logout', 'register', 'password_change', 'password_reset'

-- User Management:
-- - 'user_create', 'user_update', 'user_delete', 'user_view', 'role_change'

-- Apartment Management:
-- - 'apartment_create', 'apartment_update', 'apartment_delete', 'apartment_view'

-- Bills:
-- - 'bill_create', 'bill_update', 'bill_delete', 'bill_view', 'bill_pay'

-- Vehicles:
-- - 'vehicle_create', 'vehicle_update', 'vehicle_delete', 'vehicle_view', 'vehicle_request'

-- Visitors:
-- - 'visitor_create', 'visitor_update', 'visitor_delete', 'visitor_view', 'visitor_checkin', 'visitor_checkout'

-- Access Cards:
-- - 'card_create', 'card_update', 'card_delete', 'card_view', 'card_activate', 'card_deactivate'

-- Payments:
-- - 'payment_create', 'payment_update', 'payment_view', 'payment_approve', 'payment_reject'
