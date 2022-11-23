const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
};
