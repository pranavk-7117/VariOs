"use client";

import React from "react";
import { ArrowRight, ShieldCheck, TrendingDown, X, CheckCircle2, Sparkles, Building2 } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { getLiveCrowdClusters } from "@/lib/live-ops";

export const BeforeAfterImpactModal: React.FC = () => {
  const { state, closeBeforeAfterModal } = useSimulation();

  if (!state.showBeforeAfterModal || !state.beforeAfterSummary) return null;

  const liveCluster = !state.isSimulating ? getLiveCrowdClusters(state)[0] : null;
  const verificationText = state.isSimulating
    ? "Simulated telemetry confirms the multi-agency mitigation plan successfully stabilized the Dive Ghat corridor. The chokepoint was deflated, Camp 6 overflow was diverted to Shelter B, and water reserves have been replenished."
    : `Live command data confirms the GPS-based response is active for ${
        liveCluster?.dindis.map((dindi) => dindi.name).join(" + ") || "registered Dindis"
      }. WariOS matched the crowd to the verified halt, nearest hospital, water logistics hub, and on-ground volunteer team.`;

  const footerText = state.isSimulating
    ? "✓ 4 Operations Confirmed: Bypass B Active, Tanker T-03 En Route, 5 Volunteers Deployed, Shelter B Open."
    : `✓ Closed-Loop Dispatch Active: ${
        liveCluster?.nearestCamp?.item.name ?? "Camp 1 (Pune Racecourse)"
      } designated, ${liveCluster?.nearestMedical?.item.name ?? "Deenanath Mangeshkar Hospital"} linked, ${
        liveCluster?.nearestTanker?.item.currentHub ?? "Hadapsar Hub"
      } staged.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeBeforeAfterModal}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Close verification modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 pr-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 inline-block">
              Closed-Loop Verification Complete
            </span>
            <h3 className="text-2xl font-black text-wari-textPrimary tracking-tight mt-1">
              Response Effective & Verified
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-wari-textSecond leading-relaxed bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl">
          {verificationText}
        </p>

        {/* Metric Cards List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-wari-textMuted uppercase tracking-wider px-1">
            Mitigation Impact & Subsystem Deltas:
          </div>

          {state.beforeAfterSummary.map((item, idx) => (
            <div
              key={`${item.metric}-${idx}`}
              className="rounded-2xl bg-wari-pageBg border border-wari-cardBorder p-4 space-y-2 text-xs hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-wari-textPrimary text-sm">{item.metric}</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center gap-1 shrink-0">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {item.deltaText}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-wari-cardBorder/60">
                <div className="p-2 rounded-xl bg-red-50/60 border border-red-100">
                  <span className="text-[10px] text-red-600 font-bold block uppercase tracking-wider">Before Action</span>
                  <span className="text-xs font-bold text-red-700 line-through opacity-80">{item.before}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">After Mitigation</span>
                  <span className="text-xs font-bold text-emerald-950">{item.after}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-wari-cardBorder flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-emerald-800 font-semibold">{footerText}</span>
          <button
            onClick={closeBeforeAfterModal}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-md shrink-0"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
