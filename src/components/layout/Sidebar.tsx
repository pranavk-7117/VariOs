"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  Bell,
  Compass,
  Droplets,
  HeartHandshake,
  Bot,
  Sliders,
  ChevronDown,
  LogOut,
  UserCircle,
  Shield,
  Stethoscope,
  Truck,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Role } from "@/lib/types";

const ROLE_ICONS: Record<Role, any> = {
  COMMANDER: Shield,
  POLICE: Shield,
  MEDICAL: Stethoscope,
  VOLUNTEER: HeartHandshake,
  LOGISTICS: Truck,
  SANITATION: Trash2,
  DINDI_LEADER: Compass,
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { state } = useSimulation();
  const { user, logout, switchRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [roleOpen, setRoleOpen] = useState(false);

  const criticalCount = state.alerts.filter(
    (a) => a.severity === "CRITICAL" && a.status === "ACTIVE"
  ).length;
  const activeAlerts = state.alerts.filter((a) => a.status === "ACTIVE").length;
  const realDindiCount = state.dindis.filter((d) => d.isCustomRegistered).length;

  const navSections = [
    {
      emoji: "🟠",
      label: "DINDI LEADERS",
      color: "text-orange-600",
      items: [
        {
          label: "Dindi Registration & GPS",
          href: "/dindi",
          icon: Compass,
          badge: realDindiCount > 0 ? String(realDindiCount) : undefined,
          badgeCls: "bg-orange-100 text-orange-800 border border-orange-200",
          desc: "Register, track & request help",
        },
      ],
    },
    {
      emoji: "👷",
      label: "VOLUNTEERS",
      color: "text-purple-600",
      items: [
        {
          label: "Volunteer Seva Portal",
          href: "/volunteer",
          icon: HeartHandshake,
          badge: "SEVA",
          badgeCls: "bg-purple-100 text-purple-800 border border-purple-200",
          desc: "Report incidents, track tasks",
        },
      ],
    },
    {
      emoji: "🏛️",
      label: "AUTHORITIES",
      color: "text-slate-600",
      items: [
        {
          label: "Command Centre",
          href: "/command-centre",
          icon: LayoutDashboard,
          desc: "Tactical overview",
        },
        {
          label: "Corridor GIS Map",
          href: "/map",
          icon: MapPin,
          desc: "Live corridor map",
        },
        {
          label: "Incidents & Triage",
          href: "/incidents",
          icon: ShieldAlert,
          badge: criticalCount > 0 ? String(criticalCount) : undefined,
          badgeCls: "bg-red-100 text-red-700 border border-red-200 animate-pulse",
          desc: "7-stage mitigation",
        },
        {
          label: "Corridor Alerts",
          href: "/alerts",
          icon: Bell,
          badge: activeAlerts > 0 ? String(activeAlerts) : undefined,
          badgeCls: "bg-amber-100 text-amber-700 border border-amber-200",
          desc: "Active alerts feed",
        },
        {
          label: "Resource Logistics",
          href: "/resources",
          icon: Droplets,
          desc: "Water, medical, sanitation",
        },
      ],
    },
    {
      emoji: "🤖",
      label: "AI & FORECASTING",
      color: "text-emerald-600",
      items: [
        {
          label: "AI Operations Copilot",
          href: "/copilot",
          icon: Bot,
          badge: "AI",
          badgeCls: "bg-emerald-100 text-emerald-800 border border-emerald-200",
          desc: "Multilingual AI assistant",
        },
        {
          label: "Crowd Density Forecast",
          href: "/simulator",
          icon: Sliders,
          desc: "Predictive modelling",
        },
      ],
    },
  ];

  const roleOptions: { role: Role; label: string }[] = [
    { role: "COMMANDER", label: "Incident Commander" },
    { role: "DINDI_LEADER", label: "Dindi Pramukh / Leader" },
    { role: "VOLUNTEER", label: "Smart Seva Volunteer" },
    { role: "POLICE", label: "Superintendent of Police" },
    { role: "MEDICAL", label: "Chief Medical Officer" },
    { role: "LOGISTICS", label: "Water & Logistics Officer" },
    { role: "SANITATION", label: "Sanitation Head" },
  ];

  return (
    <aside className="w-60 bg-wari-sidebarBg border-r border-wari-cardBorder flex flex-col h-screen select-none z-30 sticky top-0 shrink-0">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-wari-cardBorder">
        <Link href="/command-centre" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wari-orange to-wari-plum flex items-center justify-center shadow-md shrink-0">
            <span className="font-mono font-black text-white text-base">W</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-wari-textPrimary group-hover:text-wari-orange transition-colors">
                WariOS
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-wari-plumLight text-wari-plum rounded border border-wari-plum/20 font-bold">
                AI OPS
              </span>
            </div>
            <p className="text-[10px] text-wari-textMuted leading-tight">
              {language === "hi" ? "सुरक्षित वारी, सुगम वारी" : language === "mr" ? "सुरक्षित वारी, सुगम वारी" : "Safe Wari, Smooth Wari"}
            </p>
          </div>
        </Link>
      </div>

      {/* Live Mode Indicator */}
      <div className={`px-4 py-2 border-b border-wari-cardBorder flex items-center gap-2 ${
        state.isSimulating ? "bg-purple-50" : "bg-emerald-50"
      }`}>
        <span className={`relative flex h-2 w-2 shrink-0`}>
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
            state.isSimulating ? "bg-purple-400" : "bg-emerald-400"
          } opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            state.isSimulating ? "bg-purple-600" : "bg-emerald-500"
          }`} />
        </span>
        <span className={`text-[10px] font-bold ${state.isSimulating ? "text-purple-700" : "text-emerald-700"}`}>
          {state.isSimulating
            ? language === "en" ? "DEMO ARCHIVE 2024-25" : language === "hi" ? "डेमो संग्रह 2024-25" : "डेमो संग्रह 2024-25"
            : language === "en" ? "LIVE REAL MODE" : language === "hi" ? "लाइव वास्तविक मोड" : "लाइव्ह वास्तविक मोड"}
        </span>
      </div>

      {/* Language toggle */}
      <div className="px-3 py-2 border-b border-wari-cardBorder flex items-center gap-1">
        {(["en", "hi", "mr"] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
              language === lang
                ? "bg-wari-orange text-white shadow-sm"
                : "text-wari-textSecond hover:bg-wari-pageBg"
            }`}
          >
            {lang === "en" ? "EN" : lang === "hi" ? "हिंदी" : "मराठी"}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className={`text-[9px] font-black uppercase tracking-widest px-3 mb-1.5 flex items-center gap-1.5 ${section.color}`}>
              <span>{section.emoji}</span>
              <span>{section.label}</span>
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-wari-orangeLight text-wari-orange border-l-2 border-wari-orange shadow-sm font-bold"
                        : "text-wari-textSecond hover:text-wari-textPrimary hover:bg-wari-pageBg"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-wari-orange" : "text-wari-textMuted"}`} />
                      <div>
                        <div>
                          {item.href === "/command-centre"
                            ? t("nav.commandCenter")
                            : item.href === "/map"
                              ? t("nav.map")
                              : item.href === "/alerts"
                                ? t("nav.alerts")
                                : item.href === "/resources"
                                  ? t("nav.resources")
                                  : item.href === "/copilot"
                                    ? t("nav.copilot")
                                    : item.href === "/simulator"
                                      ? t("nav.simulator")
                                      : item.href === "/volunteer"
                                        ? t("nav.volunteers")
                                        : item.href === "/dindi"
                                          ? t("nav.dindis")
                                          : item.label}
                        </div>
                        {!isActive && (item as any).desc && (
                          <div className="text-[9px] text-wari-textMuted font-normal leading-tight">{(item as any).desc}</div>
                        )}
                      </div>
                    </div>
                    {(item as any).badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${(item as any).badgeCls}`}>
                        {(item as any).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User & Role */}
      <div className="border-t border-wari-cardBorder bg-white">
        <div className="p-2.5 relative">
          <button
            onClick={() => setRoleOpen((v) => !v)}
            className="w-full px-3 py-2 rounded-xl bg-wari-pageBg border border-wari-cardBorder hover:border-wari-orange/40 text-left flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <UserCircle className="w-4 h-4 text-wari-orange shrink-0" />
              <div className="truncate">
                <span className="text-wari-textPrimary font-bold text-xs block truncate">
                  {user?.name?.split(",")[0] ?? "Officer"}
                </span>
                <span className="text-wari-textMuted text-[9px]">{user?.role ?? "COMMANDER"}</span>
              </div>
            </div>
            <ChevronDown className={`w-3 h-3 text-wari-textMuted shrink-0 transition-transform ${roleOpen ? "rotate-180" : ""}`} />
          </button>

          {roleOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-1 bg-white border border-wari-cardBorder rounded-2xl shadow-cardHov py-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-1 text-[9px] font-bold text-wari-textMuted uppercase tracking-wider border-b border-wari-cardBorder mb-1">
                Switch Role
              </div>
              {roleOptions.map((r) => {
                const Icon = ROLE_ICONS[r.role];
                const isActive = user?.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => { switchRole(r.role); setRoleOpen(false); }}
                    className={`w-full px-3 py-2 text-left text-[11px] flex items-center gap-2 transition-colors ${
                      isActive
                        ? "bg-wari-orangeLight text-wari-orange font-bold"
                        : "text-wari-textSecond hover:bg-wari-pageBg hover:text-wari-textPrimary"
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>{r.label}</span>
                    {isActive && <span className="ml-auto text-wari-orange text-[10px]">●</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-2.5 pb-2.5">
          <button
            onClick={logout}
            className="w-full py-1.5 px-3 rounded-xl text-[11px] text-wari-textMuted hover:text-red-600 hover:bg-red-50 border border-wari-cardBorder hover:border-red-200 flex items-center justify-center gap-1.5 transition-all"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};
