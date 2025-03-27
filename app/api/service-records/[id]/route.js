import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verifyToken } from '@/app/lib/auth';
import { addDays, format } from 'date-fns';

export async function GET(request, { params }) {
  try {
    // Verify auth token
    const token = request.headers.get('authorization')?.split(' ')[1];
    const tokenData = await verifyToken(token);
    
    const { id } = params;
    console.log(`Fetching service record with ID: ${id}`);
    
    const result = await pool.query(
      `SELECT * FROM service_records WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      console.log(`No service record found with ID: ${id}`);
      return NextResponse.json({ error: 'Service record not found' }, { status: 404 });
    }
    
    const serviceRecord = result.rows[0];
    console.log(`Service record found with certificate number: ${serviceRecord.certificate_number}`);
    
    return NextResponse.json(serviceRecord);
  } catch (error) {
    console.error(`Error fetching service record: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Verify auth token
    const token = request.headers.get('authorization')?.split(' ')[1];
    const tokenData = await verifyToken(token);
    
    const { id } = params;
    const data = await request.json();
    
    console.log(`Updating service record with ID: ${id}`);
    
    // Format dates correctly for database
    const serviceDate = data.service_date ? new Date(data.service_date) : null;
    
    // ALWAYS calculate retest_date as service_date + 364 days
    // This ensures the retest date is always correctly set
    let retestDate = null;
    if (serviceDate) {
      retestDate = addDays(serviceDate, 364);
      console.log(`Service date: ${format(serviceDate, 'yyyy-MM-dd')}`);
      console.log(`Calculated retest date: ${format(retestDate, 'yyyy-MM-dd')}`);
    }
    
    // Build update query dynamically
    const updateFields = [];
    const queryParams = [];
    let paramCount = 1;
    
    // Add all fields from the request to the update query
    Object.keys(data).forEach(key => {
      // Skip id as we don't want to update that
      if (key === 'id') return;
      
      // Don't use client's retest_date - we calculate it instead
      if (key === 'retest_date') return;
      
      // Handle service_date field
      if (key === 'service_date' && serviceDate) {
        updateFields.push(`${key} = $${paramCount}`);
        queryParams.push(serviceDate);
        paramCount++;
      } else if (data[key] !== null && data[key] !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        queryParams.push(data[key]);
        paramCount++;
      }
    });
    
    // Always add the calculated retest_date if we have a service_date
    if (retestDate) {
      updateFields.push(`retest_date = $${paramCount}`);
      queryParams.push(retestDate);
      paramCount++;
    }
    
    // Add the record ID as the last parameter
    queryParams.push(id);
    
    // Build and execute the update query
    const updateQuery = `
      UPDATE service_records
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    console.log(`Update query: ${updateQuery}`);
    console.log(`Query parameters:`, queryParams);
    
    const result = await pool.query(updateQuery, queryParams);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service record not found or not updated' }, { status: 404 });
    }
    
    const updatedRecord = result.rows[0];
    console.log(`Service record updated successfully`);
    
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error(`Error updating service record: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 