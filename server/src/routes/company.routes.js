const router = require('express').Router();
const companyController = require('../controllers/company.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createCompanySchema,
  updateCompanySchema,
  approveCompanySchema,
  listCompaniesSchema,
  idParamSchema,
} = require('../validations/company.validation');

router.use(authenticate);

router.post('/', authorize('company_hr'), validate(createCompanySchema), companyController.create);
router.get('/me', authorize('company_hr'), companyController.getMine);
router.get('/', validate(listCompaniesSchema), companyController.list);
router.get('/:id', validate(idParamSchema), companyController.getById);
router.put('/:id', authorize('company_hr', 'admin'), validate(updateCompanySchema), companyController.update);
router.patch('/:id/approve', authorize('tpo', 'admin'), validate(approveCompanySchema), companyController.approve);
router.post('/:id/bookmark', authorize('student'), validate(idParamSchema), companyController.bookmark);

module.exports = router;
