import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verifyToken } from '@/app/lib/auth';

export async function GET(request) {
  try {
    // Get company_id from query parameters
    const url = new URL(request.url);
    const companyId = url.searchParams.get('company_id');
    
    // Verify auth token
    const token = request.headers.get('authorization')?.split(' ')[1];
    const tokenData = await verifyToken(token);
    
    console.log(`Fetching compressors for company ID: ${companyId}`);
    
    if (!companyId) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }
    
    // Query the database for compressor records
    // Using the column names from the database schema as per the CompressorRecord type
    const result = await pool.query(
      `SELECT 
        id, company_id, engineer_name, test_date, retest_date,
        status, certificate_number, notes, equipment_name,
        equipment_serial, pressure_test_result, safety_valve_test,
        oil_level, belt_condition, compressor_model, created_at
       FROM public.compressor_records 
       WHERE company_id = $1 
       ORDER BY test_date DESC`,
      [companyId]
    );
    
    console.log(`Found ${result.rows.length} compressor records for company ID ${companyId}`);
    
    // Return empty array even if no records found (instead of an error)
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(`Error fetching compressors: ${error.message}`);
    // For DB connection or other critical errors, still return an error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Verify auth token
    const token = request.headers.get('authorization')?.split(' ')[1];
    const tokenData = await verifyToken(token);
    
    // Parse the request body
    const data = await request.json();
    
    console.log(`Creating compressor record for company ID: ${data.company_id}`);
    
    // Validate required fields
    if (!data.company_id || !data.engineer_name || !data.equipment_name || !data.equipment_serial) {
      return NextResponse.json({ 
        error: 'company_id, engineer_name, equipment_name, and equipment_serial are required' 
      }, { status: 400 });
    }
    
    // Insert the new compressor record
    const result = await pool.query(
      `INSERT INTO public.compressor_records(
        company_id, engineer_name, test_date, retest_date,
        status, compressor_model, equipment_name,
        equipment_serial, pressure_test_result, safety_valve_test,
        oil_level, belt_condition, notes
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        data.company_id,
        data.engineer_name,
        data.test_date,
        data.retest_date,
        data.status,
        data.compressor_model,
        data.equipment_name,
        data.equipment_serial,
        data.pressure_test_result,
        data.safety_valve_test,
        data.oil_level,
        data.belt_condition,
        data.notes
      ]
    );
    
    console.log(`Created compressor record: ${result.rows[0].id}`);
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(`Error creating compressor record: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 