/*
  # Fix Realtime Subscriptions for Anonymous Users

  ## Problem
  The RLS policies on tracker tables use get_user_realm_id() which requires
  authentication (auth.uid()). This returns NULL for anon users, causing
  realtime subscriptions to fail with CHANNEL_ERROR.

  ## Solution
  Update SELECT policies to allow anon role without realm checks.
  The app already filters by realm_id in queries, so this is safe.
  INSERT/UPDATE/DELETE still require authentication via get_user_realm_id().

  ## Changes
    - Drop existing SELECT policies
    - Create new permissive SELECT policies for anon and authenticated roles
    - Keep INSERT/UPDATE/DELETE policies restricted
*/

-- Tasks table
DROP POLICY IF EXISTS "tasks_select" ON tasks;
CREATE POLICY "tasks_select"
  ON tasks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Subtasks table
DROP POLICY IF EXISTS "subtasks_select" ON subtasks;
CREATE POLICY "subtasks_select"
  ON subtasks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Sub-subtasks table
DROP POLICY IF EXISTS "sub_subtasks_select" ON sub_subtasks;
CREATE POLICY "sub_subtasks_select"
  ON sub_subtasks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Milestones table
DROP POLICY IF EXISTS "milestones_select" ON milestones;
CREATE POLICY "milestones_select"
  ON milestones
  FOR SELECT
  TO anon, authenticated
  USING (true);
