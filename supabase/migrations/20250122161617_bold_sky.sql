/*
  # Initial Schema for Poker Club Management System

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Links to auth.users
      - `email` (text)
      - `full_name` (text)
      - `is_admin` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `memberships`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `status` (text) - active/inactive
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `time_banks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `minutes_remaining` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `play_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `minutes_used` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Add policies for user access to their own data
*/

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Memberships table
CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Time banks table
CREATE TABLE time_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  minutes_remaining integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Play sessions table
CREATE TABLE play_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  minutes_used integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin = true OR id = auth.uid());

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can create profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin = true);

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin = true);

-- Policies for memberships
CREATE POLICY "Admins can manage memberships"
  ON memberships FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Users can view own membership"
  ON memberships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for time banks
CREATE POLICY "Admins can manage time banks"
  ON time_banks FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Users can view own time bank"
  ON time_banks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for play sessions
CREATE POLICY "Admins can manage play sessions"
  ON play_sessions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Users can view own play sessions"
  ON play_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());