const router = require('express').Router();
const interviewController = require('../controllers/interview.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { scheduleInterviewSchema, updateInterviewSchema } = require('../validations/interview.validation');

router.use(authenticate);

router.post('/', authorize('company_hr', 'tpo'), validate(scheduleInterviewSchema), interviewController.schedule);
router.put('/:id', authorize('company_hr', 'tpo'), validate(updateInterviewSchema), interviewController.update);
router.get('/me', authorize('student'), interviewController.myInterviews);

module.exports = router;
