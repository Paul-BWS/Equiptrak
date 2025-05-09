const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log('Authenticating request...');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token is required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log('Token verified successfully for user:', user);
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken }; 