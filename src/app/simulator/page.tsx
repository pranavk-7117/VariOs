"use client";

import React, { useState } from "react";
import {
  Sliders,
  RotateCcw,
  CloudRain,
  Users,
  Compass,
  Droplets,
  Sparkles,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import { SCENARIO_PRESETS, generateCounterfactualData } from "@/lib/counterfactual";
import { useSimulation } from "@/context/SimulationContext";
import { getLiveCrowdClusters } from "@/lib/live-ops";

export default function SimulatorPage() {
  const { state } = useSimulation();
  const [rainMmH, setRainMmH] = useState(18);
  const [pilgrimSurgePercent, setPilgrimSurgePercent] = useState(25);
  const [dindiSpeedKmH, setDindiSpeedKmH] = useState(3.2);
  const [waterFactor, setWaterFactor] = useState(0.8);
  const [activePreset, setActivePreset] = useState<string | null>("dive_ghat_rain");

  // Dynamic counterfactual calculation across all 4 parameters
  const counterfactualResults = generateCounterfactualData(
    rainMmH,
    1 + pilgrimSurgePercent / 100,
    dindiSpeedKmH,
    waterFactor
  );

  const liveClusters = getLiveCrowdClusters(state);
  const liveCluster = liveClusters[0];
  const liveBasePeople = liveCluster?.totalPilgrims ?? (state.totalPilgrims > 0 ? state.totalPilgrims : 45000);
  const liveCapacity = liveCluster?.capacity ?? 40000;
  const projectedPeople = Math.round(liveBasePeople * (1 + pilgrimSurgePercent / 100));
  const projectedOccupancy = liveCapacity > 0 ? Math.round((projectedPeople / liveCapacity) * 100) : 0;
  const activeResponseOccupancy = Math.max(
    0,
    Math.round(projectedOccupancy * 0.65 - Math.max(0, (waterFactor - 1) * 8) - Math.max(0, dindiSpeedKmH - 3.6) * 4)
  );

  const applyPreset = (presetId: string) => {
    const p = SCENARIO_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setActivePreset(presetId);
    setRainMmH(p.rainMmH);
    setPilgrimSurgePercent(Math.round((p.pilgrimMultiplier - 1) * 100));
    setDindiSpeedKmH(p.dindiSpeedKmH);
    setWaterFactor(p.waterSupplyFactor);
  };

  const resetParams = () => {
    setActivePreset(null);
    setRainMmH(18);
    setPilgrimSurgePercent(0);
    setDindiSpeedKmH(3.2);
    setWaterFactor(1.0);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="card-base p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-wari-orangeLight border border-orange-200 text-wari-orange flex items-center justify-center shadow-sm">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
              What-If Scenario Simulator
            </h1>
            <p className="text-sm text-wari-textSecond mt-0.5">
              Simulate weather events, crowd surges, and logistics delays to test corridor resilience
            </p>
          </div>
        </div>

        <button
          onClick={resetParams}
          className="btn-secondary flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Preset Scenarios Chips */}
      <div className="card-base p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-wari-textMuted uppercase tracking-wider block">
            Preset Operational Scenarios:
          </span>
          <span className="text-[11px] text-wari-textSecond">
            Click any scenario to auto-calibrate simulation parameters
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIO_PRESETS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => applyPreset(sc.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activePreset === sc.id
                  ? "bg-wari-orangeLight border-wari-orange shadow-sm ring-2 ring-wari-orange/30"
                  : "bg-wari-pageBg border-wari-cardBorder hover:border-orange-200 hover:bg-orange-50/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-wari-textPrimary block">
                  {sc.name}
                </span>
                {activePreset === sc.id && (
                  <span className="text-[10px] bg-orange-600 text-white font-bold px-1.5 py-0.5 rounded">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-wari-textSecond leading-relaxed">
                {sc.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Baseline Telemetry Strip */}
      <div className="card-base p-4 border border-emerald-200 bg-emerald-50/30">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white rounded-xl border border-emerald-200 p-3">
            <span className="text-wari-textMuted block text-[11px]">Base Pilgrims</span>
            <strong className="text-base text-wari-textPrimary font-black">{liveBasePeople.toLocaleString()}</strong>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 p-3">
            <span className="text-wari-textMuted block text-[11px]">Projected Surge</span>
            <strong className="text-base text-purple-700 font-black">{projectedPeople.toLocaleString()} (+{pilgrimSurgePercent}%)</strong>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 p-3">
            <span className="text-wari-textMuted block text-[11px]">Projected Unmanaged Load</span>
            <strong className={`text-base font-black ${projectedOccupancy > 100 ? "text-red-700" : "text-emerald-700"}`}>
              {projectedOccupancy}%
            </strong>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 p-3">
            <span className="text-wari-textMuted block text-[11px]">WariOS Managed Load</span>
            <strong className="text-base text-emerald-700 font-black flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
              {activeResponseOccupancy}%
            </strong>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 card-base p-6">
        {/* Slider 1: Rain */}
        <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-wari-textMuted flex items-center gap-1.5 font-medium">
              <CloudRain className="w-4 h-4 text-blue-500" />
              Rain Intensity
            </span>
            <span className="text-blue-600 font-bold text-sm">{rainMmH} mm/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={rainMmH}
            onChange={(e) => {
              setRainMmH(Number(e.target.value));
              setActivePreset(null);
            }}
            className="w-full accent-wari-orange cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-wari-textMuted">
            <span>0 (Dry)</span>
            <span>25 (Heavy)</span>
            <span>50 (Cloudburst)</span>
          </div>
        </div>

        {/* Slider 2: Pilgrim Surge */}
        <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-wari-textMuted flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-purple-500" />
              Pilgrim Volume
            </span>
            <span className="text-purple-700 font-bold text-sm">+{pilgrimSurgePercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={pilgrimSurgePercent}
            onChange={(e) => {
              setPilgrimSurgePercent(Number(e.target.value));
              setActivePreset(null);
            }}
            className="w-full accent-wari-orange cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-wari-textMuted">
            <span>Nominal</span>
            <span>+50%</span>
            <span>+100%</span>
          </div>
        </div>

        {/* Slider 3: Dindi Speed */}
        <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-wari-textMuted flex items-center gap-1.5 font-medium">
              <Compass className="w-4 h-4 text-wari-orange" />
              Dindi Walking Pace
            </span>
            <span className="text-wari-orange font-bold text-sm">{dindiSpeedKmH} km/h</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={dindiSpeedKmH}
            onChange={(e) => {
              setDindiSpeedKmH(Number(e.target.value));
              setActivePreset(null);
            }}
            className="w-full accent-wari-orange cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-wari-textMuted">
            <span>1.0 km/h (Slow)</span>
            <span>3.2 km/h</span>
            <span>5.0 km/h (Fast)</span>
          </div>
        </div>

        {/* Slider 4: Water Supply Factor */}
        <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-wari-textMuted flex items-center gap-1.5 font-medium">
              <Droplets className="w-4 h-4 text-emerald-500" />
              Water Logistics
            </span>
            <span className="text-emerald-700 font-bold text-sm">{waterFactor}x Fleet</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.1"
            value={waterFactor}
            onChange={(e) => {
              setWaterFactor(Number(e.target.value));
              setActivePreset(null);
            }}
            className="w-full accent-wari-orange cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-wari-textMuted">
            <span>0.2x Deficit</span>
            <span>1.0x Normal</span>
            <span>1.5x Surplus</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison: WITHOUT WariOS vs WITH WariOS */}
      <div className="card-base p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-wari-cardBorder">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-wari-orange" />
            <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider">
              Projected 45-Minute Outcome Comparison
            </h3>
          </div>
          <span className="text-xs text-wari-textMuted">
            Real-Time Dynamic Counterfactual Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: WITHOUT WariOS */}
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-red-200">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                Without WariOS (No Intervention)
              </span>
              <span className="badge-critical">
                Cascade Risk
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {counterfactualResults.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-red-200 flex items-center justify-between shadow-sm"
                >
                  <span className="text-wari-textPrimary font-medium">{r.metricName}</span>
                  <span className="text-red-700 font-bold text-sm">
                    {r.noActionValue}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: WITH WariOS */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                With WariOS (Active Mitigation)
              </span>
              <span className="badge-normal">
                Mitigated & Stable
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {counterfactualResults.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between shadow-sm"
                >
                  <span className="text-wari-textPrimary font-medium">{r.metricName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 font-bold text-sm">
                      {r.wariosValue}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                      {r.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
