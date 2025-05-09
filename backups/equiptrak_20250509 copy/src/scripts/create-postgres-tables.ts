import db from '@/lib/db';

/**
 * Script to create the necessary PostgreSQL tables for EquipTrak
 * This can be run from the command line or imported and called from another script
 */

async function createTables() {
  console.log('Creating PostgreSQL tables...');
  
  try {
    // Create companies table
    await db.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        county TEXT,
        postcode TEXT,
        country TEXT DEFAULT 'United Kingdom',
        telephone TEXT,
        website TEXT,
        industry TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Add unique constraint on company name
      ALTER TABLE companies DROP CONSTRAINT IF EXISTS unique_company_name;
      ALTER TABLE companies ADD CONSTRAINT unique_company_name UNIQUE (company_name);
    `);
    console.log('Companies table created');
    
    // Create contacts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        telephone TEXT,
        mobile TEXT,
        job_title TEXT,
        is_primary BOOLEAN DEFAULT false,
        is_user BOOLEAN DEFAULT false,
        has_user_access BOOLEAN DEFAULT false,
        user_id UUID,
        role TEXT DEFAULT 'user',
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
      CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id) WHERE user_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
    `);
    console.log('Contacts table created');
    
    // Create equipment_types table
    await db.query(`
      CREATE TABLE IF NOT EXISTS equipment_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Add unique constraint on equipment type name
      ALTER TABLE equipment_types DROP CONSTRAINT IF EXISTS unique_equipment_type_name;
      ALTER TABLE equipment_types ADD CONSTRAINT unique_equipment_type_name UNIQUE (name);
    `);
    console.log('Equipment types table created');
    
    // Create equipment table
    await db.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        equipment_type_id UUID REFERENCES equipment_types(id),
        name TEXT NOT NULL,
        serial_number TEXT,
        model TEXT,
        manufacturer TEXT,
        purchase_date DATE,
        warranty_expiry DATE,
        status TEXT DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_equipment_company_id ON equipment(company_id);
      CREATE INDEX IF NOT EXISTS idx_equipment_equipment_type_id ON equipment(equipment_type_id);
    `);
    console.log('Equipment table created');
    
    // Insert default data
    await insertDefaultData();
    
    console.log('All tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

async function insertDefaultData() {
  try {
    // Insert default company if it doesn't exist
    await db.query(`
      INSERT INTO companies (company_name, address, city, county, postcode, country, telephone)
      VALUES (
        'Basic Welding Supplies Ltd',
        '123 Main Street',
        'Manchester',
        'Greater Manchester',
        'M1 1AA',
        'United Kingdom',
        '01234 567890'
      )
      ON CONFLICT (company_name) DO NOTHING;
    `);
    
    // Get the company ID
    const company = await db.queryOne(`
      SELECT id FROM companies WHERE company_name = 'Basic Welding Supplies Ltd'
    `);
    
    if (company) {
      // Insert admin contact if it doesn't exist
      await db.query(`
        INSERT INTO contacts (
          company_id, first_name, last_name, email, telephone, 
          is_primary, is_user, has_user_access, role
        )
        VALUES (
          $1, 'Admin', 'User', 'admin@example.com', '01234 567890',
          true, true, true, 'admin'
        )
        ON CONFLICT DO NOTHING;
      `, [company.id]);
      
      // Insert default equipment types
      const equipmentTypes = [
        'Compressor',
        'Spot Welder',
        'Rivet Tool',
        'Lifting Equipment',
        'Other'
      ];
      
      for (const type of equipmentTypes) {
        await db.query(`
          INSERT INTO equipment_types (name)
          VALUES ($1)
          ON CONFLICT (name) DO NOTHING;
        `, [type]);
      }
    }
    
    console.log('Default data inserted');
  } catch (error) {
    console.error('Error inserting default data:', error);
  }
}

// Export functions for use in other scripts
export { createTables, insertDefaultData };

// Run the script if called directly
if (typeof window === 'undefined') {
  createTables()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
} 