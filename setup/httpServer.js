const http = require("http");

const roomsRouter = require("../routes/rooms");

const express = require("express");

const cors = require("cors");

const app = express();

app.use(express.json());

const config = { exposedHeaders: "Authorization" };

app.use(cors(config));

app.use("/api/v1/rooms", roomsRouter);

const httpServer = http.createServer(app);

module.exports = httpServer;
