const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- 📂 Models Import ---
const Prayer = require('./models/Prayer');
const UserSetting = require('./models/UserSetting');
const LoginLog = require('./models/LoginLog');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// --- 🔥 MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 Connected to MongoDB: salah_pro-db"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// --- 👤 USER SYNC ROUTE (Firebase to MongoDB) ---
app.post('/api/users/sync', async (req, res) => {
  const { userId, email, displayName } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { userId },
      {
        email,
        displayName,
        lastLogin: new Date()
      },
      // 'new: true' ki jagah 'returnDocument: after' use kiya hai warning se bachne ke liye
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    res.json(user);
  } catch (err) {
    console.error("User Sync Error:", err);
    res.status(500).json({ error: "User sync failed" });
  }
});

// --- 🛡️ AUTH LOGGING ROUTE ---
app.post('/api/logs/login', async (req, res) => {
  const { email, date, time } = req.body;
  try {
    const newLog = new LoginLog({ email, loginDate: date, loginTime: time });
    await newLog.save();
    console.log(`👤 New Login: ${email} at ${time}`);
    res.json({ success: true, message: "Login logged successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logging failed" });
  }
});

// --- 📊 ADMIN ANALYTICS ROUTES ---

// Total users aur aaj ke active users show karne ke liye
app.get('/api/admin/stats', async (req, res) => {
  try {
    // 🔢 MongoDB se total users ki ginti
    const total = await User.countDocuments();

    // 🕒 Aaj ki date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 🎯 Un unique users ki ginti jinhon ne aaj namaz mark ki
    const activeToday = await Prayer.distinct('userId', { date: today });

    res.json({
      totalUsers: total,
      activeToday: activeToday.length
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: "Stats load nahi ho sakay" });
  }
});

// Aakhri 5 login activities
// index.js mein check karein
app.get('/api/admin/recent-activity', async (req, res) => {
  try {
    // Aakhri 5 logins nikalna (sort by newest first)
    const logs = await LoginLog.find().sort({ _id: -1 }).limit(5);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Logs load nahi ho sakay" });
  }
});

// --- 🕌 PRAYER DATA ROUTES ---

app.get('/api/history/:userId', async (req, res) => {
  try {
    const history = await Prayer.find({ userId: req.params.userId });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "History load failed" });
  }
});

app.post('/api/save', async (req, res) => {
  const { userId, date, prayers } = req.body;
  try {
    const record = await Prayer.findOneAndUpdate(
      { userId, date },
      { prayers },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: "Save operation failed" });
  }
});

// --- ⚙️ SETTINGS ROUTES ---

app.get('/api/settings/:userId', async (req, res) => {
  try {
    const settings = await UserSetting.findOne({ userId: req.params.userId });
    res.json(settings || { isShareEnabled: false });
  } catch (err) {
    res.status(500).json({ error: "Settings fetch failed" });
  }
});

app.post('/api/settings', async (req, res) => {
  const { userId, isShareEnabled } = req.body;
  try {
    const updated = await UserSetting.findOneAndUpdate(
      { userId },
      { isShareEnabled },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Cloud sync failed" });
  }
});


// index.js mein ye updated stats route add karein
app.get('/api/admin/detailed-stats', async (req, res) => {
  try {
    const allUsers = await User.find().sort({ lastLogin: -1 }); // Sab users (Latest login pehle)

    // 🔥 "Active Now" logic: Woh users jinhon ne pichlay 5 mins mein login/sync kiya
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await User.find({ lastLogin: { $gte: fiveMinsAgo } });

    res.json({
      totalCount: allUsers.length,
      onlineCount: onlineUsers.length,
      allUsers,     // List of all user objects
      onlineUsers   // List of currently active user objects
    });
  } catch (err) {
    res.status(500).json({ error: "Data fetch failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));