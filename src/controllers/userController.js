const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwtSecret } = require('../config');
const { AppError } = require('../middlewares/errorHandler');

exports.register = async (req, res, next) => {
  try {
    const { username, password, businessName, phone } = req.body;
    if (!username || typeof username !== 'string' || username.trim() === '') {
      throw new AppError('Username is required', 400);
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      throw new AppError('Password is required', 400);
    }
    if (!businessName || typeof businessName !== 'string' || businessName.trim() === '') {
      throw new AppError('Business name is required', 400);
    }
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      throw new AppError('Phone is required', 400);
    }
    const user = new User({ username, password, businessName, phone });
    await user.save();
    res.json({ success: true, message: 'User registered', user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || username.trim() === '') {
      throw new AppError('Username is required', 400);
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      throw new AppError('Password is required', 400);
    }
    const user = await User.findOne({ username });
    if (!user) throw new AppError('Invalid credentials', 401);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

