"use client";

import React, { useState } from "react";
import {
  Droplets,
  Truck,
  Zap,
  CheckCircle2,
  Utensils,
  Trash2,
  Building2,
  Phone,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { getLiveCrowdClusters } from "@/lib/live-ops";

export default function ResourcesPage() {
  const { state, dispatchTankerT03, isMitigated } = useSimulation();
  const [resourceTab, setResourceTab] = useState<"WATER" | "FOOD" | "SANITATION">("WATER");
  const liveClusters = getLiveCrowdClusters(state);
  const topLiveCluster = liveClusters[0];
  const isLiveMode = !state.isSimulating;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="card-base p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
              Resource Logistics Optimizer (Camps 1–8)
            </h1>
            <p className="text-sm text-wari-textSecond mt-0.5">
              Monitor water tanker fleets, camp consumption rates, Prasad kitchens, and mobile sanitation squads
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-wari-pageBg p-1 rounded-xl border border-wari-cardBorder self-start md:self-auto">
          <button
            onClick={() => setResourceTab("WATER")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              resourceTab === "WATER"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water Fleet ({state.tankers.length})</span>
          </button>
          <button
            onClick={() => setResourceTab("FOOD")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              resourceTab === "FOOD"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Prasad & Food ({state.camps.length})</span>
          </button>
          <button
            onClick={() => setResourceTab("SANITATION")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              resourceTab === "SANITATION"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sanitation ({state.sanitationCrews.length})</span>
          </button>
        </div>
      </div>

      {/* Live Resource Optimization Banner */}
      {isLiveMode && (
        <div className="card-base p-6 space-y-4 border-2 border-emerald-300 bg-emerald-50/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-wari-textPrimary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Live GPS Resource Optimization
              </h2>
              <p className="text-xs text-wari-textMuted mt-0.5">
                Dynamic telemetry calculated from real registered Dindis, verified camps, and mobile tankers.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full">
              LIVE TELEMETRY
            </span>
          </div>

          {topLiveCluster ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-white border border-emerald-200 p-4 space-y-1">
                <span className="text-wari-textMuted text-[11px] block">Live Crowd Load</span>
                <span className="text-2xl font-black text-wari-textPrimary">{topLiveCluster.totalPilgrims.toLocaleString()}</span>
                <p className="text-emerald-700 font-bold text-[11px]">
                  {topLiveCluster.occupancyPercent}% of {topLiveCluster.capacity.toLocaleString()} Safe Capacity
                </p>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-4 space-y-1">
                <span className="text-wari-textMuted text-[11px] block">Nearest Verified Halt</span>
                <strong className="font-bold text-wari-textPrimary text-sm block truncate">
                  {topLiveCluster.nearestCamp ? topLiveCluster.nearestCamp.item.name : "Camp 1 (Pune Bhavani Peth)"}
                </strong>
                <span className="text-purple-700 font-semibold text-[11px]">
                  {topLiveCluster.nearestCamp ? `${topLiveCluster.nearestCamp.distanceKm} km away` : "Corridor Start"}
                </span>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-4 space-y-1">
                <span className="text-wari-textMuted text-[11px] block">Nearest Water Supply</span>
                <strong className="font-bold text-blue-900 text-sm block truncate">
                  {topLiveCluster.nearestTanker ? `${topLiveCluster.nearestTanker.item.id} (${topLiveCluster.nearestTanker.item.currentHub})` : "Tanker T-03 (12,000L)"}
                </strong>
                <span className="text-blue-700 font-semibold text-[11px]">
                  {topLiveCluster.nearestTanker ? `${topLiveCluster.nearestTanker.distanceKm} km · ETA ~15m` : "Ready at Hub"}
                </span>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-4 space-y-1">
                <span className="text-wari-textMuted text-[11px] block">Nearest Emergency Medical</span>
                <strong className="font-bold text-red-950 text-sm block truncate">
                  {topLiveCluster.nearestMedical ? topLiveCluster.nearestMedical.item.name : "Deenanath Mangeshkar Hospital"}
                </strong>
                <span className="text-red-700 font-semibold text-[11px]">
                  {topLiveCluster.nearestMedical ? `${topLiveCluster.nearestMedical.distanceKm} km away` : "2.6 km away"}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-dashed border-emerald-300 p-5 text-center">
              <p className="text-xs font-bold text-wari-textPrimary">Awaiting active Dindi live telemetry</p>
              <p className="text-[11px] text-wari-textMuted mt-0.5">
                Register a Dindi from <strong>/dindi</strong> to calculate nearest verified halts, water tankers, and medical posts in real time.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: WATER RESERVES & MOBILE FLEET ── */}
      {resourceTab === "WATER" && (
        <div className="space-y-6">
          {!isLiveMode && (
            <div
              className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                isMitigated
                  ? "bg-emerald-50 border-emerald-300"
                  : "bg-red-50 border-red-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl ${
                    isMitigated ? "bg-emerald-100 text-emerald-700" : "bg-red-500 text-white animate-pulse"
                  }`}
                >
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-wari-textPrimary">
                      Camp 5 (Saswad Palkhi Maidan) Water Advisory
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isMitigated ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {isMitigated ? "Resolved" : "Depletion in 34m"}
                    </span>
                  </div>
                  <p className="text-xs text-wari-textSecond mt-1">
                    {isMitigated
                      ? "Tanker T-03 (12,000L) connected. Safe buffer extended to 78 minutes."
                      : "Current stock at 18%. Burn rate of 420 L/min requires immediate replenishment."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isMitigated ? (
                  <button
                    onClick={dispatchTankerT03}
                    className="btn-primary flex items-center gap-2 shrink-0"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Dispatch Tanker T-03 (Hub 2)</span>
                  </button>
                ) : (
                  <div className="badge-normal flex items-center gap-2 px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tanker T-03 En Route (ETA 6m)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Grid: Camps 1-8 Water vs Mobile Tankers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Camps Water Stock Table (7 Cols) */}
            <div className="lg:col-span-7 card-base p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-wari-cardBorder">
                <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Camp Water Reserves (Camps 1–8)
                </h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  8 VERIFIED CAMPS
                </span>
              </div>

              <div className="space-y-3">
                {state.camps.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-wari-pageBg border border-wari-cardBorder text-xs space-y-2.5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-sm text-wari-textPrimary">{c.name}</span>
                        <div className="text-[11px] text-wari-textMuted">
                          Safe Capacity: {c.capacity.toLocaleString()} pilgrims • Water Burn Rate: {c.waterBurnRateLitersPerMin} L/min
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                          c.waterStockPercent <= 20
                            ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                            : c.waterStockPercent <= 50
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {c.waterStockPercent}% Stock
                      </span>
                    </div>

                    {/* Stock Bar */}
                    <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-wari-cardBorder">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          c.waterStockPercent <= 20
                            ? "bg-red-500"
                            : c.waterStockPercent <= 50
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${c.waterStockPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-wari-textMuted">
                      <span>Occupancy: {c.occupancyPercent}%</span>
                      <span
                        className={
                          c.minutesToWaterDepletion < 40 ? "text-red-600 font-bold" : "text-emerald-700 font-semibold"
                        }
                      >
                        Depletion Buffer: ~{c.minutesToWaterDepletion} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Water Tanker Fleet (5 Cols) */}
            <div className="lg:col-span-5 card-base p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-wari-cardBorder">
                <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Mobile Water Tanker Fleet ({state.tankers.length} Units)
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  LIVE STATUS
                </span>
              </div>

              <div className="space-y-3">
                {state.tankers.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-wari-pageBg border border-wari-cardBorder text-xs space-y-2 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold text-sm text-wari-textPrimary">{t.id}</span>
                        <span className="text-xs text-wari-textMuted font-mono">
                          ({t.capacityLiters.toLocaleString()} L)
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          t.status === "AVAILABLE"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.status === "EN_ROUTE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="text-xs text-wari-textSecond space-y-1">
                      <div>
                        <span className="text-wari-textMuted">Stationed At: </span>
                        <strong>{t.currentHub}</strong>
                      </div>
                      <div>
                        <span className="text-wari-textMuted">Driver / Contact: </span>
                        <span>{t.driverName}</span>
                      </div>
                      {t.assignedCampId && (
                        <div className="text-emerald-700 font-semibold">
                          <span>Assigned: {t.assignedCampId} (ETA {t.etaMinutes}m)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PRASAD & ANNA DAN KITCHENS (CAMPS 1-8) ── */}
      {resourceTab === "FOOD" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-wari-textPrimary flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              Anna Dan & Maha-Prasad Kitchens across Camps 1–8
            </h2>
            <span className="text-xs text-wari-textMuted">Prepared for ~250,000+ devotees daily</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {state.camps.map((c, idx) => (
              <div
                key={c.id}
                className="card-base p-5 space-y-3 text-xs border border-amber-200 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-wari-textPrimary">{c.name}</span>
                  <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                    {c.foodStockPercent}% Stock
                  </span>
                </div>
                <div className="w-full bg-wari-pageBg h-2.5 rounded-full overflow-hidden border border-wari-cardBorder">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${c.foodStockPercent}%` }}
                  />
                </div>
                <div className="space-y-1 text-wari-textSecond">
                  <div>
                    <span className="text-wari-textMuted">Safe Capacity: </span>
                    <strong>{c.capacity.toLocaleString()} pilgrims</strong>
                  </div>
                  <p className="text-[11px] text-wari-textMuted">
                    Maha-Prasad kitchen active. Hot khichdi, sheera & clean drinking water ready.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: SANITATION CREWS & MOBILE PODS ── */}
      {resourceTab === "SANITATION" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-wari-textPrimary flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-teal-600" />
              Corridor Sanitation Crews & Mobile Toilet Pods
            </h2>
            <span className="text-xs text-teal-800 font-bold bg-teal-100 px-2.5 py-0.5 rounded-full">
              {state.sanitationCrews.length} Crews Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.sanitationCrews.map((sc) => (
              <div
                key={sc.id}
                className="card-base p-5 space-y-2.5 text-xs border border-teal-200 hover:border-teal-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-sm text-wari-textPrimary">{sc.name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
                    {sc.status}
                  </span>
                </div>
                <p className="text-xs text-wari-textSecond">
                  Zone: <strong>{sc.zone}</strong> • Supervisor: <strong>{sc.leadName}</strong>
                </p>
                <div className="text-teal-900 text-xs font-semibold bg-teal-50 border border-teal-200 p-2.5 rounded-xl">
                  ✓ {sc.activeToiletsCleaned} Mobile sanitation pods disinfected & sanitized in the last hour
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
