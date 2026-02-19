import { useState, useEffect } from "react";
import {
  signInWithPopup, onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LogOut, LayoutDashboard, CloudIcon, Share2, ClipboardCheck,
  Sparkles, BarChart3, Activity, Clock, Sun, Moon, Users, Globe, ChevronRight
} from "lucide-react";

// Components Import
import Calendar from "./components/Calendar";
import PrayerCard from "./components/PrayerCard";
import Profile from "./components/Profile";
import Auth from "./components/Auth";

const initialPrayers = [
  { id: 1, name: "Fajr", time: "05:15 AM" },
  { id: 2, name: "Dhuhr", time: "01:15 PM" },
  { id: 3, name: "Asr", time: "04:30 PM" },
  { id: 4, name: "Maghrib", time: "06:10 PM" },
  { id: 5, name: "Isha", time: "07:45 PM" },
];

const API_URL = "http://localhost:5000/api";
const ADMIN_EMAIL = "contactabdullahislam@gmail.com";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isShareEnabled, setIsShareEnabled] = useState(false);

  // Admin Private States
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, activeToday: 0 });
  const [recentLogs, setRecentLogs] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [history, setHistory] = useState({});

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHistoryFromMongo(currentUser.uid);
        fetchSettingsFromMongo(currentUser.uid);
        syncUserToMongo(currentUser);
        if (currentUser.email === ADMIN_EMAIL) {
          fetchAdminStats();
          fetchRecentActivity();
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 📈 Data Logic (Sync, Stats, Logs) ---
  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`);
      const data = await res.json();
      setAdminStats(data);
    } catch (err) { console.error("Stats Error"); }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/recent-activity`);
      const data = await res.json();
      setRecentLogs(data);
    } catch (err) { console.error("Logs Error"); }
  };

  const syncUserToMongo = async (fbUser) => {
    try {
      await fetch(`${API_URL}/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email.split('@')[0]
        })
      });
    } catch (err) { console.error("Sync Error"); }
  };

  const handleLogin = async () => {
    // Small delay to ensure auth state propogates if needed, 
    // though firebase auth.currentUser should be set by the time await finishes in Auth.
    const currentUser = auth.currentUser;
    if (currentUser) {
      await syncUserToMongo(currentUser); // Ensure sync happens on explicit login
      try {
        await fetch(`${API_URL}/logs/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser.email,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
          })
        });
      } catch (err) { console.error("Log login failed"); }
    }
  };

  const updatePrayerStatus = async (id, newStatus) => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const currentDayPrayers = history[dateKey] || initialPrayers.map(p => ({ ...p, status: 'none' }));
    const updated = currentDayPrayers.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setHistory(prev => ({ ...prev, [dateKey]: updated }));
    if (user) {
      setIsSyncing(true);
      try {
        await fetch(`${API_URL}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, date: dateKey, prayers: updated })
        });
      } finally { setIsSyncing(false); }
    }
  };

  const fetchHistoryFromMongo = async (uid) => {
    setIsSyncing(true);
    try {
      console.log("Fetching history for:", uid);
      const res = await fetch(`${API_URL}/history/${uid}`);
      const data = await res.json();
      console.log("Fetched history:", data);
      const cloudData = {};
      data.forEach(entry => { cloudData[entry.date] = entry.prayers; });
      setHistory(cloudData);
    } catch (err) {
      console.error("Fetch History Error:", err);
    } finally { setIsSyncing(false); }
  };

  const fetchSettingsFromMongo = async (uid) => {
    try {
      const res = await fetch(`${API_URL}/settings/${uid}`);
      const data = await res.json();
      setIsShareEnabled(data.isShareEnabled);
    } catch (err) { console.warn("Settings fetch error"); }
  };

  const toggleShareFeature = async (newValue) => {
    setIsShareEnabled(newValue);
    if (user) {
      setIsSyncing(true);
      try {
        await fetch(`${API_URL}/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, isShareEnabled: newValue })
        });
      } finally { setIsSyncing(false); }
    }
  };

  const handleShare = async () => {
    const dateKey = format(selectedDate, "eeee, MMM do");
    const dbKey = format(selectedDate, "yyyy-MM-dd");
    const prayers = history[dbKey] || initialPrayers.map(p => ({ ...p, status: 'none' }));
    let text = `Salaam, today's Salah Report for ${dateKey}:\n\n`;
    prayers.forEach(p => {
      const icon = p.status === 'jamaat' ? '✅' : p.status === 'individual' ? '👤' : p.status === 'missed' ? '❌' : '⚪';
      text += `🔹 *${p.name}:* ${icon} (${p.status || 'None'})\n`;
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      if (navigator.share) await navigator.share({ title: 'Salah Report', text });
    } catch (err) { console.error("Share failed"); }
  };

  if (isLoading) return (
    <div className={`h-screen flex items-center justify-center transition-colors duration-1000 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-[#F8FAFC]'}`}>
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="text-emerald-500 font-black tracking-[0.5em] uppercase italic text-xs">Synchronizing...</motion.div>
    </div>
  );

  if (!user) return <Auth theme={theme} onSuccess={handleLogin} />;

  const currentPrayers = history[format(selectedDate, "yyyy-MM-dd")] || initialPrayers.map(p => ({ ...p, status: 'none' }));
  const progress = currentPrayers.filter(p => p.status === 'jamaat' || p.status === 'individual').length * 20;

  return (
    <div className={`min-h-screen transition-all duration-700 pb-16 ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-[#F8FAFC] text-slate-800'}`}>

      {/* 🌓 Minimalist Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className={`fixed bottom-10 right-10 p-5 rounded-[2rem] shadow-2xl z-50 transition-all border ${theme === 'dark' ? 'bg-white text-black border-white/20' : 'bg-slate-900 text-white border-slate-700'}`}
      >
        {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
      </motion.button>

      <AnimatePresence mode="wait">
        {view === "dashboard" ? (
          <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-12 flex flex-col items-center space-y-16">

            {/* 🛡️ OWNER INSIGHTS (Glassmorphism Light Mode) */}
            {user.email === ADMIN_EMAIL && (
              <div className="w-full max-w-2xl space-y-8">
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={`p-10 border rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20' : 'bg-white border-indigo-50 shadow-indigo-100/40'}`}>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em]">Cloud Analytics</h4>
                      <div className="flex items-baseline gap-3 mt-2">
                        <p className={`text-6xl font-black tabular-nums tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{adminStats.totalUsers}</p>
                        <span className="text-[12px] font-bold text-slate-400 uppercase">Members</span>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 p-4 rounded-[1.5rem] border border-emerald-500/20 text-right">
                      <div className="flex items-center justify-end gap-2 text-emerald-500 font-black text-3xl tabular-nums">
                        <Globe size={24} /> {adminStats.activeToday}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Activity</p>
                    </div>
                  </div>

                  {/* Activity Feed Trigger */}
                  <div className="mt-10 space-y-4">
                    <div className="flex items-center gap-3 px-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
                      <Activity size={14} className="text-emerald-500" /> Recent Cloud Handshakes
                    </div>
                    <div className="max-h-52 overflow-y-auto pr-3 space-y-3 custom-scrollbar">
                      {recentLogs.map((log, i) => (
                        <div key={i} className={`p-5 rounded-3xl flex justify-between items-center transition-all border ${theme === 'dark' ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200'}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                            <p className={`text-[12px] font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{log.email}</p>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 tabular-nums uppercase">{log.loginTime}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Main Navigation Pill */}
            <div className={`w-full max-w-2xl flex justify-between items-center p-4 rounded-[2.5rem] border shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-100'}`}>
              <button onClick={() => setView("profile")} className="flex items-center gap-4 ml-2 group">
                <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-lg group-hover:rotate-6 transition-all">
                  {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <span className={`block text-[12px] font-black uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.displayName || "Dashboard"}</span>
                  <span className="block text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{user.email}</span>
                </div>
              </button>
              <div className="flex items-center gap-4 mr-2">
                <div className={`p-2.5 rounded-xl ${isSyncing ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' : 'bg-slate-500/5 text-slate-400'}`}><CloudIcon size={20} /></div>
                <button onClick={() => signOut(auth)} className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-md"><LogOut size={20} /></button>
              </div>
            </div>

            {/* Title & Glowing Progress Bar */}
            <div className="w-full max-w-2xl space-y-10">
              <div className="flex justify-between items-end px-6">
                <div className="space-y-2">
                  <h1 className={`text-8xl font-black italic tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>SALAH <span className="text-emerald-500">PRO</span></h1>
                  <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">{format(selectedDate, "eeee, MMM do")}</p>
                </div>
                <div className="text-8xl font-black text-emerald-500 tabular-nums drop-shadow-2xl">{progress}%</div>
              </div>
              <div className={`w-full h-6 rounded-full p-1.5 border shadow-inner overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-200 border-slate-300'}`}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 shadow-[0_0_30px_rgba(16,185,129,0.4)]" />
              </div>
            </div>

            <Calendar selectedDate={selectedDate} onDateClick={setSelectedDate} history={history} theme={theme} />

            {/* Checkbox Checklist Section */}
            <motion.div className={`w-full max-w-2xl space-y-8 p-12 rounded-[5rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.1)] relative overflow-hidden border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100 shadow-slate-200'}`}>
              <div className="flex justify-between items-center relative z-10 mb-2">
                <h3 className={`text-[13px] font-black uppercase tracking-[0.4em] flex items-center gap-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><LayoutDashboard size={20} className="text-emerald-500" /> Spiritual Pulse</h3>
                {isShareEnabled && (
                  <button onClick={handleShare} className={`px-8 py-4 rounded-3xl border transition-all flex items-center gap-3 group font-black uppercase text-[11px] tracking-widest shadow-lg ${copySuccess ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white hover:scale-105'}`}>
                    {copySuccess ? <ClipboardCheck size={20} /> : <Share2 size={20} />} {copySuccess ? "Copied" : "Share"}
                  </button>
                )}
              </div>
              <div className="space-y-6 relative z-10">
                {currentPrayers.map((prayer) => (
                  <PrayerCard key={prayer.id} {...prayer} status={currentPrayers.find(p => p.id === prayer.id)?.status || 'none'} onStatusChange={(newStatus) => updatePrayerStatus(prayer.id, newStatus)} theme={theme} />
                ))}
              </div>
            </motion.div>

          </motion.div>
        ) : (
          <Profile user={user} onBack={() => setView("dashboard")} isShareEnabled={isShareEnabled} toggleShareFeature={toggleShareFeature} theme={theme} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;