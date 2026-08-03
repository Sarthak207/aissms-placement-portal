const router = require('express').Router();
const reportController = require('../controllers/report.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/placement', authorize('tpo', 'admin'), reportController.placementReport);
router.get('/branch/:branchId', authorize('tpo', 'admin', 'coordinator'), reportController.branchReport);

module.exports = router;
