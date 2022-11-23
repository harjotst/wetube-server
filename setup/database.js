const mongoose = require("mongoose");

const { MONGO_URI } = require("./env");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("Connected to Database.");
  } catch (error) {
    console.log("Couldn't connect to Database.", error);
  }
};

module.exports = connectToDatabase;
