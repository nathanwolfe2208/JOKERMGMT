/*
  # Create admin user

  1. New User
    - Creates an admin user with email admin@pokerclub.com
    - Sets up profile with admin privileges
    - No membership or time bank needed for admin
*/

DO $$
DECLARE
  admin_id uuid := 'a0000000-0000-0000-0000-000000000000';
BEGIN
  -- Create admin user in auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at
  ) VALUES (
    admin_id,
    'admin@pokerclub.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF', -- dummy hashed password
    now()
  );

  -- Create admin profile
  INSERT INTO profiles (
    id,
    email,
    full_name,
    is_admin,
    created_at
  ) VALUES (
    admin_id,
    'admin@pokerclub.com',
    'Club Administrator',
    true,
    now()
  );
END $$;