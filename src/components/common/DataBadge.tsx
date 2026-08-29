"use client";

import React from "react";
import { Sparkles, Activity, Cpu, AlertTriangle } from "lucide-react";

export type DataBadgeType =
  | "LIVE_DATA"
  | "SIMULATED_DATA"
  | "SIMULATED_FORECAST"
  | "AI_RECOMMENDATION";

interface DataBadgeProps {
  type: DataBadgeType;
  customText?: string;
  size?: "sm" | "md";
}

export const DataBadge: React.FC<DataBadgeProps> = ({
  type,
  customText,
  size = "sm",
}) => {
  const configs = {
    LIVE_DATA: {
      label: customText || "LIVE TELEMETRY",
      bg: "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
      dot: "bg-emerald-400 animate-pulse",
      icon: Activity,
    },
    SIMULATED_DATA: {
      label: customText || "SIMULATED DATA",
      bg: "bg-purple-950/80 border-purple-500/40 text-purple-300",
      dot: "bg-purple-400",
      icon: Cpu,
    },
    SIMULATED_FORECAST: {
      label: customText || "SIMULATED FORECAST (+45M)",
      bg: "bg-amber-950/80 border-amber-500/40 text-amber-300",
      dot: "bg-amber-400 animate-pulse",
      icon: AlertTriangle,
    },
    AI_RECOMMENDATION: {
      label: customText || "AI RECOMMENDATION",
      bg: "bg-orange-950/80 border-wari-orange/50 text-orange-200",
      dot: "bg-wari-orange animate-pulse",
      icon: Sparkles,
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 gap-1.5"
      : "text-xs px-2.5 py-1 gap-2";

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border shadow-sm backdrop-blur-md transition-all ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3 opacity-80" />
      <span>{config.label}</span>
    </span>
  );
};

export const RiskPill: React.FC<{
  level: "NORMAL" | "ATTENTION" | "HIGH" | "CRITICAL";
  showDot?: boolean;
}> = ({ level, showDot = true }) => {
  const colors = {
    NORMAL: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    ATTENTION: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    HIGH: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    CRITICAL: "bg-red-500/20 border-red-500/50 text-red-400 shadow-glowRed",
  };

  const dots = {
    NORMAL: "bg-emerald-400",
    ATTENTION: "bg-amber-400",
    HIGH: "bg-orange-400",
    CRITICAL: "bg-red-400 animate-ping",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider border ${colors[level]}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dots[level]}`} />}
      <span>{level}</span>
    </span>
  );
};
