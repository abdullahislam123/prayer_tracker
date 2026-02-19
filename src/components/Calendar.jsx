import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth } from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const Calendar = ({ selectedDate, onDateClick, history, theme }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => (
    <div className={`flex justify-between items-center mb-6 px-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <h2 className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {format(currentMonth, "MMMM yyyy")}
      </h2>
      <div className="flex gap-2">
        <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(d => (
          <div key={d} className={`text-[10px] font-black uppercase text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{d}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    const baseCellClass = "relative h-12 flex flex-col items-center justify-center cursor-pointer rounded-2xl transition-all";
    const inactiveClass = "pointer-events-none opacity-30";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dateKey = format(cloneDay, "yyyy-MM-dd");
        const isCompleted = history[dateKey]?.filter(p => p.status === 'jamaat' || p.status === 'individual').length === 5;
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        let textColorClass = "";

        if (theme === 'dark') {
          textColorClass = isSelected
            ? "!text-emerald-400"
            : (isCurrentMonth ? "text-slate-300" : "text-slate-700");
        } else {
          textColorClass = isSelected
            ? "!text-emerald-600"
            : (isCurrentMonth ? "text-slate-700" : "text-slate-300");
        }

        const bgClass = isSelected
          ? (theme === 'dark' ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-emerald-100 border border-emerald-300")
          : (theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-50");

        days.push(
          <motion.div
            key={day}
            whileTap={{ scale: 0.95 }}
            className={`${baseCellClass} ${!isCurrentMonth ? inactiveClass : ""} ${bgClass} ${textColorClass} ${isSelected ? "font-bold" : ""}`}
            onClick={() => onDateClick(cloneDay)}
          >
            <span className="text-xs">{format(day, "d")}</span>
            {isCompleted && (
              <div className="absolute bottom-1.5 w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
          </motion.div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 gap-1" key={day}>{days}</div>);
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className={`w-full max-w-md border p-4 rounded-[2.5rem] backdrop-blur-md ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-100'}`}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;