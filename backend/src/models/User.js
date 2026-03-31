const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    businessName: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function saveHook(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);