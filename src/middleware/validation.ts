import { Request, Response, NextFunction } from 'express';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'boolean' | 'number' | 'email';
  minLength?: number;
  maxLength?: number;
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { field: string; message: string }[] = [];

    rules.forEach(rule => {
      const value = req.body[rule.field];

      // Check if required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field: rule.field, message: `${rule.field} is required` });
        return;
      }

      // Skip further validation if value is not provided and not required
      if ((value === undefined || value === null || value === '') && !rule.required) {
        return;
      }

      // Type validation
      if (rule.type) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push({ field: rule.field, message: `${rule.field} must be a string` });
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push({ field: rule.field, message: `${rule.field} must be a boolean` });
            }
            break;
          case 'number':
            if (typeof value !== 'number') {
              errors.push({ field: rule.field, message: `${rule.field} must be a number` });
            }
            break;
          case 'email':
            if (typeof value !== 'string' || !validateEmail(value)) {
              errors.push({ field: rule.field, message: `${rule.field} must be a valid email address` });
            }
            break;
        }
      }

      // String length validation
      if (typeof value === 'string') {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push({ 
            field: rule.field, 
            message: `${rule.field} must be at least ${rule.minLength} characters` 
          });
        }

        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push({ 
            field: rule.field, 
            message: `${rule.field} must be no more than ${rule.maxLength} characters` 
          });
        }
      }
    });

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    next();
  };
};

// Email validation helper
function validateEmail(email: string): boolean {
  // Convert email to lowercase for case-insensitive validation
  const normalizedEmail = email.toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalizedEmail);
} 