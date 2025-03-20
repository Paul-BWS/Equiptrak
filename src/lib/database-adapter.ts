import { supabase } from '@/integrations/supabase/client';
import db from './db';

// Environment variable to control which database to use
const USE_POSTGRES = import.meta.env.VITE_USE_POSTGRES === 'true';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mock data for browser testing
const mockData = {
  companies: [
    { id: '1', name: 'Mock Company 1', address: '123 Test St', contact_name: 'John Doe', contact_email: 'john@example.com', contact_phone: '123-456-7890' },
    { id: '2', name: 'Mock Company 2', address: '456 Demo Ave', contact_name: 'Jane Smith', contact_email: 'jane@example.com', contact_phone: '987-654-3210' },
  ],
  equipment: [
    { id: '1', name: 'Mock Equipment 1', serial_number: 'SN001', model: 'Model X', manufacturer: 'Acme Inc', equipment_type: 'Compressor', company_name: 'Mock Company 1' },
    { id: '2', name: 'Mock Equipment 2', serial_number: 'SN002', model: 'Model Y', manufacturer: 'Tech Corp', equipment_type: 'Rivet Tool', company_name: 'Mock Company 2' },
  ]
};

/**
 * Database adapter that works with both Supabase and PostgreSQL
 */
class DatabaseAdapter {
  /**
   * Execute a query against the appropriate database
   */
  async query<T = any>(table: string, options: {
    select?: string | string[];
    where?: Record<string, any>;
    order?: Record<string, 'asc' | 'desc'>;
    limit?: number;
    offset?: number;
    single?: boolean;
  } = {}): Promise<T> {
    // In browser environment with PostgreSQL mode, use mock data
    if (isBrowser && USE_POSTGRES) {
      return this.queryMock<T>(table, options);
    }
    
    if (USE_POSTGRES) {
      return this.queryPostgres<T>(table, options);
    } else {
      return this.querySupabase<T>(table, options);
    }
  }

  /**
   * Execute a query against mock data (for browser testing)
   */
  private queryMock<T = any>(table: string, options: {
    select?: string | string[];
    where?: Record<string, any>;
    order?: Record<string, 'asc' | 'desc'>;
    limit?: number;
    offset?: number;
    single?: boolean;
  } = {}): Promise<T> {
    console.warn(`Using mock data for table: ${table}`);
    const { where, single } = options;
    
    // Get the mock data for the table
    let data = (mockData[table as keyof typeof mockData] || []) as any[];
    
    // Apply where conditions if any
    if (where) {
      data = data.filter(item => 
        Object.entries(where).every(([key, value]) => item[key] === value)
      );
    }
    
    // Return the result
    return Promise.resolve(single ? (data[0] || null) : data) as Promise<T>;
  }

  /**
   * Execute a query against Supabase
   */
  private async querySupabase<T = any>(table: string, options: {
    select?: string | string[];
    where?: Record<string, any>;
    order?: Record<string, 'asc' | 'desc'>;
    limit?: number;
    offset?: number;
    single?: boolean;
  } = {}): Promise<T> {
    const { select, where, order, limit, offset, single } = options;
    
    let query = supabase.from(table).select(
      select ? (Array.isArray(select) ? select.join(', ') : select) : '*'
    );
    
    // Apply where conditions
    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    // Apply order
    if (order) {
      Object.entries(order).forEach(([key, direction]) => {
        query = query.order(key, { ascending: direction === 'asc' });
      });
    }
    
    // Apply limit and offset
    if (limit) {
      query = query.limit(limit);
    }
    
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }
    
    const { data, error } = single 
      ? await query.single() 
      : await query;
    
    if (error) {
      throw error;
    }
    
