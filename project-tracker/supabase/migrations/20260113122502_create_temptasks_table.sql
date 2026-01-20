-- Drop table if you want a clean reset (optional)
-- DROP TABLE IF EXISTS temp_tasks CASCADE;

-- =========================
-- Create temp_tasks table
-- =========================
CREATE TABLE IF NOT EXISTS temp_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  realm_id uuid NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),

  name text NOT NULL,
  priority text,

  status text NOT NULL DEFAULT 'draft',

  -- UI / display-only fields
  assigned_byname text,
  created_byname text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================
-- Enable Row Level Security
-- =========================
ALTER TABLE temp_tasks ENABLE ROW LEVEL SECURITY;

-- =========================
-- REMOVE WRONG POLICY
-- =========================
DROP POLICY IF EXISTS "Allow all operations on temp_tasks"
ON temp_tasks;

-- =========================
-- SELECT policy
-- =========================
CREATE POLICY "Users can view temp_tasks in their realm"
ON temp_tasks
FOR SELECT
TO authenticated
USING (
  realm_id = get_user_realm_id()
);

-- =========================
-- INSERT policy  ✅ (THIS FIXES YOUR ERROR)
-- =========================
CREATE POLICY "Users can insert temp_tasks in their realm"
ON temp_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  realm_id = get_user_realm_id()
  AND created_by = auth.uid()
);

-- =========================
-- UPDATE policy
-- =========================
CREATE POLICY "Users can update temp_tasks in their realm"
ON temp_tasks
FOR UPDATE
TO authenticated
USING (
  realm_id = get_user_realm_id()
)
WITH CHECK (
  realm_id = get_user_realm_id()
);

-- =========================
-- DELETE policy (optional)
-- =========================
CREATE POLICY "Users can delete temp_tasks in their realm"
ON temp_tasks
FOR DELETE
TO authenticated
USING (
  realm_id = get_user_realm_id()
);
