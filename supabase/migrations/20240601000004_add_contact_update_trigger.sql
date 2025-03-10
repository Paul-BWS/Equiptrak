-- Create a function to update user metadata when a contact's company_id is updated
CREATE OR REPLACE FUNCTION update_user_metadata_on_contact_update()
RETURNS TRIGGER AS $$
DECLARE
    company_name_var TEXT;
BEGIN
    -- Only proceed if company_id has changed and user_id exists
    IF (NEW.company_id IS DISTINCT FROM OLD.company_id) AND NEW.user_id IS NOT NULL THEN
        -- Get company name
        SELECT company_name INTO company_name_var
        FROM companies
        WHERE id = NEW.company_id;
        
        -- Update the user metadata with the new company_id
        UPDATE auth.users
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'company_id', NEW.company_id::text,
                'company_name', company_name_var
            )
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the function when a contact is updated
DROP TRIGGER IF EXISTS update_user_metadata_on_contact_update ON contacts;
CREATE TRIGGER update_user_metadata_on_contact_update
    AFTER UPDATE OF company_id ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_metadata_on_contact_update(); 