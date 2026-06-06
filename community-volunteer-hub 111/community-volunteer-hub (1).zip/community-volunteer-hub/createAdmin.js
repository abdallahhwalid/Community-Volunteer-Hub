const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');

  await User.deleteOne({ email: 'admin@hub.com' });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await User.create({
    name: 'Admin',
    email: 'admin@hub.com',
    password: hashedPassword,
    role: 'admin'
  });

  console.log('Admin recreated!');
  mongoose.disconnect();
});