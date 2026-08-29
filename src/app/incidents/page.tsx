"use client";

import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingDown,
  Droplets,
  HeartHandshake,
  Users,
  Compass,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { PriorityGauge } from "@/components/common/PriorityGauge";
import { DecisionFlowBar } from "@/components/dashboard/DecisionFlowBar";

export default function IncidentsPage() {
  const {
    state,
    executeFullMitigation,
    rerouteDindi14,
    dispatchTankerT03,
    deployVolunteersCP4,
    openBackupShelterB,
    isMitigated,
  } = useSimulation();

  const cp4 = state.checkpoints.find((c) => c.shortCode === "CP4");
  const camp6 = state.camps.find((c) => c.id === "CAMP-06");
  const dindi14 = state.dindis.find((d) => d.id === "DINDI-14");

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 7-Stage Lifecycle Bar */}
      <DecisionFlowBar />

      {/* Main Incident Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border transition-all ${
          isMitigated
            ? "bg-emerald-50 border-emerald-300"
            : "bg-red-50 border-red-200 shadow-sm"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-1 ${
                isMitigated
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                  : "bg-red-500 text-white animate-pulse shadow-md"
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-wari-textPrimary border border-wari-cardBorder">
                  INCIDENT #INC-402
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isMitigated
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                  }`}
                >
                  {isMitigated ? "Mitigation In Progress" : "Critical Chokepoint Risk"}
                </span>
              </div>

              <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
                Checkpoint 4 (Dive Ghat Apex) Density Surge
              </h1>
              <p className="text-sm text-wari-textSecond mt-1">
                Location: Dive Ghat Mountain Incline • Projected 97% capacity breach in 43 minutes
              </p>
            </div>
          </div>

          {/* Primary Action Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {!isMitigated ? (
              <button
                onClick={executeFullMitigation}
                className="w-full md:w-auto btn-primary flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Execute Multi-Agency Response</span>
              </button>
            ) : (
              <div className="badge-normal flex items-center gap-2 px-4 py-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Response Dispatched & Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Incident Telemetry + Priority Scorer + Cascading Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Telemetry & Causes (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Situation & Telemetry Card */}
          <div className="card-base p-6 space-y-5">
            <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-wari-orange" />
              <span>Real-Time Sensor Telemetry & Forecast</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder">
                <span className="text-wari-textMuted text-xs block">Current Density</span>
                <span className={`text-2xl font-bold ${isMitigated ? "text-emerald-700" : "text-red-700"}`}>
                  {cp4?.currentDensity || 91}%
                </span>
                <span className="text-wari-textMuted text-xs block mt-0.5">
                  {cp4?.currentCount.toLocaleString()} Devotees
                </span>
              </div>

              <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder">
                <span className="text-wari-textMuted text-xs block">45m Forecast</span>
                <span className={`text-2xl font-bold ${isMitigated ? "text-emerald-700" : "text-red-700"}`}>
                  {cp4?.forecast45Min || 97}%
                </span>
                <span className="text-wari-textMuted text-xs block mt-0.5">
                  {isMitigated ? "Stabilized" : "Breach in 43m"}
                </span>
              </div>

              <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder">
                <span className="text-wari-textMuted text-xs block">Dindi #14 Pace</span>
                <span className={`text-2xl font-bold ${isMitigated ? "text-emerald-700" : "text-orange-700"}`}>
                  {dindi14?.currentPaceKmH || 3.2} km/h
                </span>
                <span className="text-wari-textMuted text-xs block mt-0.5">
                  {isMitigated ? "Bypass B" : "-21% pace drop"}
                </span>
              </div>
            </div>

            {/* Root Causes Analysis */}
            <div className="bg-wari-pageBg rounded-xl p-4 border border-wari-cardBorder space-y-2">
              <span className="text-xs font-bold text-wari-orange block uppercase tracking-wider">
                Root Cause Synthesis:
              </span>
              <div className="text-xs text-wari-textSecond space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-wari-orange font-bold">1.</span>
                  <span>
                    <strong>Palkhi Chariot Slowdown:</strong> Dindi #14 (38,000 devotees) slowed down to 3.2 km/h on the steep 14% rain-slicked incline.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>
                    <strong>Dive Ghat Rainfall:</strong> 18mm/h cloudburst created a backward compression wave toward Wadki.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">3.</span>
                  <span>
                    <strong>Downstream Camp 6 Bottleneck:</strong> Saswad Palkhi Maidan operating at 120% capacity, slowing queue egress.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cascading Impact Matrix */}
          <div className="card-base p-6 space-y-4">
            <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider">
              Downstream Cascading Effects
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-1">
                <span className="text-wari-textMuted block text-xs">Camp 6 (Saswad)</span>
                <span className={`text-base font-bold ${isMitigated ? "text-emerald-700" : "text-amber-700"}`}>
                  {isMitigated ? "85% (Safe)" : "+21% Surge (120%)"}
                </span>
                <p className="text-xs text-wari-textSecond">
                  {isMitigated ? "Diverted to Shelter B" : "Overcapacity risk"}
                </p>
              </div>

              <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-1">
                <span className="text-wari-textMuted block text-xs">Medical Trauma Load</span>
                <span className={`text-base font-bold ${isMitigated ? "text-emerald-700" : "text-purple-700"}`}>
                  {isMitigated ? "64% Normal" : "+14% Stress (83%)"}
                </span>
                <p className="text-xs text-wari-textSecond">
                  Saswad Rural ICU
                </p>
              </div>

              <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-1">
                <span className="text-wari-textMuted block text-xs">Water Reserves</span>
                <span className={`text-base font-bold ${isMitigated ? "text-emerald-700" : "text-red-700"}`}>
                  {isMitigated ? "78 min Buffer" : "Critical in 34m"}
                </span>
                <p className="text-xs text-wari-textSecond">
                  Burn: 420 L/min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Scorer & Action Checklist (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Priority Scorer Gauge */}
          <PriorityGauge
            score={isMitigated ? 35 : 92}
            breakdown={{
              density: isMitigated ? 10 : 35,
              urgency: isMitigated ? 8 : 25,
              population: isMitigated ? 10 : 20,
              resource: isMitigated ? 7 : 12,
            }}
            title="Operational Priority Score"
          />

          {/* Multi-Agency Response Checklist */}
          <div className="card-base p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-wari-cardBorder">
              <span className="text-sm font-bold text-wari-textPrimary">
                Multi-Agency Action Checklist
              </span>
              <span className="text-xs text-wari-textMuted">
                {isMitigated ? "4 / 4 Completed" : "0 / 4 Dispatched"}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Action 1 */}
              <div className="p-3.5 rounded-xl bg-wari-pageBg border border-wari-cardBorder flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {isMitigated ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-wari-orange text-xs flex items-center justify-center text-wari-orange font-bold shrink-0">
                      1
                    </span>
                  )}
                  <div>
                    <span className="font-bold text-wari-textPrimary block text-xs">Reroute Dindi #14</span>
                    <span className="text-[11px] text-wari-textMuted">Divert via East Saswad Bypass B</span>
                  </div>
                </div>
                {!isMitigated && (
                  <button
                    onClick={rerouteDindi14}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    Reroute
                  </button>
                )}
              </div>

              {/* Action 2 */}
              <div className="p-3.5 rounded-xl bg-wari-pageBg border border-wari-cardBorder flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {isMitigated ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-purple-500 text-xs flex items-center justify-center text-purple-600 font-bold shrink-0">
                      2
                    </span>
                  )}
                  <div>
                    <span className="font-bold text-wari-textPrimary block text-xs">Deploy 5 Marshals</span>
                    <span className="text-[11px] text-wari-textMuted">Sector 3 to Dive Ghat Apex</span>
                  </div>
                </div>
                {!isMitigated && (
                  <button
                    onClick={deployVolunteersCP4}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Deploy
                  </button>
                )}
              </div>

              {/* Action 3 */}
              <div className="p-3.5 rounded-xl bg-wari-pageBg border border-wari-cardBorder flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {isMitigated ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-blue-500 text-xs flex items-center justify-center text-blue-600 font-bold shrink-0">
                      3
                    </span>
                  )}
                  <div>
                    <span className="font-bold text-wari-textPrimary block text-xs">Dispatch Tanker T-03</span>
                    <span className="text-[11px] text-wari-textMuted">From Hub 2 (1.8km) to Camp 6</span>
                  </div>
                </div>
                {!isMitigated && (
                  <button
                    onClick={dispatchTankerT03}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Dispatch
                  </button>
                )}
              </div>

              {/* Action 4 */}
              <div className="p-3.5 rounded-xl bg-wari-pageBg border border-wari-cardBorder flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {isMitigated ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-emerald-500 text-xs flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      4
                    </span>
                  )}
                  <div>
                    <span className="font-bold text-wari-textPrimary block text-xs">Open Backup Shelter B</span>
                    <span className="text-[11px] text-wari-textMuted">Saswad Grounds (20k capacity)</span>
                  </div>
                </div>
                {!isMitigated && (
                  <button
                    onClick={openBackupShelterB}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
