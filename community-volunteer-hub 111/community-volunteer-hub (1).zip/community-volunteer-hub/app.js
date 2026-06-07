const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();

// Set EJS as view engine
app.set('view engine', 'ejs');

app.use(express.static('public'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// IMPORTANT: enables DELETE and PUT from forms
app.use(methodOverride('_method'));

app.use(fileUpload());

// Session
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Person 4 routes
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/messages', messageRoutes);
app.use('/admin', adminRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// Person 3 routes
const authRoutes = require('./routes/authRoutes');

app.use('/', authRoutes);

// Person 2 routes
const requestRoutes = require('./routes/requestRoutes');

app.use('/requests', requestRoutes);


// ── 404 handler ──
app.use((req, res) => {
  const user = req.session.userId
    ? { name: req.session.name, role: req.session.role }
    : null;
  res.status(404).render('404', { user });
});

// ── 500 handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  const user = req.session.userId
    ? { name: req.session.name, role: req.session.role }
    : null;
  res.status(500).render('500', { user });
});

// Connect to MongoDB FIRST, then start server
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
.then(() => {
  console.log('MongoDB connected!');

  app.listen(process.env.PORT, () => {
    console.log(
      `Server running on http://localhost:${process.env.PORT}`
    );
  });
})
.catch((err) => {
  console.log('MongoDB connection error:', err);
});