// Enhanced role-based admin middleware
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Check role-based admin access
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    return next();
  }

  // Fallback: Check if user email contains 'admin' (for backward compatibility)
  if (req.user.email && req.user.email.includes('admin')) {
    return next();
  }

  // Fallback: Check environment admin emails
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());
  if (req.user.email && adminEmails.includes(req.user.email)) {
    return next();
  }

  return res.status(403).json({ error: "Admin access required" });
}

// Super admin only access
function isSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Check role-based super admin access
  if (req.user.role === 'superadmin') {
    return next();
  }

  // Fallback: Check environment admin emails for super admin
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());
  if (req.user.email && adminEmails.includes(req.user.email)) {
    return next();
  }

  return res.status(403).json({ error: "Super admin access required" });
}

// Check if user has specific role
function hasRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.role === role || req.user.role === 'superadmin') {
      return next();
    }

    return res.status(403).json({ error: `${role} access required` });
  };
}

// Check if user is active
function isActiveUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.isActive === false) {
    return res.status(403).json({ error: "Account is deactivated" });
  }

  return next();
}

module.exports = {
  isAdmin,
  isSuperAdmin,
  hasRole,
  isActiveUser
};
