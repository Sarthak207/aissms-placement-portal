const { z } = require('zod');
const { objectId } = require('./student.validation');

const eligibilitySchema = z.object({
  minCgpa: z.number().min(0).max(10),
  maxLiveBacklogs: z.number().min(0).default(0),
  maxHistoryBacklogs: z.number().min(0).default(0),
  allowedBranches: z.array(objectId).default([]),
  allowedPassingYears: z.array(z.number()).default([]),
});

const createDriveSchema = {
  body: z.object({
    companyId: objectId,
    title: z.string().min(2),
    role: z.string().min(2),
    type: z.enum(['internship', 'full_time', 'internship_ppo']),
    description: z.string().optional(),
    ctc: z.number().min(0).optional(),
    stipend: z.number().min(0).optional(),
    location: z.string().optional(),
    mode: z.enum(['on_campus', 'off_campus', 'virtual']).optional(),
    eligibility: eligibilitySchema,
    selectionProcess: z.array(z.string()).optional(),
    bondDetails: z.string().optional(),
    requiredSkills: z.array(z.string()).optional(),
    applicationDeadline: z.coerce.date(),
  }),
};

const updateDriveSchema = {
  params: z.object({ id: objectId }),
  body: createDriveSchema.body.partial(),
};

const listDrivesSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.string().optional(),
    search: z.string().optional(),
    role: z.string().optional(),
    minPackage: z.coerce.number().optional(),
    location: z.string().optional(),
    status: z.enum(['draft', 'open', 'closed', 'cancelled']).optional(),
    branch: objectId.optional(),
    skills: z.string().optional(), // comma-separated
  }),
};

const idParamSchema = { params: z.object({ id: objectId }) };

module.exports = { createDriveSchema, updateDriveSchema, listDrivesSchema, idParamSchema };
