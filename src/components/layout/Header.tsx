"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ShieldAlert, CloudDrizzle, Sun, Sparkles } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchLiveWeather, WeatherData } from "@/lib/weather-service";

export const Header: React.FC = () => {
  const { state, setIsSimulating } = useSimulation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchLiveWeather().then(setWeather);
    const id = setInterval(() => fetchLiveWeather().then(setWeather), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const criticalCount = state.alerts.filter((a) => a.severity === "CRITICAL" && a.status === "ACTIVE").length;
  const WeatherIcon = weather?.isRaining ? CloudDrizzle : Sun;

  return (
    <>
      <header className="h-13 bg-white border-b border-wari-cardBorder px-4 sm:px-5 flex items-center justify-between sticky top-0 z-20 shadow-header select-none gap-3">

        {/* Left — Mode toggle */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-0.5 bg-wari-pageBg border border-wari-cardBorder rounded-xl text-xs font-bold gap-0.5">
            <button
              onClick={() => setIsSimulating(false)}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                !state.isSimulating
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-wari-textSecond hover:text-wari-textPrimary"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
              🟢 Live Mode
            </button>
            <button
              onClick={() => setIsSimulating(true)}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                state.isSimulating
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-wari-textSecond hover:text-wari-textPrimary"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              🧪 Demo Archive
            </button>
          </div>

          {/* Weather */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-wari-pageBg border border-wari-cardBorder rounded-lg text-xs">
            {weather ? (
              <>
                <WeatherIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-wari-textSecond">Corridor:</span>
                <span className="font-bold text-wari-textPrimary">{weather.temperatureC}°C</span>
                <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded font-bold ${weather.isLive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {weather.isLive ? "LIVE" : "est."}
                </span>
              </>
            ) : (
              <span className="text-wari-textMuted">28°C Clear</span>
            )}
          </div>
        </div>

        {/* Right — Quick nav + clock */}
        <div className="flex items-center gap-2">
          {/* Critical alert badge */}
          {criticalCount > 0 && (
            <Link href="/incidents">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                {criticalCount} CRITICAL
              </div>
            </Link>
          )}

          {/* Quick portal links */}
          <Link
            href="/dindi"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            🚩 Dindi
          </Link>

          <Link
            href="/volunteer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-xl text-xs font-bold transition-all"
          >
            👷 Volunteer
          </Link>

          <Link
            href="/command-centre"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            🏛️ Command
          </Link>

          {/* User */}
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-wari-pageBg border border-wari-cardBorder rounded-xl">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-wari-orange to-wari-plum flex items-center justify-center text-white font-bold text-[9px]">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-wari-textPrimary truncate max-w-[80px]">
                {user.name.split(",")[0]}
              </span>
            </div>
          )}

          {/* Clock */}
          <div
            suppressHydrationWarning
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-wari-textPrimary text-white rounded-xl text-xs font-mono font-bold"
          >
            <Clock className="w-3 h-3 text-wari-orange" />
            <span suppressHydrationWarning>{clock || state.currentClock}</span>
          </div>
        </div>
      </header>

      {/* Demo Archive Banner */}
      {state.isSimulating && (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-purple-700 shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            <span className="font-bold text-purple-200 text-[10px] bg-purple-800 px-2 py-0.5 rounded border border-purple-600 uppercase tracking-wide">
              DEMO ARCHIVE
            </span>
            <span className="truncate text-purple-100">
              2024–25 Wari historical data — Dive Ghat bottleneck scenario for judges & training
            </span>
          </div>
          <button
            onClick={() => setIsSimulating(false)}
            className="text-[11px] font-bold text-purple-300 hover:text-white underline shrink-0 ml-3"
          >
            Back to Live →
          </button>
        </div>
      )}
    </>
  );
};
