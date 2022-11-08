const app = require("express")();
const http = require("http").Server(app);
const cors = require("cors");
app.use(cors());
const fs = require("fs");

const io = require("socket.io")(http, {
  cors: {
    origin: ["http://localhost:3000"],
    // Allowing frontend to connect to backend
  },
});
// backend is set on this port

// const messages = [{ username: "Bot", message: "Welcome to the chat" }];
// chat history wont be saved. resets on every new connection

io.on("connect", (socket) => {
  socket.on("login", (username, password) => {
    fs.readFile("./users.json", (err, data) => {
      try {
        const file = JSON.parse(data);

        const userLoggingIn = file.users.find(
          (user) => user.username === username && user.password === password
        );
        if (userLoggingIn && userLoggingIn.password === password) {
          userLoggingIn.onlineStatus = true;
          io.emit("verifying-login", "login-success");
        } else {
          io.emit("verifying-login", "login-failed");
        }
        const updatedUsers = JSON.stringify(file);

        fs.writeFile("./users.json", updatedUsers, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("users.json updated");
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  });

  socket.on("signup", (username, password) => {
    fs.readFile("./users.json", (err, data) => {
      try {
        const file = JSON.parse(data);
        const userSigningUp = file.users.find(
          (user) => user.username === username
        );

        if (userSigningUp) {
          io.emit("verifying-signup", "user already exists");
          return;
        } else {
          io.emit("verifying-signup", "signup-success");
        }

        file.users.push({
          username: username,
          password: password,
          onlineStatus: false,
        });

        const updatedUsers = JSON.stringify(file);

        fs.writeFile("./users.json", updatedUsers, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("users.json updated");
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  });

  socket.on("logout", (username) => {
    fs.readFile("./users.json", (err, data) => {
      try {
        const file = JSON.parse(data);

        const userLoggingOut = file.users.find(
          (user) => user.username === username
        );
        if (!userLoggingOut) {
          console.log("sth went wrong");
          return;
        }
        console.log("server check", userLoggingOut);
        userLoggingOut.onlineStatus = false;

        const updatedUsers = JSON.stringify(file);

        fs.writeFile("./users.json", updatedUsers, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("users.json updated");
            io.emit("verifying-logout");
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  });

  socket.on("send-message", (message, username) => {
    fs.readFile("./messages.json", (err, data) => {
      try {
        const file = JSON.parse(data);
        const updatedFile = file.messages.push({
          username: username,
          message: message,
        });
        const updatedMessages = JSON.stringify(file);
        fs.writeFile("./messages.json", updatedMessages, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("messages.json updated");
            // io.emit("verifying-message", message, username);
          }
        });
      } catch (err) {
        console.log("check ", err);
      }
    });

    // io.emit("receive-message", message, username); // was doing this when chat history wasnt beinge preserved
    // messages.push({ username, message });
  });

  socket.on("sign-up", (username, password) => {
    users.push({ username, password });
  });
});

app.get("/get-chat-history", (req, res, next) => {
  // res.send(JSON.stringify(messages));
  fs.readFile("./messages.json", "utf8", (err, data) => {
    if (err) {
      console.log("File read failed:", err);
      return err;
    }
    const parsedData = JSON.parse(data);
    res.send(parsedData.messages);
  });
});

app.get("/get-users", (req, res, next) => {
  fs.readFile("./users.json", "utf8", (err, data) => {
    if (err) {
      console.log("File read failed:", err);
      return err;
    }
    const parsedData = JSON.parse(data);
    res.send(parsedData.users);
  });
});

http.listen(3001, function () {});
