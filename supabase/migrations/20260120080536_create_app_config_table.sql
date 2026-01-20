/*
  # Create app_config table for application configuration
  
  1. New Tables
    - `app_config`
      - `id` (uuid, primary key) - Unique identifier
      - `realm_id` (uuid) - Reference to realm
      - `config_key` (text) - Configuration key (e.g., 'milestone_options', 'row_colors')
      - `config_value` (jsonb) - Configuration value stored as JSON
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - Unique constraint on (realm_id, config_key)
  
  2. Security
    - Enable RLS on `app_config` table
    - Add policies for authenticated users to manage config in their realm
  
  3. Indexes
    - Index on realm_id for efficient filtering
    - Index on config_key for lookups
*/

CREATE TABLE IF NOT EXISTS app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id uuid NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  config_key text NOT NULL,
  config_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT app_config_realm_config_unique UNIQUE (realm_id, config_key)
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_app_config_realm_id ON app_config(realm_id);
CREATE INDEX IF NOT EXISTS idx_app_config_config_key ON app_config(config_key);

CREATE POLICY "Users can view app_config for their realm"
  ON app_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create app_config for their realm"
  ON app_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update app_config for their realm"
  ON app_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete app_config for their realm"
  ON app_config FOR DELETE
  TO authenticated
  USING (true);

-- Insert default configuration for the demo realm
INSERT INTO app_config (realm_id, config_key, config_value) VALUES
  ('00000000-0000-0000-0000-000000000001', 'milestone_options', '[
    {"value": "planned", "label": "PLANNED"},
    {"value": "closed", "label": "CLOSED"},
    {"value": "dev-complete", "label": "Dev Complete"},
    {"value": "dev-merge-done", "label": "Dev Merge Done"},
    {"value": "staging-merge-done", "label": "Staging Merge Done"},
    {"value": "prod-merge-done", "label": "Prod Merge Done"},
    {"value": "check", "label": "✓"}
  ]'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'row_colors', '{
    "planned": "#3b82f6",
    "actual": "#10b981",
    "subtask": "#8b5cf6",
    "subSubtask": "#f59e0b",
    "plannedOpacity": 0.15,
    "actualOpacity": 0.15,
    "subtaskOpacity": 0.12,
    "subSubtaskOpacity": 0.1
  }'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'category_colors', '{
    "dev": "#10b981",
    "test": "#3b82f6",
    "infra": "#eab308",
    "support": "#f97316"
  }'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'category_opacity', '{
    "dev": 1.0,
    "test": 1.0,
    "infra": 1.0,
    "support": 1.0
  }'::jsonb)
ON CONFLICT (realm_id, config_key) DO NOTHING;
