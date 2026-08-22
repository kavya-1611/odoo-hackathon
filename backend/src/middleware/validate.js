/**
 * Wraps a Zod schema and validates req.body against it.
 * On failure, responds with 400 and a readable list of issues instead of
 * letting a malformed request reach the database layer.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return res.status(400).json({ error: "Validation failed.", issues });
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
