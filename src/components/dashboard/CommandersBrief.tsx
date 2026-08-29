"use client";

import React from "react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";
import { AlertTriangle, ArrowRight, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

const RISK_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  CRITICAL:  { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    badge: "badge-critical" },
  HIGH:      { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "badge-high" },
  ATTENTION: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  badge: "badge-medium" },
};

export const CommandersBrief: React.FC = () => {
  const { state, executeFullMitigation, isMitigated } = useSimulation();
  const { t } = useLanguage();

  const criticalAlerts = state.alerts
    .filter((a) => a.status === "ACTIVE")
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);

  const topAlert = criticalAlerts[0];

  if (criticalAlerts.length === 0) {
    return (
      <div className="card-base p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="text-emerald-600 text-xl">✓</span>
        </div>
        <div>
          <p className="font-bold text-wari-textPrimary">{t("brief.title")}</p>
          <p className="text-sm text-emerald-600 font-medium">
            All corridors clear. No active incidents requiring attention.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base overflow-hidden">
      {/* Header strip */}
      <div className="px-5 py-3.5 border-b border-wari-cardBorder flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-wari-orange" />
            <h2 className="font-bold text-sm text-wari-textPrimary">{t("brief.title")}</h2>
          </div>
          <span className="badge-critical">
            {criticalAlerts.length} {t("brief.requiresAttention")}
          </span>
        </div>
        <span className="text-xs text-wari-textMuted font-mono">{state.currentClock}</span>
      </div>

      {/* Alert cards */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {criticalAlerts.map((alert, idx) => {
          const styles = RISK_STYLES[alert.severity] ?? RISK_STYLES.ATTENTION;
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border-2 ${styles.bg} ${styles.border} ${idx === 0 ? "ring-2 ring-offset-1 ring-red-300" : ""}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={styles.badge}>{alert.severity}</span>
                <span className="text-xs text-wari-textMuted font-mono">−{alert.timeToCriticalMinutes}m</span>
              </div>
              <p className="font-bold text-wari-textPrimary text-sm mb-0.5">{alert.title}</p>
              <p className="text-xs text-wari-textSecond">{alert.cause}</p>
            </div>
          );
        })}
      </div>

      {/* Priority action strip */}
      {topAlert && !isMitigated && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-wari-orangeLight border border-orange-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-wari-orange uppercase tracking-wider">{t("brief.topPriority")}</p>
            <p className="font-bold text-wari-textPrimary text-sm">{topAlert.title}</p>
            <p className="text-xs text-wari-textSecond mt-0.5">{t("brief.recommended")}: {topAlert.recommendedAction}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/incidents">
              <button className="btn-secondary text-xs px-3 py-1.5">{t("brief.viewIncident")}</button>
            </Link>
            <button onClick={executeFullMitigation} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {t("brief.executeResponse")}
            </button>
          </div>
        </div>
      )}

      {isMitigated && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
          <span className="text-emerald-600 font-bold text-sm">✓</span>
          <span className="text-sm text-emerald-700 font-semibold">Mitigation response executed. Monitoring verification…</span>
        </div>
      )}
    </div>
  );
};
