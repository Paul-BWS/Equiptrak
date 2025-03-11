-- Comprehensive fix for Tim's user account and associations
DO $$
DECLARE
    tim_user_id uuid;
    tim_contact_id uuid;
    acme_company_id uuid := '0cd307a7-c938-49da-b005-17746587ca8a'; -- Acme company ID
    contact_exists boolean;
    user_exists boolean;
BEGIN
    -- Check if Tim exists in auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'tim@acme.com'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE EXCEPTION 'User tim@acme.com not found in auth.users';
    END IF;
    
    -- Get Tim's user ID
    SELECT id INTO tim_user_id 
    FROM auth.users 
    WHERE email = 'tim@acme.com';
    
    -- Check if Tim exists in contacts
    SELECT EXISTS (
        SELECT 1 FROM contacts WHERE email = 'tim@acme.com'
    ) INTO contact_exists;
    
    IF NOT contact_exists THEN
        RAISE EXCEPTION 'Contact tim@acme.com not found in contacts table';
    END IF;
    
    -- Get Tim's contact ID
    SELECT id INTO tim_contact_id
    FROM contacts
    WHERE email = 'tim@acme.com';
    
    -- 1. Update Tim's user metadata with the company_id
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
        'company_id', acme_company_id::text,
        'company_name', 'Acme',
        'role', 'customer',
        'name', 'Tim Acme',
        'email_verified', true
    )
    WHERE id = tim_user_id;
    
    RAISE NOTICE 'Updated Tim''s user metadata with company_id: %', acme_company_id;
    
    -- 2. Ensure the contact record is properly linked
    UPDATE contacts
    SET 
        user_id = tim_user_id,
        is_user = TRUE,
        has_user_access = TRUE,
        has_system_access = TRUE
    WHERE 
        id = tim_contact_id;
        
    RAISE NOTICE 'Updated Tim''s contact record with user_id: %', tim_user_id;
    
    -- 3. Check if there's a profiles table and update it if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) THEN
        -- Check if Tim has a profile
        IF EXISTS (
            SELECT 1 FROM profiles WHERE id = tim_user_id
        ) THEN
            -- Update Tim's profile
            UPDATE profiles
            SET 
                company_name = 'Acme',
                role = 'customer',
                email = 'tim@acme.com'
            WHERE 
                id = tim_user_id;
                
            RAISE NOTICE 'Updated Tim''s profile record';
        ELSE
            -- Create a profile for Tim
            INSERT INTO profiles (
                id,
                email,
                company_name,
                role,
                created_at,
                updated_at
            ) VALUES (
                tim_user_id,
                'tim@acme.com',
                'Acme',
                'customer',
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Created profile record for Tim';
        END IF;
    END IF;
    
    -- 4. Check if there's a user_roles table and update it if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_roles'
    ) THEN
        -- Check if Tim has a user_role
        IF EXISTS (
            SELECT 1 FROM user_roles WHERE user_id = tim_user_id
        ) THEN
            -- Update Tim's user_role
            UPDATE user_roles
            SET role = 'customer'
            WHERE user_id = tim_user_id;
            
            RAISE NOTICE 'Updated Tim''s user_role record';
        ELSE
            -- Create a user_role for Tim
            INSERT INTO user_roles (
                user_id,
                role,
                created_at
            ) VALUES (
                tim_user_id,
                'customer',
                NOW()
            );
            
            RAISE NOTICE 'Created user_role record for Tim';
        END IF;
    END IF;
    
    RAISE NOTICE 'Tim''s account has been fully updated and linked';
END $$; 