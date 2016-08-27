const port = 3000;
const express = require("express");
const app = express();
const http = require("http").Server(app);

app.use(express.static("dist"));

app.use((req, res, next) => {
  console.log(req.method, req.url, req.path);
  next();
});

module.exports = app;

app.socket = require("./socket")(http);
app.use("/api", require("./rest"));

const server = http.listen(port, () => console.log(`Server started on port ${port}`));
server.on("error", console.error.bind(console));
