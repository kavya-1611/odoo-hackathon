/**
 * Usage: roleGuard("ADMIN") or roleGuard("ADMIN", "EMPLOYEE")
 * Must run after authGuard, since it relies on req.user being populated.
 */
function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}

module.exports = roleGuard;
