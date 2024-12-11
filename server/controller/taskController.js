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

exports.dashboardStatistics = async function(req, res) {
  try {
      const id = req.params.id; // User ID

      // Fetch user and handle possible not found error
      const user = await User.findById(id);
      if (!user) {
          return res.status(404).json({ status: false, message: "User not found." });
      }

      const isAdmin = user.isAdmin;
      const userId = user._id;

      // Fetch tasks based on user role (Admin or not)
      const allTasks = isAdmin
          ? await Task.find({ isTrashed: false })
              .populate({
                  path: "team",
                  select: "name role title email",
              })
              .sort({ _id: -1 })
          : await Task.find({
              isTrashed: false,
              team: { $all: [userId] },
          })
              .populate({
                  path: "team",
                  select: "name role title email",
              })
              .sort({ _id: -1 });

      // Fetch top 10 active users
      const users = await User.find({ isActive: true })
          .select("name title role isAdmin createdAt")
          .limit(10)
          .sort({ _id: -1 });

      // Group tasks by stage and calculate counts
      const groupTasks = allTasks.reduce((result, task) => {
          const stage = task.stage;

          if (!result[stage]) {
              result[stage] = 1;
          } else {
              result[stage] += 1;
          }

          return result;
      }, {});

      // Group tasks by priority
      const groupData = Object.entries(
          allTasks.reduce((result, task) => {
              const { priority } = task;

              result[priority] = (result[priority] || 0) + 1;
              return result;
          }, {})
      ).map(([name, total]) => ({ name, total }));

      // Calculate total tasks
      const totalTasks = allTasks.length;
      const last10Task = allTasks.slice(0, 10);

      // Prepare summary data
      const summary = {
          totalTasks,
          last10Task,
          users: isAdmin ? users : [], // Only send users to admin
          tasks: groupTasks,
          graphData: groupData,
      };

      // Send successful response
      res.status(200).json({
          status: true,
          message: "Successfully fetched dashboard statistics.",
          ...summary,
      });

  } catch (error) {
      console.error(error); // Log error for debugging
      res.status(500).json({ status: false, message: "An error occurred while fetching dashboard statistics." });
  }
};

// some confusion about query istrash value
exports.getTasks = async function(req, res) {
  try {
    // Extract stage and isTrashed from query parameters
    const { stage, isTrashed } = req.query;

    // If isTrashed is undefined, it will default to false
    let query = { isTrashed: isTrashed === 'true' }; // Ensures isTrashed is a boolean

    if (stage) {
      query.stage = stage; // Add stage filter if provided
    }

    // Fetch tasks from the database based on the query
    let queryResult = Task.find(query)
      .populate({
        path: 'team',
        select: 'name title email',
      })
      .sort({ _id: -1 }); // Sort by creation date in descending order

    const tasks = await queryResult;

    // Send response with the fetched tasks
    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

exports.getTask = async function(req,res) {
  try {
      const id = req.params.tid;
  
      const task = await Task.findById(id)
        .populate({
          path: "team",
          select: "name title role email",
        })
        .populate({
          path: "activities.by",
          select: "name",
        });
  
      res.status(200).json({
        status: true,
        task,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ status: false, message: error.message });
    }
  
}

exports.createSubTask = async function(req,res){
  try {
      const { title, tag, date } = req.body;
  
      const id = req.params.tid;
  
      const newSubTask = {
        title,
        date,
        tag,
      };
  
      const task = await Task.findById(id);
  
      task.subTasks.push(newSubTask);
  
      await task.save();
  
      res
        .status(200)
        .json({ status: true, message: "SubTask added successfully." });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ status: false, message: error.message });
    }
}

exports.updateTask = async function(req, res) {
  try {
    const id = req.params.tid;
    const { title, team, stage, priority, assets, date } = req.body;

    // Parse the date from a custom format (e.g., dd-MM-yyyy) to a JavaScript Date object
    const parsedDate = parse(date, 'dd-MM-yyyy', new Date());

    if (isNaN(parsedDate)) {
      return res.status(400).json({ status: false, message: "Invalid date format." });
    }

    // The date is now a JavaScript Date object, so we can store it directly in MongoDB
    const task = await Task.findById(id);

    task.title = title;
    task.date = parsedDate;  // Store the JavaScript Date object directly
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;

    await task.save();

    res.status(200).json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

exports.trashTask = async function(req,res){
  try {
      const id= req.params.tid;
  
      const task = await Task.findById(id);
  
      task.isTrashed = true;
  
      await task.save();
  
      res.status(200).json({
        status: true,
        message: `Task trashed successfully.`,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ status: false, message: error.message });
    }
}

exports.deleteRestoreTask = async function(req,res){
  try {
      const id = req.params.tid;
      const { actionType } = req.query;
  
      if (actionType === "delete") {
        await Task.findByIdAndDelete(id);
      } else if (actionType === "deleteAll") {
        await Task.deleteMany({ isTrashed: true });
      } else if (actionType === "restore") {
        const resp = await Task.findById(id);
  
        resp.isTrashed = false;
        resp.save();
      } else if (actionType === "restoreAll") {
        await Task.updateMany(
          { isTrashed: true },
          { $set: { isTrashed: false } }
        );
      }
  
      res.status(200).json({
        status: true,
        message: `Operation performed successfully.`,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ status: false, message: error.message });
    }
}



