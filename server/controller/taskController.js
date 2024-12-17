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
const upload = require("../multerconfig")



// Joi validation schema for the task
const taskValidationSchema = Joi.object({
  title: Joi.string().required(),
  team: Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/)).required(),
  stage: Joi.string().valid('todo', 'in progress', 'completed').required(),
  date: Joi.date().required(),
  priority: Joi.string().valid('high', 'medium', 'low').required(),
  assets: Joi.array().items(Joi.string()).optional(),
});

exports.createTask = async function (req, res) {
  try {
    const userId = req.params.id;
    let team1 = req.body.team;

    console.log("Team array received:", team1); // Log the team array

    // Ensure the files were uploaded
    const uploadedFiles = req.files;
    console.log("Files uploaded:", uploadedFiles);

    // Check if files are uploaded under the 'assets[]' field
    if (!uploadedFiles || !uploadedFiles['assets[]']) {
      console.log("No files uploaded or incorrect field name.");
      return res.status(400).json(error_function("No files uploaded."));
    }

    // Extract filenames from the uploaded files
    const assetFiles = uploadedFiles['assets[]'].map(file => file.filename);
    console.log("Asset files:", assetFiles);  // Debugging log

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json(error_function("Invalid user ID."));
    }

    const { title, team, stage, date, priority } = req.body;

    // Verify all team members exist in the User collection
    const users = await User.find({ _id: { $in: team } });
    console.log("Users found:", users);  // Debugging log

    if (users.length !== team.length) {
      console.log("Mismatch between team and found users:", users.length, team.length);
      return res.status(400).json(error_function("One or more team member IDs are invalid."));
    }

    // Construct notification text
    let text = `New task has been assigned to you`;
    if (team.length > 1) {
      text += ` and ${team.length - 1} others.`;
    }
    text += ` The task priority is set to ${priority} priority. Please check and act accordingly. The task date is ${format(new Date(date), 'MMMM dd, yyyy')}. Thank you!`;

    // Activity object for task creation
    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    console.log("Creating task with data:", {
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets: assetFiles,
      activities: [activity],
      originaluserId: userId
    });

    // Create the task
    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets: assetFiles, // Store the file names in the assets field
      activities: [activity],
      originaluserId: userId,
    });

    console.log("Task created:", task);  // Debugging log

    // Create notifications for the team members
    const notifications = team.map(memberId => ({
      team: memberId,
      text,
      task: task._id,
    }));

    console.log("Notifications to insert:", notifications);  // Debugging log

    await Notification.insertMany(notifications);

    // Update the tasks array for the user identified by userId
    const updatedUser = await User.findByIdAndUpdate(userId, { $push: { tasks: task._id } }, { new: true });

    res.status(200).json(success_function("Task created successfully.", { task }));
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(400).json({
      success: false,
      statuscode: 400,
      message: error.message || "An unexpected error occurred.",
      data: null,
    });
  }
};


