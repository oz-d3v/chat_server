const app = require("express")();
const http = require("http").Server(app);
const cors = require("cors");
app.use(cors());

const io = require("socket.io")(http, {
  cors: {
    origin: ["http://localhost:3000"],
    // Allowing frontend to connect to backend
  },
});
// backend is set on this port

const messages = [{ username: "Bot", message: "Welcome to the chat" }];
const users = [
  { username: "osama", password: "123", onlineStatus: false, socketId: "" },
  { username: "umair", password: "123", onlineStatus: false, socketId: "" },
];

io.on("connect", (socket) => {
  socket.on("login", (username, password) => {
    const user = users.find((user) => user.username === username);

    user.onlineStatus = true;
    user.socketId = socket.id;

    console.log(user);

    if (user && user.password === password) {
      io.emit("verifying-login", "login-success");
    } else {
      io.emit("verifying-login", "login-failed");
    }
  });

  socket.on("send-message", (message, username, channelID) => {
    io.emit("receive-message", message, username, channelID);
    messages.push({ username, message });

    socket.on("sign-up", (username, password) => {
      users.push({ username, password });
    });
  });

  io.emit("fetch-users", users);

  io.emit("get-messages", messages);

  socket.on("disconnect", () => {
    const user = users.find((user) => user.socketId === socket.id);
    if (user) {
      user.socketId = "";
      user.onlineStatus = false;
    }
  });
});

// app.get("/get-messages", (req, res, next) => {
//   res.send(JSON.stringify(messages));
// });

http.listen(3001, function () {});
