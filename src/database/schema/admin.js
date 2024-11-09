const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'fieldsalesagents', 'salessupervisors', 'businessmanager'], // Define available roles
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('AdminUsers', UserSchema);
