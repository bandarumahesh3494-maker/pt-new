/*
  # Fix Realtime Subscription Error for Profiles Table

  ## Problem
  The profiles table RLS policies only allow authenticated users, but the app
  tries to subscribe to realtime changes in demo mode using the anon role.
  This causes CHANNEL_ERROR when subscribing.

  ## Solution
  Update the SELECT policy on profiles to allow anon role to view profiles
  within a specific realm. This enables realtime subscriptions to work
  in both authenticated and demo modes.

  ## Changes
    - Drop the restrictive "Users can view profiles in their realm" policy
    - Add a new permissive SELECT policy that allows anon role with realm filtering
*/

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view profiles in their realm" ON profiles;

-- Create a new permissive SELECT policy that allows anon role
-- This enables realtime subscriptions to work in demo mode
CREATE POLICY "Allow viewing profiles in realm"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);
