const User    = require('../models/User');
const Request = require('../models/Request');
const Message = require('../models/Message');

// ─────────────────────────────────────────────
// GET /admin  —  dashboard overview
// ─────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const [userCount, requestCount, messageCount] = await Promise.all([
      User.countDocuments(),
      Request.countDocuments(),
      Message.countDocuments()
    ]);

    const recentUsers = await User.find()
      .sort({ joinedAt: -1 }) ;

    const recentRequests = await Request.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 }); 

    const recentMessages = await Message.find()
      .populate('sender',   'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 }) ;

    // Contact messages — optional, only if model exists
    let contactMessages = [];
    try {
      const ContactMessage = require('../models/ContactMessage');
      contactMessages = await ContactMessage.find()
        .sort({ createdAt: -1 }) ;
        
    } catch (e) { /* model not available */ }

    res.render('admin', {
      userCount,
      requestCount,
      messageCount,
      recentUsers,
      recentRequests,
      recentMessages,
      contactMessages,
      user: req.session ? { name: req.session.name } : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// ─────────────────────────────────────────────
// DELETE /admin/users/:id
// ─────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// ─────────────────────────────────────────────
// DELETE /admin/requests/:id
// ─────────────────────────────────────────────
exports.deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// ─────────────────────────────────────────────
// GET /admin/messages  —  alias, redirects to dashboard
// ─────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  res.redirect('/admin');
};

// ─────────────────────────────────────────────
// DELETE /admin/messages/:id
// ─────────────────────────────────────────────
exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};