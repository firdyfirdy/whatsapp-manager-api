require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  CHROME_EXECUTABLE_PATH: process.env.CHROME_EXECUTABLE_PATH || undefined,
  SESSIONS_DIR: process.env.SESSIONS_DIR || require('path').join(__dirname, '../../sessions'),
};
