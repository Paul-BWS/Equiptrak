-- Disable the trigger temporarily
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Create a user
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert the user
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    raw_app_meta_data,
    raw_user_meta_data
  )
  VALUES (
    (SELECT id FROM auth.instances LIMIT 1),
    new_user_id,
    'new-user@example.com',  -- CHANGE THIS: User's email
    auth.crypt('SecurePassword123', auth.gen_salt('bf')),  -- CHANGE THIS: User's password
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated',
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "user", "name": "New User"}'::jsonb  -- CHANGE THIS: User's name and role
  );

  -- Insert the profile
  INSERT INTO public.profiles (
    id,
    role,
    email,
    name,
    company_name,
    telephone
  )
  VALUES (
    new_user_id,
    'user',  -- CHANGE THIS: User's role
    'new-user@example.com',  -- CHANGE THIS: User's email
    'New User',  -- CHANGE THIS: User's name
    'Company Name',  -- CHANGE THIS: User's company
    '1234567890'  -- CHANGE THIS: User's telephone
  );
  
  -- Output the created user ID
  RAISE NOTICE 'Created user with ID: %', new_user_id;
END $$;

-- Re-enable the trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created; 