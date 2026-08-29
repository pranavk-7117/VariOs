"use client";

import React, { useState } from "react";
import {
  Droplets,
  Truck,
  Zap,
  CheckCircle2,
  Utensils,
  Trash2,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";

export default function ResourcesPage() {
  const { state, dispatchTankerT03, isMitigated } = useSimulation();
  const [resourceTab, setResourceTab] = useState<"WATER" | "FOOD" | "SANITATION">("WATER");

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-base p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
              Resource Logistics Optimizer
            </h1>
            <p className="text-sm text-wari-textSecond mt-0.5">
              Monitor water tanker fleets, camp consumption rates, food supplies, and sanitation squads
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-wari-pageBg p-1 rounded-xl border border-wari-cardBorder">
          <button
            onClick={() => setResourceTab("WATER")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              resourceTab === "WATER"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water Fleet (6)</span>
          </button>
          <button
            onClick={() => setResourceTab("FOOD")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              resourceTab === "FOOD"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Prasad & Food (8)</span>
          </button>
          <button
            onClick={() => setResourceTab("SANITATION")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              resourceTab === "SANITATION"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sanitation (4)</span>
          </button>
        </div>
      </div>

      {/* Critical Water Highlight Card */}
      {resourceTab === "WATER" && (
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
                  Camp 6 (Saswad) Water Crisis Advisory
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

      {/* Main Grid: Camps vs Fleet */}
      {resourceTab === "WATER" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Camps Water Stock Table (7 Cols) */}
          <div className="lg:col-span-7 card-base p-6 space-y-4">
            <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider">
              Camp Water Reserves (8 Camps)
            </h3>

            <div className="space-y-3">
              {state.camps.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-wari-pageBg border border-wari-cardBorder text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-wari-textPrimary">{c.name}</span>
                      <span className="text-xs text-wari-textMuted">
                        ({c.currentOccupancy.toLocaleString()} Pilgrims)
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
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

                  <div className="flex items-center justify-between text-xs text-wari-textMuted">
                    <span>Burn Rate: {c.waterBurnRateLitersPerMin} L/min</span>
                    <span
                      className={
                        c.minutesToWaterDepletion < 40 ? "text-red-600 font-bold" : "text-emerald-700 font-semibold"
                      }
                    >
                      Depletion Buffer: {c.minutesToWaterDepletion} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Water Tanker Fleet (5 Cols) */}
          <div className="lg:col-span-5 card-base p-6 space-y-4">
            <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider">
              Mobile Water Tanker Fleet (6 Units)
            </h3>

            <div className="space-y-3">
              {state.tankers.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-wari-pageBg border border-wari-cardBorder text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-sm text-wari-textPrimary">Tanker {t.id}</span>
                      <span className="text-xs text-wari-textMuted">
                        ({t.capacityLiters.toLocaleString()} L)
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
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
                      <span>{t.currentHub}</span>
                    </div>
                    <div>
                      <span className="text-wari-textMuted">Driver: </span>
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
      )}

      {/* Food & Prasad Tab */}
      {resourceTab === "FOOD" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.camps.map((c) => (
            <div
              key={c.id}
              className="card-base p-5 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-wari-textPrimary">{c.name.split(" ")[0]}</span>
                <span className="text-emerald-700 font-bold">{c.foodStockPercent}% Stock</span>
              </div>
              <div className="w-full bg-wari-pageBg h-2.5 rounded-full overflow-hidden border border-wari-cardBorder">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${c.foodStockPercent}%` }}
                />
              </div>
              <p className="text-xs text-wari-textMuted">
                Prasad & Khichdi kitchen active. Prepared for {c.capacity.toLocaleString()} servings.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Sanitation Tab */}
      {resourceTab === "SANITATION" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.sanitationCrews.map((sc) => (
            <div
              key={sc.id}
              className="card-base p-5 space-y-2.5 text-xs"
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
                Zone: {sc.zone} • Supervisor: {sc.leadName}
              </p>
              <div className="text-emerald-700 text-xs font-semibold">
                ✓ {sc.activeToiletsCleaned} Mobile sanitation pods sanitized in the last hour
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
