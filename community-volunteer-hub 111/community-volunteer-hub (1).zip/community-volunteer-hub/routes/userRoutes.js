const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET /users/search?q=name_or_email
// Returns users matching name or email (excludes current user)
router.get('/search', protect, async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      _id: { $ne: req.session.userId },       // exclude self
      $or: [
        { name:  { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name email')
    .limit(8);

    res.json({ success: true, users });
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;