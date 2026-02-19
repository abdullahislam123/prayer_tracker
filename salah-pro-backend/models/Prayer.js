const mongoose = require('mongoose');

const PrayerSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  date: { type: String, required: true },   // Format: yyyy-MM-dd
  prayers: [{
    _id: false,
    id: Number,
    name: String,
    time: String,
    status: { type: String, default: 'none' } // jamaat, individual, missed, none
  }]
});

// Compound Index taake aik user aik date par aik hi record rakh sakay
PrayerSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Prayer', PrayerSchema);