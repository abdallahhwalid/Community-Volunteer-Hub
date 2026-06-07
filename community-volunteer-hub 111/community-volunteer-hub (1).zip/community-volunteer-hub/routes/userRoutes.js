const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// ADD THIS
router.put('/:id/rate', protect, async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Calculate new average
    const newCount  = user.ratingCount + 1;
    const newRating = ((user.rating * user.ratingCount) + Number(rating)) / newCount;

    user.rating      = Math.round(newRating * 10) / 10;
    user.ratingCount = newCount;
    await user.save();

    res.json({ success: true, rating: user.rating });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

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