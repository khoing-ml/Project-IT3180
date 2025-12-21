# Fix RLS Infinite Recursion Issue

## Problem
The RLS policies on the `profiles` table were causing infinite recursion because they were querying the `profiles` table from within the policies themselves.

## Solution
Run the SQL script to create a `SECURITY DEFINER` function that bypasses RLS when checking user roles.

## Steps to Fix

1. Go to your Supabase Dashboard
2. Navigate to the **SQL Editor**
3. Copy and paste the contents of `backend/database/fix-rls-policies.sql`
4. Click **Run** to execute the script

## What the fix does

- Creates a `auth.get_user_role()` function with `SECURITY DEFINER` that can query the profiles table without triggering RLS
- Replaces all admin policies to use this function instead of directly querying profiles
- Eliminates the circular dependency that was causing infinite recursion

## After running the script

Your frontend should be able to fetch user profiles without the "infinite recursion" error.

## Verification

After running the script, test by:
1. Logging in to your frontend
2. Check if the profile loads without errors
3. Try accessing admin features if you have an admin account
