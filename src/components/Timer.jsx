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

  const [modal, setModal] = useState({
    show: false,
    type: "",
  });

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const hasCompletedRef = useRef(false);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  const progress = time / DURATIONS[mode];
  const strokeDashoffset = circumference * (1 - progress);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 🔊 Unlock audio
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioRef.current) return;

      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        })
        .catch(() => {});

      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
  }, []);

  // ⏱ Timer logic
  useEffect(() => {
    if (!isRunning) return;

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1 && !hasCompletedRef.current) {
          hasCompletedRef.current = true;

          clearInterval(intervalRef.current);
          setIsRunning(false);

          // 🔊 play sound
          audioRef.current?.play().catch(() => {});

          // 📦 save session
          if (mode === "work" && task.trim()) {
            setSessions((prev) => [
              {
                id: Date.now(),
                task: task.trim(),
                duration: DURATIONS.work,
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ]);
          }

          setModal({ show: true, type: "complete" });
          setTask("");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, task]);

  // 💾 Save
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sessions, task })
    );
  }, [sessions, task]);

  // ▶ Start/Pause
  const handleStartPause = () => {
    if (mode === "work" && !task.trim() && !isRunning) {
      setModal({ show: true, type: "required" });
      return;
    }

    setIsRunning((prev) => {
      if (!prev) hasCompletedRef.current = false;
      return !prev;
    });
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setTime(DURATIONS[mode]);
    setIsRunning(false);
    hasCompletedRef.current = false;
  };

  const handleModeChange = (newMode) => {
    clearInterval(intervalRef.current);
    setMode(newMode);
    setTime(DURATIONS[newMode]);
    setIsRunning(false);
    hasCompletedRef.current = false;
  };

  const handleCloseModal = () => {
    setModal({ show: false, type: "" });

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (modal.type === "complete") {
      setTime(DURATIONS[mode]);
    }
  };

  const today = new Date().toDateString();
  const todaysSessions = sessions.filter(
    (s) => new Date(s.createdAt).toDateString() === today
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0D1117] text-white px-4">

      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}alarm.wav`} />

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <img src={logo} className="w-9 h-9" />
        <h1 className="text-xl font-semibold">Kairo</h1>
      </div>

      {/* MODE */}
      <div className="flex gap-2 mb-8 bg-[#161B22] p-1 rounded-xl">
        {["work", "short", "long"].map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-4 py-1.5 rounded-lg ${
              mode === m ? "bg-[#FF6B4A]" : "text-gray-400"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* TIMER */}
      <div className="relative mb-8">
        <svg
          width="280"
          height="280"
          className={isRunning ? "animate-pulseGlow" : ""}
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
            transform="rotate(-90 140 140)"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          {formatTime(time)}
        </div>
      </div>

      {/* TASK */}
      {mode === "work" && (
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter task"
          className="mb-6 px-4 py-2 bg-[#161B22] rounded"
        />
      )}

      {/* BUTTONS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleStartPause}
          className="bg-[#FF6B4A] px-6 py-2 rounded"
        >
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={handleReset}
          className="bg-gray-700 px-6 py-2 rounded"
        >
          Reset
        </button>
      </div>

      {/* SESSIONS */}
      <div className="w-full max-w-sm bg-[#161B22] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1F2937]">
          <h2 className="text-sm text-gray-400">Today</h2>
        </div>

        <div className="max-h-[220px] overflow-y-auto px-3 py-2 space-y-2 custom-scroll">
          {todaysSessions.length === 0 ? (
            <div className="flex items-center justify-center h-[150px]">
              <p className="text-gray-500 text-sm">No sessions yet</p>
            </div>
          ) : (
            todaysSessions.map((s) => (
              <div
                key={s.id}
                className="px-3 py-2 rounded-lg bg-[#0D1117] text-sm flex justify-between items-center"
              >
                <span>{s.task}</span>
                <span className="text-gray-400 text-xs">25m</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      {modal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-[#161B22] p-6 rounded-xl text-center w-[300px]">
            <h2 className="text-lg mb-2">
              {modal.type === "complete"
                ? "Session Complete"
                : "Task Required"}
            </h2>

            <p className="text-gray-400 mb-4">
              {modal.type === "complete"
                ? "Great job!"
                : "Please enter a task before starting."}
            </p>

            <button
              onClick={handleCloseModal}
              className="bg-[#FF6B4A] px-6 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}