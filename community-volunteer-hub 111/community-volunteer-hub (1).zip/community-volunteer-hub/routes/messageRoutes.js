const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',              protect, controller.getInbox);
router.get('/api',           protect, controller.getMessagesApi);
router.post('/send',         protect, controller.sendMessage);
router.post('/api/send',     protect, controller.sendMessageApi);
router.post('/api/send-file',protect, controller.sendFileApi);
router.put('/:id/read',      protect, controller.markAsRead);

module.exports = router;