-- First, get Tim's user ID from auth.users
DO $$
DECLARE
    tim_user_id uuid;
BEGIN
    -- Get Tim's user ID
    SELECT id INTO tim_user_id 
    FROM auth.users 
    WHERE email = 'tim@acme.com';
    
    IF tim_user_id IS NULL THEN
        RAISE EXCEPTION 'User tim@acme.com not found in auth.users';
    END IF;
    
    -- Update Tim's contact record
    UPDATE contacts
    SET 
        is_user = TRUE,
        has_user_access = TRUE,
        user_id = tim_user_id
    WHERE 
        email = 'tim@acme.com';
        
    RAISE NOTICE 'Updated Tim''s contact record with user_id: %', tim_user_id;
END $$; 