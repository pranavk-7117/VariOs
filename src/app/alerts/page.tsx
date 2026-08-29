"use client";

import React, { useState } from "react";
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AlertsPage() {
  const { state, executeFullMitigation, isMitigated } = useSimulation();
  const { t } = useLanguage();
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const filteredAlerts = state.alerts.filter((a) => {
    if (filterSeverity === "ALL") return true;
    if (filterSeverity === "CRITICAL") return a.severity === "CRITICAL";
    if (filterSeverity === "HIGH") return a.severity === "HIGH";
    if (filterSeverity === "ACTIVE") return a.status === "ACTIVE";
    if (filterSeverity === "RESOLVED") return a.status !== "ACTIVE";
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-base p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shadow-sm">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
              Alert Management Center
            </h1>
            <p className="text-sm text-wari-textSecond mt-0.5">
              Automated threshold alerts, predictive risk warnings, and instant mitigation controls
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-wari-pageBg p-1 rounded-xl border border-wari-cardBorder text-xs">
          {["ALL", "CRITICAL", "HIGH", "ACTIVE", "RESOLVED"].map((flt) => (
            <button
              key={flt}
              onClick={() => setFilterSeverity(flt)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                filterSeverity === flt
                  ? "bg-wari-orange text-white shadow-sm"
                  : "text-wari-textSecond hover:text-wari-textPrimary"
              }`}
            >
              {flt}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`card-base p-6 space-y-4 transition-all ${
              alert.severity === "CRITICAL"
                ? "border-red-300 bg-red-50/50"
                : alert.severity === "HIGH"
                ? "border-orange-200 bg-orange-50/40"
                : ""
            }`}
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-wari-cardBorder">
              <div className="flex items-center gap-3">
                {alert.severity === "CRITICAL" ? (
                  <AlertOctagon className="w-5 h-5 text-red-600 animate-pulse" />
                ) : alert.severity === "HIGH" ? (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                ) : (
                  <Info className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <h3 className="text-base font-bold text-wari-textPrimary">
                    {alert.title}
                  </h3>
                  <span className="text-xs text-wari-textMuted">
                    Location: {alert.location} • Timestamp: {alert.timestamp}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-white border border-wari-cardBorder text-wari-orange font-bold">
                  Priority: {alert.priorityScore}/100
                </span>
                <span
                  className={`px-3 py-1 rounded-full font-bold ${
                    alert.status === "ACTIVE"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {alert.status}
                </span>
              </div>
            </div>

            {/* Content info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-1">
                <span className="text-wari-textMuted text-xs font-bold uppercase tracking-wider block">
                  Root Cause:
                </span>
                <p className="text-wari-textSecond leading-relaxed">{alert.cause}</p>
              </div>

              <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-1">
                <span className="text-wari-textMuted text-xs font-bold uppercase tracking-wider block">
                  45-Minute Forecast:
                </span>
                <p className="text-wari-textSecond leading-relaxed">{alert.forecastText}</p>
              </div>
            </div>

            {/* Recommendation & Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-wari-cardBorder text-xs">
              <div className="text-wari-textPrimary">
                <span className="text-wari-orange font-bold">Recommended Action: </span>
                <span className="text-wari-textSecond">{alert.recommendedAction}</span>
              </div>

              {alert.status === "ACTIVE" ? (
                <button
                  onClick={executeFullMitigation}
                  className="btn-primary flex items-center gap-2 shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>Execute Mitigation</span>
                </button>
              ) : (
                <div className="badge-normal flex items-center gap-2 px-4 py-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mitigation In Progress</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
