import db from '../lib/db';

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
  company_name: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  telephone?: string;
  website?: string;
  industry?: string;
}

export interface UpdateCompanyInput {
  company_name?: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  telephone?: string;
  website?: string;
  industry?: string;
}

/**
 * Get all companies
 */
export async function getAllCompanies(): Promise<Company[]> {
  return db.query<Company>('SELECT * FROM companies ORDER BY company_name');
}

/**
 * Get a company by ID
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  const result = await db.query<Company>('SELECT * FROM companies WHERE id = $1', [id]);
  return result.length > 0 ? result[0] : null;
}

/**
 * Create a new company
 */
export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  const { company_name, address, city, county, postcode, country, telephone, website, industry } = input;
  
  const result = await db.query<Company>(
    `INSERT INTO companies (company_name, address, city, county, postcode, country, telephone, website, industry)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [company_name, address, city, county, postcode, country, telephone, website, industry]
  );
  
  return result[0];
}

/**
 * Update a company
 */
export async function updateCompany(id: string, input: Partial<CreateCompanyInput>): Promise<Company | null> {
  const { company_name, address, city, county, postcode, country, telephone, website, industry } = input;
  
  // Build the SET clause dynamically based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  if (company_name !== undefined) {
    updates.push(`company_name = $${paramIndex++}`);
    values.push(company_name);
  }
  
  if (address !== undefined) {
    updates.push(`address = $${paramIndex++}`);
    values.push(address);
  }
  
  if (city !== undefined) {
    updates.push(`city = $${paramIndex++}`);
    values.push(city);
  }
  
  if (county !== undefined) {
    updates.push(`county = $${paramIndex++}`);
    values.push(county);
  }
  
  if (postcode !== undefined) {
    updates.push(`postcode = $${paramIndex++}`);
    values.push(postcode);
  }
  
  if (country !== undefined) {
    updates.push(`country = $${paramIndex++}`);
    values.push(country);
  }
  
  if (telephone !== undefined) {
    updates.push(`telephone = $${paramIndex++}`);
    values.push(telephone);
  }
  
  if (website !== undefined) {
    updates.push(`website = $${paramIndex++}`);
    values.push(website);
  }
  
  if (industry !== undefined) {
    updates.push(`industry = $${paramIndex++}`);
    values.push(industry);
  }
  
  // Add updated_at
  updates.push(`updated_at = NOW()`);
  
  // If no fields to update, return the existing company
  if (updates.length === 1) {
    return getCompanyById(id);
  }
  
  // Add the ID to the values array
  values.push(id);
  
  const result = await db.query<Company>(
    `UPDATE companies
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Delete a company
 */
export async function deleteCompany(id: string): Promise<boolean> {
  const result = await db.query('DELETE FROM companies WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}

export default {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
}; 