-- Create a function to associate a new user with their contact record
CREATE OR REPLACE FUNCTION associate_user_with_contact()
RETURNS TRIGGER AS $$
DECLARE
    contact_record RECORD;
BEGIN
    -- Find a contact with the same email as the new user
    SELECT * INTO contact_record
    FROM contacts
    WHERE email = NEW.email;
    
    -- If a contact is found, update it with the user_id
    IF contact_record IS NOT NULL THEN
        UPDATE contacts
        SET 
            user_id = NEW.id,
            is_user = TRUE,
            has_user_access = TRUE
        WHERE id = contact_record.id;
        
        -- Update the user metadata with company_id if not already set
        IF (NEW.raw_user_meta_data->>'company_id') IS NULL AND contact_record.company_id IS NOT NULL THEN
            UPDATE auth.users
            SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
                jsonb_build_object('company_id', contact_record.company_id::text)
            WHERE id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the function when a new user is created
DROP TRIGGER IF EXISTS associate_user_with_contact_on_insert ON auth.users;
CREATE TRIGGER associate_user_with_contact_on_insert
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION associate_user_with_contact(); 