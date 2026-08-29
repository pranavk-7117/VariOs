"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Zap,
  CheckCircle2,
  Radio,
  Navigation,
  MapPin,
  Activity,
  Crosshair,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLiveGps } from "@/context/LiveGpsContext";
import { PalkhiScheduleTimeline } from "@/components/dindis/PalkhiScheduleTimeline";
import { DindiProcessionFormation } from "@/components/dindis/DindiProcessionFormation";
import { DindiCodeLookupCard } from "@/components/dindis/DindiCodeLookupCard";
import DindiLeaderRegisterCard from "@/components/dindis/DindiLeaderRegisterCard";
import { DindiLeaderNearbyView } from "@/components/dindis/DindiLeaderNearbyView";
import { Dindi } from "@/lib/types";

export default function DindisPage() {
  const { state, rerouteDindi14, isMitigated } = useSimulation();
  const { coords, isTracking, toggleTracking, boundDindiId, setBoundDindiId, nearestCheckpoint, simulatedAdvance } =
    useLiveGps();

  const [selectedDindi, setSelectedDindi] = useState<Dindi | null>(
    state.dindis.find((d) => d.id === boundDindiId) || state.dindis[0]
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-base p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center shadow-sm text-2xl">
            🟠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
                Dindi Pramukh & Leader Dashboard
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300">
                PRAMUKH PORTAL
              </span>
            </div>
            <p className="text-sm text-wari-textSecond mt-0.5">
              Register Dindi, broadcast live phone GPS, view nearby facilities, and contact ground volunteers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-live flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            Real-Time GPS Active
          </span>
        </div>
      </div>

      {/* Dindi Leader Self-Registration & Live GPS Broadcast */}
      <DindiLeaderRegisterCard />

      {/* Nearby Facilities & Nearby Volunteers with Direct Call Buttons */}
      <DindiLeaderNearbyView />

      {/* Dindi Passcode Access & Real-Time Locator */}
      <DindiCodeLookupCard />

      {/* Real-Time Live GPS Transmitter Card */}
      <div className="card-base p-6 border-2 border-wari-orange/50 space-y-4 bg-white shadow-cardHov">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-wari-cardBorder">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-wari-orange animate-pulse" />
            <div>
              <h2 className="text-sm font-bold text-wari-textPrimary">
                Live Palkhi Telemetry Transmitter (Your Device GPS)
              </h2>
              <p className="text-xs text-wari-textMuted">
                Broadcasts real latitude/longitude from your browser to the command map
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/map">
              <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-wari-orange" />
                <span>View On Map</span>
              </button>
            </Link>
            <button
              onClick={toggleTracking}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isTracking
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
            >
              {isTracking ? "● GPS Broadcasting" : "○ GPS Paused"}
            </button>
          </div>
        </div>

        {/* Live GPS Telemetry Dashboard Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-wari-pageBg p-3.5 rounded-xl border border-wari-cardBorder">
            <span className="text-wari-textMuted block">Current Coordinates</span>
            <span className="text-sm font-bold text-wari-textPrimary font-mono block mt-0.5">
              {coords ? `${coords.lat.toFixed(5)}°N` : "18.21450°N"}
            </span>
            <span className="text-xs font-mono text-wari-textMuted block">
              {coords ? `${coords.lng.toFixed(5)}°E` : "74.14560°E"}
            </span>
          </div>

          <div className="bg-wari-pageBg p-3.5 rounded-xl border border-wari-cardBorder">
            <span className="text-wari-textMuted block">Walking Pace / Speed</span>
            <span className="text-lg font-black text-wari-orange block mt-0.5">
              {coords ? `${coords.speedKmH} km/h` : "3.4 km/h"}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Real-Time Geolocation</span>
          </div>

          <div className="bg-wari-pageBg p-3.5 rounded-xl border border-wari-cardBorder">
            <span className="text-wari-textMuted block">GPS Accuracy</span>
            <span className="text-lg font-bold text-emerald-700 block mt-0.5">
              {coords ? `±${coords.accuracy}m` : "±8m"}
            </span>
            <span className="text-[11px] text-wari-textMuted">High Precision Satellite</span>
          </div>

          <div className="bg-wari-pageBg p-3.5 rounded-xl border border-wari-cardBorder">
            <span className="text-wari-textMuted block">Nearest Checkpoint</span>
            <span className="text-sm font-bold text-wari-textPrimary block mt-0.5 truncate">
              {nearestCheckpoint ? nearestCheckpoint.name : "Dive Ghat Apex"}
            </span>
            <span className="text-[11px] font-bold text-wari-orange">
              {nearestCheckpoint ? `${nearestCheckpoint.distanceKm} km away` : "0.4 km away"}
            </span>
          </div>
        </div>

        {/* Bind Device to Palkhi selector */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-wari-textMuted font-medium">Link Live GPS Device to:</span>
            <select
              value={boundDindiId}
              onChange={(e) => {
                setBoundDindiId(e.target.value);
                const found = state.dindis.find((d) => d.id === e.target.value);
                if (found) setSelectedDindi(found);
              }}
              className="bg-wari-pageBg border border-wari-cardBorder rounded-lg px-2.5 py-1 text-xs font-semibold text-wari-textPrimary focus:outline-none focus:border-wari-orange"
            >
              {state.dindis.map((d) => (
                <option key={d.id} value={d.id}>
                  #{d.number} — {d.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={simulatedAdvance}
            className="text-[11px] text-wari-textSecond hover:text-wari-orange underline flex items-center gap-1"
          >
            <Navigation className="w-3 h-3" />
            <span>Simulate 1-Step Movement along Corridor</span>
          </button>
        </div>
      </div>

      {/* Official 2026 Palkhi Itinerary & Ringan Schedule */}
      <PalkhiScheduleTimeline />

      {/* Official Dindi Procession Formation (Front, Chariot & Rear) */}
      <DindiProcessionFormation />

      {/* Dindi Table & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table View (8 Cols) */}
        <div className="lg:col-span-8 card-base p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-wari-cardBorder text-xs font-semibold text-wari-textMuted uppercase tracking-wider">
            <span>Dindi / Palkhi Group</span>
            <div className="flex items-center gap-10 pr-4">
              <span>Walking Pace</span>
              <span>Next Halt / ETA</span>
              <span>Status</span>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {state.dindis.map((d) => {
              const isSelected = selectedDindi?.id === d.id;
              const isLiveBound = boundDindiId === d.id;

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDindi(d)}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all text-xs ${
                    isSelected
                      ? "bg-wari-orangeLight border-wari-orange shadow-sm"
                      : "bg-wari-pageBg border-wari-cardBorder hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                      style={{ backgroundColor: d.routeColor }}
                    >
                      #{d.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-wari-textPrimary">{d.name}</span>
                        {isLiveBound && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            GPS BOUND
                          </span>
                        )}
                        {d.rerouted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-semibold">
                            Bypass B
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-wari-textMuted">
                        Leader: {d.leader} • {d.pilgrimCount.toLocaleString()} Devotees
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    {/* Pace */}
                    <div className="text-right">
                      <span
                        className={`font-bold text-sm ${
                          d.paceDropPercent > 15 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {isLiveBound && coords ? `${coords.speedKmH} km/h` : `${d.currentPaceKmH} km/h`}
                      </span>
                      <span className="text-[11px] text-wari-textMuted block">
                        {d.paceDropPercent > 0 ? `↓${d.paceDropPercent}%` : "Nominal"}
                      </span>
                    </div>

                    {/* ETA */}
                    <div className="text-right w-24">
                      <span className="text-wari-textPrimary font-bold text-sm">{d.etaNextHalt}</span>
                      <span className="text-[11px] text-wari-textMuted block truncate max-w-[90px]">
                        {d.nextHalt.split(" ")[0]}
                      </span>
                    </div>

                    {/* Status */}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        d.status === "CRITICAL"
                          ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                          : d.status === "ATTENTION"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Dindi Details & Reroute Controls (4 Cols) */}
        <div className="lg:col-span-4 card-base p-6 space-y-5">
          {selectedDindi ? (
            <div className="space-y-5">
              <div className="pb-4 border-b border-wari-cardBorder">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-wari-orange uppercase tracking-wider">
                    Palkhi Profile
                  </span>
                  <span className="text-xs text-wari-textMuted">
                    ID: {selectedDindi.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-wari-textPrimary">
                  {selectedDindi.name}
                </h3>
                <p className="text-xs text-wari-textMuted mt-0.5">
                  Leader: {selectedDindi.leader}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-wari-pageBg p-3 rounded-xl border border-wari-cardBorder">
                  <span className="text-wari-textMuted text-xs block">Devotee Count</span>
                  <span className="text-lg font-bold text-wari-textPrimary">
                    {selectedDindi.pilgrimCount.toLocaleString()}
                  </span>
                  <span className="text-wari-textMuted text-xs block">Pilgrims</span>
                </div>

                <div className="bg-wari-pageBg p-3 rounded-xl border border-wari-cardBorder">
                  <span className="text-wari-textMuted text-xs block">Walking Pace</span>
                  <span
                    className={`text-lg font-bold ${
                      selectedDindi.paceDropPercent > 15 ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {boundDindiId === selectedDindi.id && coords
                      ? `${coords.speedKmH} km/h`
                      : `${selectedDindi.currentPaceKmH} km/h`}
                  </span>
                  <span className="text-wari-textMuted text-xs block">
                    Std: {selectedDindi.standardPaceKmH} km/h
                  </span>
                </div>

                <div className="bg-wari-pageBg p-3 rounded-xl border border-wari-cardBorder">
                  <span className="text-wari-textMuted text-xs block">Terrain Incline</span>
                  <span className="text-lg font-bold text-purple-700">
                    {selectedDindi.terrainFactor}x Grade
                  </span>
                  <span className="text-wari-textMuted text-xs block">Slope</span>
                </div>

                <div className="bg-wari-pageBg p-3 rounded-xl border border-wari-cardBorder">
                  <span className="text-wari-textMuted text-xs block">Rain Delay</span>
                  <span className="text-lg font-bold text-amber-700">
                    +{selectedDindi.weatherDelayMinutes} min
                  </span>
                  <span className="text-wari-textMuted text-xs block">Dive Ghat</span>
                </div>
              </div>

              {/* Current Segment */}
              <div className="bg-wari-pageBg rounded-xl p-4 border border-wari-cardBorder space-y-1.5">
                <span className="text-xs font-bold text-wari-textMuted uppercase tracking-wider block">
                  Current Location:
                </span>
                <span className="text-xs font-semibold text-wari-textPrimary block">
                  {selectedDindi.currentSegment}
                </span>
                <span className="text-xs text-wari-orange block">
                  Next Halt: {selectedDindi.nextHalt} (ETA {selectedDindi.etaNextHalt})
                </span>
              </div>

              {/* Reroute Action */}
              {selectedDindi.id === "DINDI-14" && (
                <div className="pt-2 border-t border-wari-cardBorder">
                  {!isMitigated ? (
                    <button
                      onClick={rerouteDindi14}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Reroute Dindi #14 to Bypass B</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Diverted to Bypass Route B</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-wari-textMuted text-xs">
              Select a Dindi to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
