const express = require("express");
// creates an Express application instance
const app = express();
const database = require("./config/database");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const rideRoute = require("./routes/ride");
const contactUsRoute = require("./routes/contact");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const socketIo = require("socket.io");
const { auth } = require("./middlewares/auth");
const Message = require("./models/Message");

//setting up port number
const PORT = process.env.PORT || 4000;

//cookie-parser
app.use(cookieParser());

//connect to the database
database.connect();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions,
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Connecting to cloudinary
cloudinaryConnect();

// Setting up routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/ride", rideRoute);

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
  });

  socket.on("sendMessage", async ({ roomId, sender, receiver, content }) => {
    try {
      const message = new Message({ sender, receiver, content });
      await message.save();
      io.to(roomId).emit("message", message);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", "Failed to save message");
    }
  });

  socket.on("disconnect", (reason) => {
    // console.log("Client disconnected", socket.id, reason);
    console.log("Client disconnected");
  });
});

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running perfectly...",
  });
});

app.get("/api/v1/messages/:roomId", auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: roomId.split("_")[0], receiver: roomId.split("_")[1] },
        { sender: roomId.split("_")[1], receiver: roomId.split("_")[0] },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// The credentials option allows cookies and other credentials to be sent with requests, which is important for maintaining authenticated sessions.
