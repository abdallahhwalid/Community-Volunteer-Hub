const Message = require('../models/Message');

// GET /messages — show all conversations for the logged-in user
exports.getInbox = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 });

    res.render('messages', { messages, currentUser: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// POST /messages/send — send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, requestId } = req.body;

    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
      request: requestId || null
    });

    await message.save();
    res.redirect('/messages');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// PUT /messages/:id/read — mark a message as read
exports.markAsRead = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};