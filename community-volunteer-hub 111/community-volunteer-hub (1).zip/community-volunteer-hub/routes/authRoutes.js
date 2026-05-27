const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Register routes
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

// Login routes
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

// Profile routes (protected - must be logged in)
router.get('/profile', protect, authController.showProfile);
router.post('/profile', protect, authController.updateProfile);

module.exports = router;
// Static pages
router.get('/terms', (req, res) => res.render('terms'));
router.get('/privacy', (req, res) => res.render('privacy'));
router.get('/safety', (req, res) => res.render('safety'));
router.get('/about', (req, res) => res.render('about'));