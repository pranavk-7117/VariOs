"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Sparkles,
  Flame,
  ChevronRight,
  Route,
  Navigation,
  Compass,
} from "lucide-react";
import {
  TUKARAM_MAHARAJ_SCHEDULE_2026,
  DNYANESHWAR_MAHARAJ_SCHEDULE_2026,
  SANT_DNYANESHWAR_ROUTE_CONFIG,
  PalkhiEvent,
  PalkhiWaypoint,
} from "@/lib/palkhi-schedule";

export const PalkhiScheduleTimeline: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "DNYANESHWAR" | "TUKARAM" | "WAYPOINTS_20"
  >("DNYANESHWAR");

  const [selectedEvent, setSelectedEvent] = useState<PalkhiEvent>(
    DNYANESHWAR_MAHARAJ_SCHEDULE_2026[2] // Dive Ghat / Saswad
  );

  const [selectedWaypoint, setSelectedWaypoint] = useState<PalkhiWaypoint>(
    SANT_DNYANESHWAR_ROUTE_CONFIG.route_waypoints[5] // Dive Ghat Base
  );

  const scheduleList =
    activeTab === "DNYANESHWAR"
      ? DNYANESHWAR_MAHARAJ_SCHEDULE_2026
      : TUKARAM_MAHARAJ_SCHEDULE_2026;

  return (
    <div className="card-base p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-wari-cardBorder">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-wari-textPrimary">
              Official 2026 Wari Palkhi Itinerary & Route Waypoints
            </h3>
            <p className="text-xs text-wari-textSecond mt-0.5">
              Verified 20-stage Alandi–Pandharpur sequence, Ringan traditions & daily halts
            </p>
          </div>
        </div>

        {/* Palkhi Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-wari-pageBg p-1 rounded-xl border border-wari-cardBorder text-xs">
          <button
            onClick={() => {
              setActiveTab("DNYANESHWAR");
              setSelectedEvent(DNYANESHWAR_MAHARAJ_SCHEDULE_2026[0]);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "DNYANESHWAR"
                ? "bg-wari-orange text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <span>Mauli Palkhi 2026</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("TUKARAM");
              setSelectedEvent(TUKARAM_MAHARAJ_SCHEDULE_2026[0]);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "TUKARAM"
                ? "bg-wari-orange text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <span>Tukaram Maharaj 2026</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("WAYPOINTS_20");
              setSelectedWaypoint(SANT_DNYANESHWAR_ROUTE_CONFIG.route_waypoints[0]);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "WAYPOINTS_20"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>20-Stage Route (240km)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1 & 2: Schedule Itineraries */}
      {activeTab !== "WAYPOINTS_20" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline items list (7 cols) */}
          <div className="lg:col-span-7 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {scheduleList.map((item, idx) => {
              const isSelected = selectedEvent.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedEvent(item)}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all text-xs ${
                    isSelected
                      ? "bg-wari-orangeLight border-wari-orange shadow-sm"
                      : "bg-wari-pageBg border-wari-cardBorder hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        item.isRingan
                          ? "bg-amber-500 text-white shadow-sm"
                          : isSelected
                          ? "bg-wari-orange text-white"
                          : "bg-white text-wari-textSecond border border-wari-cardBorder"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-wari-textPrimary">
                          {item.locationName}
                        </span>
                        {item.isRingan && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-600" />
                            RINGAN
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-wari-textMuted">{item.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-wari-textSecond hidden sm:inline truncate max-w-[150px]">
                      {item.highlight}
                    </span>
                    <ChevronRight className="w-4 h-4 text-wari-textMuted" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Halt & Ringan Detail Inspector (5 cols) */}
          <div className="lg:col-span-5 bg-wari-pageBg p-5 rounded-2xl border border-wari-cardBorder space-y-4">
            <div className="pb-3 border-b border-wari-cardBorder">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-wari-orange uppercase tracking-wider">
                  {activeTab === "DNYANESHWAR" ? "Mauli Palkhi 2026" : "Tukaram Palkhi 2026"}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white text-wari-textPrimary border border-wari-cardBorder">
                  {selectedEvent.date}
                </span>
              </div>
              <h4 className="text-lg font-bold text-wari-textPrimary">
                {selectedEvent.locationName}
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-wari-cardBorder space-y-1">
                <span className="text-wari-textMuted font-bold uppercase tracking-wider block">
                  Itinerary & Religious Significance:
                </span>
                <p className="text-wari-textPrimary leading-relaxed text-xs">
                  {selectedEvent.description}
                </p>
              </div>

              {selectedEvent.isRingan && (
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-1 text-amber-900">
                  <span className="font-bold flex items-center gap-1.5 text-xs text-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Special Ringan Tradition
                  </span>
                  <p className="text-xs text-amber-800">
                    {selectedEvent.ringanType || "Traditional Horse / Sheep Ringan"}
                  </p>
                </div>
              )}

              <div className="bg-white p-3.5 rounded-xl border border-wari-cardBorder grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-wari-textMuted block">Coordinates</span>
                  <span className="font-bold text-wari-textPrimary font-mono">
                    {typeof selectedEvent?.lat === "number" ? selectedEvent.lat.toFixed(4) : "18.5138"}°N, {typeof selectedEvent?.lng === "number" ? selectedEvent.lng.toFixed(4) : "73.8589"}°E
                  </span>
                </div>
                <div>
                  <span className="text-wari-textMuted block">Corridor Sector</span>
                  <span className="font-bold text-wari-orange">Pune–Pandharpur Route</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: 20-Stage High-Precision Waypoint Sequence */}
      {activeTab === "WAYPOINTS_20" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Waypoint Sequence List (7 cols) */}
          <div className="lg:col-span-7 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {SANT_DNYANESHWAR_ROUTE_CONFIG.route_waypoints.map((wp) => {
              const isSelected = selectedWaypoint.sequence === wp.sequence;
              const isRingan = wp.type.toLowerCase().includes("ringan");

              return (
                <button
                  key={wp.sequence}
                  onClick={() => setSelectedWaypoint(wp)}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all text-xs ${
                    isSelected
                      ? "bg-blue-50 border-blue-400 shadow-sm"
                      : "bg-wari-pageBg border-wari-cardBorder hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        wp.sequence === 1
                          ? "bg-[#6B1D47] text-white"
                          : wp.sequence === 20
                          ? "bg-wari-orange text-white"
                          : isRingan
                          ? "bg-amber-500 text-white"
                          : isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-white text-wari-textSecond border border-wari-cardBorder"
                      }`}
                    >
                      {wp.sequence}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-wari-textPrimary">
                          {wp.location}
                        </span>
                        {isRingan && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-600" />
                            RINGAN
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-blue-700 font-semibold">{wp.type}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-sm text-wari-textPrimary font-mono">
                      {wp.distance_from_start_km} km
                    </span>
                    <span className="text-[11px] text-wari-textMuted block">from Alandi</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Waypoint Detail Inspector (5 cols) */}
          <div className="lg:col-span-5 bg-wari-pageBg p-5 rounded-2xl border border-wari-cardBorder space-y-4">
            <div className="pb-3 border-b border-wari-cardBorder">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Stage #{selectedWaypoint.sequence} of 20
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  {selectedWaypoint.distance_from_start_km} km / 240 km
                </span>
              </div>
              <h4 className="text-lg font-bold text-wari-textPrimary">
                {selectedWaypoint.location}
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-wari-cardBorder space-y-1">
                <span className="text-wari-textMuted font-bold uppercase tracking-wider block">
                  Waypoint Classification:
                </span>
                <p className="text-sm font-bold text-wari-textPrimary">
                  {selectedWaypoint.type}
                </p>
                <p className="text-xs text-wari-textSecond">
                  Official stage along the 240km Sant Dnyaneshwar Maharaj Palkhi corridor.
                </p>
              </div>

              {/* Progress bar to Pandharpur */}
              <div className="bg-white p-3.5 rounded-xl border border-wari-cardBorder space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-wari-textMuted">Corridor Progress</span>
                  <span className="text-wari-orange">
                    {Math.round((selectedWaypoint.distance_from_start_km / 240) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-wari-pageBg h-2.5 rounded-full overflow-hidden border border-wari-cardBorder">
                  <div
                    className="h-full bg-gradient-to-r from-wari-orange to-wari-plum rounded-full transition-all duration-500"
                    style={{
                      width: `${(selectedWaypoint.distance_from_start_km / 240) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-wari-textMuted">
                  <span>Alandi (0 km)</span>
                  <span>Pandharpur (240 km)</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-wari-cardBorder grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-wari-textMuted block">Latitude</span>
                  <span className="font-bold text-wari-textPrimary font-mono">
                    {typeof selectedWaypoint?.lat === "number" ? selectedWaypoint.lat.toFixed(4) : "18.5138"}°N
                  </span>
                </div>
                <div>
                  <span className="text-wari-textMuted block">Longitude</span>
                  <span className="font-bold text-wari-textPrimary font-mono">
                    {typeof selectedWaypoint?.lng === "number" ? selectedWaypoint.lng.toFixed(4) : "73.8589"}°E
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
