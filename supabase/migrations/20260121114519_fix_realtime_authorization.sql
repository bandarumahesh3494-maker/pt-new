/*
  # Fix Realtime Authorization Issues

  This migration ensures the realtime system has proper authorization
  configuration for anonymous and authenticated access.

  ## Changes:
    1. Grant explicit usage on realtime schema to anon/authenticated
    2. Grant execute permissions on realtime functions
    3. Verify publication configuration
    4. Set proper role permissions

  ## Tables Affected:
    - tasks
    - subtasks
    - sub_subtasks
    - milestones
    - profiles
*/

-- Grant usage on realtime schema
GRANT USAGE ON SCHEMA realtime TO anon, authenticated;

-- Grant all privileges on all tables in realtime schema
GRANT ALL ON ALL TABLES IN SCHEMA realtime TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA realtime TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA realtime TO anon, authenticated;

-- Ensure tables have proper grants for realtime to read
GRANT SELECT ON tasks TO postgres, anon, authenticated;
GRANT SELECT ON subtasks TO postgres, anon, authenticated;
GRANT SELECT ON sub_subtasks TO postgres, anon, authenticated;
GRANT SELECT ON milestones TO postgres, anon, authenticated;
GRANT SELECT ON profiles TO postgres, anon, authenticated;

-- Re-add tables to publication (idempotent operation)
DO $$
BEGIN
  -- Add tables to supabase_realtime publication if not already present
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE sub_subtasks;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;
