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
      user: req.session.userId ? { name: req.session.name, role: req.session.role } : null
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

// Forgot / Reset password
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.showResetPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Logout
router.get('/logout', authController.logout);

// Profile routes
router.get('/profile', protect, authController.showProfile);
router.post('/profile', protect, authController.updateProfile);
router.get('/profile/:id', protect, authController.showVolunteerProfile);

// Static pages
router.get('/terms', (req, res) => res.render('terms', { user: req.session.userId ? { name: req.session.name, role: req.session.role } : null }));
router.get('/privacy', (req, res) => res.render('privacy', { user: req.session.userId ? { name: req.session.name, role: req.session.role } : null }));
router.get('/safety', (req, res) => res.render('safety', { user: req.session.userId ? { name: req.session.name, role: req.session.role } : null }));
router.get('/about', (req, res) => res.render('about', { user: req.session.userId ? { name: req.session.name, role: req.session.role } : null }));

// Volunteers endpoint for homepage
router.get('/api/volunteers', async (req, res) => {
  try {
    const volunteers = await User.find({ skills: { $exists: true, $ne: [] } })
      .sort({ rating: -1 })
      .limit(4)
      .select('name skills rating');
    res.json({ success: true, volunteers });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// API routes for React
router.post('/api/register', authController.apiRegister);
router.post('/api/login', authController.apiLogin);
router.get('/api/profile', protect, authController.apiGetProfile);
router.put('/api/profile', protect, authController.apiUpdateProfile);
router.post('/api/ai/description', protect, async (req, res) => {
  try {
    const { title, category, requestType, location } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Write a clear, friendly help request description for:
- Title: "${title}"
- Category: "${category}"
- Type: "${requestType === 'online' ? 'Online (remote)' : 'In-person'}"
${location && requestType !== 'online' ? `- Location: "${location}"` : ''}

3-5 sentences. Explain what help is needed, any requirements, and what the volunteer can expect. Write ONLY the description text.`
        }]
      })
    });

    const data = await response.json();
    const description = data.content?.[0]?.text?.trim();

    if (!description) return res.status(500).json({ success: false, error: 'No description generated' });

    res.json({ success: true, description });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
// Contact GET
router.get('/contact', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = req.session.userId 
      ? await User.findById(req.session.userId).select('name role email')
      : null;
    res.render('contact', { user, success: null, error: null });
  } catch(err) {
    res.render('contact', { user: null, success: null, error: null });
  }
});

// Contact POST
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.render('contact', {
        user: req.session.userId ? { name: req.session.name, role: req.session.role } : null,
        error: 'All fields are required',
        success: null
      });
    }

    await ContactMessage.create({ name, email, subject, message });

    res.render('contact', {
      user: req.session.userId ? { name: req.session.name, role: req.session.role } : null,
      success: 'Message sent successfully!',
      error: null
    });

  } catch (err) {
    console.error(err);
    res.render('contact', {
      user: req.session.userId ? { name: req.session.name, role: req.session.role } : null,
      error: 'Something went wrong',
      success: null
    });
  }
});

module.exports = router;