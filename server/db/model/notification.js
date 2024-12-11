const mongoose = require('mongoose');

// Define the notice schema
const noticeSchema = new mongoose.Schema(
  {
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    text: {
      type: String,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    notiType: {
      type: String,
      default: "alert",
      enum: ["alert", "message"],
    },
    isRead: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Create the model
const Notice = mongoose.model('Notice', noticeSchema);

// Export the model
module.exports = Notice;
