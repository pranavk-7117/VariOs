"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Shield, Stethoscope, HeartHandshake, Truck, Trash2, Compass, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Role } from "@/lib/types";

const ROLE_CARDS: {
  role: Role;
  icon: any;
  name: string;
  title: string;
  dept: string;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    role: "COMMANDER",
    icon: Shield,
    name: "Dr. Rajesh Deshmukh, IAS",
    title: "Incident Commander",
    dept: "District Collector's Office, Pune",
    color: "#E85A1C",
    bgColor: "#FEF0EA",
    borderColor: "#FDCFB8",
  },
  {
    role: "POLICE",
    icon: Shield,
    name: "SP Suresh Patil, IPS",
    title: "Superintendent of Police",
    dept: "Pune Rural Division — Wari Bandobast",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  {
    role: "MEDICAL",
    icon: Stethoscope,
    name: "Dr. Anjali Nair, MBBS",
    title: "Chief Medical Officer",
    dept: "Pilgrimage Medical Command — DMER",
    color: "#10B981",
    bgColor: "#F0FDF4",
    borderColor: "#A7F3D0",
  },
  {
    role: "VOLUNTEER",
    icon: HeartHandshake,
    name: "Smt. Kavita Shinde",
    title: "Smart Seva Coordinator",
    dept: "Mauli Seva Mandal — Palkhi Division",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    borderColor: "#DDD6FE",
  },
  {
    role: "LOGISTICS",
    icon: Truck,
    name: "Vijay Kulkarni",
    title: "Water & Logistics Officer",
    dept: "Zilla Parishad — Water Supply Division",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  {
    role: "SANITATION",
    icon: Trash2,
    name: "Sunil Mhaske",
    title: "Civic Sanitation Head",
    dept: "PCMC Sanitation Wing — Wari Corridor",
    color: "#14B8A6",
    bgColor: "#F0FDFA",
    borderColor: "#99F6E4",
  },
  {
    role: "DINDI_LEADER",
    icon: Compass,
    name: "Bapu Maharaj Dehukar",
    title: "Dindi Pramukh / Palkhi Leader (#14)",
    dept: "Live GPS Broadcast & Palkhi Cohort Lead",
    color: "#E85A1C",
    bgColor: "#FEF0EA",
    borderColor: "#FDCFB8",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginAsRole } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleLogin = (role: Role) => {
    loginAsRole(role);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-wari-pageBg flex flex-col">
      {/* Top bar */}
      <div className="px-8 py-4 flex items-center justify-between border-b border-wari-cardBorder bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wari-orange to-wari-plum flex items-center justify-center shadow">
            <span className="font-mono font-bold text-white text-lg">W</span>
          </div>
          <div>
            <span className="font-bold text-base text-wari-textPrimary">WariOS</span>
            <span className="text-xs text-wari-textMuted ml-2">Operations Portal</span>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex items-center gap-1 p-1 bg-wari-pageBg rounded-xl border border-wari-cardBorder">
          {(["en", "hi", "mr"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                language === lang
                  ? "bg-wari-orange text-white shadow-sm"
                  : "text-wari-textSecond hover:text-wari-textPrimary"
              }`}
            >
              {lang === "en" ? "EN" : lang === "hi" ? "हिंदी" : "मराठी"}
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="text-center px-4 pt-12 pb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-wari-orangeLight border border-orange-200 rounded-full text-sm text-wari-orange font-semibold mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wari-orange opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-wari-orange" />
          </span>
          Ashadhi Ekadashi 2024 — Operations Live
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-wari-textPrimary mb-3">
          {t("login.title")}
        </h1>
        <p className="text-wari-textSecond max-w-xl mx-auto text-base">
          {t("login.subtitle")}
        </p>
      </div>

      {/* Role cards */}
      <div className="flex-1 px-4 sm:px-8 pb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.role}
                onClick={() => handleLogin(card.role)}
                className="group text-left p-5 rounded-2xl border-2 bg-white hover:shadow-cardHov transition-all duration-200"
                style={{ borderColor: card.borderColor }}
              >
                {/* Icon + Role badge */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: card.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: card.bgColor, color: card.color }}
                  >
                    {card.role}
                  </span>
                </div>

                {/* Info */}
                <h3 className="font-bold text-sm text-wari-textPrimary mb-0.5">{card.name}</h3>
                <p className="text-xs font-semibold mb-1" style={{ color: card.color }}>
                  {card.title}
                </p>
                <p className="text-xs text-wari-textMuted">{card.dept}</p>

                {/* CTA */}
                <div
                  className="mt-4 flex items-center gap-1.5 text-xs font-bold group-hover:gap-2.5 transition-all"
                  style={{ color: card.color }}
                >
                  <span>{t("login.launch")} →</span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-wari-textMuted mt-8">
          Wari Pilgrimage Operations Network · Pune Division · Maharashtra Government
        </p>
      </div>
    </div>
  );
}
