"use client";

import React from "react";
import { ArrowRight, ShieldCheck, TrendingDown, X } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { getLiveCrowdClusters } from "@/lib/live-ops";

export const BeforeAfterImpactModal: React.FC = () => {
  const { state, closeBeforeAfterModal } = useSimulation();

  if (!state.showBeforeAfterModal || !state.beforeAfterSummary) return null;

  const liveCluster = !state.isSimulating ? getLiveCrowdClusters(state)[0] : null;
  const verificationText = state.isSimulating
    ? "Simulated telemetry confirms the multi-agency mitigation plan successfully stabilized the Dive Ghat corridor. The chokepoint was deflated, Camp 6 overflow was diverted to Shelter B, and water reserves have been replenished."
    : `Live command data confirms the MMCOE response is in progress for ${
        liveCluster?.dindis.map((dindi) => dindi.name).join(" + ") || "registered Dindis"
      }. WariOS matched the crowd to the nearest halt, medical post, water point, sanitation crew, and volunteer team using the latest GPS position.`;

  const footerText = state.isSimulating
    ? "✓ 4 Operations Confirmed: Bypass B Active, Tanker T-03 En Route, 5 Volunteers Deployed, Shelter B Open."
    : `✓ Live Operations Confirmed: ${
        liveCluster?.nearestCamp?.item.name ?? "nearest halt"
      } assigned, ${liveCluster?.nearestMedical?.item.name ?? "medical post"} notified, ${
        liveCluster?.nearestTanker?.item.currentHub ?? "water point"
      } staged, volunteers alerted.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden space-y-6">
        <button
          onClick={closeBeforeAfterModal}
          className="absolute top-5 right-5 p-2 rounded-xl bg-wari-pageBg hover:bg-wari-cardBorder text-wari-textMuted hover:text-wari-textPrimary transition-colors"
          aria-label="Close verification modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 pr-12">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Closed-Loop Verification Complete
            </span>
            <h3 className="text-2xl font-bold text-wari-textPrimary tracking-tight mt-1">
              Response Effective & Verified
            </h3>
          </div>
        </div>

        <p className="text-sm text-wari-textSecond leading-relaxed">{verificationText}</p>

        <div className="space-y-3">
          <div className="grid grid-cols-12 text-xs font-semibold text-wari-textMuted px-4 pb-1 uppercase tracking-wider">
            <span className="col-span-5">Metric / Subsystem</span>
            <span className="col-span-3 text-center">Before Action</span>
            <span className="col-span-4 text-right">After Mitigation</span>
          </div>

          {state.beforeAfterSummary.map((item, idx) => (
            <div
              key={`${item.metric}-${idx}`}
              className="grid grid-cols-12 items-center p-4 rounded-xl bg-wari-pageBg border border-wari-cardBorder text-xs gap-2"
            >
              <div className="col-span-5 font-bold text-sm text-wari-textPrimary">{item.metric}</div>
              <div className="col-span-3 text-center text-red-600 font-bold text-sm line-through opacity-75">
                {item.before}
              </div>
              <div className="col-span-4 flex items-center justify-end gap-2.5 min-w-0">
                <span className="text-emerald-700 font-bold text-sm break-words text-right">{item.after}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold flex items-center gap-1 shrink-0">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {item.deltaText}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-wari-cardBorder flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-emerald-700 font-medium">{footerText}</span>
          <button
            onClick={closeBeforeAfterModal}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-md"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
