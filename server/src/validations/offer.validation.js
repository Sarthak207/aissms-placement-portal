const { z } = require('zod');
const { objectId } = require('./student.validation');

const issueOfferSchema = {
  body: z.object({
    applicationId: objectId,
    ctc: z.number().min(0),
    joiningDetails: z.string().optional(),
  }),
};

module.exports = { issueOfferSchema };
