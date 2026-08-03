const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createUserSchema,
  updateUserSchema,
  createDepartmentSchema,
  createBranchSchema,
  listUsersSchema,
} = require('../validations/admin.validation');
const { idParamSchema } = require('../validations/student.validation');

router.use(authenticate);

router.post('/departments', authorize('admin'), validate(createDepartmentSchema), adminController.createDepartment);
router.get('/departments', authorize('admin', 'tpo', 'coordinator'), adminController.listDepartments);

router.post('/branches', authorize('admin'), validate(createBranchSchema), adminController.createBranch);
router.get('/branches', authorize('admin', 'tpo', 'coordinator'), adminController.listBranches);

router.use(authorize('admin'));

router.post('/users', validate(createUserSchema), adminController.createUser);
router.get('/users', validate(listUsersSchema), adminController.listUsers);
router.put('/users/:id', validate(updateUserSchema), adminController.updateUser);
router.delete('/users/:id', validate(idParamSchema), adminController.deleteUser);

router.get('/audit-logs', adminController.auditLogs);

module.exports = router;
