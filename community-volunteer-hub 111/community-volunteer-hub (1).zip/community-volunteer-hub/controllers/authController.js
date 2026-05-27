const User = require('../models/User');

// REGISTER
exports.showRegister = (req, res) => {
  res.render('register', { error: null });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
    res.render('profile', { user });
  } catch (err) {
    res.redirect('/login');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, location, bio, skills } = req.body;
    const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];

    const updateData = { name, location, bio, skills: skillsArray };

    if (req.files && req.files.photo) {
      const photo = req.files.photo;
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