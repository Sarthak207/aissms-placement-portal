const router = require('express').Router();
const studentController = require('../controllers/student.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { uploadResume, uploadPhoto } = require('../middleware/upload');
const { updateStudentSchema, listStudentsSchema, verifyStudentSchema, idParamSchema } = require('../validations/student.validation');

router.use(authenticate);

router.get('/me', authorize('student'), studentController.getMe);
router.put('/me', authorize('student'), validate(updateStudentSchema), studentController.updateMe);
router.post('/me/resume', authorize('student'), uploadResume.single('resume'), studentController.uploadResume);
router.post('/me/photo', authorize('student'), uploadPhoto.single('photo'), studentController.uploadPhoto);

router.get('/', authorize('coordinator', 'tpo', 'admin'), validate(listStudentsSchema), studentController.list);
router.get('/:id', authorize('coordinator', 'tpo', 'admin'), validate(idParamSchema), studentController.getById);
router.patch('/:id/verify', authorize('coordinator', 'tpo'), validate(verifyStudentSchema), studentController.verify);

module.exports = router;
