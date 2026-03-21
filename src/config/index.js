const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/carter-dev',
  jwtSecret: process.env.JWT_SECRET,
  pdfStoragePath: process.env.PDF_STORAGE_PATH || './pdfs',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
};
