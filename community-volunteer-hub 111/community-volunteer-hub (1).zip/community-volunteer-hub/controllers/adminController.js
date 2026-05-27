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

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentRequests = await Request.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('admin', {
      userCount,
      requestCount,
      messageCount,
      recentUsers,
      recentRequests
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