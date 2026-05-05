const Joi = require('joi');

// Auth validations
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('ADMIN', 'MEMBER').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Project validations
const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(2000).optional().allow('')
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(2000).optional().allow('')
}).min(1);

// Team member validations
const addMemberSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('ADMIN', 'MEMBER').optional()
});

// Task validations
const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(300).required(),
  description: Joi.string().max(5000).optional().allow(''),
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'DONE').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
  dueDate: Joi.date().iso().optional().allow(null),
  assigneeId: Joi.number().integer().optional().allow(null),
  projectId: Joi.number().integer().required()
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(300).optional(),
  description: Joi.string().max(5000).optional().allow(''),
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'DONE').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
  dueDate: Joi.date().iso().optional().allow(null),
  assigneeId: Joi.number().integer().optional().allow(null)
}).min(1);

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map(d => d.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }
  next();
};

module.exports = {
  signupSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  createTaskSchema,
  updateTaskSchema,
  validate
};
