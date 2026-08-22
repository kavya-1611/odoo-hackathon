const { verifyToken } = require("../utils/jwt");

/**
 * Verifies the JWT sent in the Authorization header and attaches the
 * decoded payload (id, role, email) to req.user for downstream handlers.
 */
function authGuard(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = authGuard;
