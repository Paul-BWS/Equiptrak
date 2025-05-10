import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verifyToken } from '@/app/lib/auth';

export async function DELETE(request) {
  try {
    // Verify auth token (simplified for development)
    const token = request.headers.get('authorization')?.split(' ')[1];
    try {
      const tokenData = await verifyToken(token);
    } catch (authError) {
      console.warn("Auth validation issue:", authError.message);
    }
    
    // Get the company ID from query params
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }
    
    console.log(`Deleting test service records for company ID: ${companyId}`);
    
    // Delete invalid test records (those with status 'Invalid' OR missing certificate numbers)
    const result = await pool.query(
      `DELETE FROM service_records 
       WHERE company_id = $1 
       AND (
         certificate_number IS NULL 
         OR certificate_number = '' 
         OR certificate_number = '-'
         OR status = 'invalid' 
         OR LOWER(status) = 'invalid'
       )
       RETURNING id`,
      [companyId]
    );
    
    const deletedCount = result.rowCount;
    
    return NextResponse.json({ 
      message: `Successfully deleted ${deletedCount} test service records`,
      deletedCount,
      companyId
    });
  } catch (error) {
    console.error(`Error deleting test service records: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 