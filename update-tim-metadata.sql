-- Update Tim's user metadata with the correct company_id
DO $$
DECLARE
    tim_user_id uuid;
    acme_company_id uuid := '0cd307a7-c938-49da-b005-17746587ca8a'; -- Acme company ID
BEGIN
    -- Get Tim's user ID
    SELECT id INTO tim_user_id 
    FROM auth.users 
    WHERE email = 'tim@acme.com';
    
    IF tim_user_id IS NULL THEN
        RAISE EXCEPTION 'User tim@acme.com not found in auth.users';
    END IF;
    
    -- Update Tim's user metadata with the company_id
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || 
        jsonb_build_object(
            'company_id', acme_company_id::text,
            'company_name', 'Acme'
        )
    WHERE id = tim_user_id;
    
    -- Also ensure the contact record is properly linked
    UPDATE contacts
    SET 
        user_id = tim_user_id,
        is_user = TRUE,
        has_user_access = TRUE
    WHERE 
        email = 'tim@acme.com';
        
    RAISE NOTICE 'Updated Tim''s user metadata and contact record';
END $$; 