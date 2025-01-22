/*
  # Populate database with test data

  1. Test Data Creation
    - Create auth users first
    - 15 test players with varying:
      - Membership statuses (active/inactive)
      - Time banks (0-20 hours)
      - Some with active play sessions
    
  2. Data Distribution
    - 10 active memberships
    - 5 inactive memberships
    - Varied time bank amounts
    - 3 active play sessions
*/

DO $$
DECLARE
  user_ids uuid[] := ARRAY[
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'ffffffff-ffff-ffff-ffff-ffffffffffff'
  ];
  emails text[] := ARRAY[
    'john.doe@example.com',
    'jane.smith@example.com',
    'bob.wilson@example.com',
    'alice.brown@example.com',
    'charlie.davis@example.com',
    'diana.miller@example.com',
    'edward.jones@example.com',
    'fiona.taylor@example.com',
    'george.white@example.com',
    'helen.green@example.com',
    'ian.black@example.com',
    'julia.reed@example.com',
    'kevin.hall@example.com',
    'laura.adams@example.com',
    'mike.clark@example.com'
  ];
  names text[] := ARRAY[
    'John Doe',
    'Jane Smith',
    'Bob Wilson',
    'Alice Brown',
    'Charlie Davis',
    'Diana Miller',
    'Edward Jones',
    'Fiona Taylor',
    'George White',
    'Helen Green',
    'Ian Black',
    'Julia Reed',
    'Kevin Hall',
    'Laura Adams',
    'Mike Clark'
  ];
BEGIN
  -- Create auth.users first
  FOR i IN 1..15 LOOP
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
    VALUES (
      user_ids[i],
      emails[i],
      '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF', -- dummy hashed password
      now()
    );
  END LOOP;

  -- Insert profiles
  FOR i IN 1..15 LOOP
    INSERT INTO profiles (id, email, full_name, is_admin, created_at)
    VALUES (
      user_ids[i],
      emails[i],
      names[i],
      false,
      now() - (31 - i) * interval '1 day'
    );
  END LOOP;

  -- Insert memberships (10 active, 5 inactive)
  FOR i IN 1..10 LOOP
    INSERT INTO memberships (user_id, start_date, end_date, status)
    VALUES (
      user_ids[i],
      now() - ((31 - i) * interval '1 day'),
      now() + ((30 + i * 2) * interval '1 day'),
      'active'
    );
  END LOOP;

  FOR i IN 11..15 LOOP
    INSERT INTO memberships (user_id, start_date, end_date, status)
    VALUES (
      user_ids[i],
      now() - ((31 - i) * interval '1 day'),
      now() - interval '1 day',
      'inactive'
    );
  END LOOP;

  -- Insert time banks with varying amounts
  INSERT INTO time_banks (user_id, minutes_remaining)
  SELECT
    user_ids[i],
    CASE
      WHEN i <= 10 THEN (1200 - (i - 1) * 120) -- Active members: 20h down to 2h
      WHEN i = 11 THEN 30 -- 30 minutes for first inactive
      ELSE 0 -- 0 for remaining inactive
    END
  FROM generate_series(1, 15) i;

  -- Insert active play sessions
  INSERT INTO play_sessions (user_id, start_time, end_time, minutes_used)
  VALUES
    (user_ids[1], now() - interval '2 hours', NULL, NULL),
    (user_ids[2], now() - interval '1 hour', NULL, NULL),
    (user_ids[3], now() - interval '30 minutes', NULL, NULL);

  -- Insert completed sessions
  INSERT INTO play_sessions (user_id, start_time, end_time, minutes_used)
  VALUES
    (user_ids[4], now() - interval '1 day', now() - interval '20 hours', 240),
    (user_ids[5], now() - interval '2 days', now() - interval '1 day 20 hours', 180),
    (user_ids[6], now() - interval '3 days', now() - interval '2 days 22 hours', 120);
END $$;