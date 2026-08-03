const { z } = require('zod');

const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

const registerSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: passwordRule,
    role: z.enum(['student', 'company_hr']), // other roles are provisioned by Admin only
    // student-only optional fields collected at signup:
    rollNumber: z.string().optional(),
    branchId: z.string().optional(),
    passingYear: z.number().int().optional(),
    // company_hr-only optional fields:
    companyName: z.string().optional(),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    rememberMe: z.boolean().optional().default(false),
    captchaToken: z.string().optional(),
  }),
};

const forgotPasswordSchema = {
  body: z.object({ email: z.string().email() }),
};

const resetPasswordSchema = {
  body: z.object({
    email: z.string().email(),
    token: z.string().min(10),
    newPassword: passwordRule,
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
