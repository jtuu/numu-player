const port = 3000;
const express = require("express");
const app = express();
const http = require("http").Server(app);
const SocketServer = require("./socket");
const path = require("path");
const {log, rainbowize, logHttp} = require("./utils");

const absBasePath = path.resolve(__dirname + "/../dist/");

app.use((req, res, next) => {
  logHttp(req, res, req.method, req.url, req.path);
  next();
});
app.use(express.static(absBasePath));

module.exports = app;

app.socket = new SocketServer(http);
app.use("/api", require("./rest"));

app.get("*", (req, res) => {
  res.sendFile(absBasePath + "/index.html");
});

const server = http.listen(port, () => log(rainbowize(` Server started on port ${port}`)));
server.on("error", console.error.bind(console));
