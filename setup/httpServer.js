const http = require("http");

const roomsRouter = require("../routes/rooms");

const publicRouter = require("../routes/public");

const express = require("express");

const cors = require("cors");

const app = express();

app.use(express.static("public"));

app.use(express.json());

const config = { exposedHeaders: "Authorization" };

app.use(cors(config));

app.use("/api/v1/rooms", roomsRouter);

app.use("/", publicRouter);

const httpServer = http.createServer(app);

module.exports = httpServer;
