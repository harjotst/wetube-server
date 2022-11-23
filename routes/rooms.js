const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const express = require("express");

const { SECRET_KEY } = require("../setup/env");

const router = express.Router();

const Room = require("../models/room");
const User = require("../models/user");

const { getYoutubeVideoDuration } = require("../controllers/youtubedata");

router.post("/create-room", async (req, res) => {
  // extract username and video url from request body
  const { username, videoUrl } = req.body;

  // check whether username or video url are undefined
  if (!username || !videoUrl)
    return res
      .status(400)
      .send({ message: "Username Or Video URL Not Provided." });

  let duration;

  try {
    duration = await getYoutubeVideoDuration(videoUrl.split("v=")[1]);
  } catch (error) {
    return res
      .status(400)
      .send({ reason: "videoUrl", message: "YouTube Video Doesn't Exist." });
  }

  // create room with room id and video url
  const room = new Room({
    roomId: uuidv4(),
    videoUrl: videoUrl,
    duration: duration,
    members: [],
  });

  // save the room to the database
  await room.save();

  // create user that's joining the newly created room
  const user = new User({ username, room: room._id });

  // save user to database
  await user.save();

  // add user id to room memebers list
  room.members.push(user._id);

  // save the room to the database once again
  await room.save();

  // return username and room id back to client
  const response = {
    username: user.username,
    room: room.roomId,
    roomId: room._id,
  };

  // hash user object and send token representing identity to user
  jwt.sign(response, SECRET_KEY, (err, token) => {
    if (err) return res.status(500).send(err);

    res.status(201).set("Authorization", `Bearer ${token}`).send(response);
  });
});

router.post("/join-room", async (req, res) => {
  // extract username and room id from request body
  const { username, roomId } = req.body;

  // check whether username or room id are undefined
  if (!username || !roomId)
    return res
      .status(400)
      .send({ message: "Username Or Room ID Not Provided." });

  // find room corresponding to provided room id
  const room = await Room.findOne({ roomId }).exec();

  // if room doesn't exist then return error message to client
  if (!room)
    return res
      .status(400)
      .send({ reason: "roomId", message: "Room Doesn't Exist." });

  // check if username in room exists already
  const usernameExists = await User.findOne({
    username,
    room: room._id,
  }).exec();

  // if username already exists, let user know that username exists
  if (usernameExists)
    return res.status(400).send({
      reason: "username",
      message: "Username Already Exists In Room.",
    });

  // create user that's joining existing room
  const user = new User({ username, room: room._id });

  // save user to database
  await user.save();

  // add member to room members list
  room.members.push(user._id);

  // increment number of members in room
  ++room.numberOfMembers;

  // update room
  await room.save();

  // return username and room id back to client
  const response = {
    username: user.username,
    room: room.roomId,
    roomId: room._id,
  };

  // hash user object and send to client
  jwt.sign(response, SECRET_KEY, (err, token) => {
    if (err) return res.status(500).send(err);

    res.status(201).set("Authorization", `Bearer ${token}`).send(response);
  });
});

router.delete("/leave-room", async (req, res) => {
  // get authorization header from request
  const authorization = req.get("Authorization");

  // check if the authorization header isn't provided
  if (!authorization)
    return res.status(400).send({
      message: "Authentication Header Not Provided In Request Header.",
    });

  // get token from authorization header string
  const token = authorization.split(" ")[1];

  // check if the authorization header doesn't have correct format
  if (!token)
    return res
      .status(400)
      .send({ message: "Authentication Header Has Incorrect Format." });

  // check if the token is valid
  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    // if the token couldn't be verified, send an error to client
    if (err) return res.status(400).send(err);

    // delete the user from the database
    await User.findOneAndDelete({
      username: decoded.username,
      room: decoded.roomId,
    }).exec();

    // send OK response to client
    res.status(200).send();
  });
});

module.exports = router;
