import { useEffect, useRef, useState } from "react";
import logo from "../assets/kairo-logo.png";

const STORAGE_KEY = "kairo-data";

export default function Timer() {
  const DURATIONS = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  };

  const [mode, setMode] = useState("work");

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved).sessions || [];
    } catch {
      return [];
    }
  });

  const [task, setTask] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return "";
    try {
      return JSON.parse(saved).task || "";
    } catch {
      return "";
    }
  });

  const [time, setTime] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  const progress = time / DURATIONS[mode];
  const strokeDashoffset = circumference * (1 - progress);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 🔔 Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // ⏱ Timer logic
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);

          // 🔊 Play sound
          audioRef.current?.play();

          // 🔔 Notification
          if (Notification.permission === "granted") {
            new Notification("Kairo", {
              body:
                mode === "work"
                  ? "Focus session complete 🎯"
                  : "Break finished 💪",
            });
          }

          // ✅ Log session
          if (mode === "work" && task.trim()) {
            setSessions((prevSessions) => [
              {
                id: Date.now(),
                task: task.trim(),
                duration: DURATIONS.work,
                createdAt: new Date().toISOString(),
              },
              ...prevSessions,
            ]);
          }

          setTask("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, task, mode]);

  // 💾 Save
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sessions, task })
    );
  }, [sessions, task]);

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setTime(DURATIONS[mode]);
    setIsRunning(false);
  };

  const handleModeChange = (newMode) => {
    clearInterval(intervalRef.current);
    setMode(newMode);
    setTime(DURATIONS[newMode]);
    setIsRunning(false);
  };

  // 💧 Ripple effect
  const createRipple = (e) => {
    const button = e.currentTarget;
    const circle = document.createElement("span");

    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();

    button.appendChild(circle);
  };

  const today = new Date().toDateString();
  const todaysSessions = sessions.filter(
    (s) => new Date(s.createdAt).toDateString() === today
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0D1117] text-white px-4">
      
      {/* 🔊 Audio */}
      <audio ref={audioRef} src="/alarm.mp3" />

      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
            {/* subtle glow */}
            <div className="absolute inset-0 bg-[#FF6B4A] blur-xl opacity-30 rounded-full"></div>

            <img
            src={logo}
            alt="Kairo"
            className="w-9 h-9 relative z-10"
            />
        </div>

        <h1 className="text-xl font-semibold tracking-wide">
            Kairo
        </h1>
        </div>

      {/* MODE SWITCH */}
      <div className="flex gap-2 mb-8 bg-[#161B22] p-1 rounded-xl">
        {["work", "short", "long"].map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${
              mode === m
                ? "bg-[#FF6B4A] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {m === "work"
              ? "Work"
              : m === "short"
              ? "Short"
              : "Long"}
          </button>
        ))}
      </div>

      {/* TIMER */}
      <div className="relative flex items-center justify-center mb-8">
        <svg
          width="280"
          height="280"
          className={`${isRunning ? "animate-pulseGlow" : ""}`}
        >
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="#1F2937"
            strokeWidth="12"
            fill="none"
          />

          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="#FF6B4A"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 140 140)"
            style={{ transition: "stroke-dashoffset 0.5s linear" }}
          />
        </svg>

        {/* Smooth timer */}
        <div className="absolute text-5xl font-semibold tabular-nums">
          <span key={time} className="animate-flip">
            {formatTime(time)}
          </span>
        </div>
      </div>

      {/* TASK */}
      {mode === "work" && (
        <input
          type="text"
          placeholder="What are you working on?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="mb-6 w-full max-w-sm px-4 py-2 rounded-xl bg-[#161B22] text-white outline-none focus:ring-2 focus:ring-[#FF6B4A]"
        />
      )}

      {/* CONTROLS */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={(e) => {
            createRipple(e);
            handleStartPause();
          }}
          className="relative overflow-hidden px-8 py-2 rounded-xl bg-[#FF6B4A] hover:bg-[#FF7A5C] active:scale-95 transition"
        >
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={(e) => {
            createRipple(e);
            handleReset();
          }}
          className="relative overflow-hidden px-6 py-2 rounded-xl bg-[#1F2937] hover:bg-[#374151]"
        >
          Reset
        </button>
      </div>

      {/* SESSIONS */}
      <div className="w-full max-w-sm bg-[#161B22] p-4 rounded-xl">
        <h2 className="text-sm text-gray-400 mb-2">Today</h2>

        {todaysSessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No sessions yet</p>
        ) : (
          <ul className="space-y-2">
            {todaysSessions.map((s) => (
              <li
                key={s.id}
                className="px-3 py-2 rounded-lg bg-[#0D1117] text-sm flex justify-between"
              >
                <span>{s.task}</span>
                <span className="text-gray-400">25m</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}