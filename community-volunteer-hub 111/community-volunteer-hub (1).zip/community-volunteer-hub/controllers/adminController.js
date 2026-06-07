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
    res.json({ success: true });          // CHANGE from res.redirect('/admin')
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ success: true });          // CHANGE from res.redirect('/admin')
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });          // CHANGE from res.redirect('/admin')
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
// ─────────────────────────────────────────────
// GET /admin/messages  —  alias, redirects to dashboard
// ─────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  res.redirect('/admin');
};

// ─────────────────────────────────────────────
// ADD THIS to adminController.js
// GET /admin/api  —  JSON data for React AdminPage
// ─────────────────────────────────────────────
exports.getDashboardApi = async (req, res) => {
  try {
    const [userCount, requestCount, messageCount] = await Promise.all([
      User.countDocuments(),
      Request.countDocuments(),
      Message.countDocuments()
    ]);

    const recentUsers = await User.find().sort({ joinedAt: -1 });

    const recentRequests = await Request.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });

    const recentMessages = await Message.find()
      .populate('sender',   'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    let contactMessages = [];
    try {
      const ContactMessage = require('../models/ContactMessage');
      contactMessages = await ContactMessage.find().sort({ createdAt: -1 });
    } catch (e) { /* model not available */ }

    res.json({
      success: true,
      userCount,
      requestCount,
      messageCount,
      recentUsers,
      recentRequests,
      recentMessages,
      contactMessages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
// ─────────────────────────────────────────────
// POST /admin/contact/:id/reply
// Admin replies to a contact message → creates a Message to the user
// ─────────────────────────────────────────────
exports.replyToContact = async (req, res) => {
  try {
    const { replyText } = req.body;
    const ContactMessage = require('../models/ContactMessage');
    const Message = require('../models/Message');
    const User    = require('../models/User');

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, error: 'Reply text is required' });
    }

    const cm = await ContactMessage.findById(req.params.id);
    if (!cm) return res.status(404).json({ success: false, error: 'Contact message not found' });

    console.log('📬 Contact message email:', cm.email);
    console.log('📬 Contact message name:', cm.name);

    // Try email first, then name
    let recipient = await User.findOne({ email: cm.email });
    if (!recipient) {
      recipient = await User.findOne({ name: { $regex: cm.name, $options: 'i' } });
    }

    console.log('👤 Recipient found:', recipient ? recipient.name + ' / ' + recipient.email : 'NONE');

    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        error: `No account found for "${cm.name}" (${cm.email})` 
      });
    }

    let supportUser = await User.findOne({ role: 'admin' });
    console.log('🔑 Support/admin user:', supportUser ? supportUser.name + ' / ' + supportUser.email : 'NONE');

    if (!supportUser) {
      return res.status(500).json({ success: false, error: 'No admin user found' });
    }

    // Make sure sender and receiver are different
    if (supportUser._id.toString() === recipient._id.toString()) {
      return res.status(400).json({ success: false, error: 'Sender and receiver are the same user!' });
    }

    const newMessage = await Message.create({
      sender:   supportUser._id,
      receiver: recipient._id,
      content:  `📬 Re: "${cm.subject}"\n\n${replyText.trim()}`,
    });

    console.log('✅ Message created:', newMessage._id);
    console.log('   sender:', newMessage.sender);
    console.log('   receiver:', newMessage.receiver);

    cm.isRead = true;
    await cm.save();

    res.json({ success: true, message: 'Reply sent!' });
  } catch (err) {
    console.error('replyToContact error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};