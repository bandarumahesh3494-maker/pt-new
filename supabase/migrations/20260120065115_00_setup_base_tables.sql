/*
  # Setup Base Tables for Project Tracker
  
  1. New Tables
    - `realms` - Organizations/workspaces
    - `profiles` - User profiles linked to auth.users
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create realms table
CREATE TABLE IF NOT EXISTS realms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE realms ENABLE ROW LEVEL SECURITY;

GRANT ALL ON realms TO authenticated;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'user',
  realm_id uuid REFERENCES realms(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT ALL ON profiles TO authenticated;

-- Now add policies after both tables exist
CREATE POLICY "Users can view their realm"
  ON realms FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT realm_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert realms"
  ON realms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Realm admins can update their realm"
  ON realms FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT realm_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'realm_admin', 'owner')
    )
  );

CREATE POLICY "Users can view profiles in their realm"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    realm_id IN (
      SELECT realm_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());