import jwt from 'jsonwebtoken';

// Secret key should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'equiptrak-secret-key';

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object>} - The decoded token data
 */
export async function verifyToken(token) {
  if (!token) {
    console.warn('No token provided for verification');
    return null;
  }
  
  try {
    // For development, we'll allow requests without proper verification
    // In production, this should be properly verified
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: token verification bypassed');
      return { id: 'dev-user', role: 'admin' };
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
} 