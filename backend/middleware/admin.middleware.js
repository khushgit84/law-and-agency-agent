/**
 * Express middleware to restrict access to admin users only.
 * Must be used AFTER requireAuth middleware.
 */
export function requireAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error('ADMIN_EMAIL is not configured in environment variables.');
    return res.status(500).json({ error: 'Admin access is not configured.' });
  }

  if (!req.user || req.user.email !== adminEmail) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }

  next();
}
