const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  loginDate: { type: String, required: true }, // Date
  loginTime: { type: String, required: true }, // Time
  method: { type: String, default: 'Google' }  // Auth Method
});

module.exports = mongoose.model('LoginLog', LoginLogSchema);