    return data as T;
  }

  /**
   * Execute a query against PostgreSQL
   */
  private async queryPostgres<T = any>(table: string, options: {
    select?: string | string[];
    where?: Record<string, any>;
    order?: Record<string, 'asc' | 'desc'>;
    limit?: number;
    offset?: number;
    single?: boolean;
  } = {}): Promise<T> {
    const { select, where, order, limit, offset, single } = options;
    
    // Build the SQL query
    const selectClause = select 
      ? (Array.isArray(select) ? select.join(', ') : select) 
      : '*';
    
    let sql = `SELECT ${selectClause} FROM ${table}`;
    const params: any[] = [];
    
    // Add WHERE clause
    if (where && Object.keys(where).length > 0) {
      const whereConditions = Object.entries(where).map(([key, value], index) => {
        params.push(value);
        return `${key} = $${index + 1}`;
      });
      
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Add ORDER BY clause
    if (order && Object.keys(order).length > 0) {
      const orderClauses = Object.entries(order).map(([key, direction]) => 
        `${key} ${direction.toUpperCase()}`
      );
      
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    }
    
    // Add LIMIT and OFFSET
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    
    if (offset) {
      sql += ` OFFSET ${offset}`;
    }
    
    // Execute the query
    const result = await db.query(sql, params);
    
    return single ? (result.length > 0 ? result[0] : null) : result as T;
  }

  /**
   * Insert a record into the appropriate database
   */
  async insert<T = any>(table: string, data: Record<string, any>, options: {
    returning?: string | string[];
  } = {}): Promise<T> {
    // In browser environment with PostgreSQL mode, use mock data
    if (isBrowser && USE_POSTGRES) {
      console.warn(`Mock insert into table: ${table}`, data);
      return Promise.resolve({ id: Date.now().toString(), ...data }) as Promise<T>;
    }
    
    if (USE_POSTGRES) {
      return this.insertPostgres<T>(table, data, options);
    } else {
      return this.insertSupabase<T>(table, data, options);
    }
  }

  /**
   * Insert a record into Supabase
   */
  private async insertSupabase<T = any>(table: string, data: Record<string, any>, options: {
    returning?: string | string[];
  } = {}): Promise<T> {
    const { returning } = options;
    
    const query = supabase.from(table).insert(data);
    
    if (returning) {
      query.select(Array.isArray(returning) ? returning.join(', ') : returning);
    }
    
    const { data: result, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return result as T;
  }

  /**
   * Insert a record into PostgreSQL
   */
  private async insertPostgres<T = any>(table: string, data: Record<string, any>, options: {
    returning?: string | string[];
  } = {}): Promise<T> {
    const { returning } = options;
    
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    
    let sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    
    if (returning) {
      sql += ` RETURNING ${Array.isArray(returning) ? returning.join(', ') : returning}`;
    } else {
      sql += ' RETURNING *';
    }
    
    const result = await db.query(sql, values);
    
    return result as T;
  }

  /**
   * Update a record in the appropriate database
   */
  async update<T = any>(table: string, data: Record<string, any>, where: Record<string, any>, options: {
    returning?: string | string[];
  } = {}): Promise<T> {
    if (USE_POSTGRES) {
      return this.updatePostgres<T>(table, data, where, options);
    } else {
      return this.updateSupabase<T>(table, data, where, options);
    }
  }

  /**
   * Update a record in Supabase
   */
  private async updateSupabase<T = any>(table: string, data: Record<string, any>, where: Record<string, any>, options: {
    returning?: string | string[];
  } = {}): Promise<T> {
    const { returning } = options;
    
    let query = supabase.from(table).update(data);
    
    // Apply where conditions
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    if (returning) {
      query.select(Array.isArray(returning) ? returning.join(', ') : returning);
    }
    
    const { data: result, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return result as T;
  }

  /**
   * Update a record in PostgreSQL
   */
  private async updatePostgres<T = any>(table: string, data: Record<string, any>, where: Record<string, any>, options: {
    returning?: string | string[];
  } = {}): Promise<T> {
    const { returning } = options;
    
    const setColumns = Object.keys(data);
    const setValues = Object.values(data);
    const whereColumns = Object.keys(where);
    const whereValues = Object.values(where);
    
    const setClause = setColumns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const whereClause = whereColumns.map((col, i) => `${col} = $${setValues.length + i + 1}`).join(' AND ');
    
    let sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    
    if (returning) {
      sql += ` RETURNING ${Array.isArray(returning) ? returning.join(', ') : returning}`;
    } else {
      sql += ' RETURNING *';
    }
    
    const result = await db.query(sql, [...setValues, ...whereValues]);
    
    return result as T;
  }

  /**
   * Delete a record from the appropriate database
   */
  async delete<T = any>(table: string, where: Record<string, any>, options: {
    returning?: string | string[];
  } = {}): Promise<T> {
    if (USE_POSTGRES) {
      return this.deletePostgres<T>(table, where, options);
    } else {
      return this.deleteSupabase<T>(table, where, options);
    }
  }

  /**
   * Delete a record from Supabase
   */
  private async deleteSupabase<T = any>(table: string, where: Record<string, any>, options: {
    returning?: string | string[];
  } = {}): Promise<T> {
    const { returning } = options;
    
    let query = supabase.from(table).delete();
    
    // Apply where conditions
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    if (returning) {
      query.select(Array.isArray(returning) ? returning.join(', ') : returning);
    }
    
    const { data: result, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return result as T;
  }

  /**
   * Delete a record from PostgreSQL
   */
  private async deletePostgres<T = any>(table: string, where: Record<string, any>, options: {
    returning?: string | string[];
  } = {}): Promise<T> {
    const { returning } = options;
    
    const whereColumns = Object.keys(where);
    const whereValues = Object.values(where);
    
    const whereClause = whereColumns.map((col, i) => `${col} = $${i + 1}`).join(' AND ');
    
    let sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    
    if (returning) {
      sql += ` RETURNING ${Array.isArray(returning) ? returning.join(', ') : returning}`;
    } else {
      sql += ' RETURNING *';
    }
    
    const result = await db.query(sql, whereValues);
    
    return result as T;
  }

  /**
   * Execute a raw SQL query
   */
  async rawQuery<T = any>(sql: string, params?: any[]): Promise<T[]> {
    // In browser environment with PostgreSQL mode, return mock data
    if (isBrowser && USE_POSTGRES) {
      console.warn('Mock raw query:', sql);
      
      // Return mock equipment data for equipment queries
      if (sql.toLowerCase().includes('equipment')) {
        return mockData.equipment as unknown as T[];
      }
      
      return [] as T[];
    }
    
    if (USE_POSTGRES) {
      return db.query<T>(sql, params);
    } else {
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
      
      if (error) {
        throw error;
      }
      
      return data as T[];
    }
  }
}

// Create and export a singleton instance
const dbAdapter = new DatabaseAdapter();
export default dbAdapter; 