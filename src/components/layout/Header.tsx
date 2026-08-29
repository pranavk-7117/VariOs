"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Clock, ShieldAlert, CloudRain, Sun, CloudDrizzle, Wifi, WifiOff } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchLiveWeather, WeatherData } from "@/lib/weather-service";

export const Header: React.FC = () => {
  const { state } = useSimulation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [clock, setClock] = useState("");

  // Real-time clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch live weather on mount, refresh every 10 min
  useEffect(() => {
    fetchLiveWeather().then(setWeather);
    const id = setInterval(() => fetchLiveWeather().then(setWeather), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const criticalCount = state.alerts.filter(
    (a) => a.severity === "CRITICAL" && a.status === "ACTIVE"
  ).length;

  const WeatherIcon = weather?.isRaining ? CloudDrizzle : Sun;

  return (
    <header className="h-14 bg-white border-b border-wari-cardBorder px-5 flex items-center justify-between sticky top-0 z-20 shadow-header">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Live indicator + corridor */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <div>
            <p className="text-xs font-semibold text-wari-textPrimary leading-tight">
              {t("header.network")}
            </p>
            <p className="text-[10px] text-wari-textMuted leading-tight">
              {t("header.route")}
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-wari-cardBorder" />

        {/* Pilgrims count */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-wari-pageBg border border-wari-cardBorder rounded-lg text-xs">
          <Users className="w-3.5 h-3.5 text-wari-orange" />
          <span className="text-wari-textSecond">{t("header.pilgrims")}:</span>
          <span className="font-bold text-wari-textPrimary">{state.totalPilgrims.toLocaleString("en-IN")}</span>
        </div>

        {/* Critical alerts */}
        {criticalCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            <span className="font-bold">{criticalCount} {t("header.critical")}{criticalCount > 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Live weather */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-wari-pageBg border border-wari-cardBorder rounded-lg text-xs">
          {weather ? (
            <>
              <WeatherIcon className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-wari-textSecond">Dive Ghat:</span>
              <span className="font-bold text-wari-textPrimary">{weather.temperatureC}°C</span>
              {weather.isRaining && (
                <span className="text-blue-600 font-medium">{weather.precipitationProb}% rain</span>
              )}
              <span className={`ml-1 text-[10px] px-1.5 rounded font-bold ${weather.isLive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {weather.isLive ? "LIVE" : "est."}
              </span>
            </>
          ) : (
            <>
              <CloudRain className="w-3.5 h-3.5 text-wari-textMuted" />
              <span className="text-wari-textMuted text-[11px]">Loading weather…</span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Dindi Passcode & Live GPS Fast Action */}
        <Link
          href="/dindis"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-xs font-bold shadow-sm hover:from-amber-600 hover:to-orange-700 transition-all"
        >
          <span className="text-[11px]">⭐</span>
          <span>Dindi Code Tracker</span>
        </Link>
        {/* Logged-in user */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-wari-pageBg border border-wari-cardBorder rounded-lg">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-wari-orange to-wari-plum flex items-center justify-center text-white font-bold text-[10px]">
              {user.name.charAt(0)}
            </div>
            <div className="text-xs">
              <span className="font-semibold text-wari-textPrimary block leading-tight truncate max-w-[100px]">
                {user.name.split(",")[0]}
              </span>
              <span className="text-wari-orange text-[10px] font-medium">{user.role}</span>
            </div>
          </div>
        )}

        {/* Real-time clock */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-wari-textPrimary text-white rounded-lg text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-wari-orange" />
          <span>{clock || state.currentClock}</span>
        </div>
      </div>
    </header>
  );
};
