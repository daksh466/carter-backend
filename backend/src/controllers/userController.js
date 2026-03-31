const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const buildUserPayload = (user) => ({
  id: String(user._id),
  username: user.username,
  businessName: user.businessName || '',
  phone: user.phone || ''
});

exports.login = async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '').trim();

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (error) {
      passwordMatch = false;
    }

    if (!passwordMatch && user.password === password) {
      passwordMatch = true;
    }

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userPayload = buildUserPayload(user);
    const token = jwt.sign(
      { id: userPayload.id, username: userPayload.username },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '1d' }
    );

    return res.json({ token, user: userPayload });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to login', error: error.message });
  }
};