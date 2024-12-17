const PersonalTask = require('../db/model/personalTask');
const set_reminder_template = require("../utils/emailTemplates/reminder").scheduleReminder;
const sendEmail = require("../utils/send-email").sendEmail;
const User = require('../db/model/user');
const schedule = require('node-schedule');


exports.addPersonalTask = async function (req, res) {
    try {
        const userId = req.params.id;

        const { title, description, priority, stage, dueDate, notes } = req.body;

        const addTask = await PersonalTask.create({
            userId,
            title,
            description,
            priority,
            stage,
            dueDate,
            notes,
        });

        res.status(201).json({
            message: 'Personal task added successfully',
            task: addTask,
        });
    } catch (error) {
        console.error('Error adding personal task:', error);

        res.status(500).json({
            message: 'Failed to add personal task',
            error: error.message,
        });
    }
};

exports.updatePersonalTask = async function (req, res) {
    try {
      // Extract the task ID from the request parameters
      const taskId = req.params.ptid;
  
      // Create an update object dynamically based on the request body
      const updateData = {};
      const { title, priority, description, stage, note } = req.body;
  
      if (title) updateData.title = title;
      if (priority) updateData.priority = priority;
      if (description) updateData.description = description;
      if (stage) updateData.stage = stage;
  
      // Replace the old notes with the new note if provided
      if (note) {
        updateData.notes = [{ note, createdAt: new Date() }];
      }
  
      // Check if there's something to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          message: 'No fields provided for update',
        });
      }
  
      // Find the task by ID and update the fields
      const updatedTask = await PersonalTask.findByIdAndUpdate(
        taskId,
        updateData,
        { new: true, runValidators: true } // Return updated document and validate inputs
      );
  
      // If the task doesn't exist, return a 404 error
      if (!updatedTask) {
        return res.status(404).json({
          message: 'Personal task not found',
        });
      }
  
      // Return the updated task
      res.status(200).json({
        message: 'Personal task updated successfully',
        task: updatedTask,
      });
    } catch (error) {
      console.error('Error updating personal task:', error);
  
      // Handle any errors and return a 500 status
      res.status(500).json({
        message: 'Failed to update personal task',
        error: error.message,
      });
    }
};

exports.deletePersonalTask = async function(req,res){
    try {
        let task_Id = req.params.ptid

    let deletetask = await PersonalTask.deleteOne({_id : task_Id})
    if(deletetask){
        res.status(200).json({
            message: 'Personal task deleted successfully',
            task: deletetask,
          });
    }else{
        res.status(400).json({
            message: 'Personal task deleted Unsuccessfully',
          });
    }
    } catch (error) {
        res.status(400).json({
            message: 'Personal task deleted Unsuccessfully',
          });
        console.log("error: ",error)
    }
}

exports.getAllPersonalTasks = async function(req,res){

   try {

    let id = req.params.id
    let alltasks = await PersonalTask.find({ userId: id});
    if(alltasks){
        res.status(200).json({
            message: 'All Personal task fetched successfully',
            task: alltasks,
          });
    }else{
        res.status(400).json({
            message: 'All Personal task fetched Unsuccessfully',
            task: alltasks,
          });
    }
   } catch (error) {
    console.log("error : ",error)
   }
}

exports.archivePersonalTask = async function (req, res) {
    try {
      const taskId = req.params.ptid; // Task ID from request params
  
      // Find the task by ID
      const task = await PersonalTask.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Personal task not found' });
      }
  
      // Toggle the isArchived field
      task.isArchived = !task.isArchived; // If it is archived, unarchive it, and vice versa
  
      // Save the updated task
      await task.save();
  
      res.status(200).json({
        message: task.isArchived ? 'Task archived successfully' : 'Task unarchived successfully',
        task,
      });
    } catch (error) {
      console.error('Error archiving task:', error);
      res.status(500).json({
        message: 'Failed to archive task',
        error: error.message,
      });
    }
};

exports.getArchivedPersonalTasks = async function (req, res) {
    try {
      let user_Id = req.params.id;
  
      const tasks = await PersonalTask.find({ 
        userId: user_Id, 
        isArchived: true 
      });
  
      if (!tasks.length) {
        return res.status(404).json({ message: 'No archived tasks found for this user' });
      }
  
      res.status(200).json({ message: 'Archived tasks fetched successfully', tasks });
    } catch (error) {
      console.error('Error fetching archived tasks:', error);
      res.status(500).json({ message: 'Failed to fetch archived tasks', error: error.message });
    }
};

exports.setReminder = async function (req, res) {
    try {
      const taskId = req.params.ptid;
      const reminder = req.body.reminder; // Reminder date from request body
  
      // Validate reminder date
      if (!reminder) {
        return res.status(400).json({ message: 'Reminder date is required' });
      }
  
      let reminderDate = new Date(reminder); // Convert reminder to Date object
  
      // Ensure the reminder date is valid
      if (isNaN(reminderDate.getTime())) {
        return res.status(400).json({ message: 'Invalid reminder date format' });
      }
  
      // Check if reminder date is in the future
      if (reminderDate < new Date()) {
        return res.status(400).json({ message: 'Reminder date must be in the future' });
      }
  
      // Convert reminder date to UTC
      reminderDate = new Date(reminderDate.toISOString());
  
      // Update the task with the reminder date
      const updatedTask = await PersonalTask.findByIdAndUpdate(
        taskId,
        { reminder: reminderDate },
        { new: true, runValidators: true }
      );
  
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Fetch user details using the userId from the task
      const user = await User.findById(updatedTask.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Prepare email template with task and user details
      const email_template = await set_reminder_template(
        updatedTask.title,
        updatedTask.description,
        updatedTask.dueDate,
        user.name,
        user.email
      );
  
      // Schedule email reminder using node-schedule with reminder date and time
    //   schedule.scheduleJob(reminderDate, async () => {
    //     console.log(`Sending email reminder for task: ${updatedTask.title} to ${user.email}`);
  
    //     try {
    //       // Send the reminder email at the scheduled time
    //       await sendEmail(user.email, "Task Reminder", email_template);
    //       console.log('Email sent successfully');
    //     } catch (emailError) {
    //       console.error('Error sending email:', emailError);
    //     }
    //   });
  
      res.status(200).json({
        message: 'Reminder set successfully',
        task: updatedTask,
      });
    } catch (error) {
      console.error('Error setting reminder:', error);
      res.status(500).json({ message: 'Failed to set reminder', error: error.message });
    }
};
  
//star and unstar 
