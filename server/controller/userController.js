const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require("mongoose");
const User = require('../db/model/user');
const { success_function, error_function } = require('../utils/responsehandler');
const Notification = require('../db/model/notification');
const Task = require('../db/model/task');


exports.registerUser = async function (req, res) {
    try {
        const { name, email, password, isAdmin, role, title } = req.body;

        // Skip registration for admin
        if (email === 'admin@gmail.com') {
            return res.status(400).json({
                status: false,
                message: "Admin user already exists.",
            });
        }

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({
                status: false,
                message: "User already exists",
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            isAdmin,
            role,
            title,
        });

        // Return success response with the user data, excluding the password
        if (user) {
            user.password = undefined; // Ensure the password is not sent in the response
            return res.status(201).json({
                status: true,
                message: "User created successfully",
                user,
            });
        } else {
            return res.status(400).json({
                status: false,
                message: "Failed to create user",
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: false,
            message: error.message,
        });
    }
};

exports.loginUser = async function (req, res) {
    try {
      const { email, password } = req.body;
      console.log("email, pass:", email, password);
  
      const user = await User.findOne({ email });
      console.log("user:", user);
  
      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password.",
        });
      }
  
      console.log('User found, calling matchPassword');
      console.log(user instanceof User);  // Should log true if it's an instance of User
  
      const isMatch = await user.matchPassword(password);
      console.log("ismatch:", isMatch);
  
      if (isMatch) {
        const token = jwt.sign({ user_id: user._id }, process.env.PRIVATE_KEY, { expiresIn: "10d" });
        res.status(200).json({
          status: true,
          message: "Login successful",
          user,
          token,
        });
      } else {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({ status: false, message: error.message });
    }
};
  
exports.getTeamList = async function(req,res) {
  try {

    const users = await User.find().select("name title role email isActive");

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}

exports.getNotificationsList = async function (req, res) {
  try {
    const userId = req.params.id;

    const notices = await Notification.find({
      team: userId,
      isRead: { $nin: [userId] }, // Find notifications where userId is NOT in isRead array
    }).populate("task", "title");

    console.log("Unread notifications:", notices);

    res.status(201).json(notices);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};



