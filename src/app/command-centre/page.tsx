"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Bot,
  Clock,
  Droplets,
  Hospital,
  Map,
  Megaphone,
  Route,
  Send,
  Truck,
  Users,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";
import { LiveRouteMapSnippet } from "@/components/dashboard/LiveRouteMapSnippet";
import { getLiveCrowdClusters } from "@/lib/live-ops";

const copy = {
  en: {
    title: "|| Pandhari's Path, Vitthal's Meeting Path ||",
    map: "Live Wari Route Map",
    quick: "Quick Actions",
    timeline: "Wari Operation Timeline",
    alerts: "Important Alerts",
    copilot: "WariOS AI Assistant",
    fullMap: "View Full Map",
    ask: "Type your question...",
  },
  hi: {
    title: "|| पंढरी की राह, विठ्ठल से मिलने की राह ||",
    map: "लाइव वारी मार्ग मानचित्र",
    quick: "त्वरित कार्रवाई",
    timeline: "वारी संचालन टाइमलाइन",
    alerts: "महत्वपूर्ण सूचनाएं",
    copilot: "WariOS AI सहायक",
    fullMap: "पूरा मानचित्र देखें",
    ask: "अपना प्रश्न लिखें...",
  },
  mr: {
    title: "|| पंढरीची वाट, विठ्ठलाच्या भेटीची वाट ||",
    map: "लाइव्ह वारी मार्ग नकाशा",
    quick: "त्वरित कृती",
    timeline: "वारी ऑपरेशन टाइमलाइन",
    alerts: "महत्त्वाच्या सूचना",
    copilot: "WariOS AI सहाय्यक",
    fullMap: "पूर्ण नकाशा पहा",
    ask: "तुमचा प्रश्न येथे लिहा...",
  },
};

