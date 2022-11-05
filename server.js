// setting up the server
const io = require("socket.io")(3001, {
  cors: {
    origin: ["http://localhost:3000"],
    // Allowing frontend to connect to backend
  },
});

io.on("connection", (socket) => {
  socket.on("send-message", (message, username) => {
    console.log("check message", message, username);
    io.emit("receive-message", message, username);
  });
});

// room
//
