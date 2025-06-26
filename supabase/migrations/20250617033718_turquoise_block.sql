/*
  # Create Security Tables for Authentication

  1. New Tables
    - `user_security_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `mfa_enabled` (boolean, default false)
      - `mfa_secret` (text, encrypted TOTP secret)
      - `backup_codes` (text array, hashed backup codes)
      - `last_password_change` (timestamptz)
      - `failed_login_attempts` (integer, default 0)
      - `locked_until` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `security_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `event_type` (text, type of security event)
      - `ip_address` (inet, IP address of request)
      - `user_agent` (text, browser user agent)
      - `metadata` (jsonb, additional event data)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own security settings
    - Add policies for users to view their own security events

  3. Indexes
    - Add indexes for performance on commonly queried columns
*/

-- Create user_security_settings table
CREATE TABLE IF NOT EXISTS user_security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  mfa_enabled boolean DEFAULT false NOT NULL,
  mfa_secret text,
  backup_codes text[],
  last_password_change timestamptz DEFAULT now(),
  failed_login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS user_security_settings_user_id_idx ON user_security_settings(user_id);
CREATE INDEX IF NOT EXISTS user_security_settings_mfa_enabled_idx ON user_security_settings(mfa_enabled);
CREATE INDEX IF NOT EXISTS security_events_user_id_idx ON security_events(user_id);
CREATE INDEX IF NOT EXISTS security_events_event_type_idx ON security_events(event_type);
CREATE INDEX IF NOT EXISTS security_events_created_at_idx ON security_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_security_settings
CREATE POLICY "Users can view own security settings"
  ON user_security_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security settings"
  ON user_security_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings"
  ON user_security_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for security_events
CREATE POLICY "Users can view own security events"
  ON security_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert security events"
  ON security_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_user_security_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_user_security_settings_updated_at
      BEFORE UPDATE ON user_security_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;