/*
  # Set admin privileges for existing user

  1. Changes
    - Updates the admin status for the user who signed up with admin@pokerclub.com
    - Safe to run multiple times
*/

DO $$
BEGIN
  UPDATE profiles
  SET 
    is_admin = true,
    full_name = 'Club Administrator'
  WHERE email = 'admin@pokerclub.com';
END $$;