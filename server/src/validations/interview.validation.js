const { z } = require('zod');
const { objectId } = require('./student.validation');

const scheduleInterviewSchema = {
  body: z.object({
    applicationId: objectId,
    round: z.string().min(1),
    scheduledAt: z.coerce.date(),
    mode: z.enum(['online', 'offline']).optional(),
    meetingLink: z.string().optional(),
    venue: z.string().optional(),
  }),
};

const updateInterviewSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    scheduledAt: z.coerce.date().optional(),
    feedback: z.string().optional(),
    result: z.enum(['pending', 'pass', 'fail']).optional(),
    meetingLink: z.string().optional(),
    venue: z.string().optional(),
  }),
};

module.exports = { scheduleInterviewSchema, updateInterviewSchema };
