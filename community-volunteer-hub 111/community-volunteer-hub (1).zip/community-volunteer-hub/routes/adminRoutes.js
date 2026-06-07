const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/',          protect, isAdmin, adminController.getDashboard);
router.get('/messages',  protect, isAdmin, adminController.getMessages);
router.delete('/users/:id',    protect, isAdmin, adminController.deleteUser);
router.delete('/requests/:id', protect, isAdmin, adminController.deleteRequest);
router.delete('/messages/:id', protect, isAdmin, adminController.deleteMessage);

router.post('/contact/:id/reply', protect, isAdmin, adminController.replyToContact);

module.exports = router;