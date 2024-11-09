const express = require("express");
const cors = require('cors'); // For enabling CORS
require("./database/index"); // Database setup

// Importing routes
const admin = require("./route/admin")


const app = express();
const PORT = 3005;

// For parsing application/json
app.use(express.json()); 

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Allow CORS for any origin
app.use(cors({
  origin: '*',  // Allows all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', "PATCH"], // Optionally specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Optionally specify allowed headers
}));

// Routes
app.use('/admin', admin);



// Start the server
app.listen(PORT, () => console.log(`Running express server on ${PORT}`));
