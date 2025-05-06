import Joi from 'joi';

// Validation schema for creating/updating a client
export const clientSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),

  aboutMe: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'About Me is required',
      'string.min': 'About Me must be at least 10 characters long',
      'string.max': 'About Me cannot exceed 1000 characters',
      'any.required': 'About Me is required'
    }),

  email: Joi.string()
    .email({ 
      minDomainSegments: 2,
      tlds: { 
        allow: ['com', 'net', 'org', 'edu', 'gov', 'co', 'io', 'dev'] 
      }
    })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be in a valid format (e.g., user@example.com)',
      'any.required': 'Email is required'
    })
});

// Validation middleware
export const validateClient = (req: any, res: any, next: any) => {
  const { error } = clientSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ error: errorMessage });
  }
  
  next();
}; 