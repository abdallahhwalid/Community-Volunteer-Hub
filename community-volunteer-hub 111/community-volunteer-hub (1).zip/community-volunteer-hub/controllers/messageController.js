const Message = require('../models/Message');
const User    = require('../models/User');
const path    = require('path');
const fs      = require('fs');

// GET /messages — EJS inbox view
exports.getInbox = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user   = await User.findById(userId);
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender',   'name')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 });

    res.render('messages', { messages, currentUser: req.session, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// GET /messages/api — JSON for React
exports.getMessagesApi = async (req, res) => {
  try {
    const userId = req.session.userId;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender',   'name')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /messages/send — EJS form submit
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, requestId } = req.body;
    if (!content || content.trim() === '') return res.redirect('/messages');

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

// POST /messages/api/send — JSON (text or location)
exports.sendMessageApi = async (req, res) => {
  try {
    const { receiverId, content, requestId, location } = req.body;

    if (!content && !location) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    const message = await Message.create({
      sender:   req.session.userId,
      receiver: receiverId,
      content:  content ? content.trim() : '',
      request:  requestId || null,
      location: location || null
    });

    await message.populate('sender',   'name');
    await message.populate('receiver', 'name');

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /messages/api/send-file — file upload
exports.sendFileApi = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { receiverId, content, fileType } = req.body;
    const uploadedFile = req.files.file;

    // 50MB limit
    if (uploadedFile.size > 50 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File too large. Max 50MB.' });
    }

    // Save to /public/uploads/messages/
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'messages');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const safeFileName = `${Date.now()}-${uploadedFile.name.replace(/\s+/g, '-')}`;
    const uploadPath   = path.join(uploadsDir, safeFileName);
    await uploadedFile.mv(uploadPath);

    const fileUrl = `/uploads/messages/${safeFileName}`;

    const message = await Message.create({
      sender:   req.session.userId,
      receiver: receiverId,
      content:  content ? content.trim() : '',
      fileUrl,
      fileType: fileType || 'doc'
    });

    await message.populate('sender',   'name');
    await message.populate('receiver', 'name');

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error('sendFileApi error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// PUT /messages/:id/read
exports.markAsRead = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};