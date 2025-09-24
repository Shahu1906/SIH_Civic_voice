const Joi = require("joi");

const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Validation for admin creation (allows role field)
const validateAdminCreation = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required(),
    role: Joi.string().valid("user", "admin").optional().default("admin")
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateReport = (req, res, next) => {
  const schema = Joi.object({
    description: Joi.string().min(10).max(1000).required(),
    issueType: Joi.string().valid("Road", "Sanitation", "Electricity", "Water", "Other").required(),
    location: Joi.object().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Validation for role updates
const validateRoleUpdate = (req, res, next) => {
  const schema = Joi.object({
    role: Joi.string().valid("user", "admin", "superadmin").required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Validation for user status updates
const validateStatusUpdate = (req, res, next) => {
  const schema = Joi.object({
    isActive: Joi.boolean().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Validation for issue status updates
const validateIssueStatusUpdate = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid("Pending", "In Progress", "Resolved", "Verified").required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateRegister,
  validateAdminCreation,
  validateLogin,
  validateReport,
  validateRoleUpdate,
  validateStatusUpdate,
  validateIssueStatusUpdate
};
