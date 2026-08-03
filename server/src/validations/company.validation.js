const { z } = require('zod');
const { objectId } = require('./student.validation');

const createCompanySchema = {
  body: z.object({
    name: z.string().min(2),
    website: z.string().optional(),
    industry: z.string().optional(),
    description: z.string().optional(),
  }),
};

const updateCompanySchema = {
  params: z.object({ id: objectId }),
  body: createCompanySchema.body.partial(),
};

const approveCompanySchema = {
  params: z.object({ id: objectId }),
  body: z.object({ status: z.enum(['approved', 'rejected']) }),
};

const listCompaniesSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.string().optional(),
    search: z.string().optional(),
    verificationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  }),
};

const idParamSchema = { params: z.object({ id: objectId }) };

module.exports = { createCompanySchema, updateCompanySchema, approveCompanySchema, listCompaniesSchema, idParamSchema };
