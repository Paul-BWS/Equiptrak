-- Create a function to update user metadata when a contact is associated with a user
CREATE OR REPLACE FUNCTION update_user_metadata_from_contact()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if user_id is being set or changed
    IF NEW.user_id IS NOT NULL AND (OLD.user_id IS NULL OR OLD.user_id != NEW.user_id) THEN
        -- Update the user metadata with company_id
        UPDATE auth.users
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            jsonb_build_object('company_id', NEW.company_id::text)
        WHERE id = NEW.user_id
        AND (raw_user_meta_data->>'company_id') IS NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the function when a contact is updated
DROP TRIGGER IF EXISTS update_user_metadata_on_contact_update ON contacts;
CREATE TRIGGER update_user_metadata_on_contact_update
    AFTER UPDATE OF user_id ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_metadata_from_contact();

-- Create a trigger to run the function when a new contact is inserted
DROP TRIGGER IF EXISTS update_user_metadata_on_contact_insert ON contacts;
CREATE TRIGGER update_user_metadata_on_contact_insert
    AFTER INSERT ON contacts
    FOR EACH ROW
    WHEN (NEW.user_id IS NOT NULL)
    EXECUTE FUNCTION update_user_metadata_from_contact(); 