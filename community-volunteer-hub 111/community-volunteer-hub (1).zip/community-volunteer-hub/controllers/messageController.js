const Message = require('../models/Message');
const User    = require('../models/User');
const path    = require('path');

// ─────────────────────────────────────────────
// GET /messages  —  EJS inbox view
// ─────────────────────────────────────────────
exports.getInbox = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user   = await User.findById(userId);

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender',   'name')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 }); // newest first → most recent convo at top of sidebar

    res.render('messages', {
      messages,
      currentUser: req.session,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// ─────────────────────────────────────────────
// GET /messages/api  —  React: fetch all messages
// ─────────────────────────────────────────────
exports.getMessagesApi = async (req, res) => {
  try {
    const userId = req.session.userId;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender',   'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// POST /messages/send  —  EJS form submit
// ─────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, requestId } = req.body;

    if (!content || !content.trim()) {
      return res.redirect('/messages');
    }

    await Message.create({
      sender:   req.session.userId,
      receiver: receiverId,
      content:  content.trim(),
      request:  requestId || null
    });

    res.redirect('/messages');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// ─────────────────────────────────────────────
// POST /messages/api/send  —  React: send text or location
// ─────────────────────────────────────────────
exports.sendMessageApi = async (req, res) => {
  try {
    const { receiverId, content, location, requestId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, error: 'Receiver is required' });
    }
    if (!content?.trim() && !location) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const message = await Message.create({
      sender:   req.session.userId,
      receiver: receiverId,
      content:  content?.trim() || '',
      location: location || undefined,
      request:  requestId || null
    });

    const populated = await message.populate([
      { path: 'sender',   select: 'name email' },
      { path: 'receiver', select: 'name email' }
    ]);

    res.json({ success: true, message: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// POST /messages/api/send-file  —  React: send file attachment
// ─────────────────────────────────────────────
exports.sendFileApi = async (req, res) => {
  try {
    const { receiverId, content, fileType } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, error: 'Receiver is required' });
    }
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file     = req.files.file;
    const ext      = path.extname(file.name);
    const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    const savePath = path.join(__dirname, '../public/uploads', filename);

    await file.mv(savePath);

    const fileUrl = '/uploads/' + filename;

    const message = await Message.create({
      sender:   req.session.userId,
      receiver: receiverId,
      content:  content?.trim() || '',
      fileUrl,
      fileType: fileType || null
    });

    const populated = await message.populate([
      { path: 'sender',   select: 'name email' },
      { path: 'receiver', select: 'name email' }
    ]);

    res.json({ success: true, message: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// PUT /messages/:id/read  —  mark as read
// ─────────────────────────────────────────────
exports.markAsRead = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};