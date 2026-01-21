/*
  # Enable Real-time Replication for Project Tracker Tables

  This migration enables real-time updates for all project tracker tables
  by adding them to the supabase_realtime publication.

  ## Tables Enabled:
    - tasks
    - subtasks
    - sub_subtasks
    - milestones
    - profiles

  ## Why This is Needed:
    Real-time subscriptions only work for tables that are part of the
    supabase_realtime publication. Without this, changes to the database
    won't trigger real-time events in the frontend.
*/

-- Enable real-time for tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Enable real-time for subtasks table
ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;

-- Enable real-time for sub_subtasks table
ALTER PUBLICATION supabase_realtime ADD TABLE sub_subtasks;

-- Enable real-time for milestones table
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;

-- Enable real-time for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
