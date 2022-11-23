const { v4: uuidv4 } = require("uuid");

const User = require("../models/user");

const findUserById = async (socketId) => {
  // get user with socket id
  const user = await User.findOne({ socketId }).exec();

  // check if user doesn't exist
  if (!user) return;

  // populate room field on user
  await user.populate("room");

  return user;
};

const socketController = (io) => {
  return (socket) => {
    // connect socket to user in database
    socket.on("join-room", async (username, room, roomId, callback) => {
      console.log(
        `'${socket.id}' has username: '${username}' and joined room: '${room}'`
      );

      // find user with username in the room with room id
      const user = await User.findOne({ username, room: roomId }).exec();

      // if user doesn't exist
      if (!user) return;

      // set user socket id
      user.socketId = socket.id;

      // populate room field on user
      await user.populate("room");

      // have user join room
      socket.join(user.room.roomId);

      // save user
      await user.save();

      // populate members array
      await user.room.populate("members");

      // emit user-joined event to all users in room with list of current members
      io.to(user.room.roomId).emit(
        "user-joined",
        user.username,
        user.room.members
      );

      // send player data back to client
      callback({
        youtubeId: user.room.videoUrl.split("v=")[1],
        time: user.room.videoTime,
        duration: user.room.duration,
        paused: user.room.paused,
        lastUpdated: user.room.lastUpdated,
      });
    });

    // play video if paused
    socket.on("play-video", async (time) => {
      console.log(`'${socket.id}' played video`);

      // find user by socket id
      const user = await findUserById(socket.id);

      // if user doesn't exist
      if (!user) return;

      // set paused to the opposite of what it currently is
      user.room.paused = false;

      // update video time
      user.room.videoTime = time;

      // save room
      await user.room.save();

      // broadcast to all other sockets in the room to toggle the
      // video at the specified time
      socket.broadcast.to(user.room.roomId).emit("play-video", time);
    });

    // play video if paused
    socket.on("pause-video", async (time) => {
      console.log(`'${socket.id}' paused video`);

      // find user by socket id
      const user = await findUserById(socket.id);

      // if user doesn't exist
      if (!user) return;

      // set paused to the opposite of what it currently is
      user.room.paused = true;

      // update video time
      user.room.videoTime = time;

      // save room
      await user.room.save();

      // broadcast to all other sockets in the room to toggle the
      // video at the specified time
      socket.broadcast.to(user.room.roomId).emit("pause-video", time);
    });

    // send a message to everyone else in the room
    socket.on("send-message", async (message) => {
      console.log(`'${socket.id}' messaged '${message}'`);

      // find user by socket id
      const user = await findUserById(socket.id);

      // if user doesn't exist
      if (!user) return;

      // broadcast message to all sockets
      io.to(user.room.roomId).emit("message", {
        sender: user.username,
        text: message,
      });
    });

    // change the video all users in the room are watching
    socket.on("change-video", async (videoUrl) => {
      console.log("change-video", videoUrl);

      // find user by socket id
      const user = await findUserById(socket.id);

      // if user doesn't exist
      if (!user) return;

      // set video url
      user.room.videoUrl = videoUrl;

      // set video time to =
      user.room.videoTime = 0;

      // set video to paused
      user.room.paused = true;

      // save room
      await user.room.save();

      // emit change-video event for users in room
      io.to(user.room.roomId).emit("change-video", {
        id: user.room.videoUrl.split("v=")[1],
        time: user.room.videoTime,
        duration: user.room.duration,
        paused: user.room.paused,
        lastUpdated: user.room.lastUpdated,
      });
    });

    socket.on("user-left", async () => {
      console.log(`${socket.id} disconnected`);

      // find user by socket id
      const user = await findUserById(socket.id);

      // if user doesn't exist
      if (!user) return;

      // populate members array in room
      await user.room.populate("members");

      // send user-left event to rest of members in the room
      io.to(user.room.roomId).emit(
        "user-left",
        user.username,
        user.room.members
      );
    });

    socket.on("disconnect", async () => {
      console.log(`${socket.id} disconnected`);

      // find user by socket id
      const user = await findUserById(socket.id);

      // if user doesn't exist
      if (!user) return;

      // populate members array in room
      await user.room.populate("members");

      // send user-left event to rest of members in the room
      io.to(user.room.roomId).emit(
        "user-left",
        user.username,
        user.room.members
      );
    });
  };
};

module.exports = socketController;
