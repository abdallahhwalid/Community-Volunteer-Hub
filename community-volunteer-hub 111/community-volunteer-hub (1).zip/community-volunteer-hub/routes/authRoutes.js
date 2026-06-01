const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const Request = require('../models/Request');
const User = require('../models/User');
const ContactMessage = require('../models/ContactMessage');

// HOME ROUTE
router.get('/', async (req, res) => {
  try {
    const recentRequests = await Request.find({ status: 'Open' })
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    const topVolunteers = await User.find({ rating: { $gt: 0 } })
      .sort({ rating: -1 })
      .limit(4);

    res.render('index', {
      recentRequests,
      topVolunteers,
      user: req.session.userId ? { name: req.session.name } : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Register routes
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

// Login routes
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

// Profile routes
router.get('/profile', protect, authController.showProfile);
router.post('/profile', protect, authController.updateProfile);

// Static pages
router.get('/terms', (req, res) => res.render('terms'));
router.get('/privacy', (req, res) => res.render('privacy'));
router.get('/safety', (req, res) => res.render('safety'));
router.get('/about', (req, res) => res.render('about'));

// API routes for React
// API routes for React
router.post('/api/register', authController.apiRegister);
router.post('/api/login', authController.apiLogin);
router.get('/api/profile', protect, authController.apiGetProfile);

// Contact GET
router.get('/contact', (req, res) => {
  res.render('contact', {
    user: req.session.userId ? { name: req.session.name } : null,
    success: null,
    error: null
  });
});

// Contact POST
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.render('contact', {
        user: req.session.userId ? { name: req.session.name } : null,
        error: 'All fields are required',
        success: null
      });
    }

    await ContactMessage.create({ name, email, subject, message });

    res.render('contact', {
      user: req.session.userId ? { name: req.session.name } : null,
      success: 'Message sent successfully!',
      error: null
    });

  } catch (err) {
    console.error(err);
    res.render('contact', {
      user: req.session.userId ? { name: req.session.name } : null,
      error: 'Something went wrong',
      success: null
    });
  }
});

module.exports = router;