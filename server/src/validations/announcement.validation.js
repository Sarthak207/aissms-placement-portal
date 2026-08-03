const { z } = require('zod');

const createAnnouncementSchema = {
  body: z.object({
    title: z.string().min(2),
    body: z.string().min(2),
    departmentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  }),
};

module.exports = { createAnnouncementSchema };
