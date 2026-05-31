const User = require('../models/User');
const Request = require('../models/Request');
const Message = require('../models/Message');

// GET /admin — dashboard overview
exports.getDashboard = async (req, res) => {
  try {
    const [userCount, requestCount, messageCount] = await Promise.all([
      User.countDocuments(),
      Request.countDocuments(),
      Message.countDocuments()
    ]);

    const recentUsers = await User.find().sort({ joinedAt: -1 }).limit(5);
    const recentRequests = await Request.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentMessages = await Message.find()
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.render('admin', {
      userCount,
      requestCount,
      messageCount,
      recentUsers,
      recentRequests,
      recentMessages,
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// DELETE /admin/users/:id — remove a user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// DELETE /admin/requests/:id — remove a request
exports.deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// GET /admin/messages — view all messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    res.render('admin', {
      userCount: await User.countDocuments(),
      requestCount: await Request.countDocuments(),
      messageCount: await Message.countDocuments(),
      recentUsers: await User.find().sort({ createdAt: -1 }).limit(5),
      recentRequests: await Request.find().populate('postedBy', 'name').sort({ createdAt: -1 }).limit(5),
      messages,
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};