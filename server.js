const httpServer = require("./setup/httpServer");
const { PORT } = require("./setup/env");

require("./setup/database")();
require("./setup/websocket")(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}.`);
});
