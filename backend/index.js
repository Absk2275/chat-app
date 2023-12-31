const express = require("express");
const dotenv = require("dotenv");
const app = express();
dotenv.config();
const userRoutes = require("./Routes/userRoutes");
const conn = require("./Config/Db");
const cors = require("cors");
const {notFound, errorHandler} = require("./middleware/errorMiddleware");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const path = require("path");
conn();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use(messageRoutes);

//------------------------------------Deployment-----------------------------------------------------

const __dirname1 = path.resolve(__dirname, '..'); // Assuming the backend and frontend are in the same directory

if (process.env.NODE_ENV === "production") {
  // Update the path to point to the correct frontend build directory
  app.use(express.static(path.join(__dirname1, "frontend", "build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}
//-----------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

const server = app.listen(
    PORT,
    console.log(`Server running on PORT ${PORT}`)
  );
  
  const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
      origin: "https://chat-again.onrender.com",
      // credentials: true,
    },
  });
  
  io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });
  
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;
  
      if (!chat.users) return console.log("chat.users not defined");
  
      chat.users.forEach((user) => {
        if (user._id == newMessageRecieved.sender._id) return;
  
        socket.in(user._id).emit("message recieved", newMessageRecieved);
      });
    });
  
    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  });