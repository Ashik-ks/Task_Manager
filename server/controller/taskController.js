const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require("mongoose");
const User = require('../db/model/user');
const Notification = require('../db/model/notification');
const Task = require('../db/model/task');
const { success_function, error_function } = require('../utils/responsehandler');
const { format, parse } = require('date-fns');
const Joi = require('joi');

const taskValidationSchema = Joi.object({
    title: Joi.string().required(),
    team: Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/)).required(),
    stage: Joi.string().valid('todo', 'in progress', 'completed').required(),
    date: Joi.date().required(),
    priority: Joi.string().valid('high', 'medium', 'low').required(),
    // assets: Joi.array().items(Joi.string()).optional(),
});


exports.createTask = async function (req, res) {
    try {
        const userId = req.params.id;
        console.log("userid : ",userId)
        
        const { error, value } = taskValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json(error_function(error.details[0].message));
        }

        const { title, team, stage, date, priority, assets } = value;
        console.log("title : ",title)

        // Verify all team members exist
        const users = await User.find({ _id: { $in: team } });
        if (users.length !== team.length) {
            return res.status(400).json(error_function("One or more team member IDs are invalid."));
        }
        console.log("users : ",users)

        // Construct notification text
        let text = "New task has been assigned to you";
        if (team.length > 1) {
            text += ` and ${team.length - 1} others.`;
        }
        text += ` The task priority is set to ${priority} priority. Please check and act accordingly. The task date is ${format(new Date(date), 'MMMM dd, yyyy')}. Thank you!`;

        // Activity object
        const activity = {
            type: "assigned",
            activity: text,
            by: userId,
        };

        // Create task
        const task = await Task.create({
            title,
            team,
            stage: stage.toLowerCase(),
            date,
            priority: priority.toLowerCase(),
            assets,
            activities: [activity],
        });

        // Create notifications for the team
        const notifications = team.map(memberId => ({
            user: memberId,
            text,
            task: task._id,
        }));

        await Notification.insertMany(notifications);

        res.status(200).json(success_function("Task created successfully.", { task }));
    } catch (error) {
        console.error(error);
        res.status(500).json(error_function("An error occurred while creating the task."));
    }
};

exports.duplicateTask = async function(req, res) {
  try {
      const { id } = req.params;
  
      const task = await Task.findById(id);
      if (!task) {
          return res.status(404).json({ status: false, message: "Task not found." });
      }

      // Create a new task by duplicating the existing one, excluding the _id field
      const newTask = await Task.create({
        ...task.toObject(), // Convert the task to a plain object to avoid issues with Mongoose references
        _id: undefined, // Ensure that MongoDB generates a new _id
        title: task.title + " - Duplicate", // Modify the title
        originalTaskId: task._id, // Add a reference to the original task
      });

      // Copy the other necessary fields
      newTask.team = task.team;
      newTask.subTasks = task.subTasks;
      newTask.assets = task.assets;
      newTask.priority = task.priority;
      newTask.stage = task.stage;

      // Save the new task
      await newTask.save();

      // Notify users
      let text = "New task has been assigned to you";
      if (task.team.length > 1) {
        text += ` and ${task.team.length - 1} others.`;
      }

      const formattedDate = task.date instanceof Date ? task.date.toDateString() : new Date(task.date).toDateString();
      
      text += ` The task priority is set to ${task.priority} priority, so check and act accordingly. The task date is ${formattedDate}. Thank you!!!`;

      // Create notifications
      await Notification.insertMany(
        task.team.map(memberId => ({
          user: memberId,
          text,
          task: newTask._id,
        }))
      );

      res.status(200).json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: "An error occurred while duplicating the task." });
  }
};

exports.postTaskActivity = async function(req, res) {
  try {
      const { tid: taskId, id: userId } = req.params;
      console.log("idtid : ",taskId,userId)
      const { type, activity } = req.body;

      // Check if the task exists
      const task = await Task.findById(taskId);
      if (!task) {
          return res.status(404).json({ status: false, message: "Task not found." });
      }

      // Input validation (basic)
      if (!type || !activity) {
          return res.status(400).json({ status: false, message: "Type and activity are required." });
      }

      // Construct the activity data
      const data = {
          type,
          activity,
          by: userId,
      };

      // Add the activity to the task's activities
      task.activities.push(data);

      // Save the task with the new activity
      await task.save();

      // Send a success response
      res.status(200).json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
      console.error(error);
      // More detailed error logging
      res.status(500).json({ status: false, message: "An error occurred while posting the activity." });
  }
};



