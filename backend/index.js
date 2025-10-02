import express, { json } from "express";
import { connect } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import authRoutes from "./routes/authRoutes.js";
import { rooms, users } from "./sharedState/sharedState.js";
import roomRoutes from "./routes/roomRoutes.js";
import nodemailer from "nodemailer";
import quizRoutes from "./routes/quizRoutes.js";
import Room from "./models/Room.js";
import Messages from "./models/Messages.js";
import User from "./models/User.js";
dotenv.config();

const app = express();
app.use(json());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors({ origin: "*" }));

//mongoDB connection
const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGO_URI);
    console.log(`Database connected, ${conn.connection.id}`);
  } catch {
    console.error("Error connecting to database");
  }
};

// let timeOnline = {};
let connections = {};
// let roomHistory = {};

//Routes
app.use("/", authRoutes);
app.use("/", roomRoutes);
app.use("/", quizRoutes);
app.post("/getMessage", async (req, res) => {
  const { roomCode } = req.body;
  try {
    const messageDoc = await Messages.findOne({ room: roomCode });
    const messages = messageDoc ? messageDoc.message : [];
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

io.on("connection", (socket) => {
  // console.log("Client connected with id:", socket.id);

  socket.on("join-room", async ({ roomCode, userId }) => {
    try {
      socket.userId = userId;
      socket.join(roomCode);
      socket.roomCode = roomCode;

      if (!rooms[roomCode]) rooms[roomCode] = [];
      if (!rooms[roomCode].includes(userId)) rooms[roomCode].push(userId);
      users[userId] = roomCode;

      const roomSearch = await Room.find({ roomId: roomCode });
      if (!roomSearch) {
        await Room.create({
          roomId: roomCode,
          users: [{ userId }],
        });
      } else {
        const userExists = (roomSearch.users || []).some(
          (u) => u.userId === userId
        );
        if (!userExists) {
          await Room.updateOne(
            { roomId: roomCode },
            { $push: { users: { userId } } }
          );
        }
      }

      // console.log(userAddition);
      const messageDoc = await Messages.findOne({ room: roomCode });
      if (messageDoc && messageDoc.message) {
        socket.emit("room-messages", messageDoc.message);
       
      }

      if (!connections[roomCode]) connections[roomCode] = [];
      if (!connections[roomCode].includes(socket.id)) {
        connections[roomCode].push(socket.id);
      }

      io.to(roomCode).emit("user-joined", socket.id, connections[roomCode]);
      // console.log(`User ${userId} joined room ${roomCode}`);
    } catch (error) {
      console.error("Error in join-room:", error);
    }
  });

  socket.on("signal", ({ roomCode, message, toId }) => {
    try {
      if (toId) {
        io.to(toId).emit("signal", socket.id, message);
      } else {
        socket.to(roomCode).emit("signal", socket.id, message);
      }
    } catch (error) {
      console.error("Error in signal:", error);
    }
  });

  socket.on("editor", ({ change, code }) => {
    try {
      io.to(code).emit("editor", change);
    } catch (error) {
      console.error("Error in editor:", error);
    }
  });

  socket.on("text-message", async ({ message, client, code, tempId }) => {
    try {
      const user = await User.findOne({ uid: client });
      const username = user ? user.username : "Unknown";
      const messageData = {
        userId: client,
        username,
        message,
        timestamps: new Date(),
        tempId,
      };

      const messageDBSearch = await Messages.findOneAndUpdate(
        { room: code },
        {
          $push: { message: messageData },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
      const finalMessage =
        messageDBSearch.message[messageDBSearch.message.length - 1];
      io.to(code).emit("text-message", {
        message: finalMessage.message,
        client: finalMessage.userId, 
        username: finalMessage.username,
        timestamp: finalMessage.timestamps.toISOString(), 
        tempId: finalMessage.tempId,
      });
      // console.log(`Message from ${username} in room ${code} processed.`);
    } catch (error) {
      console.error("Error in text-message:", error);
    }
  });

  socket.on("ping-check", (cb) => {
    cb(); // Immediately call the callback
  });

  socket.on("leave-room", async ({ code, client }) => {
    try {
      await Room.updateOne(
        { roomId: code },
        { $pull: { users: { userId: client } } }
      );
      socket.leave(code);
    } catch (error) {
      console.error("Error in leave-room:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    try {
      for (const room in connections) {
        if (connections[room].includes(socket.id)) {
          connections[room] = connections[room].filter(
            (id) => id !== socket.id
          );
        }
      }
    } catch (error) {
      console.error("Error in disconnect:", error);
    }
  });
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "theguywhoapproves@gmail.com",
    pass: "bkpt okmx dkfh frmu",
  },
});

app.post("/send-code", async (req, res) => {
  const { roomCode, email } = req.body;
  console.log(roomCode, email);
  try {
    const mailOptions = {
      from: "theguywhoapproves@gmail.com",
      to: email,
      subject: "Your Room Code for CodeCollab",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to CodeCollab!</h2>
          <p>Here is your room code to join the collaborative coding session:</p>
          <div style="background-color: #1F2937; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #fff; margin: 0;">Room Code: ${roomCode}</h3>
          </div>
          <p>You can use this code to join the room and start coding with your team.</p>
          <p>Happy coding!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email" });
  }
});

server.listen(5000, (err) => {
  if (err) {
    console.error("Error starting server:", err);
    return;
  }
  connectDB();
  console.log("Server is listening on port 5000!");
});
