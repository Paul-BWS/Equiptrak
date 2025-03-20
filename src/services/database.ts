import db from '@/lib/db';

// Company types
export interface Company {
  id: string;
  company_name: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  telephone?: string;
  website?: string;
  industry?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCompanyInput {
  name: string;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  id: string;
}

// Company functions
export async function getAllCompanies(): Promise<Company[]> {
  try {
    console.log('Fetching all companies...');
    const companies = await db.query<Company>(`
      SELECT * FROM companies 
      ORDER BY company_name ASC
    `);
    console.log('Companies fetched:', companies);
    return companies;
  } catch (error) {
    console.error('Error getting companies:', error);
    throw new Error('Failed to get companies');
  }
}

export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const results = await db.query<Company>(`
      SELECT * FROM companies 
      WHERE id = $1
    `, [id]);
    
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`Error getting company with ID ${id}:`, error);
    throw new Error('Failed to get company');
  }
}

export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  try {
    const result = await db.query<Company>(`
      INSERT INTO companies (
        name, address, contact_name, contact_email, contact_phone
      ) VALUES (
        $1, $2, $3, $4, $5
      ) RETURNING *
    `, [
      input.name,
      input.address || null,
      input.contact_name || null,
      input.contact_email || null,
      input.contact_phone || null
    ]);
    
    return result[0];
  } catch (error) {
    console.error('Error creating company:', error);
    throw new Error('Failed to create company');
  }
}

export async function updateCompany(input: UpdateCompanyInput): Promise<Company> {
  try {
    // Build the SET clause dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    // Add each field that is provided
    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    
    if (input.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(input.address);
    }
    
    if (input.contact_name !== undefined) {
      updates.push(`contact_name = $${paramIndex++}`);
      values.push(input.contact_name);
    }
    
    if (input.contact_email !== undefined) {
      updates.push(`contact_email = $${paramIndex++}`);
      values.push(input.contact_email);
    }
    
    if (input.contact_phone !== undefined) {
      updates.push(`contact_phone = $${paramIndex++}`);
      values.push(input.contact_phone);
    }
    
    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);
    
    // Add the ID as the last parameter
    values.push(input.id);
    
    const result = await db.query<Company>(`
      UPDATE companies 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);
    
    if (result.length === 0) {
      throw new Error(`Company with ID ${input.id} not found`);
    }
    
    return result[0];
  } catch (error) {
    console.error(`Error updating company with ID ${input.id}:`, error);
    throw new Error('Failed to update company');
  }
}

export async function deleteCompany(id: string): Promise<void> {
  try {
    const result = await db.query(`
      DELETE FROM companies 
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    if (result.length === 0) {
      throw new Error(`Company with ID ${id} not found`);
    }
  } catch (error) {
    console.error(`Error deleting company with ID ${id}:`, error);
    throw new Error('Failed to delete company');
  }
}

// Export all functions
export default {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
}; 