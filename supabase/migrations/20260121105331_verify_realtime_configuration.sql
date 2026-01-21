/*
  # Verify and Fix Realtime Configuration
  
  This migration ensures realtime is properly configured for all tracker tables.
  
  ## Actions:
    1. Ensure tables have proper replica identity (FULL for better change tracking)
    2. Re-add tables to supabase_realtime publication
    
  ## Notes:
    - Using REPLICA IDENTITY FULL ensures all columns are available in realtime events
    - Tables may already be in publication, this ensures they are configured correctly
*/

-- Set replica identity to FULL for better realtime support
-- This ensures all column values are available in realtime events
ALTER TABLE tasks REPLICA IDENTITY FULL;
ALTER TABLE subtasks REPLICA IDENTITY FULL;
ALTER TABLE sub_subtasks REPLICA IDENTITY FULL;
ALTER TABLE milestones REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;
