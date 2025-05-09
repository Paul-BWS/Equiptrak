import db from '../lib/db';

export interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  model: string;
  manufacturer: string;
  type_id: string;
  company_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface EquipmentWithRelations extends Equipment {
  equipment_type: string;
  company_name: string;
}

export interface CreateEquipmentInput {
  name: string;
  serial_number: string;
  model: string;
  manufacturer: string;
  type_id: string;
  company_id: string;
}

export interface UpdateEquipmentInput {
  name?: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  type_id?: string;
  company_id?: string;
}

/**
 * Get all equipment
 */
export async function getAllEquipment(): Promise<Equipment[]> {
  return db.query<Equipment>('SELECT * FROM equipment ORDER BY name');
}

/**
 * Get equipment with related data
 */
export async function getEquipmentWithRelations(): Promise<EquipmentWithRelations[]> {
  const query = `
    SELECT 
      e.*,
      et.name as equipment_type,
      c.name as company_name
    FROM 
      equipment e
    JOIN 
      equipment_types et ON e.type_id = et.id
    JOIN 
      companies c ON e.company_id = c.id
    ORDER BY 
      c.name, e.name
  `;
  
  return db.query<EquipmentWithRelations>(query);
}

/**
 * Get equipment by ID
 */
export async function getEquipmentById(id: string): Promise<Equipment | null> {
  return db.queryOne<Equipment>('SELECT * FROM equipment WHERE id = $1', [id]);
}

/**
 * Get equipment by company ID
 */
export async function getEquipmentByCompanyId(companyId: string): Promise<Equipment[]> {
  return db.query<Equipment>('SELECT * FROM equipment WHERE company_id = $1 ORDER BY name', [companyId]);
}

/**
 * Get equipment by type ID
 */
export async function getEquipmentByTypeId(typeId: string): Promise<Equipment[]> {
  return db.query<Equipment>('SELECT * FROM equipment WHERE type_id = $1 ORDER BY name', [typeId]);
}

/**
 * Create new equipment
 */
export async function createEquipment(input: CreateEquipmentInput): Promise<Equipment> {
  const { name, serial_number, model, manufacturer, type_id, company_id } = input;
  
  const result = await db.query<Equipment>(
    `INSERT INTO equipment (name, serial_number, model, manufacturer, type_id, company_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, serial_number, model, manufacturer, type_id, company_id]
  );
  
  return result[0];
}

/**
 * Update equipment
 */
export async function updateEquipment(id: string, input: UpdateEquipmentInput): Promise<Equipment | null> {
  const { name, serial_number, model, manufacturer, type_id, company_id } = input;
  
  // Build the SET clause dynamically based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  
  if (serial_number !== undefined) {
    updates.push(`serial_number = $${paramIndex++}`);
    values.push(serial_number);
  }
  
  if (model !== undefined) {
    updates.push(`model = $${paramIndex++}`);
    values.push(model);
  }
  
  if (manufacturer !== undefined) {
    updates.push(`manufacturer = $${paramIndex++}`);
    values.push(manufacturer);
  }
  
  if (type_id !== undefined) {
    updates.push(`type_id = $${paramIndex++}`);
    values.push(type_id);
  }
  
  if (company_id !== undefined) {
    updates.push(`company_id = $${paramIndex++}`);
    values.push(company_id);
  }
  
  // Add updated_at
  updates.push(`updated_at = NOW()`);
  
  // If no fields to update, return the existing equipment
  if (updates.length === 1) {
    return getEquipmentById(id);
  }
  
  // Add the ID to the values array
  values.push(id);
  
  const result = await db.query<Equipment>(
    `UPDATE equipment
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Delete equipment
 */
export async function deleteEquipment(id: string): Promise<boolean> {
  const result = await db.query('DELETE FROM equipment WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
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