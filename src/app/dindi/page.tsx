"use client";

import React, { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import DindiLeaderRegisterCard from "@/components/dindis/DindiLeaderRegisterCard";
import { DindiLeaderNearbyView } from "@/components/dindis/DindiLeaderNearbyView";
import { PalkhiScheduleTimeline } from "@/components/dindis/PalkhiScheduleTimeline";
import { useSimulation } from "@/context/SimulationContext";
import { useLiveGps } from "@/context/LiveGpsContext";

export default function DindiPortal() {
  const { state, resetAll, deleteDindi } = useSimulation();
  const { coords, isTracking } = useLiveGps();
  const [selectedDindiId, setSelectedDindiId] = useState("");
  const [dindiSearch, setDindiSearch] = useState("");

  // Only show Dindis that were actually registered by real users
  const myDindis = state.dindis.filter((d) => d.isCustomRegistered);
  const filteredDindis = useMemo(() => {
    const query = dindiSearch.trim().toLowerCase();
    if (!query) return myDindis;
    return myDindis.filter((dindi) =>
      [dindi.name, dindi.leader, dindi.passcode, String(dindi.number)]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [dindiSearch, myDindis]);
  const effectiveSelectedDindi = myDindis.find((dindi) => dindi.id === selectedDindiId) ?? filteredDindis[0] ?? myDindis[0];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">

      {/* ── PORTAL HEADER ── */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">🚩</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Dindi Pramukh Portal</h1>
            <p className="text-sm text-orange-100">दिंडी नेते · Real-time GPS journey tracking</p>
          </div>
          {isTracking && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              LIVE GPS
            </span>
          )}
        </div>
        <p className="text-xs text-orange-100 mt-2">
          Register your Dindi in under 1 minute. Your phone becomes a live GPS beacon visible to WariOS authorities.
        </p>
      </div>

      {/* ── LIVE GPS STATUS BAR (shows only once tracking starts) ── */}
      {coords && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex flex-wrap gap-4 text-xs">
          <div>
            <span className="text-emerald-600 block">📍 Location</span>
            <span className="font-mono font-bold text-emerald-900">
              {coords.lat.toFixed(5)}°N, {coords.lng.toFixed(5)}°E
            </span>
          </div>
          <div>
            <span className="text-emerald-600 block">⚡ Speed</span>
            <span className="font-bold text-emerald-900 text-base">{coords.speedKmH} km/h</span>
          </div>
          <div>
            <span className="text-emerald-600 block">🎯 Accuracy</span>
            <span className="font-bold text-emerald-900">±{coords.accuracy}m</span>
          </div>
          <div className="ml-auto flex items-center">
            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
              REAL PHONE GPS
            </span>
          </div>
        </div>
      )}

      {/* ── REGISTRATION CARD ── */}
      <DindiLeaderRegisterCard />

      {myDindis.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-white/90 p-4 shadow-card space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-wari-textPrimary">Select Dindi for Live Facilities</h2>
              <p className="text-xs text-wari-textMuted">Search by Dindi name, leader, number, or passcode. Nearby camps and hospitals update from this Dindi GPS.</p>
            </div>
            <button
              onClick={resetAll}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              Delete Current Data
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={dindiSearch}
              onChange={(event) => setDindiSearch(event.target.value)}
              placeholder="Search Dindi code, leader, mandal..."
              className="input-base"
            />
            <select
              value={effectiveSelectedDindi?.id ?? ""}
              onChange={(event) => setSelectedDindiId(event.target.value)}
              className="input-base"
            >
              {filteredDindis.map((dindi) => (
                <option key={dindi.id} value={dindi.id}>
                  {dindi.name} · {dindi.passcode} · {dindi.pilgrimCount.toLocaleString()} people
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── MY REGISTERED DINDIS (in Live Mode, only real ones) ── */}
      {myDindis.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-wari-textPrimary px-1">Your Active Dindis</h2>
          {myDindis.map((d) => (
            <div key={d.id} className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-orange-900">{d.name}</div>
                  <div className="text-xs text-orange-700">Leader: {d.leader} · {d.pilgrimCount.toLocaleString()} devotees</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold bg-orange-600 text-white px-2.5 py-1 rounded-lg">
                      {d.passcode}
                    </span>
                    <div className="text-[10px] text-orange-600 mt-0.5">Share with pilgrims</div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete registered Dindi "${d.name}" (${d.passcode})?`)) {
                        deleteDindi(d.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 transition-all shadow-sm active:scale-95"
                    title="Delete this Dindi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Replanned Route Notification */}
              {d.route && (
                <div className="p-2.5 rounded-lg bg-purple-100/80 border border-purple-300 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-950">
                    <span className="flex items-center gap-1">
                      <span>⚡</span>
                      <span>Assigned Route: {d.route}</span>
                    </span>
                    <span className="bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded text-[10px]">
                      Staggered Batch
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-800">
                    Pace: {d.speedKmH ?? d.currentPaceKmH} km/h • Optimized to ensure zero halt overcrowding.
                  </p>
                </div>
              )}

              {/* Live GPS linked to this dindi */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white rounded-lg p-2.5 border border-orange-100">
                  <div className="text-orange-500 text-[10px]">Live Position</div>
                  <div className="font-mono font-bold text-orange-900 text-[11px]">
                    {d.lat.toFixed(4)}°N
                  </div>
                  <div className="font-mono text-orange-700 text-[10px]">{d.lng.toFixed(4)}°E</div>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-orange-100">
                  <div className="text-orange-500 text-[10px]">Walking Pace</div>
                  <div className="font-bold text-emerald-700 text-base">
                    {coords ? `${coords.speedKmH}` : d.currentPaceKmH}
                  </div>
                  <div className="text-orange-600 text-[10px]">km/h</div>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-orange-100">
                  <div className="text-orange-500 text-[10px]">Next Halt</div>
                  <div className="font-bold text-orange-900 text-[11px] truncate">{d.nextHalt}</div>
                  <div className="text-orange-600 text-[10px]">ETA {d.etaNextHalt}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── NEARBY FACILITIES & VOLUNTEER CONTACTS ── */}
      <DindiLeaderNearbyView selectedDindiId={effectiveSelectedDindi?.id} />

      {/* ── PALKHI SCHEDULE (real 2026 itinerary) ── */}
      <PalkhiScheduleTimeline />

    </div>
  );
}
