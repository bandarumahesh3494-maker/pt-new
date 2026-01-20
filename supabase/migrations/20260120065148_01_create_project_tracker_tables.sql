/* ============================================================================
   PROJECT TRACKER – REALM BASED (profiles.realm_id)
   ============================================================================ */

-- ---------------------------------------------------------------------------
-- Helper: current user's realm
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_realm_id()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT realm_id
    FROM profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_user_realm_id() TO authenticated;

-- ---------------------------------------------------------------------------
-- Trigger: auto populate realm + user
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auto_populate_realm_and_user()
RETURNS TRIGGER AS $$
DECLARE
  current_realm uuid;
BEGIN
  current_realm := get_user_realm_id();

  IF current_realm IS NULL THEN
    RAISE EXCEPTION 'User does not belong to any realm';
  END IF;

  NEW.realm_id := current_realm;
  NEW.user_id := auth.uid();
  NEW.created_by := auth.uid();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================================
-- TASKS
-- ===========================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id uuid NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('dev','test','infra','support')),
  priority int DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_select
  ON tasks FOR SELECT
  USING (realm_id = get_user_realm_id());

CREATE POLICY tasks_insert
  ON tasks FOR INSERT
  WITH CHECK (realm_id = get_user_realm_id());

CREATE POLICY tasks_update
  ON tasks FOR UPDATE
  USING (realm_id = get_user_realm_id());

CREATE POLICY tasks_delete
  ON tasks FOR DELETE
  USING (realm_id = get_user_realm_id());

CREATE TRIGGER trg_tasks_realm
BEFORE INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION auto_populate_realm_and_user();

GRANT ALL ON tasks TO authenticated;

-- ===========================================================================
-- SUBTASKS
-- ===========================================================================
CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id uuid NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  name text NOT NULL,
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY subtasks_select
  ON subtasks FOR SELECT
  USING (realm_id = get_user_realm_id());

CREATE POLICY subtasks_insert
  ON subtasks FOR INSERT
  WITH CHECK (realm_id = get_user_realm_id());

CREATE POLICY subtasks_update
  ON subtasks FOR UPDATE
  USING (realm_id = get_user_realm_id());

CREATE POLICY subtasks_delete
  ON subtasks FOR DELETE
  USING (realm_id = get_user_realm_id());

CREATE TRIGGER trg_subtasks_realm
BEFORE INSERT ON subtasks
FOR EACH ROW
EXECUTE FUNCTION auto_populate_realm_and_user();

GRANT ALL ON subtasks TO authenticated;

-- ===========================================================================
-- SUB-SUBTASKS
-- ===========================================================================
CREATE TABLE IF NOT EXISTS sub_subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id uuid NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  subtask_id uuid NOT NULL REFERENCES subtasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index int DEFAULT 0,
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sub_subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY sub_subtasks_select
  ON sub_subtasks FOR SELECT
  USING (realm_id = get_user_realm_id());

CREATE POLICY sub_subtasks_insert
  ON sub_subtasks FOR INSERT
  WITH CHECK (realm_id = get_user_realm_id());

CREATE POLICY sub_subtasks_update
  ON sub_subtasks FOR UPDATE
  USING (realm_id = get_user_realm_id());

CREATE POLICY sub_subtasks_delete
  ON sub_subtasks FOR DELETE
  USING (realm_id = get_user_realm_id());

CREATE TRIGGER trg_sub_subtasks_realm
BEFORE INSERT ON sub_subtasks
FOR EACH ROW
EXECUTE FUNCTION auto_populate_realm_and_user();

GRANT ALL ON sub_subtasks TO authenticated;

-- ===========================================================================
-- MILESTONES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id uuid NOT NULL REFERENCES realms(id),
  user_id uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  subtask_id uuid REFERENCES subtasks(id),
  sub_subtask_id uuid REFERENCES sub_subtasks(id),
  milestone_date date NOT NULL,
  milestone_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (
    (subtask_id IS NOT NULL AND sub_subtask_id IS NULL)
    OR
    (subtask_id IS NULL AND sub_subtask_id IS NOT NULL)
  )
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY milestones_select
  ON milestones FOR SELECT
  USING (realm_id = get_user_realm_id());

CREATE POLICY milestones_insert
  ON milestones FOR INSERT
  WITH CHECK (realm_id = get_user_realm_id());

CREATE POLICY milestones_update
  ON milestones FOR UPDATE
  USING (realm_id = get_user_realm_id());

CREATE POLICY milestones_delete
  ON milestones FOR DELETE
  USING (realm_id = get_user_realm_id());

CREATE TRIGGER trg_milestones_realm
BEFORE INSERT ON milestones
FOR EACH ROW
EXECUTE FUNCTION auto_populate_realm_and_user();

GRANT ALL ON milestones TO authenticated;

-- ===========================================================================
-- CONFIG
-- ===========================================================================
CREATE TABLE IF NOT EXISTS config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id uuid NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(realm_id, key)
);

ALTER TABLE config ENABLE ROW LEVEL SECURITY;

CREATE POLICY config_select
  ON config FOR SELECT
  USING (realm_id = get_user_realm_id());

CREATE POLICY config_insert
  ON config FOR INSERT
  WITH CHECK (realm_id = get_user_realm_id());

CREATE POLICY config_update
  ON config FOR UPDATE
  USING (realm_id = get_user_realm_id());

CREATE POLICY config_delete
  ON config FOR DELETE
  USING (realm_id = get_user_realm_id());

GRANT ALL ON config TO authenticated;

-- ===========================================================================
-- ACTION_HISTORY
-- ===========================================================================
CREATE TABLE IF NOT EXISTS action_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id uuid NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE action_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY action_history_select
  ON action_history FOR SELECT
  USING (realm_id = get_user_realm_id());

CREATE POLICY action_history_insert
  ON action_history FOR INSERT
  WITH CHECK (realm_id = get_user_realm_id());

GRANT ALL ON action_history TO authenticated;

-- ===========================================================================
-- TEMP_TASKS
-- ===========================================================================
CREATE TABLE IF NOT EXISTS temp_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id uuid NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  name text NOT NULL,
  priority text,
  status text NOT NULL DEFAULT 'draft',
  assigned_byname text,
  created_byname text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE temp_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY temp_tasks_select
  ON temp_tasks FOR SELECT
  TO authenticated
  USING (realm_id = get_user_realm_id());

CREATE POLICY temp_tasks_insert
  ON temp_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    realm_id = get_user_realm_id()
    AND created_by = auth.uid()
  );

CREATE POLICY temp_tasks_update
  ON temp_tasks FOR UPDATE
  TO authenticated
  USING (realm_id = get_user_realm_id())
  WITH CHECK (realm_id = get_user_realm_id());

CREATE POLICY temp_tasks_delete
  ON temp_tasks FOR DELETE
  TO authenticated
  USING (realm_id = get_user_realm_id());

GRANT ALL ON temp_tasks TO authenticated;