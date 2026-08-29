"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Map, Layers, Navigation, AlertTriangle } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";

// Dynamic import prevents SSR for Leaflet
const WariOSMap = dynamic(
  () => import("@/components/map/WariOSMap").then((m) => ({ default: m.WariOSMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full bg-[#e8e0d5] animate-pulse flex items-center justify-center rounded-2xl" style={{ height: "580px" }}>
        <div className="text-center">
          <Map className="w-8 h-8 text-wari-textMuted mx-auto mb-2" />
          <p className="text-sm text-wari-textMuted">Loading OpenStreetMap…</p>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  const { state } = useSimulation();
  const { t } = useLanguage();

  const criticalCPs = state.isSimulating ? state.checkpoints.filter((cp) => cp.risk === "CRITICAL") : [];
  const highCPs     = state.checkpoints.filter((cp) => cp.risk === "HIGH");

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-wari-textPrimary">{t("map.title")}</h1>
          <p className="text-sm text-wari-textSecond mt-0.5">
            Pune (Alandi) → Pandharpur · 240 km · OpenStreetMap
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Legend */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-wari-cardBorder rounded-xl text-xs">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600 inline-block" /><span className="text-wari-textSecond">Critical</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /><span className="text-wari-textSecond">High</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /><span className="text-wari-textSecond">Normal</span></div>
          </div>
          <div className="badge-live flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"/><span className="relative rounded-full h-1.5 w-1.5 bg-emerald-500"/></span>
            OpenStreetMap Live
          </div>
        </div>
      </div>

      {/* Alert row */}
      {criticalCPs.length > 0 && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            <strong>{criticalCPs.map((c) => c.shortCode).join(", ")}</strong> —{" "}
            Demo archive critical density. Click markers on map for historical stats and bypass options.
          </p>
        </div>
      )}

      {/* Full-width map */}
      <div className="card-base overflow-hidden p-2">
        <WariOSMap height="580px" showLayerControl zoom={9} />
      </div>

      {/* Checkpoint status strip */}
      {state.isSimulating && <div>
        <h2 className="section-label">Checkpoint Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {state.checkpoints.map((cp) => {
            const riskColor: Record<string, string> = {
              CRITICAL:  "bg-red-100 border-red-300 text-red-800",
              HIGH:      "bg-orange-100 border-orange-300 text-orange-800",
              ATTENTION: "bg-amber-100 border-amber-300 text-amber-800",
              NORMAL:    "bg-emerald-100 border-emerald-300 text-emerald-800",
            };
            return (
              <div
                key={cp.id}
                className={`p-3 rounded-xl border text-center ${riskColor[cp.risk] ?? riskColor.NORMAL}`}
              >
                <p className="text-xs font-bold">{cp.shortCode}</p>
                <p className="text-lg font-black">{cp.currentDensity}%</p>
                <p className="text-[10px] font-semibold uppercase">{cp.risk}</p>
              </div>
            );
          })}
        </div>
      </div>}
    </div>
  );
}
