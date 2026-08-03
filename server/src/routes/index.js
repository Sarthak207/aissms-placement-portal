const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/students', require('./student.routes'));
router.use('/companies', require('./company.routes'));
router.use('/drives', require('./drive.routes'));
router.use('/applications', require('./application.routes'));
router.use('/interviews', require('./interview.routes'));
router.use('/offers', require('./offer.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/announcements', require('./announcement.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/reports', require('./report.routes'));
router.use('/admin', require('./admin.routes'));

router.get('/health', (req, res) => res.status(200).json({ success: true, message: 'API is healthy' }));

module.exports = router;
