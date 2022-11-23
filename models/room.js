const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  videoTime: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    required: true,
  },
  paused: {
    type: Boolean,
    default: true,
  },
  lastUpdated: {
    type: Number,
    default: Date.now(),
  },
  numberOfMembers: {
    type: Number,
    default: 1,
  },
  members: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});

RoomSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();

  next();
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
