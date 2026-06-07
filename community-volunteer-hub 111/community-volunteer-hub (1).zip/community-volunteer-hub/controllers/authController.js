const User     = require('../models/User');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const nodemailer = require('nodemailer');
// REGISTER
exports.showRegister = (req, res) => {
  res.render('register', { error: null });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim() === '') {
      return res.render('register', { error: 'Name is required' });
    }
    if (!email || !email.includes('@')) {
      return res.render('register', { error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.render('register', { error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    req.session.userId = user._id;
    req.session.role   = user.role;
    req.session.name   = user.name;
    res.redirect('/');

  } catch (err) {
    res.render('register', { error: 'Something went wrong' });
  }
};

// LOGIN
exports.showLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.includes('@')) {
      return res.render('login', { error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.render('login', { error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.userId = user._id;
    req.session.role   = user.role;
    req.session.name   = user.name;
    res.redirect('/');

  } catch (err) {
    res.render('login', { error: 'Something went wrong' });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

// PROFILE
exports.showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/login');
    res.render('profile', { user });
  } catch (err) {
    res.redirect('/login');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, location, bio, skills } = req.body;

    if (!name || name.trim() === '') {
      const user = await User.findById(req.session.userId);
      return res.render('profile', { user, error: 'Name is required' });
    }

    const skillsArray = skills
      ? skills.split(',').map(s => s.trim()).filter(s => s)
      : [];
    const updateData = { name, location, bio, skills: skillsArray };

    if (req.files && req.files.photo) {
      const photo = req.files.photo;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(photo.mimetype)) {
        const user = await User.findById(req.session.userId);
        return res.render('profile', { user, error: 'Only JPG and PNG images are allowed' });
      }
      if (photo.size > 5 * 1024 * 1024) {
        const user = await User.findById(req.session.userId);
        return res.render('profile', { user, error: 'Image must be under 5MB' });
      }
      const fileName   = req.session.userId + '_' + photo.name;
      const uploadPath = __dirname + '/../public/images/' + fileName;
      await photo.mv(uploadPath);
      updateData.photo = '/images/' + fileName;
    }

    await User.findByIdAndUpdate(req.session.userId, updateData);
    res.redirect('/profile');

  } catch (err) {
    console.log(err);
    res.redirect('/profile');
  }
};

// ─── API FUNCTIONS FOR REACT ───────────────────────────────────────────────

// API Register
exports.apiRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    req.session.userId = user._id;
    req.session.role   = user.role;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};

// API Login
exports.apiLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    req.session.userId = user._id;
    req.session.role   = user.role;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};

// API Get Profile
exports.apiGetProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};

// FORGOT PASSWORD - show form
exports.showForgotPassword = (req, res) => {
  const user = req.session.userId ? { name: req.session.name, role: req.session.role } : null;
  res.render('forgot-password', { error: null, success: null, user });
};

// FORGOT PASSWORD - handle form
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.render('forgot-password', { error: 'Please enter a valid email address', success: null });
    }

    const sessionUser = req.session.userId ? { name: req.session.name, role: req.session.role } : null;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('forgot-password', { error: null, success: 'If that email exists, a reset link has been sent.', user: sessionUser });
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken       = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Community Help Hub — Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="background:#1E3A8A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">Reset My Password</a>
        <p>If you did not request this, ignore this email.</p>
      `
    });

    res.render('forgot-password', { error: null, success: 'A password reset link has been sent to your email.', user: sessionUser });

  } catch (err) {
    console.error(err);
    res.render('forgot-password', { error: 'Something went wrong. Please try again.', success: null, user: null });
  }
};

// RESET PASSWORD - show form
exports.showResetPassword = async (req, res) => {
  const { token } = req.params;
  const sessionUser = req.session.userId ? { name: req.session.name, role: req.session.role } : null;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    return res.render('reset-password', { error: 'This reset link is invalid or has expired.', token: null, user: sessionUser });
  }

  res.render('reset-password', { error: null, token, user: sessionUser });
};

// RESET PASSWORD - handle form
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    const sessionUser = req.session.userId ? { name: req.session.name, role: req.session.role } : null;

    if (!password || password.length < 6) {
      return res.render('reset-password', { error: 'Password must be at least 6 characters', token, user: sessionUser });
    }
    if (password !== confirmPassword) {
      return res.render('reset-password', { error: 'Passwords do not match', token, user: sessionUser });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('reset-password', { error: 'This reset link is invalid or has expired.', token: null, user: sessionUser });
    }

    user.password         = await bcrypt.hash(password, 10);
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.redirect('/login');

  } catch (err) {
    console.error(err);
    res.render('reset-password', { error: 'Something went wrong. Please try again.', token: req.params.token, user: null });
  }
};

// API Update Profile
exports.apiUpdateProfile = async (req, res) => {
  try {
    const { name, location, bio, skills } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const skillsArray = skills
      ? skills.split(',').map(s => s.trim()).filter(s => s)
      : [];

    const updateData = { name, location, bio, skills: skillsArray };

    if (req.files && req.files.photo) {
      const photo = req.files.photo;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(photo.mimetype)) {
        return res.status(400).json({ success: false, error: 'Only JPG and PNG images are allowed' });
      }
      if (photo.size > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: 'Image must be under 5MB' });
      }
      const fileName   = req.session.userId + '_' + photo.name;
      const uploadPath = __dirname + '/../public/images/' + fileName;
      await photo.mv(uploadPath);
      updateData.photo = '/images/' + fileName;
    }

    const updated = await User.findByIdAndUpdate(req.session.userId, updateData, { new: true }).select('-password');
    req.session.name = updated.name;
    res.status(200).json({ success: true, user: updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};