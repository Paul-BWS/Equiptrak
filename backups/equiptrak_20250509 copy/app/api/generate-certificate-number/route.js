import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verifyToken } from '@/app/lib/auth';

export async function GET(request) {
  try {
    // Verify auth token (simplified for development)
    const token = request.headers.get('authorization')?.split(' ')[1];
    const tokenData = await verifyToken(token);
    
    console.log('Generating certificate number');
    
    try {
      // First try to use the sequence
      const result = await pool.query(
        `SELECT nextval('service_certificate_seq')::TEXT AS certificate_number`
      );
      
      const certificateNumber = `BWS-${result.rows[0].certificate_number}`;
      
      console.log(`Generated certificate number: ${certificateNumber}`);
      
      return NextResponse.json({ certificateNumber });
    } catch (dbError) {
      console.error('Error with sequence, using fallback:', dbError);
      
      // Fallback to timestamp-based number if there's an issue with the sequence
      const timestamp = Date.now().toString().slice(-6);
      const fallbackNumber = `BWS-${timestamp}`;
      
      console.log(`Generated fallback certificate number: ${fallbackNumber}`);
      
      return NextResponse.json({ certificateNumber: fallbackNumber });
    }
  } catch (error) {
    console.error(`Error generating certificate number: ${error.message}`);
    
    // Even if there's an error, return a certificate number so the form works
    const emergencyNumber = `BWS-EMG-${Date.now().toString().slice(-6)}`;
    
    return NextResponse.json({ 
      certificateNumber: emergencyNumber,
      error: error.message 
    });
  }
} 