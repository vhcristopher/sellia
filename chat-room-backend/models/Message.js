const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomID: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, default: "" },
  filePath: { type: String, default: "" },
  fileType: { type: String, default: "" },
  isBotMessage: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
