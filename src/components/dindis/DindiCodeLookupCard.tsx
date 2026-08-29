"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Sparkles,
  Radio,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Navigation,
  Compass,
  ArrowRight,
} from "lucide-react";
import { useLiveGps } from "@/context/LiveGpsContext";
import {
  DINDI_CODE_DATABASE,
  HACKATHON_LIVE_GPS_CODE,
} from "@/lib/dindi-codes";
import Link from "next/link";

export const DindiCodeLookupCard: React.FC = () => {
  const {
    activeDindiCode,
    activeDindiInfo,
    unlockDindiByCode,
    coords,
    isTracking,
    nearestCheckpoint,
  } = useLiveGps();

  const [inputCode, setInputCode] = useState<string>("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const res = unlockDindiByCode(inputCode);
    if (res.success) {
      setFeedback({ type: "success", message: res.message });
      setInputCode("");
    } else {
      setFeedback({ type: "error", message: res.message });
    }
  };

  const handleQuickSelect = (code: string) => {
    const res = unlockDindiByCode(code);
    if (res.success) {
      setFeedback({ type: "success", message: res.message });
      setInputCode("");
    }
  };

  return (
    <div className="card-base p-6 space-y-6 border-2 border-wari-orange/40 bg-white shadow-cardHov">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-wari-cardBorder">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shadow-sm">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-wari-textPrimary">
              Dindi Passcode Access & Real-Time Locator
            </h3>
            <p className="text-xs text-wari-textSecond mt-0.5">
              Enter any Dindi code to locate your group, or use the Hackathon code to stream your phone GPS
            </p>
          </div>
        </div>

        {/* Active Badge */}
        {activeDindiInfo && (
          <div className="flex items-center gap-2">
            <span className="badge-live flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              Active: {activeDindiInfo.dindiNumber}
            </span>
          </div>
        )}
      </div>

      {/* SPECIAL HACKATHON LIVE PHONE GPS HERO BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-200" />
              Hackathon Special Feature
            </span>
            <span className="text-xs font-mono font-bold bg-black/25 px-2.5 py-0.5 rounded-lg border border-white/20">
              {HACKATHON_LIVE_GPS_CODE}
            </span>
          </div>
          <h4 className="text-base font-extrabold text-white">
            Real-Time Phone GPS Transmitter
          </h4>
          <p className="text-xs text-white/90 leading-relaxed max-w-xl">
            Entering this code links your phone&apos;s real device satellite GPS to WariOS, broadcasting your real coordinates and walking pace live on the map!
          </p>
        </div>

        <button
          onClick={() => handleQuickSelect(HACKATHON_LIVE_GPS_CODE)}
          className="px-4 py-2.5 rounded-xl bg-white text-orange-700 font-extrabold text-xs shadow-lg hover:bg-orange-50 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Smartphone className="w-4 h-4 text-orange-600" />
          <span>⚡ Activate My Phone Live GPS</span>
        </button>
      </div>

      {/* Code Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <KeyRound className="w-4 h-4 text-wari-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter Dindi Code (e.g. LIVE-GPS-2026, DINDI-F01, RATH-MAULI, DINDI-14)..."
              className="w-full pl-10 pr-4 py-3 bg-wari-pageBg border border-wari-cardBorder rounded-xl text-sm font-mono font-bold text-wari-textPrimary focus:outline-none focus:border-wari-orange focus:ring-2 focus:ring-wari-orange/20 transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-wari-textMuted"
            />
          </div>
          <button
            type="submit"
            className="btn-primary py-3 px-6 text-sm flex items-center justify-center gap-2 shrink-0"
          >
            <span>Locate Dindi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Message */}
        {feedback.type && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : "bg-rose-50 text-rose-900 border-rose-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </form>

      {/* CURRENTLY UNLOCKED DINDI TELEMETRY CARD */}
      {activeDindiInfo && (
        <div className="p-4 rounded-2xl bg-wari-pageBg border border-wari-cardBorder space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-wari-cardBorder">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-wari-orange text-white flex items-center justify-center font-bold text-xs">
                🚩
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-wari-orange">
                  Code: {activeDindiInfo.code}
                </span>
                <h4 className="text-sm font-bold text-wari-textPrimary">
                  {activeDindiInfo.dindiNumber} — {activeDindiInfo.name}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/map"
                className="px-3 py-1.5 bg-white rounded-lg border border-wari-cardBorder text-xs font-bold text-wari-orange hover:border-wari-orange transition-all flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View on Live Map</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-wari-cardBorder">
              <span className="text-wari-textMuted block text-[11px]">Head Chief (ह.भ.प.)</span>
              <span className="font-bold text-wari-textPrimary truncate block mt-0.5">
                {activeDindiInfo.headChief}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-wari-cardBorder">
              <span className="text-wari-textMuted block text-[11px]">Current Corridor Sector</span>
              <span className="font-bold text-wari-orange truncate block mt-0.5">
                {activeDindiInfo.currentSector}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-wari-cardBorder">
              <span className="text-wari-textMuted block text-[11px]">Walking Pace / Speed</span>
              <span className="font-bold text-wari-textPrimary block mt-0.5 font-mono">
                {coords ? `${coords.speedKmH} km/h` : `${activeDindiInfo.speedKmH} km/h`}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-wari-cardBorder">
              <span className="text-wari-textMuted block text-[11px]">Registered Devotees</span>
              <span className="font-bold text-wari-textPrimary block mt-0.5">
                ~{activeDindiInfo.members.toLocaleString()} Pilgrims
              </span>
            </div>
          </div>
        </div>
      )}

      {/* QUICK-SELECT CODES PALETTE */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-bold text-wari-textMuted uppercase tracking-wider block">
          Quick Code Cheat-Sheet (Click to Instantly Test):
        </span>

        <div className="flex flex-wrap gap-2">
          {Object.entries(DINDI_CODE_DATABASE).map(([code, item]) => {
            const isActive = activeDindiCode === code;
            const isHackLive = item.isLivePhoneGps;

            return (
              <button
                key={code}
                onClick={() => handleQuickSelect(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  isActive
                    ? "bg-wari-orange text-white border-wari-orange shadow-sm font-bold"
                    : isHackLive
                    ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-bold"
                    : "bg-wari-pageBg text-wari-textPrimary border-wari-cardBorder hover:border-orange-200"
                }`}
              >
                <span>{isHackLive ? "⭐" : "🚩"}</span>
                <span className="font-mono">{code}</span>
                <span className="text-[11px] opacity-75 hidden sm:inline">
                  ({item.dindiNumber.split(" ")[0]})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
