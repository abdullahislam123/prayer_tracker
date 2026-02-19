const mongoose = require('mongoose');

const UserSettingSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Firebase UID
  isShareEnabled: { type: Boolean, default: false } // Cloud synced preference
});

module.exports = mongoose.model('UserSetting', UserSettingSchema);