-- Ensure all users with the 'admin' role are associated with BWS LTD
DO $$
DECLARE
    user_record RECORD;
    bws_company_id uuid;
BEGIN
    -- First, find the BWS LTD company ID
    SELECT id INTO bws_company_id
    FROM companies
    WHERE company_name = 'BWS LTD';
    
    -- If BWS LTD doesn't exist, create it
    IF bws_company_id IS NULL THEN
        INSERT INTO companies (company_name, address, city, county, postcode, country)
        VALUES ('BWS LTD', '123 Main Street', 'Manchester', 'Greater Manchester', 'M1 1AA', 'United Kingdom')
        RETURNING id INTO bws_company_id;
        
        RAISE NOTICE 'Created BWS LTD company with ID: %', bws_company_id;
    ELSE
        RAISE NOTICE 'Found existing BWS LTD company with ID: %', bws_company_id;
    END IF;
    
    -- Update all users with 'admin' role to be associated with BWS LTD
    FOR user_record IN 
        SELECT id, email, raw_user_meta_data
        FROM auth.users
        WHERE raw_user_meta_data->>'role' = 'admin'
    LOOP
        -- Update user metadata with BWS company_id
        UPDATE auth.users
        SET raw_user_meta_data = raw_user_meta_data || 
            jsonb_build_object(
                'company_id', bws_company_id::text,
                'company_name', 'BWS LTD'
            )
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Updated admin user % with BWS LTD company_id', user_record.email;
        
        -- Check if user has a contact record
        IF EXISTS (
            SELECT 1 FROM contacts WHERE email = user_record.email
        ) THEN
            -- Update contact record with BWS company_id
            UPDATE contacts
            SET company_id = bws_company_id
            WHERE email = user_record.email;
            
            RAISE NOTICE 'Updated contact record for admin %', user_record.email;
        ELSE
            -- Create a contact record for this admin
            INSERT INTO contacts (
                name,
                email,
                company_id,
                user_id,
                is_user,
                has_user_access,
                has_system_access,
                role
            )
            VALUES (
                COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)),
                user_record.email,
                bws_company_id,
                user_record.id,
                TRUE,
                TRUE,
                TRUE,
                'Admin'
            );
            
            RAISE NOTICE 'Created contact record for admin %', user_record.email;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'All admin users have been associated with BWS LTD';
END $$; 