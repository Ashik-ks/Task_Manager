const mongoose = require('mongoose');

const personalTaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // To link the task to the specific user
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    default: "normal",
    enum: ["high", "medium", "normal", "low"],
  },
  stage: {
    type: String,
    default: "todo",
      enum: ["todo", "in progress", "completed"],
  },
  dueDate: {
    type: Date, // For task deadline
  },
  reminder: {
    type: Date, // Time to trigger a reminder
  },
  isArchived: {
    type: Boolean,
    default: false, // Archived status
  },
  notes: [
    {
      note: {
        type: String,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields.

module.exports = mongoose.model('PersonalTask', personalTaskSchema);