exports.duplicateTask = async function (req, res) {
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

exports.postTaskActivity = async function (req, res) {
  try {
    const { tid: taskId, id: userId } = req.params;
    console.log("idtid : ", taskId, userId)
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

exports.dashboardStatistics = async function (req, res) {
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
exports.getTasks = async function (req, res) {
  try {
    const { stage, isTrashed, limit } = req.query;
    let query = { isTrashed: isTrashed === 'true' };

    if (stage) query.stage = stage;

    let tasksQuery = Task.find(query)
      .populate({
        path: 'team',
        select: 'name title email',
      })
      .sort({ _id: -1 });

    if (limit) tasksQuery = tasksQuery.limit(Number(limit));  // Apply limit for last 5 tasks

    const tasks = await tasksQuery;
    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};


exports.getTask = async function (req, res) {
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

exports.createSubTask = async function (req, res) {
  try {
    const { title, tag, date } = req.body;

    const id = req.params.tid;
    console.log("tid : ",id)

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

exports.updateTask = async function (req, res) {
    try {
      const id = req.params.tid;
      console.log("tid : ", id);
  
      let { title, team, stage, priority, date } = req.body;
      const assets = req.files ? req.files['assets[]'] : [];  // Handle assets sent via Multer (using the correct field name)
  
      // Parse the 'team' field if it is a stringified array
      if (typeof team === 'string') {
        team = JSON.parse(team);  // Convert the stringified array to a proper array
      }
  
      console.log("Received body: ", { title, team, stage, priority, date });
      console.log("Received files (assets): ", assets);
  
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ status: false, message: "Task not found." });
      }
  
      console.log("Existing assets in task: ", task.assets); // Log existing assets before updating
  
      // Ensure that team is an array
      if (!Array.isArray(team)) {
        return res.status(400).json({ status: false, message: "Team must be an array." });
      }
  
      // Construct notification text
      let text = `Our Task has been updated and assigned to you.`;
      if (team.length > 1) {
        text += ` and ${team.length - 1} others.`;
      }
      text += ` The task priority is set to ${priority} priority. Please check and act accordingly. The task date is ${format(new Date(date), 'MMMM dd, yyyy')}. Thank you!`;
  
      console.log("Notification text constructed:", text);
  
      // Normalize team to ensure it is an array
      const normalizedTeam = Array.isArray(team) ? team : [team];
      console.log("Normalized Team:", normalizedTeam);
  
      // Create notifications for the team
      const notifications = normalizedTeam.map(memberId => ({
        team: memberId,
        text,
        task: task._id,
      }));
      console.log("Notifications to insert:", notifications);
  
      await Notification.insertMany(notifications);
  
      // Initialize updateDataassets to an empty array by default
      let updateDataassets = [];
  
      // Only replace old assets if new ones are uploaded
      if (assets && assets.length > 0) {
        // Map the uploaded files to the `assets` array with only the file paths
        updateDataassets = assets.map(file => file.path);  // Correctly extract file paths
        console.log("Updated assets: ", updateDataassets);  // Log updated assets
      }
  
      // Prepare the update object
      const updateData = {
        title,
        date: new Date(date),
        priority: priority.toLowerCase(),
        stage: stage.toLowerCase(),
        team: normalizedTeam,
        assets: updateDataassets,  // Ensure assets are set here
      };
      console.log("updateData : ", updateData);  // Log the update object
  
      // Use updateOne to replace old assets and update task fields
      const result = await Task.updateOne(
        { _id: id },  // Find task by ID
        { $set: updateData }  // Set new values, including updated assets
      );
  
      // Check if the update was successful
      if (result.nModified === 0) {
        return res.status(400).json({ status: false, message: "No changes were made." });
      }
  
      res.status(200).json({ status: true, message: "Task updated successfully." });
    } catch (error) {
      console.log("Error updating task:", error);
      return res.status(400).json({ status: false, message: error.message });
    }
};

exports.trashTask = async function (req, res) {
  try {
    const id = req.params.tid;

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

exports.deleteRestoreTask = async function (req, res) {
  try {
    const { actionType } = req.query;
    console.log("actiontype : ",actionType)

    if (actionType === "delete") {
      // Find the task by ID
      const task = await Task.findById(req.params.tid);

      if (task) {
        // Find the user associated with this task using originaluserId
        const user = await User.findById(task.originaluserId);

        // If user is found, remove the task ID from their tasks array
        if (user) {
          user.tasks = user.tasks.filter(taskId => taskId.toString() !== task._id.toString());
          await user.save();
        }

        // Delete the task from the database
        await Task.findByIdAndDelete(req.params.tid);

        res.status(200).json({
          status: true,
          message: "Task deleted successfully and removed from user tasks.",
        });
      } else {
        return res.status(404).json({ status: false, message: "Task not found." });
      }
    } else if (actionType === "deleteAll") {
      // Find all tasks marked as deleted (isTrashed: true)
      const tasksToDelete = await Task.find({ isTrashed: true });

      if (tasksToDelete.length === 0) {
        return res.status(404).json({ status: false, message: "No tasks found to delete." });
      }

      // Loop through each task and update the user's tasks array
      for (let task of tasksToDelete) {
        // Find the user who originally created the task
        const user = await User.findById(task.originaluserId);

        if (user) {
          // Remove the task ID from the user's tasks array
          user.tasks = user.tasks.filter(taskId => taskId.toString() !== task._id.toString());
          await user.save();
        }

        // Delete the task
        await Task.findByIdAndDelete(task._id);
      }

      res.status(200).json({
        status: true,
        message: "All trashed tasks deleted successfully and removed from users' tasks.",
      });
    } else if (actionType === "restore") {
      const task = await Task.findById(req.params.tid);

      if (task) {
        task.isTrashed = false;
        await task.save();
        res.status(200).json({
          status: true,
          message: "Task restored successfully.",
        });
      } else {
        return res.status(404).json({ status: false, message: "Task not found." });
      }
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
      res.status(200).json({
        status: true,
        message: "All trashed tasks restored successfully.",
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Invalid action type.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

exports.taskStageUpdate = async function (req, res) {
  try {
    const id = req.params.tid;          
    const { stage } = req.params;

    if (!["todo", "in progress", "completed"].includes(stage)) {
      return res.status(400).json({ message: "Invalid stage value" });
    }

    const task = await Task.findOne({ _id: id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { stage: stage }, 
      { new: true }       
    );

    res.status(200).json({
      message: "Task stage updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task stage:", error);
    res.status(500).json({ message: "An error occurred while updating the task stage" });
  }
};







