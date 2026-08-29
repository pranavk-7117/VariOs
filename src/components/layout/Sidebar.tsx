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
  Users,
  Bot,
  Sliders,
  ChevronDown,
  LogOut,
  UserCircle,
  Shield,
  Stethoscope,
  HeartHandshake,
  Truck,
  Trash2,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useAuth, ROLE_PROFILES } from "@/context/AuthContext";
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
  const { t, language, setLanguage } = useLanguage();
  const [roleOpen, setRoleOpen] = useState(false);

  const criticalCount = state.alerts.filter(
    (a) => a.severity === "CRITICAL" && a.status === "ACTIVE"
  ).length;
  const activeCount = state.alerts.filter((a) => a.status === "ACTIVE").length;

  const navSections = [
    {
      label: t("nav.section.operations"),
      items: [
        { label: t("nav.commandCenter"), href: "/",         icon: LayoutDashboard },
        { label: t("nav.map"),           href: "/map",      icon: MapPin },
      ],
    },
    {
      label: t("nav.section.incidents"),
      items: [
        { label: t("nav.incidents"), href: "/incidents", icon: ShieldAlert,
          badge: criticalCount > 0 ? `${criticalCount}` : undefined,
          badgeCls: "bg-red-100 text-red-700 border border-red-200 animate-pulse" },
        { label: t("nav.alerts"),    href: "/alerts",    icon: Bell,
          badge: activeCount > 0 ? `${activeCount}` : undefined,
          badgeCls: "bg-orange-100 text-orange-700 border border-orange-200" },
      ],
    },
    {
      label: t("nav.section.tracking"),
      items: [
        { label: t("nav.dindis"),     href: "/dindis",     icon: Compass },
        { label: t("nav.resources"),  href: "/resources",  icon: Droplets },
        { label: t("nav.volunteers"), href: "/volunteers", icon: Users },
      ],
    },
    {
      label: t("nav.section.ai"),
      items: [
        { label: t("nav.copilot"),   href: "/copilot",   icon: Bot,
          badge: "AI", badgeCls: "bg-orange-100 text-orange-700 border border-orange-200" },
        { label: t("nav.simulator"), href: "/simulator", icon: Sliders },
      ],
    },
  ];

  const roleOptions: { role: Role; label: string }[] = [
    { role: "COMMANDER",  label: "Incident Commander" },
    { role: "POLICE",     label: "Superintendent of Police" },
    { role: "MEDICAL",    label: "Chief Medical Officer" },
    { role: "VOLUNTEER",  label: "Smart Seva Coordinator" },
    { role: "LOGISTICS",  label: "Water & Logistics Officer" },
    { role: "SANITATION", label: "Sanitation Head" },
    { role: "DINDI_LEADER", label: "Dindi Pramukh / Palkhi Leader" },
  ];

  return (
    <aside className="w-64 bg-wari-sidebarBg border-r border-wari-cardBorder flex flex-col h-screen select-none z-30 sticky top-0 shrink-0 shadow-sidebar">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-wari-cardBorder">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wari-orange to-wari-plum flex items-center justify-center shadow-md">
            <span className="font-mono font-bold text-white text-lg">W</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-wari-textPrimary group-hover:text-wari-orange transition-colors">
                WariOS
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-wari-plumLight text-wari-plum rounded border border-wari-plum/20 font-semibold">
                OPS
              </span>
            </div>
            <p className="text-[11px] text-wari-textMuted">Pilgrimage Command</p>
          </div>
        </Link>
      </div>

      {/* Language toggle */}
      <div className="px-4 py-2.5 border-b border-wari-cardBorder flex items-center gap-1">
        {(["en", "hi", "mr"] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
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
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-wari-textMuted px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-wari-orangeLight text-wari-orange border-l-2 border-wari-orange"
                        : "text-wari-textSecond hover:text-wari-textPrimary hover:bg-wari-pageBg"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-wari-orange" : "text-wari-textMuted"}`} />
                      <span>{item.label}</span>
                    </div>
                    {(item as any).badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${(item as any).badgeCls}`}>
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

      {/* User & Role Section */}
      <div className="border-t border-wari-cardBorder bg-white">
        {/* Role switcher */}
        <div className="p-3 relative">
          <button
            onClick={() => setRoleOpen((v) => !v)}
            className="w-full px-3 py-2.5 rounded-xl bg-wari-pageBg border border-wari-cardBorder hover:border-wari-orange/40 text-left flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2.5 truncate">
              <UserCircle className="w-4 h-4 text-wari-orange shrink-0" />
              <div className="truncate">
                <span className="text-wari-textPrimary font-semibold text-xs block truncate">
                  {user?.name?.split(",")[0] ?? "Officer"}
                </span>
                <span className="text-wari-textMuted text-[11px]">{user?.role ?? "—"}</span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-wari-textMuted shrink-0 transition-transform ${roleOpen ? "rotate-180" : ""}`} />
          </button>

          {roleOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-wari-cardBorder rounded-2xl shadow-cardHov py-2 z-50 animate-fadeIn">
              <div className="px-4 py-1.5 text-[10px] font-bold text-wari-textMuted border-b border-wari-cardBorder uppercase tracking-wider">
                {t("common.switchRole")}
              </div>
              {roleOptions.map((r) => {
                const Icon = ROLE_ICONS[r.role];
                const isActive = user?.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => { switchRole(r.role); setRoleOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2.5 transition-colors ${
                      isActive
                        ? "bg-wari-orangeLight text-wari-orange font-bold"
                        : "text-wari-textSecond hover:bg-wari-pageBg hover:text-wari-textPrimary"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{r.label}</span>
                    {isActive && <span className="ml-auto text-[10px] text-wari-orange font-bold">●</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="px-3 pb-3">
          <button
            onClick={logout}
            className="w-full py-2 px-3 rounded-xl text-xs text-wari-textMuted hover:text-red-600 hover:bg-red-50 border border-wari-cardBorder hover:border-red-200 flex items-center justify-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t("common.signOut")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
