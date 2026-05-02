import { useEffect, useState } from "react";
import logo from "../assets/kairo-logo.png";

export default function Preloader({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 10) + 5;

      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);

        setTimeout(() => setFadeOut(true), 300);
        setTimeout(() => onFinish(), 800);
      } else {
        setProgress(current);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-[#0D1117] text-white transition-all duration-700 ${
        fadeOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Glow Background */}
      <div className="absolute w-[300px] h-[300px] bg-[#FF6B4A] opacity-20 blur-3xl rounded-full animate-pulse"></div>

      {/* Content */}
      <div className="relative z-10 text-center">
        
        {/* LOGO */}
         <div className="logo-wrapper">
              <div className="logo-glow"></div>

              <div className="logo-box">
                <img src={logo} alt="Kairo" />
              </div>
            </div>

        <p className="text-gray-400 text-sm mt-2 mb-4">
          Focus starts here
        </p>

        {/* PROGRESS */}
        <div className="w-64 h-2 bg-[#1F2937] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF6B4A] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Loading... {progress}%
        </p>
      </div>
    </div>
  );
}