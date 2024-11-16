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

app.use(cors({
    origin: ['https://www.humandiagram.com', "http://localhost:3000"], // Specify the exact domain instead of '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // if you need to allow cookies
  }));

// Routes
app.use('/admin', admin);



// Start the server
app.listen(PORT, () => console.log(`Running express server on ${PORT}`));
