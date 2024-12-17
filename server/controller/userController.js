const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require("mongoose");
const User = require('../db/model/user');
const { success_function, error_function } = require('../utils/responsehandler');
const Notification = require('../db/model/notification');
const set_register_template = require("../utils/emailTemplates/registerDetails").registerdetails;
const sendEmail = require("../utils/send-email").sendEmail;


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
      // const email_template = await set_register_template(name, email, password);
      // await sendEmail(email, "User created", email_template);
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      const token = jwt.sign({ user_id: user._id }, process.env.PRIVATE_KEY, { expiresIn: "10d" });
      console.log("token  ",token)
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

exports.getTeamList = async function (req, res) {
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

exports.updateUserProfile = async function (req, res) {
  try {
    const userId = req.params.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID.",
      });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (user) {
      // Only update fields that are passed in the request body
      user.name = req.body.name || user.name;
      user.title = req.body.title || user.title;
      user.role = req.body.role || user.role;

      // Save the updated user profile
      const updatedUser = await user.save();

      // Ensure password is not included in the response
      updatedUser.password = undefined;

      // Return the updated profile
      res.status(200).json({
        status: true,
        message: "Profile Updated Successfully.",
        user: updatedUser,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found." });
    }
  } catch (error) {
    console.error(error);  // Log the error for debugging purposes
    return res.status(500).json({
      status: false,
      message: error.message || "An unexpected error occurred while updating the profile.",
    });
  }
};

exports.markNotificationRead = async function (req, res) {
  try {
    const userId = req.params.id;
    const notificationId = req.params.nid;
    const isReadType = req.query.all;
    console.log("isRead : ", isReadType)

    if (isReadType === "true") {
      // Mark all notifications as read
      await Notification.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      // Mark a single notification as read
      await Notification.findOneAndUpdate(
        { _id: notificationId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    }

    res.status(201).json({ status: true, message: "Notifications updated successfully" });
  } catch (error) {
    console.error("Error in marking notification as read:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
};


exports.changeUserPassword = async function (req, res) {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (user) {
      user.password = req.body.newPassword;;

      await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: `Password chnaged successfully.`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}

exports.activateUserProfile = async function (req, res) {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (user) {
      user.isActive = !user.isActive;

      await user.save();

      res.status(200).json({
        status: true,
        message: `User account has been ${user.isActive ? "activated" : "deactivated"}.`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    // Catch and log any errors
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

exports.deleteUserProfile = async function (req, res) {
  try {
    const id = req.params.id;

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}

exports.getuser = async function (req, res) {
  try {
    const id = req.params.id;
    console.log("id : ", id)

    // If id is null or undefined, fetch all users
    if (id === 'null') {
      const users = await User.find();  // Fetch all users
      return res.status(200).json(users);
    }

    // Check if the provided id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Fetch user by ID
    const user = await User.findOne({ _id: id });

    // Check if user is found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user details in the response
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};




