import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

export const bioSchema = z
  .string()
  .max(500, 'Bio must be less than 500 characters')
  .optional();

export const messageSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(2000, 'Message must be less than 2000 characters');

// Registration form validation
export const registrationSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// Profile edit validation
export const profileEditSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  bio: bioSchema,
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  languages: z.array(z.string()).min(1, 'Please select at least one language'),
});

// Message validation
export const chatMessageSchema = z.object({
  content: messageSchema,
  type: z.enum(['text', 'image', 'voice', 'file']).default('text'),
});

// Thread creation validation
export const threadCreationSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content must be less than 5000 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional(),
});

// Room creation validation
export const roomCreationSchema = z.object({
  title: z
    .string()
    .min(3, 'Room name must be at least 3 characters')
    .max(50, 'Room name must be less than 50 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
  category: z.string().min(1, 'Please select a category'),
  isPrivate: z.boolean().default(false),
  tags: z.array(z.string()).max(3, 'Maximum 3 tags allowed').optional(),
});

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeMessage = (message: string): string => {
  return message
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .slice(0, 2000); // Ensure max length
};

// Validation helper functions
export const validateField = <T>(schema: z.ZodSchema<T>, value: unknown): {
  isValid: boolean;
  error?: string;
  data?: T;
} => {
  try {
    const data = schema.parse(value);
    return { isValid: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Validation failed' };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
} => {
  try {
    const validData = schema.parse(data);
    return { isValid: true, errors: {}, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

// Real-time validation hook
export const useFieldValidation = <T>(schema: z.ZodSchema<T>) => {
  const validate = (value: unknown) => validateField(schema, value);
  return { validate };
};

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
  username: /^[a-zA-Z0-9_-]+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
} as const;

// Content moderation helpers
export const containsProfanity = (text: string): boolean => {
  // Basic profanity filter - in real app, use a proper service
  const profanityList = ['spam', 'fake', 'scam']; // Minimal list for demo
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
};

export const isSpamLike = (text: string): boolean => {
  // Basic spam detection
  const spamIndicators = [
    text.length > 1000 && text.split(' ').length < 50, // Too many characters, too few words
    /(.)\1{10,}/.test(text), // Repeated characters
    /(https?:\/\/[^\s]+){3,}/.test(text), // Multiple URLs
    /[A-Z]{20,}/.test(text), // Too many caps
  ];
  
  return spamIndicators.some(indicator => indicator);
};

export const moderateContent = (content: string): {
  isAllowed: boolean;
  reason?: string;
  sanitized: string;
} => {
  const sanitized = sanitizeMessage(content);
  
  if (containsProfanity(sanitized)) {
    return { isAllowed: false, reason: 'Content contains inappropriate language', sanitized };
  }
  
  if (isSpamLike(sanitized)) {
    return { isAllowed: false, reason: 'Content appears to be spam', sanitized };
  }
  
  return { isAllowed: true, sanitized };
};