import { useState } from "react";
import { updatePassword } from "firebase/auth";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ShieldCheck, KeyRound, CheckCircle2,
  AlertCircle, Share2, Sparkles
} from "lucide-react";

// toggleShareFeature prop add kiya gaya hai backend sync ke liye
const Profile = ({ user, onBack, isShareEnabled, toggleShareFeature, theme }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    if (!strongPassword.test(newPassword)) {
      setStatus({ type: "error", msg: "Password mein Upper, Lower aur Number hona lazmi hai (Min 8)." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", msg: "Passwords match nahi kar rahay!" });
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      setStatus({ type: "success", msg: "Credentials updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatus({ type: "error", msg: "Security Alert: Dubara login kar ke try karein." });
    }
  };

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      className="p-6 md:p-12 flex flex-col items-center min-h-screen w-full selection:bg-emerald-500/30"
    >
      <div className="w-full max-w-md">
        {/* Navigation */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 mb-8 transition-all group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Dashboard</span>
        </button>

        {/* User Identity Card */}
        <div className={`border rounded-[2.5rem] p-8 mb-6 text-center relative overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-100 shadow-slate-200'}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-full flex items-center justify-center text-[#020617] text-4xl font-black shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toLowerCase()}
            </div>
            <div className={`absolute -bottom-1 -right-1 p-2 border rounded-full ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-white border-slate-100'}`}>
              <Sparkles size={14} className="text-emerald-400" />
            </div>
          </div>

          <h2 className={`text-2xl font-black tracking-tighter leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {user.displayName || user.email.split('@')[0]}
          </h2>
          <p className="text-[10px] font-bold text-slate-500 lowercase tracking-widest mt-1">{user.email}</p>

          <div className="mt-6 flex justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Verified Pro</span>
            </div>
          </div>
        </div>

        {/* --- Feature Management (Cloud Synced Toggle) --- */}
        <div className={`border rounded-[2.5rem] p-8 backdrop-blur-3xl mb-6 shadow-xl relative group ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100 shadow-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Parental Reporting</h3>
                <p className="text-[8px] font-bold text-emerald-500/60 uppercase mt-0.5">Cloud Synced</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => toggleShareFeature(!isShareEnabled)}
              className={`w-14 h-7 rounded-full transition-all relative outline-none ring-offset-2 focus:ring-2 ring-emerald-500/50 ${theme === 'dark' ? 'ring-offset-[#020617]' : 'ring-offset-white'} ${isShareEnabled ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : (theme === 'dark' ? 'bg-white/10' : 'bg-slate-200')}`}
            >
              <motion.div
                animate={{ x: isShareEnabled ? 30 : 4 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
          <p className={`text-[10px] font-medium leading-relaxed italic border-t pt-4 ${theme === 'dark' ? 'text-slate-500 border-white/5' : 'text-slate-400 border-slate-100'}`}>
            Jab ye ON hoga, toh aapka "Copy Report" button har device par nazar aayega jahan se aap login karenge.
          </p>
        </div>

        {/* Security Update Form */}
        <div className={`border rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-xl relative ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100 shadow-slate-200'}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-500"><KeyRound size={20} /></div>
            <h3 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Update Credentials</h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-4 block text-left">New Password</label>
              <input
                type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full border rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/40 transition-all font-mono ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white focus:bg-white/[0.08]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-4 block text-left">Confirm Password</label>
              <input
                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full border rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/40 transition-all font-mono ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white focus:bg-white/[0.08]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                placeholder="••••••••"
              />
            </div>

            <AnimatePresence>
              {status.msg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center gap-2 p-4 rounded-2xl text-[10px] font-bold ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
                >
                  {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {status.msg}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className={`w-full py-4.5 font-black rounded-2xl hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/40 uppercase tracking-widest text-[11px] ${theme === 'dark' ? 'bg-white text-[#020617]' : 'bg-slate-900 text-white hover:text-white'}`}>
              Save New Security Key
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;