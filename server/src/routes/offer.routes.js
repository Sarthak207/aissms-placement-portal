const router = require('express').Router();
const offerController = require('../controllers/offer.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { issueOfferSchema } = require('../validations/offer.validation');
const { idParamSchema } = require('../validations/student.validation');

router.use(authenticate);

router.post('/', authorize('company_hr', 'tpo'), validate(issueOfferSchema), offerController.issue);
router.get('/me', authorize('student'), offerController.myOffers);
router.get('/:id/download', validate(idParamSchema), offerController.download);

module.exports = router;
