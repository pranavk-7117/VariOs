"use client";

import React from "react";
import { CommandersBrief } from "@/components/dashboard/CommandersBrief";
import { DecisionFlowBar } from "@/components/dashboard/DecisionFlowBar";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { LiveRouteMapSnippet } from "@/components/dashboard/LiveRouteMapSnippet";
import { CopilotQuickPanel } from "@/components/dashboard/CopilotQuickPanel";
import { AlertTimeline } from "@/components/dashboard/AlertTimeline";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSimulation } from "@/context/SimulationContext";
import { Shield, Stethoscope, HeartHandshake, Truck, Trash2, Compass, Info } from "lucide-react";

const ROLE_FOCUS_ICONS: Record<string, any> = {
  COMMANDER: Shield,
  POLICE: Shield,
  MEDICAL: Stethoscope,
  VOLUNTEER: HeartHandshake,
  LOGISTICS: Truck,
  SANITATION: Trash2,
  DINDI_LEADER: Compass,
};

export default function CommandCenterPage() {
  const { user } = useAuth();
  const { currentRole, roleConfig } = useRole();
  const { state } = useSimulation();
  const { t } = useLanguage();

  const FocusIcon = ROLE_FOCUS_ICONS[currentRole] || Shield;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-wari-textPrimary tracking-tight">
            {t("page.commandCenter.title")}
          </h1>
          <p className="text-sm text-wari-textSecond mt-0.5">
            {t("page.commandCenter.subtitle")}
          </p>
        </div>
        <div className="text-xs text-wari-textMuted font-mono">
          Last updated: {state.currentClock}
        </div>
      </div>

      {/* Role Focus Banner — personalized for each officer's department */}
      <div className="card-base p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-wari-orangeLight border border-orange-200 flex items-center justify-center text-wari-orange">
            <FocusIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-wari-textPrimary block">
              {user?.name || roleConfig.title}
            </span>
            <span className="text-xs text-wari-textMuted">
              {user?.department || "Operations Department"}
            </span>
          </div>
        </div>

        <div className="border-l border-wari-cardBorder pl-4 hidden sm:block">
          <span className="text-xs text-wari-textMuted font-medium block">
            {t("page.commandCenter.focus")}
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {roleConfig.focusAreas.map((area, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-0.5 rounded-full bg-wari-pageBg border border-wari-cardBorder text-wari-textPrimary font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="sm:ml-auto flex items-center gap-2 text-xs">
          <Info className="w-4 h-4 text-wari-orange shrink-0" />
          <span className="text-wari-textMuted">
            {t("page.commandCenter.roleNote")}
          </span>
        </div>
      </div>

      {/* Decision Flow Lifecycle Bar */}
      <DecisionFlowBar />

      {/* Commander's Situational Brief */}
      <CommandersBrief />

      {/* Live KPI Grid */}
      <div>
        <h2 className="section-label">
          {t("page.commandCenter.metrics")}
        </h2>
        <KpiGrid />
      </div>

      {/* Main Two-Column Layout: Route Map + AI Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <h2 className="section-label">
            {t("page.commandCenter.route")}
          </h2>
          <LiveRouteMapSnippet />
        </div>
        <div className="lg:col-span-5">
          <h2 className="section-label">
            {t("page.commandCenter.copilot")}
          </h2>
          <CopilotQuickPanel />
        </div>
      </div>

      {/* Alert & Audit Log */}
      <div>
        <h2 className="section-label">
          {t("page.commandCenter.alerts")}
        </h2>
        <AlertTimeline />
      </div>
    </div>
  );
}
