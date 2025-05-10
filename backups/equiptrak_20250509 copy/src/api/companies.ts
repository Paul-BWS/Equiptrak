import companiesRepo from '../repositories/companies';
import type { Company, CreateCompanyInput, UpdateCompanyInput } from '../repositories/companies';

/**
 * Get all companies
 */
export async function getAllCompanies(): Promise<Company[]> {
  try {
    return await companiesRepo.getAllCompanies();
  } catch (error) {
    console.error('Error getting companies:', error);
    throw new Error('Failed to get companies');
  }
}

/**
 * Get a company by ID
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    return await companiesRepo.getCompanyById(id);
  } catch (error) {
    console.error(`Error getting company ${id}:`, error);
    throw new Error('Failed to get company');
  }
}

/**
 * Create a new company
 */
export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  try {
    return await companiesRepo.createCompany(input);
  } catch (error) {
    console.error('Error creating company:', error);
    throw new Error('Failed to create company');
  }
}

/**
 * Update a company
 */
export async function updateCompany(id: string, input: UpdateCompanyInput): Promise<Company | null> {
  try {
    return await companiesRepo.updateCompany(id, input);
  } catch (error) {
    console.error(`Error updating company ${id}:`, error);
    throw new Error('Failed to update company');
  }
}

/**
 * Delete a company
 */
export async function deleteCompany(id: string): Promise<boolean> {
  try {
    return await companiesRepo.deleteCompany(id);
  } catch (error) {
    console.error(`Error deleting company ${id}:`, error);
    throw new Error('Failed to delete company');
  }
}

export default {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
}; 