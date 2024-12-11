const mongoose = require('mongoose');

// Define the task schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      default: "normal",
      enum: ["high", "medium", "normal", "low"],
    },
    originalTaskId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    stage: {
      type: String,
      default: "todo",
      enum: ["todo", "in progress", "completed"],
    },
    activities: [
      {
        type: {
          type: String,
          default: "assigned",
          enum: [
            "assigned",
            "started",
            "in progress",
            "bug",
            "completed",
            "commented",
          ],
        },
        activity: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    subTasks: [
      {
        title: {
          type: String,
        },
        date: {
          type: Date,
        },
        tag: {
          type: String,
        },
      },
    ],
    assets: [
      {
        type: String,
      },
    ],
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isTrashed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create the model
const Task = mongoose.model('Task', taskSchema);

// Export the model
module.exports = Task;
