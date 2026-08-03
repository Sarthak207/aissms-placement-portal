const router = require('express').Router();
const announcementController = require('../controllers/announcement.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createAnnouncementSchema } = require('../validations/announcement.validation');

router.use(authenticate);

router.post('/', authorize('coordinator', 'tpo', 'admin'), validate(createAnnouncementSchema), announcementController.create);
router.get('/', announcementController.list);

module.exports = router;
