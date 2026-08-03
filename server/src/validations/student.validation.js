const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const updateStudentSchema = {
  body: z.object({
    academics: z
      .object({
        ssc: z.object({ board: z.string().optional(), percentage: z.number().min(0).max(100).optional(), yearOfPassing: z.number().optional() }).optional(),
        hsc: z.object({ board: z.string().optional(), percentage: z.number().min(0).max(100).optional(), yearOfPassing: z.number().optional() }).optional(),
        diploma: z.object({ board: z.string().optional(), percentage: z.number().min(0).max(100).optional(), yearOfPassing: z.number().optional() }).optional(),
        semesterCgpa: z.array(z.object({ semester: z.number().min(1).max(8), cgpa: z.number().min(0).max(10) })).optional(),
      })
      .optional(),
    cgpa: z.number().min(0).max(10).optional(),
    liveBacklogs: z.number().min(0).optional(),
    historyBacklogs: z.number().min(0).optional(),
    skills: z
      .object({
        programmingLanguages: z.array(z.string()).optional(),
        frameworks: z.array(z.string()).optional(),
        tools: z.array(z.string()).optional(),
      })
      .optional(),
    projects: z
      .array(z.object({ title: z.string(), description: z.string().optional(), techStack: z.array(z.string()).optional(), link: z.string().optional() }))
      .optional(),
    internships: z
      .array(z.object({ company: z.string(), role: z.string(), duration: z.string().optional(), description: z.string().optional() }))
      .optional(),
    achievements: z.array(z.string()).optional(),
    certifications: z.array(z.object({ title: z.string(), issuer: z.string().optional(), url: z.string().optional(), date: z.coerce.date().optional() })).optional(),
    hackathons: z.array(z.object({ name: z.string(), position: z.string().optional(), date: z.coerce.date().optional() })).optional(),
    codingProfiles: z
      .object({
        github: z.string().optional(),
        linkedin: z.string().optional(),
        leetcode: z.string().optional(),
        codeforces: z.string().optional(),
        geeksforgeeks: z.string().optional(),
        hackerrank: z.string().optional(),
      })
      .optional(),
  }),
};

const listStudentsSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.string().optional(),
    search: z.string().optional(),
    branchId: objectId.optional(),
    minCgpa: z.coerce.number().optional(),
    maxCgpa: z.coerce.number().optional(),
    passingYear: z.coerce.number().optional(),
    verificationStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
    placementStatus: z.enum(['unplaced', 'placed', 'multiple_offers']).optional(),
  }),
};

const verifyStudentSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(['verified', 'rejected']),
    remarks: z.string().optional(),
  }),
};

const idParamSchema = { params: z.object({ id: objectId }) };

module.exports = { updateStudentSchema, listStudentsSchema, verifyStudentSchema, idParamSchema, objectId };
