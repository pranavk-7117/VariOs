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
  Utensils,
  Truck,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { PriorityGauge } from "@/components/common/PriorityGauge";
import { DecisionFlowBar } from "@/components/dashboard/DecisionFlowBar";
import { getLiveCrowdClusters } from "@/lib/live-ops";

export default function IncidentsPage() {
  const {
    state,
    executeFullMitigation,
    rerouteDindi14,
    dispatchTankerT03,
    deployVolunteersCP4,
    openBackupShelterB,
    applyLiveClusterMitigation,
    rerouteLiveDindi,
    openTemporaryAuxiliaryCamp,
    regulatePalkhiPace,
    isMitigated,
  } = useSimulation();

  const cp4 = state.checkpoints.find((c) => c.shortCode === "CP4");
  const camp6 = state.camps.find((c) => c.id === "CAMP-06");
  const dindi14 = state.dindis.find((d) => d.id === "DINDI-14");
  const liveClusters = getLiveCrowdClusters(state);

  if (!state.isSimulating) {
    const isMitigatedLive = state.isMitigated || state.volunteerTasks.some((t) => t.id.startsWith("TASK-MIT"));
    const allVerified =
      state.volunteerTasks.length > 0 &&
      state.volunteerTasks.every((t) => t.status === "VERIFIED");

    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header */}
        <div className="card-base p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xl font-bold text-wari-textPrimary">Live Incidents & AI Operations Triage</h1>
            </div>
            <p className="text-sm text-wari-textSecond mt-1">
              Real-time GPS crowd aggregation, resource deficit calculation & automated multi-agency dispatch
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-full self-start sm:self-auto">
            LIVE TELEMETRY
          </span>
        </div>

        {/* Live Crowd Pressure Clusters & Incident Triage */}
        {liveClusters.length > 0 ? (
          <div className="space-y-6">
            {liveClusters.map((cluster) => {
              const targetCamp = cluster.nearestCamp?.item;
              const isOvercrowded = cluster.occupancyPercent >= 100;
              const waterDemandL = cluster.totalPilgrims * 3;
              const foodMealsDemand = cluster.totalPilgrims;
              const sanitationPodsDemand = Math.max(10, Math.round(cluster.totalPilgrims / 50));
              const availableTanker = state.tankers.find((t) => t.status === "AVAILABLE");
              const availableFood = state.foodSupplies?.find((f) => f.status === "AVAILABLE");
              const availableSanitation = state.sanitationCrews.find((s) => s.status === "AVAILABLE");
              const largestDindi = [...cluster.dindis].sort((a, b) => b.pilgrimCount - a.pilgrimCount)[0];
              const backupCamp = state.camps.find((c) => c.id !== targetCamp?.id && c.occupancyPercent < 60) ?? state.camps[1];

              return (
                <div
                  key={cluster.id}
                  className={`card-base p-6 border-2 space-y-5 transition-all ${
                    allVerified
                      ? "border-emerald-400 bg-emerald-50/50"
                      : isOvercrowded
                      ? "border-red-400 bg-red-50/40 shadow-md"
                      : "border-amber-300 bg-amber-50/30"
                  }`}
                >
                  {/* Status Banner */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-wari-cardBorder">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                          🚨 Incident #INC-LIVE-{cluster.id}
                        </span>
                        <span className={isOvercrowded ? "badge-critical" : "badge-high"}>
                          {isOvercrowded ? "CRITICAL OVERCROWDING" : "CROWD SURGE"}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-wari-textPrimary">{cluster.name}</h2>
                      <p className="text-xs text-wari-textMuted">
                        GPS {cluster.lat.toFixed(4)}°N, {cluster.lng.toFixed(4)}°E • Sector: {targetCamp?.name ?? "Corridor Sector"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {allVerified ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Problem Solved & Verified</span>
                        </div>
                      ) : isMitigatedLive ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-800 text-xs font-bold animate-pulse">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>Mitigation Dispatched — Awaiting Verification in /volunteer</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => applyLiveClusterMitigation(targetCamp?.id)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-700 hover:to-orange-700 active:scale-95 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                        >
                          <Zap className="w-4 h-4 text-yellow-300 animate-bounce" />
                          <span>⚡ Apply AI Multi-Resource Mitigation & Dispatch (1-Click)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4 Metrics Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white rounded-xl border border-wari-cardBorder p-3.5 shadow-sm">
                      <span className="text-wari-textMuted block font-medium">Devotees Present</span>
                      <span className="font-black text-base text-wari-textPrimary">{cluster.totalPilgrims.toLocaleString()}</span>
                      <span className="text-[10px] text-red-600 block font-semibold mt-0.5">
                        +{cluster.overcrowdedBy.toLocaleString()} Overflow
                      </span>
                    </div>

                    <div className="bg-white rounded-xl border border-wari-cardBorder p-3.5 shadow-sm">
                      <span className="text-wari-textMuted block font-medium">Water Reserves Load</span>
                      <span className="font-black text-base text-blue-700">{waterDemandL.toLocaleString()} L</span>
                      <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                        {allVerified ? "100% Stock (Refilled)" : "15% Stock — CRITICAL DEFICIT"}
                      </span>
                    </div>

                    <div className="bg-white rounded-xl border border-wari-cardBorder p-3.5 shadow-sm">
                      <span className="text-wari-textMuted block font-medium">Food / Prasad Load</span>
                      <span className="font-black text-base text-amber-700">{foodMealsDemand.toLocaleString()} Meals</span>
                      <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                        {allVerified ? "100% Stock (Refilled)" : "18% Stock — CRITICAL DEFICIT"}
                      </span>
                    </div>

                    <div className="bg-white rounded-xl border border-wari-cardBorder p-3.5 shadow-sm">
                      <span className="text-wari-textMuted block font-medium">Sanitation Demand</span>
                      <span className="font-black text-base text-teal-700">{sanitationPodsDemand} Pods</span>
                      <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                        {allVerified ? "24 Pods Serviced" : "Critical Overflow"}
                      </span>
                    </div>
                  </div>

                  {/* AI Multi-Resource Recommendations List */}
                  <div className="rounded-xl bg-white border border-wari-cardBorder p-4 text-xs space-y-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-wari-orange" />
                      <span className="font-bold text-wari-textPrimary">AI Operations Mitigation Recommendations:</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                        <div className="font-bold text-indigo-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-indigo-600" />
                            <span>1. Open Temporary Satellite Ground (+25k)</span>
                          </span>
                          <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded font-bold">Recommended</span>
                        </div>
                        <p className="text-[11px] text-indigo-800">
                          Activate adjacent open-air holding shelter (e.g. <strong>{targetCamp?.name ?? "Camp 1"} Outer Auxiliary Grounds</strong>) to add +25,000 capacity on the spot without making devotees walk far.
                        </p>
                      </div>

                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                        <div className="font-bold text-amber-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>2. Regulate Palkhi March Rhythm (2.5 km/h)</span>
                          </span>
                          <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold">Pacing</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Slow march pace from 4.2 to 2.5 km/h and gate arrivals into <strong>15,000-devotee batches every 45 min</strong> at the approach lane to decompress corridor choke points.
                        </p>
                      </div>

                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                        <div className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-blue-600" />
                          <span>3. Roadside Mobile Water & Food Staging</span>
                        </div>
                        <p className="text-[11px] text-blue-800">
                          Dispatch Water Tanker <strong>{availableTanker?.id ?? "LIVE-WATER-PUNE-01"}</strong> &amp; Kitchen <strong>{availableFood?.name ?? "Alandi Kitchen"}</strong> to roadside staging bays along the march route.
                        </p>
                      </div>

                      <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                        <div className="font-bold text-teal-900 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-teal-600" />
                          <span>4. Mobile Bio-Toilet Squad Deployment</span>
                        </div>
                        <p className="text-[11px] text-teal-800">
                          Deploy <strong>{availableSanitation?.name ?? "Pune Municipal Squad 1"}</strong> ({availableSanitation?.mobilePodsCount ?? 24} pods) to prevent open sanitation overload.
                        </p>
                      </div>
                    </div>

                    {/* Quick 1-tap dispatch bar */}
                    {!allVerified && !isMitigatedLive && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => applyLiveClusterMitigation(targetCamp?.id)}
                          className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5 text-yellow-300" />
                          <span>Execute Full AI Mitigation Plan</span>
                        </button>
                        {targetCamp && (
                          <button
                            onClick={() => openTemporaryAuxiliaryCamp(targetCamp.id)}
                            className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center gap-1.5 active:scale-95"
                          >
                            <Compass className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Open Temporary Satellite Ground (+25k)</span>
                          </button>
                        )}
                        <button
                          onClick={() => regulatePalkhiPace("THROTTLE_PACE")}
                          className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 active:scale-95"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Throttle March Pace (2.5 km/h / 45m Batch)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Live Alert Feed */}
        {state.alerts.length > 0 ? (
          <div className="card-base p-6 space-y-4">
            <h2 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider">
              Live Alert & Operational Triage Feed ({state.alerts.length})
            </h2>
            <div className="space-y-3">
              {state.alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-wari-cardBorder bg-wari-pageBg p-4 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-sm text-wari-textPrimary">{alert.title}</span>
                    <span className={alert.status === "RESOLVED" ? "badge-success" : alert.severity === "CRITICAL" ? "badge-critical" : "badge-high"}>
                      {alert.status === "RESOLVED" ? "RESOLVED" : alert.severity}
                    </span>
                  </div>
                  <p className="text-wari-textSecond">{alert.cause}</p>
                  <p className="text-wari-orange font-semibold">{alert.recommendedAction}</p>
                  {alert.forecastText && (
                    <p className="text-[11px] text-wari-textMuted">{alert.forecastText}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : liveClusters.length === 0 ? (
          <div className="card-base p-8 text-center border-2 border-dashed border-wari-cardBorder">
            <p className="text-sm font-bold text-wari-textPrimary">No live incidents detected</p>
            <p className="text-xs text-wari-textMuted mt-1">
              Registered Dindis and corridor resources are currently operating within safe capacity limits.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

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
