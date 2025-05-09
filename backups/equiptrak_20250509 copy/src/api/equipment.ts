import equipmentRepo from '../repositories/equipment';
import type { 
  Equipment, 
  EquipmentWithRelations, 
  CreateEquipmentInput, 
  UpdateEquipmentInput 
} from '../repositories/equipment';

/**
 * Get all equipment
 */
export async function getAllEquipment(): Promise<Equipment[]> {
  try {
    return await equipmentRepo.getAllEquipment();
  } catch (error) {
    console.error('Error getting equipment:', error);
    throw new Error('Failed to get equipment');
  }
}

/**
 * Get equipment with related data
 */
export async function getEquipmentWithRelations(): Promise<EquipmentWithRelations[]> {
  try {
    return await equipmentRepo.getEquipmentWithRelations();
  } catch (error) {
    console.error('Error getting equipment with relations:', error);
    throw new Error('Failed to get equipment with relations');
  }
}

/**
 * Get equipment by ID
 */
export async function getEquipmentById(id: string): Promise<Equipment | null> {
  try {
    return await equipmentRepo.getEquipmentById(id);
  } catch (error) {
    console.error(`Error getting equipment ${id}:`, error);
    throw new Error('Failed to get equipment');
  }
}

/**
 * Get equipment by company ID
 */
export async function getEquipmentByCompanyId(companyId: string): Promise<Equipment[]> {
  try {
    return await equipmentRepo.getEquipmentByCompanyId(companyId);
  } catch (error) {
    console.error(`Error getting equipment for company ${companyId}:`, error);
    throw new Error('Failed to get equipment for company');
  }
}

/**
 * Get equipment by type ID
 */
export async function getEquipmentByTypeId(typeId: string): Promise<Equipment[]> {
  try {
    return await equipmentRepo.getEquipmentByTypeId(typeId);
  } catch (error) {
    console.error(`Error getting equipment for type ${typeId}:`, error);
    throw new Error('Failed to get equipment for type');
  }
}

/**
 * Create new equipment
 */
export async function createEquipment(input: CreateEquipmentInput): Promise<Equipment> {
  try {
    return await equipmentRepo.createEquipment(input);
  } catch (error) {
    console.error('Error creating equipment:', error);
    throw new Error('Failed to create equipment');
  }
}

/**
 * Update equipment
 */
export async function updateEquipment(id: string, input: UpdateEquipmentInput): Promise<Equipment | null> {
  try {
    return await equipmentRepo.updateEquipment(id, input);
  } catch (error) {
    console.error(`Error updating equipment ${id}:`, error);
    throw new Error('Failed to update equipment');
  }
}

/**
 * Delete equipment
 */
export async function deleteEquipment(id: string): Promise<boolean> {
  try {
    return await equipmentRepo.deleteEquipment(id);
  } catch (error) {
    console.error(`Error deleting equipment ${id}:`, error);
    throw new Error('Failed to delete equipment');
  }
}

export default {
  getAllEquipment,
  getEquipmentWithRelations,
  getEquipmentById,
  getEquipmentByCompanyId,
  getEquipmentByTypeId,
  createEquipment,
  updateEquipment,
  deleteEquipment
}; 