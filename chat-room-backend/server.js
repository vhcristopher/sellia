require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  pingInterval: 10000,
  pingTimeout: 5000,
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(console.error);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const Message = require("./models/Message");

const roomIntervals = {};

function startLonelyUserInterval(roomID) {
  if (!roomIntervals[roomID]) {
    roomIntervals[roomID] = setInterval(async () => {
      const roomSize = io.sockets.adapter.rooms.get(roomID)?.size || 0;

      if (roomSize === 1) {
        const botMessage = new Message({
          roomID,
          sender: "IA Asistente",
          text: "Estoy aquí para ayudarte. ¿Hay algo en lo que pueda asistirte?",
          isBotMessage: true,
          timestamp: new Date(),
        });

        await botMessage.save();
        io.to(roomID).emit("message", botMessage);
      } else {
        clearInterval(roomIntervals[roomID]);
        delete roomIntervals[roomID];
      }
    }, 10000);
  }
}

app.get("/messages/:roomID", async (req, res) => {
  const { roomID } = req.params;
  const { query } = req.query;

  try {
    let searchCriteria = { roomID };
    if (query) {
      searchCriteria.text = { $regex: query, $options: "i" };
    }

    const messages = await Message.find(searchCriteria).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al consultar el historial de mensajes" });
  }
});

app.post("/messages", async (req, res) => {
  const { roomID, sender, text } = req.body;
  const message = new Message({
    roomID,
    sender,
    text,
    timestamp: new Date(),
  });
  try {
    await message.save();
    res.status(201).json({ success: true, message: "Mensaje guardado" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error al guardar el mensaje" });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No se ha subido ningún archivo" });
  }

  const filePath = `/uploads/${req.file.filename}`;
  const fileType = req.file.mimetype.startsWith("image") ? "image" : "file";
  const messageData = {
    roomID: req.body.roomID,
    sender: req.body.sender || "Anon",
    filePath,
    fileType,
    timestamp: new Date(),
  };

  try {
    const message = new Message(messageData);
    await message.save();
    io.to(req.body.roomID).emit("fileMessage", messageData);
    res.status(200).send({
      message: "Archivo subido con éxito",
      filePath,
      fileType,
    });
  } catch (error) {
    console.error("Error al guardar el archivo en la base de datos:", error);
    res.status(500).send({ message: "Error al subir el archivo" });
  }
});

const users = new Set();

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ roomID, userName }) => {
    socket.join(roomID);
    users.add(socket.id);

    io.to(roomID).emit(
      "updateUserCount",
      io.sockets.adapter.rooms.get(roomID)?.size || 0,
    );

    const roomSize = io.sockets.adapter.rooms.get(roomID)?.size || 0;
    if (roomSize === 1) {
      startLonelyUserInterval(roomID);
    }

    console.log(
      `${userName} se unió a la sala ${roomID}. Total de usuarios conectados: ${users.size}`,
    );
  });

  socket.on("chatMessage", async ({ roomID, sender, text }) => {
    const message = new Message({
      roomID,
      sender,
      text,
      timestamp: new Date(),
    });
    await message.save();
    io.to(roomID).emit("message", message);
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);

    Object.keys(io.sockets.adapter.sids[socket.id] || {}).forEach((roomID) => {
      const roomSize = io.sockets.adapter.rooms.get(roomID)?.size || 0;
      io.to(roomID).emit("updateUserCount", roomSize);

      if (roomSize === 0) {
        clearInterval(roomIntervals[roomID]);
        delete roomIntervals[roomID];
      } else if (roomSize === 1) {
        startLonelyUserInterval(roomID);
      }
    });

    console.log(
      `Usuario desconectado. Total de usuarios conectados: ${users.size}`,
    );
  });
});

const updateUserCountInterval = 5000;

setInterval(() => {
  for (const [roomID, room] of io.sockets.adapter.rooms) {
    const roomSize = room.size || 0;
    io.to(roomID).emit("updateUserCount", roomSize);
  }
}, updateUserCountInterval);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
