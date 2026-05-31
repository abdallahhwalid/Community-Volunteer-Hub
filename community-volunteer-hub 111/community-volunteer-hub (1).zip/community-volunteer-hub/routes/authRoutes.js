const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Register routes (EJS)
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

// Login routes (EJS)
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

// Profile routes (EJS - protected)
router.get('/profile', protect, authController.showProfile);
router.post('/profile', protect, authController.updateProfile);

// Static pages
router.get('/terms', (req, res) => res.render('terms'));
router.get('/privacy', (req, res) => res.render('privacy'));
router.get('/safety', (req, res) => res.render('safety'));
router.get('/about', (req, res) => res.render('about'));

// API routes for React
router.post('/api/register', authController.apiRegister);
router.post('/api/login', authController.apiLogin);
router.get('/api/profile', protect, authController.apiGetProfile);

module.exports = router;