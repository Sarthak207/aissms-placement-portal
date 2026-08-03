const router = require('express').Router();
const analyticsController = require('../controllers/analytics.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('tpo', 'admin', 'coordinator'));

router.get('/overview', analyticsController.overview);
router.get('/trends', analyticsController.trends);
router.get('/top-recruiters', analyticsController.topRecruiters);
router.get('/funnel', analyticsController.funnel);

module.exports = router;
