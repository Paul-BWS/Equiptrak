-- Check if has_system_access column exists and update it
DO $$
DECLARE
    column_exists boolean;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'contacts'
        AND column_name = 'has_system_access'
    ) INTO column_exists;
    
    IF column_exists THEN
        -- Update Tim's contact record with has_system_access
        UPDATE contacts
        SET has_system_access = TRUE
        WHERE email = 'tim@acme.com';
        
        RAISE NOTICE 'Updated Tim''s has_system_access to TRUE';
    ELSE
        RAISE NOTICE 'has_system_access column does not exist in contacts table';
    END IF;
END $$; 