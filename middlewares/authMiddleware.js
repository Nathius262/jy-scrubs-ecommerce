import { verifyToken } from '../helpers/authHelper.js';

// Middleware to protect admin routes
export const adminAuthMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Get token from the 'adminToken' cookie

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  try {
    const verified = verifyToken(token);
    
    if (verified.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Not Authorized' });
    }

    req.user = verified; // Attach the user data to the request
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};
