import { useState } from "react";
import { motion } from "framer-motion";
import { Users, User, XCircle, Circle, Edit2, Check, X } from "lucide-react";

const PrayerCard = ({ name, time, status, onStatusChange, isLocked, theme }) => {
  const [isEditing, setIsEditing] = useState(false);

  const statusConfig = {
    jamaat: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Users, label: "Jamaat" },
    individual: { color: "text-blue-400", bg: "bg-blue-500/10", icon: User, label: "Self" },
    missed: { color: "text-rose-400", bg: "bg-rose-500/10", icon: XCircle, label: "Missed" },
    none: { color: "text-slate-500", bg: "bg-white/5", icon: Circle, label: "None" }
  };

  const current = statusConfig[status || 'none'];

  const handleStatusChange = (newStatus) => {
    onStatusChange(newStatus);
    if (newStatus !== 'none' && isEditing) {
      // Logic preserved
    }
  };

  const handleUndo = () => {
    onStatusChange('none');
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative group flex items-center justify-between p-4 rounded-3xl border transition-all
        ${status !== 'none'
          ? (theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-sm')
          : (theme === 'dark' ? 'border-white/5 bg-transparent' : 'border-slate-200 bg-transparent')}
        ${isLocked ? 'opacity-50 grayscale' : ''}
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${current.bg} ${current.color}`}>
          <current.icon size={20} />
        </div>
        <div>
          <h4 className={`text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{name}</h4>
          <p className="text-[10px] font-bold text-slate-500">{time}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {status === 'none' ? (
          // Initial State: Show Options
          ['jamaat', 'individual', 'missed'].map((s) => (
            <button
              key={s}
              disabled={isLocked}
              onClick={() => onStatusChange(s)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border
                ${theme === 'dark' ? 'bg-white/5 text-slate-500 border-transparent hover:border-white/20' : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-slate-300'}
              `}
            >
              {s === 'jamaat' && <Users size={14} />}
              {s === 'individual' && <User size={14} />}
              {s === 'missed' && <XCircle size={14} />}
            </button>
          ))
        ) : (
          // Checked State
          !isEditing ? (
            <>
              <button
                disabled={isLocked}
                onClick={() => setIsEditing(true)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border 
                  ${theme === 'dark' ? 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-100'}
                `}
              >
                <Edit2 size={14} />
              </button>
              <button
                disabled={isLocked}
                onClick={handleUndo}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all border bg-rose-500/10 text-rose-500 border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/20"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              {['jamaat', 'individual', 'missed'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border
                    ${status === s
                      ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-slate-900 text-white border-slate-900')
                      : (theme === 'dark' ? 'bg-white/5 text-slate-500 border-transparent hover:border-white/20' : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-slate-300')}
                  `}
                >
                  {s === 'jamaat' && <Users size={14} />}
                  {s === 'individual' && <User size={14} />}
                  {s === 'missed' && <XCircle size={14} />}
                </button>
              ))}
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all border bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                <Check size={14} />
              </button>
            </>
          )
        )}
      </div>
    </motion.div>
  );
};

export default PrayerCard;