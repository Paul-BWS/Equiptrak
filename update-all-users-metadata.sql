-- Update all users' metadata with their company_id from the contacts table
DO $$
DECLARE
    user_record RECORD;
    contact_record RECORD;
    company_name_var TEXT;
BEGIN
    -- Loop through all users
    FOR user_record IN 
        SELECT id, email, raw_user_meta_data
        FROM auth.users
    LOOP
        -- Find the contact with matching email
        SELECT * INTO contact_record
        FROM contacts
        WHERE email = user_record.email;
        
        -- If contact exists and has a company_id
        IF contact_record IS NOT NULL AND contact_record.company_id IS NOT NULL THEN
            -- Get company name
            SELECT company_name INTO company_name_var
            FROM companies
            WHERE id = contact_record.company_id;
            
            -- Update user metadata with company_id
            UPDATE auth.users
            SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
                jsonb_build_object(
                    'company_id', contact_record.company_id::text,
                    'company_name', company_name_var
                )
            WHERE id = user_record.id
            AND (raw_user_meta_data->>'company_id') IS NULL;
            
            -- Also ensure the contact record is properly linked to the user
            UPDATE contacts
            SET 
                user_id = user_record.id,
                is_user = TRUE,
                has_user_access = TRUE
            WHERE 
                id = contact_record.id
            AND (user_id IS NULL OR user_id != user_record.id);
            
            RAISE NOTICE 'Updated user % with company_id % (company: %)', 
                user_record.email, contact_record.company_id, company_name_var;
        ELSE
            RAISE NOTICE 'No contact or company_id found for user %', user_record.email;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'All users have been updated with their company_id';
END $$; 