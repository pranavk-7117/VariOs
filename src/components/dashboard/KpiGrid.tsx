"use client";

import React from "react";
import {
  Users, Compass, AlertOctagon, HeartHandshake, Droplets, Stethoscope,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useRole } from "@/context/RoleContext";
import { getLiveCrowdClusters } from "@/lib/live-ops";

export const KpiGrid: React.FC = () => {
  const { state, isMitigated } = useSimulation();
  const { currentRole } = useRole();

  const criticalAlertsCount = state.alerts.filter((a) => a.severity === "CRITICAL" && a.status === "ACTIVE").length;
  const activeAlertsCount = state.alerts.filter((a) => a.status === "ACTIVE").length;
  const deployedVolunteers = state.volunteers.filter((v) => v.status === "DEPLOYED").length;
  const availableVolunteers = state.volunteers.filter((v) => v.status === "AVAILABLE").length;
  const enRouteTankers = state.tankers.filter((t) => t.status === "EN_ROUTE" || t.status === "DISPATCHED").length;
  const liveClusters = getLiveCrowdClusters(state);
  const topLiveCluster = liveClusters[0];
  const isLiveMode = !state.isSimulating;

  const kpis = [
    {
      id: "pilgrims",
      title: "Active Pilgrims",
      value: isLiveMode ? state.totalPilgrims.toLocaleString() : "1.24M",
      subtext: isLiveMode ? "Leader-entered live count" : "Corridor Total",
      icon: Users,
      trend: isLiveMode ? `${state.dindis.filter((d) => d.isCustomRegistered).length} live Dindis` : "+4.2% / hr",
      valueColor: "text-wari-textPrimary",
      iconColor: "text-wari-orange",
      roles: ["COMMANDER", "POLICE", "DINDI_LEADER"],
    },
    {
      id: "utilization",
      title: "Route Utilization",
      value: isLiveMode ? `${topLiveCluster?.occupancyPercent ?? 0}%` : isMitigated ? "76%" : "88%",
      subtext: isLiveMode ? "Top live location" : isMitigated ? "Bypass Relieved" : "CP4 Chokepoint",
      icon: Compass,
      trend: isLiveMode ? `${topLiveCluster?.overcrowdedBy ?? 0} over capacity` : isMitigated ? "Post-bypass relief" : "+18% Growth",
      valueColor: isLiveMode && topLiveCluster?.overcrowdedBy ? "text-red-600" : isMitigated ? "text-emerald-600" : "text-orange-600",
      iconColor: isLiveMode && topLiveCluster?.overcrowdedBy ? "text-red-500" : isMitigated ? "text-emerald-500" : "text-wari-orange",
      roles: ["COMMANDER", "POLICE", "DINDI_LEADER"],
    },
    {
      id: "alerts",
      title: "Active Alerts",
      value: isMitigated && !isLiveMode ? "1 Active" : `${activeAlertsCount} Alerts`,
      subtext: isMitigated && !isLiveMode ? "0 Critical" : `${criticalAlertsCount} Critical`,
      icon: AlertOctagon,
      trend: isLiveMode && topLiveCluster ? topLiveCluster.name : isMitigated ? "Mitigating" : "CP4 97% Breach",
      valueColor: isMitigated && !isLiveMode ? "text-emerald-600" : criticalAlertsCount > 0 ? "text-red-600" : "text-amber-600",
      iconColor: isMitigated && !isLiveMode ? "text-emerald-500" : criticalAlertsCount > 0 ? "text-red-500" : "text-amber-500",
      roles: ["COMMANDER", "POLICE", "LOGISTICS", "MEDICAL"],
    },
    {
      id: "volunteers",
      title: "Smart Seva Units",
      value: `${availableVolunteers} Ready`,
      subtext: `${deployedVolunteers} Deployed`,
      icon: HeartHandshake,
      trend: isLiveMode ? "Registered live only" : "5 Marshals at CP4",
      valueColor: "text-purple-700",
      iconColor: "text-purple-500",
      roles: ["COMMANDER", "VOLUNTEER"],
    },
    {
      id: "tankers",
      title: "Water Tankers",
      value: `${enRouteTankers} En Route`,
      subtext: `${state.tankers.length} Total Fleet`,
      icon: Droplets,
      trend: isLiveMode ? "Nearest unit calculated" : isMitigated ? "+44m Buffer" : "Camp 6 Low",
      valueColor: isMitigated && !isLiveMode ? "text-emerald-600" : "text-blue-600",
      iconColor: isMitigated && !isLiveMode ? "text-emerald-500" : "text-blue-500",
      roles: ["COMMANDER", "LOGISTICS"],
    },
    {
      id: "medical",
      title: "Medical Readiness",
      value: isLiveMode ? `${state.medicalStations.length} Posts` : isMitigated ? "85% Safe" : "74% Safe",
      subtext: isLiveMode ? "Nearest post calculated" : "MS-02 Saswad: 15%",
      icon: Stethoscope,
      trend: isLiveMode ? "Live triage support" : "25 Ambulances",
      valueColor: "text-emerald-600",
      iconColor: "text-emerald-500",
      roles: ["COMMANDER", "MEDICAL"],
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isPriority = kpi.roles.includes(currentRole);

        return (
          <div
            key={kpi.id}
            className={`card-base p-4 hover:shadow-cardHov transition-shadow ${
              isPriority ? "ring-2 ring-wari-orange/40" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-wari-textSecond font-medium truncate pr-1">{kpi.title}</span>
              <Icon className={`w-4 h-4 shrink-0 ${kpi.iconColor}`} />
            </div>

            <div className={`text-xl font-black tracking-tight ${kpi.valueColor}`}>{kpi.value}</div>
            <div className="text-xs text-wari-textMuted mt-0.5 truncate">{kpi.subtext}</div>

            <div className="mt-3 pt-2.5 border-t border-wari-cardBorder flex items-center justify-between text-xs">
              <span className="text-wari-textSecond truncate">{kpi.trend}</span>
              {isPriority && (
                <span className="text-[10px] px-1.5 py-0.5 bg-wari-orangeLight text-wari-orange rounded font-bold shrink-0 ml-1">
                  FOCUS
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
