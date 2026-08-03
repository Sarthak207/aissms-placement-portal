const router = require('express').Router();
const driveController = require('../controllers/drive.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createDriveSchema, updateDriveSchema, listDrivesSchema, idParamSchema } = require('../validations/drive.validation');

router.use(authenticate);

router.post('/', authorize('company_hr', 'tpo'), validate(createDriveSchema), driveController.create);
router.get('/', validate(listDrivesSchema), driveController.list);
router.get('/:id', validate(idParamSchema), driveController.getById);
router.put('/:id', authorize('company_hr', 'tpo', 'admin'), validate(updateDriveSchema), driveController.update);
router.delete('/:id', authorize('company_hr', 'tpo', 'admin'), validate(idParamSchema), driveController.remove);
router.patch('/:id/open', authorize('company_hr', 'tpo'), validate(idParamSchema), driveController.open);
router.patch('/:id/close', authorize('company_hr', 'tpo'), validate(idParamSchema), driveController.close);
router.get('/:id/eligible-students', authorize('company_hr', 'tpo'), validate(idParamSchema), driveController.eligibleStudents);
router.get('/:id/applicants', authorize('company_hr', 'tpo'), validate(idParamSchema), driveController.applicants);

module.exports = router;
