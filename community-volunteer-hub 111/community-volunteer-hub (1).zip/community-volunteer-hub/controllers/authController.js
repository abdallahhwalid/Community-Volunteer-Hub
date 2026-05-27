const User = require('../models/User');

// REGISTER
exports.showRegister = (req, res) => {
  res.render('register', { error: null });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Backend validation
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

    const user = new User({ name, email, password });
    await user.save();

    req.session.userId = user._id;
    req.session.role = user.role;
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

    // Backend validation
    if (!email || !email.includes('@')) {
      return res.render('login', { error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.render('login', { error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.userId = user._id;
    req.session.role = user.role;
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
    if (!user) {
      return res.redirect('/login');
    }
    res.render('profile', { user });
  } catch (err) {
    res.redirect('/login');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, location, bio, skills } = req.body;

    // Backend validation
    if (!name || name.trim() === '') {
      const user = await User.findById(req.session.userId);
      return res.render('profile', { user, error: 'Name is required' });
    }

    const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];

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
      const fileName = req.session.userId + '_' + photo.name;
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