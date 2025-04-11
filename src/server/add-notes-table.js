const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER,
  password: process.env.VITE_POSTGRES_PASSWORD,
  host: process.env.VITE_POSTGRES_HOST,
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB,
  ssl: false
});

async function addNotesTable() {
  try {
    // Check if notes table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notes'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('Creating notes table...');
      await pool.query(`
        CREATE TABLE notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          note_type TEXT NOT NULL CHECK (note_type IN ('admin', 'user')),
          created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log('Notes table created successfully');
    } else {
      console.log('Notes table already exists');
      
      // Check if note_type column exists
      const columnExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'notes' AND column_name = 'note_type'
        );
      `);

      if (!columnExists.rows[0].exists) {
        console.log('Adding note_type column...');
        await pool.query(`
          ALTER TABLE notes 
          ADD COLUMN note_type TEXT NOT NULL DEFAULT 'admin' 
          CHECK (note_type IN ('admin', 'user'));
        `);
        console.log('note_type column added successfully');
      } else {
        console.log('note_type column already exists');
      }
    }

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_company_id ON notes(company_id);
      CREATE INDEX IF NOT EXISTS idx_notes_note_type ON notes(note_type);
    `);
    console.log('Indexes created successfully');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration
addNotesTable(); 