export default function CommandCentre() {
  const { state, requestLeaderAssistance } = useSimulation();
  const { language } = useLanguage();
  const c = copy[language];
  const clusters = getLiveCrowdClusters(state);
  const topCluster = clusters[0];
  const liveDindis = state.dindis.filter((d) => d.isCustomRegistered);
  const activeAlerts = state.alerts.filter((alert) => alert.status === "ACTIVE");
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === "CRITICAL");
  const availableVolunteers = state.volunteers.filter((volunteer) => volunteer.status === "AVAILABLE").length;
  const availableTankers = state.tankers.filter((tanker) => tanker.status === "AVAILABLE").length;
  const medicalCapacity =
    state.medicalStations.length > 0
      ? Math.round(
          state.medicalStations.reduce((sum, station) => sum + (100 - station.occupancyPercent), 0) /
            state.medicalStations.length,
        )
      : 0;
  const utilization = topCluster?.occupancyPercent ?? state.routeUtilization;

  const metricCards = [
    {
      label: language === "en" ? "Total Warkaris" : language === "hi" ? "कुल वारकरी" : "एकूण वारकरी",
      value: `${Math.max(state.totalPilgrims, topCluster?.totalPilgrims ?? 0).toLocaleString()}+`,
      delta: liveDindis.length ? `${liveDindis.length} live Dindi` : "Live ready",
      icon: Users,
      tone: "text-orange-600",
    },
    {
      label: language === "en" ? "Route Pressure" : language === "hi" ? "मार्ग दबाव" : "मार्गावर दबाव",
      value: `${utilization}%`,
      delta: topCluster ? `${topCluster.capacity.toLocaleString()} capacity` : "GPS waiting",
      icon: Route,
      tone: "text-emerald-700",
    },
    {
      label: language === "en" ? "Active Alerts" : language === "hi" ? "सक्रिय सूचनाएं" : "सक्रिय सूचना",
      value: String(activeAlerts.length),
      delta: `${criticalAlerts.length} critical`,
      icon: AlertTriangle,
      tone: "text-red-600",
    },
    {
      label: language === "en" ? "Available Volunteers" : language === "hi" ? "उपलब्ध स्वयंसेवक" : "उपलब्ध स्वयंसेवक",
      value: String(availableVolunteers),
      delta: `${state.volunteers.length} total`,
      icon: Users,
      tone: "text-purple-700",
    },
    {
      label: language === "en" ? "Water Tankers" : language === "hi" ? "पानी टैंकर" : "पाणी टँकर",
      value: String(availableTankers),
      delta: `${state.tankers.length - availableTankers} active`,
      icon: Truck,
      tone: "text-orange-600",
    },
    {
      label: language === "en" ? "Medical Capacity" : language === "hi" ? "चिकित्सा क्षमता" : "वैद्यकीय क्षमता",
      value: `${medicalCapacity}%`,
      delta: topCluster?.nearestMedical?.item.name ?? "Hospitals mapped",
      icon: Hospital,
      tone: "text-red-600",
    },
  ];

  const timeline = [
    activeAlerts[0]?.title ??
      (language === "en" ? "System waiting for field report" : language === "hi" ? "फील्ड रिपोर्ट की प्रतीक्षा" : "फील्ड अहवालाची प्रतीक्षा"),
    topCluster
      ? `${topCluster.dindis.map((dindi) => dindi.name).join(" + ")} - ${topCluster.totalPilgrims.toLocaleString()}`
      : language === "en"
        ? "Register Dindi from phone GPS"
        : language === "hi"
          ? "फोन GPS से दिंडी दर्ज करें"
          : "फोन GPS वरून दिंडी नोंदवा",
    topCluster?.nearestCamp?.item.name ?? "Nearest halt assigned after GPS",
    topCluster?.nearestMedical?.item.name ?? "Nearby hospital ready",
    state.volunteers.find((volunteer) => volunteer.currentTask)?.currentTask ?? "Volunteer verification task ready",
  ];

  return (
    <div className="wari-reference-grid animate-fadeIn">
      <section className="wari-hero-band rounded-3xl border border-white/60 shadow-card overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#5b2b17] tracking-tight">{c.title}</h1>
              <p className="text-xs text-[#7a4b32] mt-1">
                {state.isSimulating ? "Demo Archive" : "Live Real Mode"} · MMCOE GPS · Supabase-backed Dindi registration
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="rounded-2xl bg-white/85 border border-orange-100 px-4 py-2 flex items-center gap-2 shadow-sm">
                <span className="text-2xl">🌤️</span>
                <div>
                  <div className="font-black">27°C</div>
                  <div className="text-[10px] text-wari-textMuted">{language === "mr" ? "पंढरपूर" : "Pandharpur"}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/85 border border-orange-100 px-4 py-2 flex items-center gap-2 shadow-sm">
                <Clock className="w-5 h-5 text-wari-textPrimary" />
                <div>
                  <div className="font-black">{state.currentClock}</div>
                  <div className="text-[10px] text-wari-textMuted">29 Aug 2026</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mt-6">
            {metricCards.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl bg-white/88 border border-orange-100 p-4 shadow-card">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#5b2b17]">
                    <Icon className={`w-5 h-5 ${metric.tone}`} />
                    <span>{metric.label}</span>
                  </div>
                  <div className="text-3xl font-black mt-3 text-black">{metric.value}</div>
                  <div className="text-xs mt-2 text-emerald-700 font-semibold">{metric.delta}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <section className="xl:col-span-8 space-y-4">
          <div className="rounded-3xl bg-white/88 border border-orange-100 p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-black text-wari-textPrimary">
                  {c.map} <span className="badge-live ml-2">LIVE</span>
                </h2>
                <p className="text-xs text-wari-textMuted">
                  Pune to Pandharpur · nearest MMCOE facilities update from registered GPS
                </p>
              </div>
              <Link href="/map" className="btn-secondary flex items-center gap-2">
                <Map className="w-4 h-4" />
                {c.fullMap}
              </Link>
            </div>
            <LiveRouteMapSnippet />
          </div>

          <div className="rounded-3xl bg-white/88 border border-orange-100 p-4 shadow-card">
            <h2 className="text-lg font-black text-wari-textPrimary mb-3">{c.quick}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <button onClick={() => requestLeaderAssistance("HALT", "Command quick action: route change requested")} className="wari-action-tile text-emerald-700">
                <Route className="w-7 h-7" />
                <span>{language === "en" ? "Change Route" : language === "hi" ? "मार्ग बदलें" : "मार्ग बदला"}</span>
              </button>
              <button onClick={() => requestLeaderAssistance("WATER", "Command quick action: water/resource dispatch requested")} className="wari-action-tile text-orange-600">
                <Truck className="w-7 h-7" />
                <span>{language === "en" ? "Send Resources" : language === "hi" ? "संसाधन भेजें" : "संसाधन पाठवा"}</span>
              </button>
              <Link href="/volunteer" className="wari-action-tile text-purple-700">
                <Users className="w-7 h-7" />
                <span>{language === "en" ? "Call Volunteers" : language === "hi" ? "स्वयंसेवक बुलाएं" : "स्वयंसेवक बोलवा"}</span>
              </Link>
              <Link href="/alerts" className="wari-action-tile text-red-600">
                <Megaphone className="w-7 h-7" />
                <span>{language === "en" ? "Broadcast Alert" : language === "hi" ? "सूचना भेजें" : "सूचना पाठवा"}</span>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white/88 border border-orange-100 p-4 shadow-card">
            <h2 className="text-lg font-black text-wari-textPrimary mb-3">{c.timeline}</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {timeline.map((item, index) => (
                <div key={`${item}-${index}`} className="relative rounded-2xl border border-orange-100 bg-orange-50/70 p-3 text-xs min-h-24">
                  <div className="font-black text-wari-orange mb-2">{index + 1}</div>
                  <div className="font-bold text-wari-textPrimary line-clamp-3">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="xl:col-span-4 space-y-4">
          <div className="rounded-3xl bg-white/90 border border-orange-100 p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-wari-textPrimary">{c.alerts}</h2>
              <Link href="/alerts" className="text-xs text-wari-orange font-bold">View all →</Link>
            </div>
            <div className="space-y-3">
              {(activeAlerts.length ? activeAlerts : state.alerts).slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 border-b border-wari-cardBorder pb-3 last:border-0">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.severity === "CRITICAL" ? "text-red-600" : "text-orange-500"}`} />
                  <div className="flex-1">
                    <div className="text-sm font-black text-wari-textPrimary">{alert.title}</div>
                    <div className="text-xs text-wari-textMuted">{alert.forecastText}</div>
                  </div>
                  <span className="text-[10px] text-wari-textMuted">{alert.timestamp}</span>
                </div>
              ))}
              {state.alerts.length === 0 && (
                <div className="text-sm text-wari-textMuted rounded-2xl bg-wari-pageBg border border-wari-cardBorder p-4">
                  No alerts yet. Register Dindi A and Dindi B at MMCOE or submit a volunteer report.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white/90 border border-orange-100 p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-6 h-6 text-wari-orange" />
              <div>
                <h2 className="text-lg font-black text-wari-textPrimary">{c.copilot}</h2>
                <p className="text-xs text-wari-textMuted">
                  {language === "en" ? "Ask in English, Hindi, or Marathi" : language === "hi" ? "हिंदी, मराठी या अंग्रेजी में पूछें" : "मराठी, हिंदी किंवा इंग्रजीत विचारा"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-orange-50/70 border border-orange-100 p-4 text-sm text-wari-textSecond leading-relaxed">
              {topCluster
                ? `MMCOE has ${topCluster.totalPilgrims.toLocaleString()} people from ${topCluster.dindis.map((d) => d.name).join(" + ")}. Nearest halt: ${topCluster.nearestCamp?.item.name ?? "assigning"}; water: ${topCluster.nearestTanker?.item.currentHub ?? "assigning"}.`
                : "Register a Dindi or report an incident and I will ground the answer in the live command state."}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-orange-200 bg-white px-3 py-2">
              <input className="flex-1 outline-none text-sm bg-transparent" placeholder={c.ask} />
              <Link href="/copilot" className="w-9 h-9 rounded-full bg-wari-orange text-white flex items-center justify-center">
                <Send className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white/90 border border-orange-100 p-5 shadow-card">
            <h2 className="text-lg font-black text-wari-textPrimary mb-3">Live Notifications</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-red-500" /> Admin sees active alerts instantly.</div>
              <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-600" /> Tanker requests assign volunteer verification tasks.</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-700" /> Dindi leaders and volunteers share the same live state.</div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/90 border border-orange-100 p-5 shadow-card">
            <h2 className="text-lg font-black text-wari-textPrimary mb-3">
              {language === "en" ? "Volunteer Task Verification" : language === "hi" ? "स्वयंसेवक कार्य सत्यापन" : "स्वयंसेवक कार्य पडताळणी"}
            </h2>
            <div className="space-y-3">
              {state.volunteerTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="rounded-2xl bg-wari-pageBg border border-wari-cardBorder p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-wari-textPrimary">{task.title}</strong>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      task.status === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : task.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="text-wari-textMuted">{task.campName} · {task.volunteerName} · ETA {task.etaMinutes} min</div>
                  {task.remarks && <div className="text-wari-textSecond">Remarks: {task.remarks}</div>}
                </div>
              ))}
              {state.volunteerTasks.length === 0 && (
                <div className="rounded-2xl bg-wari-pageBg border border-wari-cardBorder p-4 text-sm text-wari-textMuted">
                  No command tasks assigned yet. Send a water, medical, or halt request to assign the nearest camp volunteer.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
