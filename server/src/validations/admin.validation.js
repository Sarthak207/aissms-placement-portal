const { z } = require('zod');
const { objectId } = require('./student.validation');

const createUserSchema = {
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['coordinator', 'tpo', 'admin']),
    departmentId: objectId.optional(), // required if role === coordinator
  }),
};

const updateUserSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.enum(['student', 'coordinator', 'tpo', 'company_hr', 'admin']).optional(),
    isActive: z.boolean().optional(),
  }),
};

const createDepartmentSchema = {
  body: z.object({ name: z.string().min(2), code: z.string().min(2) }),
};

const createBranchSchema = {
  body: z.object({ name: z.string().min(2), code: z.string().min(2), departmentId: objectId }),
};

const listUsersSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    role: z.enum(['student', 'coordinator', 'tpo', 'company_hr', 'admin']).optional(),
    search: z.string().optional(),
  }),
};

module.exports = { createUserSchema, updateUserSchema, createDepartmentSchema, createBranchSchema, listUsersSchema };
