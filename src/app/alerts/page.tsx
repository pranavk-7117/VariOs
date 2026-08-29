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
  const { t, language } = useLanguage();
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const pageCopy = {
    en: {
      title: "Alert Management Center",
      subtitle: "Automated threshold alerts, predictive risk warnings, and instant mitigation controls",
      filterAll: "ALL",
      filterCritical: "CRITICAL",
      filterHigh: "HIGH",
      filterActive: "ACTIVE",
      filterResolved: "RESOLVED",
      location: "Location",
      timestamp: "Timestamp",
      priority: "Priority",
      rootCause: "Root Cause:",
      forecast: "45-Minute Forecast:",
      recommended: "Recommended Action:",
      executeMitigation: "Execute Mitigation",
      mitigationInProgress: "Mitigation In Progress",
    },
    hi: {
      title: "अलर्ट प्रबंधन केंद्र",
      subtitle: "स्वचालित सीमा अलर्ट, पूर्वानुमान जोखिम चेतावनी और तत्काल शमन नियंत्रण",
      filterAll: "सभी",
      filterCritical: "गंभीर",
      filterHigh: "उच्च",
      filterActive: "सक्रिय",
      filterResolved: "हल हुए",
      location: "स्थान",
      timestamp: "समय",
      priority: "प्राथमिकता",
      rootCause: "मूल कारण:",
      forecast: "45 मिनट का पूर्वानुमान:",
      recommended: "अनुशंसित कार्रवाई:",
      executeMitigation: "शमन क्रियान्वित करें",
      mitigationInProgress: "शमन प्रगति पर",
    },
    mr: {
      title: "इशारा व्यवस्थापन केंद्र",
      subtitle: "स्वयंचलित मर्यादा इशारे, अंदाजित धोका सूचना आणि त्वरित कृती नियंत्रण",
      filterAll: "सर्व",
      filterCritical: "गंभीर",
      filterHigh: "उच्च",
      filterActive: "सक्रिय",
      filterResolved: "निराकरण झाले",
      location: "स्थान",
      timestamp: "वेळ",
      priority: "प्राधान्य",
      rootCause: "मूळ कारण:",
      forecast: "४५ मिनिटांचा अंदाज:",
      recommended: "शिफारस केलेली कृती:",
      executeMitigation: "निवारण कृती करा",
      mitigationInProgress: "निवारण सुरू आहे",
    },
  };
  const pc = pageCopy[language] ?? pageCopy.en;

  const filterLabels: Record<string, string> = {
    ALL: pc.filterAll,
    CRITICAL: pc.filterCritical,
    HIGH: pc.filterHigh,
    ACTIVE: pc.filterActive,
    RESOLVED: pc.filterResolved,
  };

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
              {pc.title}
            </h1>
            <p className="text-sm text-wari-textSecond mt-0.5">
              {pc.subtitle}
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
              {filterLabels[flt] ?? flt}
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
                    {pc.location}: {alert.location} • {pc.timestamp}: {alert.timestamp}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-white border border-wari-cardBorder text-wari-orange font-bold">
                  {pc.priority}: {alert.priorityScore}/100
                </span>
                <span
                  className={`px-3 py-1 rounded-full font-bold ${
                    alert.status === "ACTIVE"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {alert.status === "ACTIVE" ? pc.filterActive : pc.filterResolved}
                </span>
              </div>
            </div>

            {/* Content info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-1">
                <span className="text-wari-textMuted text-xs font-bold uppercase tracking-wider block">
                  {pc.rootCause}
                </span>
                <p className="text-wari-textSecond leading-relaxed">{alert.cause}</p>
              </div>

              <div className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder space-y-1">
                <span className="text-wari-textMuted text-xs font-bold uppercase tracking-wider block">
                  {pc.forecast}
                </span>
                <p className="text-wari-textSecond leading-relaxed">{alert.forecastText}</p>
              </div>
            </div>

            {/* Recommendation & Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-wari-cardBorder text-xs">
              <div className="text-wari-textPrimary">
                <span className="text-wari-orange font-bold">{pc.recommended} </span>
                <span className="text-wari-textSecond">{alert.recommendedAction}</span>
              </div>

              {alert.status === "ACTIVE" ? (
                <button
                  onClick={executeFullMitigation}
                  className="btn-primary flex items-center gap-2 shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>{pc.executeMitigation}</span>
                </button>
              ) : (
                <div className="badge-normal flex items-center gap-2 px-4 py-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{pc.mitigationInProgress}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
