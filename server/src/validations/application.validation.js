const { z } = require('zod');
const { objectId } = require('./student.validation');

const createApplicationSchema = {
  body: z.object({ driveId: objectId }),
};

const updateApplicationStatusSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(['shortlisted', 'interview_scheduled', 'selected', 'rejected']),
    note: z.string().optional(),
  }),
};

const idParamSchema = { params: z.object({ id: objectId }) };

module.exports = { createApplicationSchema, updateApplicationStatusSchema, idParamSchema };
