"use client";

import React from "react";
import { CheckCircle2, Activity, Database, ShieldCheck } from "lucide-react";

export const SystemHealthBar: React.FC = () => {
  return (
    <div className="h-7 bg-wari-pageBg border-t border-wari-cardBorder px-5 flex items-center justify-between text-[10px] font-mono text-wari-textMuted select-none">
      <div className="flex items-center gap-4 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0 text-emerald-600">
          <CheckCircle2 className="w-3 h-3" />
          <span className="font-semibold">All Systems Operational</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <Activity className="w-3 h-3 text-wari-orange" />
          <span>Telemetry:</span>
          <span className="text-emerald-600 font-semibold">Live</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <Database className="w-3 h-3 text-blue-500" />
          <span>AI Forecast (45-min):</span>
          <span className="text-emerald-600 font-semibold">Active</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3 h-3 text-purple-500" />
          <span>Copilot:</span>
          <span className="text-emerald-600 font-semibold">State Grounded</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-wari-textMuted">Pune–Pandharpur Corridor</span>
        <span className="px-1.5 py-0.5 rounded bg-white text-wari-textPrimary border border-wari-cardBorder">
          WariOS v2.4
        </span>
      </div>
    </div>
  );
};
