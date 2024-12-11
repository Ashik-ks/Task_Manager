const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../model/user'); // Adjust path as needed

module.exports = {
  up: async (models, mongoose) => {
    try {
      // Check if the admin already exists
      const adminExists = await User.findOne({ email: 'admin@gmail.com' });
      if (adminExists) {
        console.log('Admin user already exists.');
        return;
      }

      // const hashedPassword = await bcrypt.hash('admin#123', 10);

      // Create and insert the admin user
      await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: "admin#123",
        isAdmin: true,
        role: 'Admin',
        title: 'System Administrator',
        isActive: true
      });

      console.log('Admin user seeded successfully.');
    } catch (error) {
      console.error('Error seeding admin user:', error);
    }
  },

  down: async (models, mongoose) => {
    try {
      // Remove the admin user by email
      const result = await User.deleteOne({ email: 'admin@gmail.com' });
      if (result.deletedCount > 0) {
        console.log('Admin user deleted successfully.');
      } else {
        console.log('No admin user found to delete.');
      }
    } catch (error) {
      console.error('Error deleting admin user:', error);
    }
  },
};
