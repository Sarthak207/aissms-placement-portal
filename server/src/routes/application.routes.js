const router = require('express').Router();
const applicationController = require('../controllers/application.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createApplicationSchema,
  updateApplicationStatusSchema,
  idParamSchema,
} = require('../validations/application.validation');

router.use(authenticate);

router.post('/', authorize('student'), validate(createApplicationSchema), applicationController.create);
router.delete('/:id', authorize('student'), validate(idParamSchema), applicationController.withdraw);
router.get('/me', authorize('student'), applicationController.myApplications);
router.get('/:id', validate(idParamSchema), applicationController.getById);
router.patch(
  '/:id/status',
  authorize('company_hr', 'tpo'),
  validate(updateApplicationStatusSchema),
  applicationController.updateStatus
);

module.exports = router;
