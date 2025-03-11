-- Fix user associations between auth.users, contacts, and companies
DO $$
DECLARE
    user_record RECORD;
    contact_record RECORD;
BEGIN
    -- Loop through all authenticated users
    FOR user_record IN 
        SELECT id, email, raw_user_meta_data
        FROM auth.users
        WHERE raw_user_meta_data IS NOT NULL
    LOOP
        -- Check if user has a contact record
        SELECT * INTO contact_record
        FROM contacts
        WHERE email = user_record.email;
        
        IF contact_record IS NOT NULL THEN
            -- Update contact record with user_id if not set
            IF contact_record.user_id IS NULL THEN
                UPDATE contacts
                SET 
                    user_id = user_record.id,
                    is_user = TRUE,
                    has_user_access = TRUE
                WHERE id = contact_record.id;
                
                RAISE NOTICE 'Updated contact % with user_id %', contact_record.email, user_record.id;
            END IF;
            
            -- Update user metadata with company_id if not set
            IF (user_record.raw_user_meta_data->>'company_id') IS NULL AND contact_record.company_id IS NOT NULL THEN
                UPDATE auth.users
                SET raw_user_meta_data = raw_user_meta_data || 
                    jsonb_build_object('company_id', contact_record.company_id::text)
                WHERE id = user_record.id;
                
                RAISE NOTICE 'Updated user % metadata with company_id %', 
                    user_record.email, contact_record.company_id;
            END IF;
        ELSE
            RAISE NOTICE 'User % has no contact record', user_record.email;
        END IF;
    END LOOP;
    
    -- Check for contacts with email matching users but no user_id set
    FOR contact_record IN
        SELECT c.id, c.email, c.company_id, u.id as user_id
        FROM contacts c
        JOIN auth.users u ON c.email = u.email
        WHERE c.user_id IS NULL
    LOOP
        -- Update contact with user_id
        UPDATE contacts
        SET 
            user_id = contact_record.user_id,
            is_user = TRUE,
            has_user_access = TRUE
        WHERE id = contact_record.id;
        
        RAISE NOTICE 'Linked contact % to user %', contact_record.email, contact_record.user_id;
        
        -- Update user metadata with company_id
        UPDATE auth.users
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            jsonb_build_object('company_id', contact_record.company_id::text)
        WHERE id = contact_record.user_id
        AND (raw_user_meta_data->>'company_id') IS NULL;
        
        RAISE NOTICE 'Updated user metadata for % with company_id %', 
            contact_record.email, contact_record.company_id;
    END LOOP;
END $$; 