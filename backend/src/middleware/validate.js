const { validationResult } = require('express-validator');

/**
 * Run express-validator checks and return 400 on first failure.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

module.exports = validate;
