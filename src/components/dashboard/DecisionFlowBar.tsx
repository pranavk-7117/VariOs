"use client";

import React from "react";
import { CheckCircle2, Activity } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";
import { DecisionStage } from "@/lib/types";

const STAGE_KEYS: { key: DecisionStage; labelKey: string; desc: string }[] = [
  { key: "DETECTED",    labelKey: "stage.detected",    desc: "Anomaly Identified" },
  { key: "PREDICTED",   labelKey: "stage.predicted",   desc: "+45m Forecast" },
  { key: "EXPLAINED",   labelKey: "stage.explained",   desc: "Root Causes" },
  { key: "RECOMMENDED", labelKey: "stage.recommended", desc: "Action Plan" },
  { key: "DECIDED",     labelKey: "stage.decided",     desc: "Officer Sign-Off" },
  { key: "DISPATCHED",  labelKey: "stage.dispatched",  desc: "Multi-Agency" },
  { key: "VERIFIED",    labelKey: "stage.verified",    desc: "Outcome Confirmed" },
];

export const DecisionFlowBar: React.FC = () => {
  const { state, isMitigated } = useSimulation();
  const { t } = useLanguage();

  const currentIdx = isMitigated
    ? 6
    : STAGE_KEYS.findIndex((s) => s.key === state.decisionStage);

  return (
    <div className="card-base p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-wari-orange" />
          <span className="text-xs font-bold uppercase tracking-wider text-wari-textPrimary">
            Operational Decision Flow
          </span>
        </div>
        <span className="text-xs">
          {isMitigated ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Outcome Verified
            </span>
          ) : (
            <span className="text-wari-textSecond">
              Step {currentIdx + 1}/7 — {t(STAGE_KEYS[currentIdx]?.labelKey ?? "stage.detected")}
            </span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STAGE_KEYS.map((stg, idx) => {
          const isDone    = idx < currentIdx || isMitigated;
          const isCurrent = idx === currentIdx && !isMitigated;

          return (
            <div
              key={stg.key}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isDone
                  ? "bg-emerald-50 border-emerald-200"
                  : isCurrent
                  ? "bg-wari-orangeLight border-wari-orange shadow-sm"
                  : "bg-wari-pageBg border-wari-cardBorder"
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isCurrent
                        ? "bg-wari-orange text-white"
                        : "bg-wari-cardBorder text-wari-textMuted"
                    }`}
                  >
                    {idx + 1}
                  </span>
                )}
                <span
                  className={`text-xs font-bold ${
                    isDone ? "text-emerald-700" : isCurrent ? "text-wari-orange" : "text-wari-textMuted"
                  }`}
                >
                  {t(stg.labelKey)}
                </span>
              </div>
              <span
                className={`text-[10px] block truncate ${
                  isDone ? "text-emerald-600" : isCurrent ? "text-orange-700" : "text-wari-textMuted"
                }`}
              >
                {stg.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
