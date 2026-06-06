const protect = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  req.user = { _id: req.session.userId, name: req.session.name };
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  if (req.session.role !== 'admin') {
    return res.status(403).send('Access denied');
  }
  next();
};

module.exports = { protect, isAdmin };