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
import { useLanguage } from "@/context/LanguageContext";
import { PriorityGauge } from "@/components/common/PriorityGauge";
import { DecisionFlowBar } from "@/components/dashboard/DecisionFlowBar";
import { getLiveCrowdClusters, computeDindiSyncPlan } from "@/lib/live-ops";
import { ArrowRight, CheckCircle, Navigation, ShieldCheck } from "lucide-react";

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
    staggerDindiRoutes,
    isMitigated,
  } = useSimulation();

  const { language } = useLanguage();
  const cp4 = state.checkpoints.find((c) => c.shortCode === "CP4");
  const camp6 = state.camps.find((c) => c.id === "CAMP-06");
  const dindi14 = state.dindis.find((d) => d.id === "DINDI-14");
  const liveClusters = getLiveCrowdClusters(state);
  const syncPlan = computeDindiSyncPlan(state.dindis, state.camps);

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
              const isElevated = cluster.occupancyPercent >= 75 || cluster.totalPilgrims >= 20000;
              const isNominal = !isElevated && !isOvercrowded;

              const waterDemandL = cluster.totalPilgrims * 3;
              const foodMealsDemand = cluster.totalPilgrims;
              const sanitationPodsDemand = Math.max(2, Math.round(cluster.totalPilgrims / 50));
              const availableTanker = state.tankers.find((t) => t.status === "AVAILABLE");
              const availableFood = state.foodSupplies?.find((f) => f.status === "AVAILABLE");
              const availableSanitation = state.sanitationCrews.find((s) => s.status === "AVAILABLE");
              const largestDindi = [...cluster.dindis].sort((a, b) => b.pilgrimCount - a.pilgrimCount)[0];
              const backupCamp = state.camps.find((c) => c.id !== targetCamp?.id && c.occupancyPercent < 60) ?? state.camps[1];

              if (isNominal && !allVerified) {
                return (
                  <div
                    key={cluster.id}
                    className="card-base p-6 border-2 border-emerald-300 bg-emerald-50/30 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                            🟢 Live Telemetry &amp; Sector Monitoring
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            NOMINAL FLOW ({cluster.occupancyPercent}% LOAD)
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-wari-textPrimary">{cluster.name}</h2>
                        <p className="text-xs text-wari-textMuted">
                          GPS {cluster.lat.toFixed(4)}°N, {cluster.lng.toFixed(4)}°E • Sector: {targetCamp?.name ?? "Corridor Sector"} • Capacity: {targetCamp?.capacity.toLocaleString() ?? 40000}
                        </p>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>All Safe • No Congestion</span>
                      </div>
                    </div>

                    {/* 4 Nominal Metrics Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white rounded-xl border border-emerald-200 p-3.5 shadow-xs">
                        <span className="text-wari-textMuted block font-medium">Devotees Present</span>
                        <span className="font-black text-base text-wari-textPrimary">{cluster.totalPilgrims.toLocaleString()}</span>
                        <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">
                          Safe ({cluster.occupancyPercent}% of {cluster.capacity.toLocaleString()})
                        </span>
                      </div>

                      <div className="bg-white rounded-xl border border-emerald-200 p-3.5 shadow-xs">
                        <span className="text-wari-textMuted block font-medium">Water Reserves Load</span>
                        <span className="font-black text-base text-blue-700">{waterDemandL.toLocaleString()} L</span>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          {targetCamp?.waterStockPercent ?? 95}% Stock — Adequate
                        </span>
                      </div>

                      <div className="bg-white rounded-xl border border-emerald-200 p-3.5 shadow-xs">
                        <span className="text-wari-textMuted block font-medium">Food / Prasad Load</span>
                        <span className="font-black text-base text-amber-700">{foodMealsDemand.toLocaleString()} Meals</span>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          Normal Kitchen Supply
                        </span>
                      </div>

                      <div className="bg-white rounded-xl border border-emerald-200 p-3.5 shadow-xs">
                        <span className="text-wari-textMuted block font-medium">Sanitation Demand</span>
                        <span className="font-black text-base text-teal-700">{sanitationPodsDemand} Pods</span>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          Optimal Availability
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                      <span>✓ Sector is operating well within safe crowd limits. Multi-agency emergency dispatch is not required.</span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700">Pacing: Normal (4.2 km/h)</span>
                    </div>
                  </div>
                );
              }

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
                          <span>Problem Solved &amp; Verified</span>
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
                          <span>⚡ Apply AI Multi-Resource Mitigation &amp; Dispatch (1-Click)</span>
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
                          <span>3. Roadside Mobile Water &amp; Food Staging</span>
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
                        {syncPlan && (
                          <button
                            onClick={() => staggerDindiRoutes(targetCamp?.id)}
                            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 shadow-sm"
                          >
                            <Navigation className="w-3.5 h-3.5 text-yellow-300" />
                            <span>⚡ Stagger Dindi Routes (Split Short vs Bypass)</span>
                          </button>
                        )}
                      </div>
                    )}

                  {/* Dynamic Dindi Synchronization & Halt Planning Feature Panel */}
                  {syncPlan && (
                    <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/80 p-5 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-purple-700" />
                            <h3 className="font-black text-sm text-purple-950 tracking-tight">
                              Dindi Synchronization &amp; Dynamic Halt Planning
                            </h3>
                            <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full uppercase">
                              Logistics Optimization
                            </span>
                          </div>
                          <p className="text-xs text-purple-900/80 mt-0.5">
                            Transforms static printed timetables into dynamic, data-driven route scheduling with staggered arrival windows.
                          </p>
                        </div>

                        <button
                          onClick={() => staggerDindiRoutes(targetCamp?.id)}
                          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 self-start sm:self-auto shadow-sm active:scale-95 shrink-0"
                        >
                          <Zap className="w-3.5 h-3.5 text-yellow-300" />
                          <span>Apply Staggered Routes</span>
                        </button>
                      </div>

                      {/* 4-Step Pipeline Bar: Track -> Predict -> Re-plan -> Alert */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-purple-900 text-[11px] uppercase tracking-wider">1. Track</span>
                            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">GPS Live</span>
                          </div>
                          <p className="text-[11px] text-wari-textSecond">
                            Live telemetry tracks <strong>{syncPlan.convergingDindis[0].name}</strong> &amp; <strong>{syncPlan.convergingDindis[1].name}</strong> converging on {syncPlan.targetCamp.name}.
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-amber-900 text-[11px] uppercase tracking-wider">2. Predict</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">Risk {syncPlan.campPeakOccupancyBefore}%</span>
                          </div>
                          <p className="text-[11px] text-wari-textSecond">
                            Simultaneous arrival would cause <strong>{syncPlan.campPeakOccupancyBefore}% overload</strong> and bottleneck at camp entrance.
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-indigo-900 text-[11px] uppercase tracking-wider">3. Re-plan</span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-mono font-bold">+{syncPlan.staggerDeltaMinutes}m Offset</span>
                          </div>
                          <p className="text-[11px] text-wari-textSecond">
                            Reroutes Dindi 1 via <strong>Shortest Corridor</strong> and Dindi 2 via <strong>Scenic Outer Bypass</strong> to stagger arrivals.
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-emerald-900 text-[11px] uppercase tracking-wider">4. Alert</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">Advance Prep</span>
                          </div>
                          <p className="text-[11px] text-wari-textSecond">
                            Pre-notifies Maha-Prasad kitchen, water tankers &amp; sanitation crews with batch timing schedule.
                          </p>
                        </div>
                      </div>

                      {/* Route Staggering Comparison Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <strong className="text-xs text-emerald-950 font-black">
                                {syncPlan.dindiShortRoute.dindi.name} (Shortest Route)
                              </strong>
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                              Batch 1 • {syncPlan.dindiShortRoute.arrivalWindow}
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-900 space-y-1">
                            <p><strong>Assigned Route:</strong> {syncPlan.dindiShortRoute.routeName}</p>
                            <p className="text-[10px] text-emerald-700 font-mono">📍 Path: {syncPlan.dindiShortRoute.routeWaypoints} ({syncPlan.dindiShortRoute.distanceKm} km · {syncPlan.dindiShortRoute.paceKmH} km/h)</p>
                          </div>
                          <p className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                            ✓ {syncPlan.dindiShortRoute.actionNote}
                          </p>
                        </div>

                        <div className="p-3.5 bg-purple-50/70 border border-purple-300 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Navigation className="w-4 h-4 text-purple-600" />
                              <strong className="text-xs text-purple-950 font-black">
                                {syncPlan.dindiLongRoute.dindi.name} (Scenic Bypass)
                              </strong>
                            </div>
                            <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                              Batch 2 • {syncPlan.dindiLongRoute.arrivalWindow}
                            </span>
                          </div>
                          <div className="text-[11px] text-purple-900 space-y-1">
                            <p><strong>Assigned Route:</strong> {syncPlan.dindiLongRoute.routeName}</p>
                            <p className="text-[10px] text-purple-700 font-mono">📍 Path: {syncPlan.dindiLongRoute.routeWaypoints} ({syncPlan.dindiLongRoute.distanceKm} km · {syncPlan.dindiLongRoute.paceKmH} km/h)</p>
                          </div>
                          <p className="text-[11px] text-purple-800 bg-white/80 p-2.5 rounded-lg border border-purple-200">
                            ✓ {syncPlan.dindiLongRoute.actionNote}
                          </p>
                        </div>
                      </div>

                      {/* AI Optimization Rationale Box */}
                      <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px]">
                          <span>💡</span>
                          <span>Logistics Optimization Rationale:</span>
                        </span>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          {syncPlan.optimizationRationale}
                        </p>
                      </div>

                      {/* Advance Logistics Notification Schedule */}
                      <div className="bg-white/90 rounded-xl p-3.5 border border-purple-200 space-y-2 text-xs">
                        <span className="font-bold text-purple-950 block text-[11px] uppercase tracking-wider">
                          📢 Advance Logistics Notification Schedule (Kitchen / Water / Sanitation)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {syncPlan.advanceAlerts.slice(0, 3).map((al, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-100 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-purple-800">{al.targetBatch}</span>
                                <span className="font-mono text-purple-600">{al.scheduledTime}</span>
                              </div>
                              <p className="text-[11px] text-wari-textPrimary font-medium">{al.action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
