"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

interface PriorityGaugeProps {
  score: number;
  breakdown?: {
    density: number;
    urgency: number;
    population: number;
    resource: number;
  };
  title?: string;
  showBreakdown?: boolean;
}

export const PriorityGauge: React.FC<PriorityGaugeProps> = ({
  score,
  breakdown,
  title = "Operational Priority Score",
  showBreakdown = true,
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 85) return "text-red-700 border-red-300 bg-red-50";
    if (val >= 70) return "text-orange-700 border-orange-300 bg-orange-50";
    if (val >= 50) return "text-amber-700 border-amber-300 bg-amber-50";
    return "text-emerald-700 border-emerald-300 bg-emerald-50";
  };

  const getBarColor = (val: number) => {
    if (val >= 85) return "bg-gradient-to-r from-orange-500 to-red-600";
    if (val >= 70) return "bg-gradient-to-r from-amber-500 to-orange-500";
    if (val >= 50) return "bg-gradient-to-r from-yellow-400 to-amber-500";
    return "bg-gradient-to-r from-teal-400 to-emerald-500";
  };

  return (
    <div className="card-base p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-wari-orange" />
          <span className="text-sm font-bold text-wari-textPrimary">
            {title}
          </span>
        </div>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full border ${getScoreColor(
            score
          )}`}
        >
          {score} / 100
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-wari-pageBg h-3 rounded-full overflow-hidden p-0.5 border border-wari-cardBorder">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(
            score
          )}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>

      {/* Factor Breakdown */}
      {showBreakdown && breakdown && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-wari-cardBorder text-xs">
          <div className="bg-wari-pageBg p-3 rounded-xl border border-wari-cardBorder">
            <span className="text-wari-textMuted block text-xs">Density Risk</span>
            <span className="text-wari-orange font-bold text-base">+{breakdown.density}</span>
            <span className="text-wari-textMuted text-[11px] block">/ 35 max</span>
          </div>
          <div className="bg-wari-pageBg p-3 rounded-xl border border-wari-cardBorder">
            <span className="text-wari-textMuted block text-xs">Time Urgency</span>
            <span className="text-red-600 font-bold text-base">+{breakdown.urgency}</span>
            <span className="text-wari-textMuted text-[11px] block">/ 25 max</span>
          </div>
          <div className="bg-wari-pageBg p-3 rounded-xl border border-wari-cardBorder">
            <span className="text-wari-textMuted block text-xs">Crowd Volume</span>
            <span className="text-purple-600 font-bold text-base">+{breakdown.population}</span>
            <span className="text-wari-textMuted text-[11px] block">/ 20 max</span>
          </div>
          <div className="bg-wari-pageBg p-3 rounded-xl border border-wari-cardBorder">
            <span className="text-wari-textMuted block text-xs">Resource Deficit</span>
            <span className="text-amber-600 font-bold text-base">+{breakdown.resource}</span>
            <span className="text-wari-textMuted text-[11px] block">/ 20 max</span>
          </div>
        </div>
      )}
    </div>
  );
};
