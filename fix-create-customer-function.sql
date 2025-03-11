-- Update the create_customer function to properly create profiles for new users
CREATE OR REPLACE FUNCTION create_customer(
    user_data jsonb,
    profile_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
    new_user_id uuid;
    current_user_email text;
    current_user_role text;
    is_admin boolean;
    company_id uuid;
BEGIN
    -- Generate UUID first
    new_user_id := gen_random_uuid();
    
    -- Get the current user's email and role from the JWT
    current_user_email := auth.jwt() ->> 'email';
    current_user_role := auth.jwt() -> 'user_metadata' ->> 'role';
    
    -- Check if user is admin by role, not by email
    is_admin := current_user_role = 'admin';
    
    -- For backward compatibility, also check specific admin emails
    IF NOT is_admin THEN
        is_admin := current_user_email IN ('paul@basicwelding.co.uk', 'sales@basicwelding.co.uk');
    END IF;
    
    -- Only admins can create users
    IF NOT is_admin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Only admins can create users',
            'current_user_email', current_user_email,
            'current_user_role', current_user_role
        );
    END IF;

    -- Determine company_id based on role
    IF user_data->>'role' = 'admin' THEN
        -- For admin users, find BWS LTD company
        SELECT id INTO company_id
        FROM companies
        WHERE company_name = 'BWS LTD';
        
        -- If BWS LTD doesn't exist, create it
        IF company_id IS NULL THEN
            INSERT INTO companies (company_name, address, city, county, postcode, country)
            VALUES ('BWS LTD', '123 Main Street', 'Manchester', 'Greater Manchester', 'M1 1AA', 'United Kingdom')
            RETURNING id INTO company_id;
        END IF;
    ELSE
        -- For regular users, find company by name
        SELECT id INTO company_id
        FROM companies
        WHERE company_name = user_data->>'company_name';
    END IF;

    -- Create the auth user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud,
        raw_app_meta_data
    )
    VALUES (
        new_user_id,
        (SELECT id FROM auth.instances LIMIT 1),
        user_data->>'email',
        auth.crypt(user_data->>'password', auth.gen_salt('bf')),
        now(),
        jsonb_build_object(
            'company_id', company_id::text,
            'company_name', user_data->>'company_name',
            'role', user_data->>'role',
            'created_by', current_user_email
        ),
        now(),
        now(),
        'authenticated',
        'authenticated',
        '{"provider": "email", "providers": ["email"]}'::jsonb
    );

    -- Create the profile
    INSERT INTO profiles (
        id,
        email,
        company_name,
        role,
        telephone,
        mobile,
        address,
        city,
        county,
        postcode,
        country,
        contact_name,
        contact_email,
        stored_password,
        company_id
    )
    VALUES (
        new_user_id,
        profile_data->>'email',
        profile_data->>'company_name',
        (profile_data->>'role')::user_role,
        profile_data->>'telephone',
        profile_data->>'mobile',
        profile_data->>'address',
        profile_data->>'city',
        profile_data->>'county',
        profile_data->>'postcode',
        COALESCE(profile_data->>'country', 'United Kingdom'),
        profile_data->>'contact_name',
        profile_data->>'contact_email',
        profile_data->>'stored_password',
        company_id
    );

    -- Return the created user's ID and success status
    RETURN jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'email', user_data->>'email',
        'company_id', company_id
    );

EXCEPTION
    WHEN others THEN
        -- If anything fails, ensure we clean up
        IF new_user_id IS NOT NULL THEN
            DELETE FROM auth.users WHERE id = new_user_id;
        END IF;
        
        -- Return error information
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'detail', SQLSTATE
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_customer(jsonb, jsonb) TO authenticated; 