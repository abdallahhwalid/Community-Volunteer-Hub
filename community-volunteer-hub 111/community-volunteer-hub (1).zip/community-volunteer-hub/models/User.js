const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'] 
  },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [String],
  photo: { type: String, default: '/images/default-avatar.png' },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  rating: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);