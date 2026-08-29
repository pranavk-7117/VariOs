"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, AlertOctagon, AlertTriangle, Info, Clock, CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";

export const AlertTimeline: React.FC = () => {
  const { state, executeFullMitigation, isMitigated } = useSimulation();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"ALERTS" | "EVENTS">("ALERTS");

  const alertBg: Record<string, string> = {
    CRITICAL: "bg-red-50 border-red-200",
    HIGH:     "bg-orange-50 border-orange-200",
    MEDIUM:   "bg-amber-50 border-amber-200",
  };

  return (
    <div className="card-base">
      {/* Header */}
      <div className="px-5 py-4 border-b border-wari-cardBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-wari-pageBg border border-wari-cardBorder rounded-xl">
          <button
            onClick={() => setTab("ALERTS")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "ALERTS" ? "bg-wari-orange text-white shadow-sm" : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Active Alerts ({state.alerts.length})
          </button>
          <button
            onClick={() => setTab("EVENTS")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "EVENTS" ? "bg-wari-orange text-white shadow-sm" : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Audit Log ({state.events.length})
          </button>
        </div>

        <Link
          href="/alerts"
          className="text-xs text-wari-orange hover:text-orange-600 flex items-center gap-1.5 font-semibold transition-colors"
        >
          Open Alert Center <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      <div className="divide-y divide-wari-cardBorder max-h-72 overflow-y-auto">
        {tab === "ALERTS"
          ? state.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  alertBg[alert.severity] ?? ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {alert.severity === "CRITICAL" ? (
                      <AlertOctagon className="w-4 h-4 text-red-500" />
                    ) : alert.severity === "HIGH" ? (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Info className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-wari-textPrimary">{alert.title}</span>
                      <span className="text-xs text-wari-textMuted">· {alert.location}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-wari-cardBorder text-wari-textSecond font-medium">
                        Priority: {alert.priorityScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-wari-textSecond">{alert.cause}</p>
                    <p className="text-xs text-wari-textMuted">Forecast: {alert.forecastText}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-wari-textMuted">
                    {alert.status === "ACTIVE" ? `In ${alert.timeToCriticalMinutes}m` : "Mitigating"}
                  </span>
                  {alert.status === "ACTIVE" ? (
                    <button
                      onClick={executeFullMitigation}
                      className="btn-primary px-3 py-1.5 flex items-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Mitigate
                    </button>
                  ) : (
                    <span className="badge-normal flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> In Progress
                    </span>
                  )}
                </div>
              </div>
            ))
          : state.events.map((ev) => (
              <div key={ev.id} className="px-5 py-3 flex items-start gap-4 text-xs hover:bg-wari-pageBg transition-colors">
                <span className="text-wari-textMuted font-mono shrink-0 w-16">{ev.timestamp}</span>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-wari-textPrimary">{ev.source}</span>
                    <span className="badge-sim">{ev.eventType}</span>
                  </div>
                  <p className="text-wari-textSecond">{ev.description}</p>
                  {ev.result && <p className="text-emerald-600">✓ {ev.result}</p>}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};
