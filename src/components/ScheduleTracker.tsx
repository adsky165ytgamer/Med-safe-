import React from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Bell,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Trash2,
  CalendarCheck,
} from "lucide-react";
import { PillTask, TextSize } from "../types/medicine";
import { playTakePillChime, playReminderBell } from "../utils/audio";

interface ScheduleTrackerProps {
  tasks: PillTask[];
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onClearAll: () => void;
  textSize: TextSize;
  highContrast: boolean;
}

export const ScheduleTracker: React.FC<ScheduleTrackerProps> = ({
  tasks,
  onToggleTask,
  onRemoveTask,
  onClearAll,
  textSize,
  highContrast,
}) => {
  const totalTasks = tasks.length;
  const takenCount = tasks.filter((t) => t.taken).length;
  const progressPercent = totalTasks > 0 ? Math.round((takenCount / totalTasks) * 100) : 0;

  const handleToggle = (taskId: string, currentlyTaken: boolean) => {
    if (!currentlyTaken) {
      playTakePillChime();
    }
    onToggleTask(taskId);
  };

  const getSlotIcon = (timeSlot: string) => {
    switch (timeSlot.toLowerCase()) {
      case "morning":
        return <Sun className="w-5 h-5 text-amber-400" />;
      case "afternoon":
        return <Sun className="w-5 h-5 text-orange-400" />;
      case "evening":
        return <Sunset className="w-5 h-5 text-purple-400" />;
      case "night":
        return <Moon className="w-5 h-5 text-indigo-400" />;
      default:
        return <Clock className="w-5 h-5 text-emerald-400" />;
    }
  };

  const todayDateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`rounded-3xl border transition-all p-6 md:p-8 shadow-2xl ${
        highContrast
          ? "bg-slate-950 border-emerald-400 text-white"
          : "bg-slate-900/80 backdrop-blur-xl border-slate-800 text-slate-100"
      }`}
    >
      {/* Header & Adherence Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              Live Pill Tracker / आज का खुराक शेड्यूल
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1">
            Today's Medicine Schedule ({todayDateStr})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tap "Mark Taken" when medicine has been swallowed with water
          </p>
        </div>

        {/* Adherence & Bell Sound Test */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={playReminderBell}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all"
            title="Listen to reminder bell sound"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Test Bell Sound</span>
          </button>

          {tasks.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-semibold transition-all"
              title="Clear all tasks"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Daily Progress Tracker */}
      {totalTasks > 0 && (
        <div className="my-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>Today's Adherence: {takenCount} of {totalTasks} Doses Taken</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {progressPercent === 100
                ? "🎉 All medicines taken on time today! Great job."
                : `${totalTasks - takenCount} dose${totalTasks - takenCount > 1 ? "s" : ""} remaining for today`}
            </div>
          </div>

          <div className="w-full sm:w-48 flex items-center gap-3">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-sm font-extrabold text-emerald-400 shrink-0">
              {progressPercent}%
            </span>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3 mt-4">
        {tasks.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-white">No Medicines Scheduled for Today</h3>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Scan a medicine label or select a sample medicine above, then click <strong>"Add to Daily Schedule"</strong> to track doses here.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 md:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                task.taken
                  ? "bg-emerald-950/20 border-emerald-500/40 opacity-80"
                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getSlotIcon(task.timeSlot)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-extrabold text-sm md:text-base tracking-wide">
                      {task.time}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {task.label}
                    </span>
                  </div>
                  <h4 className="text-base md:text-lg font-bold text-white mt-0.5">
                    {task.medicineName}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 font-medium mt-0.5">
                    {task.instruction}
                  </p>
                  {task.taken && task.takenAt && (
                    <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Taken today at {task.takenAt}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggle(task.id, task.taken)}
                  className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-extrabold flex items-center gap-2 transition-all shadow-md ${
                    task.taken
                      ? "bg-emerald-500 text-slate-950 shadow-emerald-900/40"
                      : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {task.taken ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      <span>✅ Taken</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-emerald-400" />
                      <span>Mark Taken</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveTask(task.id)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-800 transition-all"
                  title="Remove Dose"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
