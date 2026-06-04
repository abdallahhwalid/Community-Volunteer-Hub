const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    default: null
  },
  content: {
    type: String,
    trim: true,
    default: ''
  },
  // File attachments
  fileUrl:  { type: String, default: null },
  fileType: { type: String, enum: ['image', 'doc', 'video', null], default: null },
  // Location sharing
  location: {
    lat:   { type: Number },
    lng:   { type: Number },
    label: { type: String }
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);