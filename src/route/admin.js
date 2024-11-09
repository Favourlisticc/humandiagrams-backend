const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
const Admin = require("../database/schema/admin")


router.post('/signup', async (req, res) => {
    const { firstName, lastName, role, email, password } = req.body;
    console.log(req.body)
  
    try {
      // Check if user already exists
      let admin = await Admin.findOne({ email });
      if (admin) {
        console.log("User already exists")
        return res.status(400).json({ msg: 'User already exists' });
      }
  
      // Create a new user
      admin = new Admin({
        firstName,
        lastName,
        role,
        email,
        password: await bcrypt.hash(password, 10) // Hash the password
      });
  
      // Save the user to the database
      await admin.save();
  
      // Create a JWT token for the user
      const payload = { adminId: admin.id, role: admin.role };
      const token = jwt.sign(payload, "e6bf7b1a8266f4f6dd1acdcb03091dae3d4179bb2bad87a68942f69b4cc75b89b79f8e8c918ee78da555efe6ffa28bdc5f07c9ebb79171c68846a8fdb121947a", { expiresIn: '5h' });
  
      // Send user details and token back to the frontend
      res.status(201).json({ token, msg: 'User registered successfully', admin });
      console.log(token, admin);
    } catch (error) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  });
  
  // POST: Login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)
  
    try {
      // Check if the user exists
      const user = await Admin.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // If credentials are correct, generate a JWT token and send role
      const token = jwt.sign(
        { id: user._id, role: user.role },
        "e6bf7b1a8266f4f6dd1acdcb03091dae3d4179bb2bad87a68942f69b4cc75b89b79f8e8c918ee78da555efe6ffa28bdc5f07c9ebb79171c68846a8fdb121947a",
        { expiresIn: '1h' } // Token expiry time
      );
  
      // Respond with the token and user role
      res.status(200).json({
        token,
        role: user.role, // Send the role back to the frontend
        user
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  module.exports = router;