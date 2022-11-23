const mongoose = require("mongoose");

const Room = require("../models/room");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  room: {
    type: mongoose.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  socketId: {
    type: String,
    default: undefined,
  },
});

// ensure that username and room id are a unique combination
UserSchema.index({ username: 1, room: 1 }, { unique: true });

// after user is deleted (left room), we must update the count of
// users in the room. if number of users is 0, delete the room
UserSchema.post("findOneAndDelete", async function (doc) {
  // populate the room field
  await doc.populate("room");

  // remove user id from room pl.members list
  doc.room.members = doc.room.members.filter(
    (memberId) => memberId !== doc._id
  );

  // decrement member count in room
  --doc.room.numberOfMembers;

  // save changes to room
  await doc.room.save();

  // if member count is 0, delete the room
  if (!doc.room.numberOfMembers) {
    await Room.deleteOne({ _id: doc.room._id }).exec();
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
