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



