const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Set EJS as view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static('public'));

// Session
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Temporary test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Person 4 routes — commented out until they finish
// const messageRoutes = require('./routes/messageRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// app.use('/messages', messageRoutes);
// app.use('/admin', adminRoutes);

// Person 3 routes — commented out until they finish
// const authRoutes = require('./routes/authRoutes');
// app.use('/', authRoutes);

// Person 2 routes
const requestRoutes = require('./routes/requestRoutes');
app.use('/requests', requestRoutes);

// Connect to MongoDB FIRST, then start server
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => {
    console.log('MongoDB connected!');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });