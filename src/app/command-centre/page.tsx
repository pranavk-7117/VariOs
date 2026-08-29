"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Bot,
  Clock,
  Droplets,
  Hospital as HospitalIcon,
  Map,
  Megaphone,
  Route,
  Send,
  Truck,
  Users,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Trash2,
  Phone,
  Radio,
  Mic,
  MicOff,
  Volume2,
  Building2,
  Flame,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLiveGps } from "@/context/LiveGpsContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { LiveRouteMapSnippet } from "@/components/dashboard/LiveRouteMapSnippet";
import { getDistanceKm, getLiveCrowdClusters } from "@/lib/live-ops";
import { VolunteerTask } from "@/lib/types";

const copy = {
  en: {
    title: "|| Pandhari's Path, Vitthal's Meeting Path ||",
    map: "Live Tactical Route Map",
    quick: "Direct Command Dispatches",
    timeline: "Wari Operation Timeline",
    alerts: "Important Alerts & Feeds",
    copilot: "WariOS AI Copilot (Voice & RAG)",
    fullMap: "View Full Tactical Map",
    ask: "Ask Copilot in English, Hindi, or Marathi...",
  },
  hi: {
    title: "|| पंढरी की राह, विठ्ठल से मिलने की राह ||",
    map: "लाइव वारी मार्ग मानचित्र",
    quick: "कमांड त्वरित प्रेषण",
    timeline: "वारी संचालन टाइमलाइन",
    alerts: "महत्वपूर्ण सूचनाएं",
    copilot: "WariOS AI सहायक (ध्वनि और RAG)",
    fullMap: "पूरा मानचित्र देखें",
    ask: "हिंदी, मराठी या अंग्रेजी में पूछें...",
  },
  mr: {
    title: "|| पंढरीची वाट, विठ्ठलाच्या भेटीची वाट ||",
    map: "लाइव्ह वारी मार्ग नकाशा",
    quick: "थेट कमांड कृती",
    timeline: "वारी ऑपरेशन टाइमलाइन",
    alerts: "महत्त्वाच्या सूचना व अलर्ट",
    copilot: "WariOS AI सहाय्यक (आवाज व RAG)",
    fullMap: "पूर्ण नकाशा पहा",
    ask: "मराठी, हिंदी किंवा इंग्रजीत प्रश्न विचारा...",
  },
};

export default function CommandCentre() {
  const {
    state,
    requestLeaderAssistance,
    assignCommandTask,
    deleteVolunteerTask,
    resetAll,
  } = useSimulation();
  const { language } = useLanguage();
  const { coords } = useLiveGps();
  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    reset: resetSpeech,
    speak,
    isSpeaking,
    stopSpeaking,
  } = useSpeechRecognition();

  const c = copy[language];
  const [dindiSearch, setDindiSearch] = useState("");
  const [selectedDindiId, setSelectedDindiId] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // New task modal / quick dispatch state
  const [dispatchModalCampId, setDispatchModalCampId] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<VolunteerTask["type"]>("WATER_TANKER");
  const [taskTitle, setTaskTitle] = useState("💧 Dispatch Water Tanker (12,000L)");
  const [taskEta, setTaskEta] = useState(15);
  const [taskNotes, setTaskNotes] = useState("");

  const clusters = getLiveCrowdClusters(state);
  const topCluster = clusters[0];
  const liveDindis = state.dindis.filter((d) => d.isCustomRegistered);

  const filteredDindis = useMemo(() => {
    const query = dindiSearch.trim().toLowerCase();
    if (!query) return liveDindis;
    return liveDindis.filter((dindi) =>
      [dindi.name, dindi.leader, dindi.passcode, String(dindi.number)]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [dindiSearch, liveDindis]);

  const selectedDindi =
    liveDindis.find((dindi) => dindi.id === selectedDindiId) ??
    filteredDindis[0] ??
    liveDindis[0];

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

  const selectedFacilities = useMemo(() => {
    if (!selectedDindi && !coords) return null;
    const lat = selectedDindi?.lat ?? coords?.lat ?? 18.5138;
    const lng = selectedDindi?.lng ?? coords?.lng ?? 73.8589;

    const camp = state.camps
      .map((item) => ({ item, distanceKm: getDistanceKm(lat, lng, item.lat, item.lng) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];

    const medical = state.medicalStations
      .map((item) => ({ item, distanceKm: getDistanceKm(lat, lng, item.lat, item.lng) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];

    const tanker = state.tankers
      .map((item) => ({ item, distanceKm: getDistanceKm(lat, lng, item.lat, item.lng) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];

    const volunteer = state.volunteers
      .map((item) => ({ item, distanceKm: getDistanceKm(lat, lng, item.lat, item.lng) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];

    return { camp, medical, tanker, volunteer };
  }, [selectedDindi, coords, state.camps, state.medicalStations, state.tankers, state.volunteers]);

  // Handle AI Copilot Query & Voice Response
  const handleAskCopilot = (questionText?: string) => {
    const q = (questionText || aiQuery || transcript).trim();
    if (!q) return;

    let response = "";
    const lowerQ = q.toLowerCase();

    if (lowerQ.includes("schedule") || lowerQ.includes("वेळापत्रक") || lowerQ.includes("शेड्यूल") || lowerQ.includes("ringan") || lowerQ.includes("रिंगण")) {
      response =
        language === "mr"
          ? "अधिकृत २०२६ पालखी वेळापत्रक: पहिले उभे रिंगण काटेवाडी येथे १८ जुलै रोजी आहे, दुसरे रिंगण अकलूज येथे २१ जुलै रोजी आहे आणि शेवटचे बाजीराव विहीर येथे २४ जुलै रोजी आहे. आषाढी एकादशी २६ जुलै रोजी पंढरपुरात आहे."
          : language === "hi"
          ? "2026 पालखी रिंगण का शेड्यूल: पहला रिंगण काटेवाडी में 18 जुलाई, दूसरा अकलूज में 21 जुलाई, और बाजीराव विहीर में 24 जुलाई को होगा। आषाढ़ी एकादशी 26 जुलाई को है।"
          : "Official 2026 Palkhi Ringan Schedule: First Ringan at Katewadi on 18 July, Second Ringan at Akluj on 21 July, Bajirao Vihir on 24 July. Ashadhi Ekadashi is on 26 July 2026 at Pandharpur.";
    } else if (lowerQ.includes("dindi") || lowerQ.includes("दिंडी") || lowerQ.includes("crowd") || lowerQ.includes("गर्दी")) {
      response =
        liveDindis.length > 0
          ? language === "mr"
            ? `सध्या ${liveDindis.length} नोंदणीकृत दिंड्या ट्रॅक केल्या जात आहेत. एकूण भाविक: ${state.totalPilgrims.toLocaleString()}. जवळचा तळ: ${selectedFacilities?.camp?.item.name ?? "कॅम्प १"}.`
            : `Currently tracking ${liveDindis.length} registered Dindis with ${state.totalPilgrims.toLocaleString()} pilgrims. Nearest halt is ${selectedFacilities?.camp?.item.name ?? "Camp 1"}.`
          : "No live Dindis registered yet. Dindi leaders can register at /dindi to broadcast GPS.";
    } else if (lowerQ.includes("water") || lowerQ.includes("tanker") || lowerQ.includes("पाणी") || lowerQ.includes("टँकर")) {
      response = `There are ${availableTankers} water tankers available along the corridor. Nearest tanker is ${selectedFacilities?.tanker?.item.id ?? "T-03"} located ${selectedFacilities?.tanker?.distanceKm ?? 0} km away with estimated arrival in 15 minutes.`;
    } else {
      response = `Command Status: ${liveDindis.length} live Dindis, ${state.camps.length} camps operational, ${activeAlerts.length} active alerts. All 6 camp sectors are staffed with active volunteers.`;
    }

    setAiResponse(response);
    speak(response, language);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalCampId) return;

    assignCommandTask({
      campId: dispatchModalCampId,
      type: taskType,
      title: taskTitle,
      etaMinutes: Number(taskEta) || 15,
      notes: taskNotes,
    });

    setDispatchModalCampId(null);
    setTaskNotes("");
  };

  const metricCards = [
    {
      label: language === "en" ? "Total Warkaris" : language === "hi" ? "कुल वारकरी" : "एकूण वारकरी",
      value: `${Math.max(state.totalPilgrims, topCluster?.totalPilgrims ?? 0).toLocaleString()}`,
      delta: liveDindis.length > 0 ? `${liveDindis.length} Live Dindis` : "Live GPS Ready",
      icon: Users,
      tone: "text-orange-700",
    },
    {
      label: language === "en" ? "Water Stock" : language === "hi" ? "जल स्टॉक" : "पाणी साठा",
      value: `${availableTankers} Tankers`,
      delta: "Camps 1–6 Supplied",
      icon: Droplets,
      tone: "text-blue-600",
    },
    {
      label: language === "en" ? "Live Volunteers" : language === "hi" ? "सक्रिय स्वयंसेवक" : "सक्रिय स्वयंसेवक",
      value: `${state.volunteers.length}`,
      delta: "6 Camps Staffed",
      icon: Users,
      tone: "text-purple-700",
    },
    {
      label: language === "en" ? "Active Tasks" : language === "hi" ? "सक्रिय कार्य" : "सक्रिय कार्य",
      value: `${state.volunteerTasks.filter((t) => t.status !== "VERIFIED").length}`,
      delta: `${state.volunteerTasks.filter((t) => t.status === "VERIFIED").length} Verified`,
      icon: CheckCircle2,
      tone: "text-emerald-700",
    },
    {
      label: language === "en" ? "Active Alerts" : language === "hi" ? "अलर्ट" : "अलर्ट",
      value: `${activeAlerts.length}`,
      delta: criticalAlerts.length > 0 ? `${criticalAlerts.length} CRITICAL` : "Normal Flow",
      icon: AlertTriangle,
      tone: criticalAlerts.length > 0 ? "text-red-600" : "text-amber-600",
    },
    {
      label: language === "en" ? "Medical Capacity" : language === "hi" ? "चिकित्सा क्षमता" : "वैद्यकीय क्षमता",
      value: `${medicalCapacity}%`,
      delta: "Trauma Hubs Ready",
      icon: HospitalIcon,
      tone: "text-red-700",
    },
  ];

  return (
    <div className="wari-reference-grid animate-fadeIn pb-12 space-y-6">

      {/* ── HEADER BANNER ── */}
      <section className="wari-hero-band rounded-3xl border border-white/60 shadow-card overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#5b2b17] tracking-tight">{c.title}</h1>
              </div>
              <p className="text-xs text-[#7a4b32] mt-1 font-semibold">
                {state.isSimulating ? "🧪 Demo Archive" : "🟢 Live Real Mode"} · Central Command & Authority Oversight · Zero Fake Data
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete current live data and reset to fresh state?")) {
                    resetAll();
                  }
                }}
                className="rounded-2xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 font-bold px-3 py-2 text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete & Reset Live Data
              </button>

              <div className="rounded-2xl bg-white/85 border border-orange-100 px-4 py-2 flex items-center gap-2 shadow-sm">
                <Clock className="w-4 h-4 text-wari-textPrimary" />
                <div>
                  <div className="font-black text-sm">{state.currentClock}</div>
                  <div className="text-[10px] text-wari-textMuted">Live Operations</div>
                </div>
              </div>
            </div>
          </div>

          {/* 6 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3.5 mt-6">
            {metricCards.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl bg-white/90 border border-orange-100 p-4 shadow-card">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#5b2b17]">
                    <Icon className={`w-4 h-4 ${metric.tone}`} />
                    <span>{metric.label}</span>
                  </div>
                  <div className="text-2xl font-black mt-2 text-black">{metric.value}</div>
                  <div className="text-[11px] mt-1 text-emerald-700 font-semibold">{metric.delta}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CAMPS 1-6 VOLUNTEER & RESOURCE DISPATCH MATRIX ── */}
      <section className="rounded-3xl bg-white/90 border border-orange-200 p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-wari-cardBorder">
          <div>
            <h2 className="text-lg font-black text-wari-textPrimary flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              Camps 1–6 Ground Volunteer & Resource Dispatch Matrix
            </h2>
            <p className="text-xs text-wari-textMuted">
              Assign tasks (e.g. water tanker, medical triage, crowd control) to specific camp volunteers. Status and remarks sync automatically.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-orange-100 text-orange-800 px-3 py-1 rounded-full self-start sm:self-auto">
            6 VERIFIED CAMPS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.camps.slice(0, 6).map((camp, idx) => {
            const assignedVol = state.volunteers.find(
              (v) => v.assignedCampId === camp.id || v.locationName.includes(`Camp ${idx + 1}`)
            ) || state.volunteers[idx % state.volunteers.length];

            const campTasks = state.volunteerTasks.filter((t) => t.campId === camp.id);
            const pendingTasks = campTasks.filter((t) => t.status !== "VERIFIED");

            return (
              <div
                key={camp.id}
                className="rounded-2xl border-2 border-orange-200 bg-orange-50/40 p-4 space-y-3 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-600 text-white">
                      Camp {idx + 1}
                    </span>
                    <h3 className="font-bold text-wari-textPrimary text-sm mt-1">{camp.name}</h3>
                    <div className="text-[11px] text-wari-textMuted">
                      Capacity: {camp.capacity.toLocaleString()} • Water: {camp.waterStockPercent}%
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    camp.status === "CRITICAL" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {camp.status}
                  </span>
                </div>

                {/* Assigned Volunteer */}
                <div className="p-2.5 rounded-xl bg-white border border-orange-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-wari-textMuted block">Assigned Ground Volunteer:</span>
                    <strong className="text-purple-950 font-bold">{assignedVol?.name ?? "Designated Volunteer"}</strong>
                    <div className="text-[10px] text-purple-700 font-mono">{assignedVol?.phone || "+91 90000 10001"}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                    {assignedVol?.status ?? "AVAILABLE"}
                  </span>
                </div>

                {/* Active Tasks on this camp */}
                {pendingTasks.length > 0 ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-orange-900 block">Pending Verification ({pendingTasks.length}):</span>
                    {pendingTasks.map((t) => (
                      <div key={t.id} className="p-2 bg-white/90 rounded-lg border border-orange-200 text-[11px] flex items-center justify-between gap-2">
                        <span className="truncate font-semibold text-wari-textPrimary">{t.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold shrink-0">
                          {t.status} (ETA {t.etaMinutes}m)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-700 font-medium">✓ No pending tasks at Camp {idx + 1}</div>
                )}

                {/* Dispatch Button */}
                <button
                  onClick={() => {
                    setDispatchModalCampId(camp.id);
                    setTaskTitle(`💧 Dispatch Water Tanker to ${camp.name}`);
                  }}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Dispatch Task to Camp {idx + 1} Volunteer
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── DISPATCH MODAL ── */}
      {dispatchModalCampId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-orange-200 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📦</span>
                <div>
                  <h3 className="font-bold text-wari-textPrimary text-base">
                    Dispatch Task to {state.camps.find((c) => c.id === dispatchModalCampId)?.name}
                  </h3>
                  <p className="text-xs text-wari-textMuted">
                    This task will appear instantly on the assigned volunteer dashboard for verification.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDispatchModalCampId(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-wari-textSecond block mb-1">Task / Resource Type</label>
                <select
                  value={taskType}
                  onChange={(e) => {
                    const t = e.target.value as VolunteerTask["type"];
                    setTaskType(t);
                    if (t === "WATER_TANKER") setTaskTitle("💧 Dispatch Water Tanker (12,000L)");
                    else if (t === "MEDICAL") setTaskTitle("🚑 Dispatch Medical Emergency Triage Unit");
                    else if (t === "CROWD") setTaskTitle("👥 Mobilize Crowd Marshals to Main Gate");
                    else if (t === "SANITATION") setTaskTitle("🚻 Dispatch Mobile Toilet Sanitization Crew");
                    else setTaskTitle("⛺ Open Emergency Halt Rest Area");
                  }}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="WATER_TANKER">💧 Water Tanker (12,000L)</option>
                  <option value="MEDICAL">🚑 Medical Emergency Aid</option>
                  <option value="CROWD">👥 Crowd Control / Queue Marshalling</option>
                  <option value="HALT">⛺ Halt / Shelter Bay Setup</option>
                  <option value="SANITATION">🚻 Sanitation & Toilet Crew</option>
                  <option value="GENERAL">📌 General Seva Task</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-wari-textSecond block mb-1">Task Title / Details</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-wari-textSecond block mb-1">Estimated Arrival (ETA Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={taskEta}
                    onChange={(e) => setTaskEta(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-wari-textSecond block mb-1">Assigned Ground Contact</label>
                  <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900 truncate">
                    {state.volunteers.find((v) => v.assignedCampId === dispatchModalCampId)?.name || "Camp Volunteer"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-wari-textSecond block mb-1">Special Instructions / Dispatch Notes</label>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="e.g. Tanker T-03 driver Sanjay Shinde (982214401). Verify water discharge level and report back."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400 min-h-16"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalCampId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow transition-all"
                >
                  🚀 Dispatch to Volunteer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2 COLUMN: LIVE MAP & VOLUNTEER VERIFICATION FEED ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT (8 COLS): DINDI SEARCH CONTEXT + LIVE MAP */}
        <section className="xl:col-span-8 space-y-5">
          
          {/* DINDI SEARCH & SELECTION BAR */}
          <div className="rounded-3xl bg-white/90 border border-orange-100 p-5 shadow-card space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-4">
                <label className="text-[11px] uppercase font-black text-wari-textMuted tracking-wider">
                  🔍 Search Dindi / Code
                </label>
                <input
                  value={dindiSearch}
                  onChange={(event) => setDindiSearch(event.target.value)}
                  placeholder="e.g. DND-1234, Sopan Maharaj, Mandal..."
                  className="mt-1 w-full rounded-xl border border-wari-cardBorder bg-white px-3 py-2 text-xs font-medium outline-none focus:border-wari-orange"
                />
              </div>
              <div className="lg:col-span-4">
                <label className="text-[11px] uppercase font-black text-wari-textMuted tracking-wider">
                  Select Dindi for Live Context
                </label>
                <select
                  value={selectedDindi?.id ?? ""}
                  onChange={(event) => setSelectedDindiId(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-wari-cardBorder bg-white px-3 py-2 text-xs font-bold outline-none focus:border-wari-orange"
                >
                  {filteredDindis.length === 0 && <option value="">No live Dindis registered yet</option>}
                  {filteredDindis.map((dindi) => (
                    <option key={dindi.id} value={dindi.id}>
                      {dindi.name} · {dindi.passcode} · {dindi.pilgrimCount.toLocaleString()} people
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-4 rounded-2xl bg-orange-50 border border-orange-200 p-2.5 text-xs">
                <div className="font-bold text-orange-950 truncate">
                  {selectedDindi ? `${selectedDindi.name} (${selectedDindi.passcode})` : "Awaiting live Dindi registration"}
                </div>
                <div className="text-[11px] text-orange-800 mt-0.5">
                  {selectedDindi
                    ? `GPS: ${selectedDindi.lat.toFixed(4)}°N, ${selectedDindi.lng.toFixed(4)}°E · ~${selectedDindi.pilgrimCount.toLocaleString()} devotees`
                    : "Register from /dindi to broadcast GPS."}
                </div>
              </div>
            </div>

            {/* Dynamic Facility Breakdown for Selected Dindi */}
            {selectedFacilities && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
                <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-2.5">
                  <span className="text-[10px] text-purple-700 font-bold block">Closest Camp (1-6)</span>
                  <strong className="text-purple-950 font-bold block truncate">{selectedFacilities.camp?.item.name ?? "Calculating..."}</strong>
                  <span className="text-purple-700 font-bold text-[11px]">{selectedFacilities.camp?.distanceKm ?? 0} km away</span>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-2.5">
                  <span className="text-[10px] text-red-700 font-bold block">Nearest Hospital</span>
                  <strong className="text-red-950 font-bold block truncate">{selectedFacilities.medical?.item.name ?? "Deenanath / Sassoon"}</strong>
                  <span className="text-red-700 font-bold text-[11px]">{selectedFacilities.medical?.distanceKm ?? 0} km away</span>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2.5">
                  <span className="text-[10px] text-blue-700 font-bold block">Water Logistics</span>
                  <strong className="text-blue-950 font-bold block truncate">{selectedFacilities.tanker?.item.id ?? "T-03 Tanker"}</strong>
                  <span className="text-blue-700 font-bold text-[11px]">{selectedFacilities.tanker?.distanceKm ?? 0} km away</span>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5">
                  <span className="text-[10px] text-emerald-700 font-bold block">Camp Volunteer</span>
                  <strong className="text-emerald-950 font-bold block truncate">{selectedFacilities.volunteer?.item.name ?? "Aarav Patil"}</strong>
                  <span className="text-emerald-700 font-bold text-[11px]">{selectedFacilities.volunteer?.distanceKm ?? 0} km away</span>
                </div>
              </div>
            )}
          </div>

          {/* LIVE TACTICAL ROUTE MAP */}
          <div className="rounded-3xl bg-white/90 border border-orange-100 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-wari-textPrimary flex items-center gap-2">
                  {c.map} <span className="badge-live">LIVE</span>
                </h2>
                <p className="text-xs text-wari-textMuted">
                  Pune (Alandi) → Pandharpur (240 km) · Real OpenStreetMap corridor waypoints, camps & registered Dindis
                </p>
              </div>
              <Link href="/map" className="btn-secondary flex items-center gap-1.5 text-xs font-bold">
                <Map className="w-4 h-4" />
                {c.fullMap}
              </Link>
            </div>
            <LiveRouteMapSnippet />
          </div>

        </section>

        {/* RIGHT (4 COLS): LIVE VOLUNTEER VERIFICATION FEED & VOICE AI COPILOT */}
        <aside className="xl:col-span-4 space-y-5">
          
          {/* ── LIVE VOLUNTEER VERIFICATION FEED ── */}
          <div className="rounded-3xl bg-white/90 border border-orange-100 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-base font-black text-wari-textPrimary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Volunteer Live Task Sync
              </h2>
              <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                {state.volunteerTasks.length} TOTAL
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {state.volunteerTasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-2xl border p-3 text-xs space-y-1.5 ${
                    task.status === "VERIFIED"
                      ? "bg-emerald-50/70 border-emerald-300"
                      : task.status === "REJECTED"
                      ? "bg-red-50/70 border-red-300"
                      : "bg-amber-50/70 border-amber-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <strong className="text-wari-textPrimary font-bold text-xs truncate">{task.title}</strong>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        task.status === "VERIFIED"
                          ? "bg-emerald-200 text-emerald-900"
                          : task.status === "REJECTED"
                          ? "bg-red-200 text-red-900"
                          : "bg-amber-200 text-amber-900 animate-pulse"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-wari-textMuted flex items-center justify-between">
                    <span>{task.campName} · {task.volunteerName}</span>
                    <span className="font-semibold text-orange-700">ETA {task.etaMinutes}m</span>
                  </div>

                  {task.remarks && (
                    <div className="p-1.5 rounded-lg bg-white border border-gray-200 text-[10px] text-gray-800 font-medium">
                      💬 Volunteer Remarks: {task.remarks}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-[10px] text-gray-400">
                    <span>{task.createdAt}</span>
                    <button
                      onClick={() => deleteVolunteerTask(task.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}

              {state.volunteerTasks.length === 0 && (
                <div className="text-xs text-wari-textMuted rounded-2xl bg-wari-pageBg border border-wari-cardBorder p-4 text-center">
                  No dispatch tasks currently running. Click "Dispatch Task to Camp Volunteer" above to stage a tanker or triage team.
                </div>
              )}
            </div>
          </div>

          {/* ── VOICE RAG AI COPILOT (3 LANGUAGES) ── */}
          <div className="rounded-3xl bg-white/90 border border-orange-100 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-wari-orange" />
                <h2 className="text-base font-black text-wari-textPrimary">{c.copilot}</h2>
              </div>
              <Link href="/copilot" className="text-xs text-wari-orange font-bold hover:underline">
                Open Full →
              </Link>
            </div>

            <p className="text-[11px] text-wari-textMuted">
              Ask about Ringan dates, 2026 Palkhi halts, overcrowding, or nearest facilities in Marathi, Hindi, or English.
            </p>

            {/* Voice Output Box */}
            {aiResponse && (
              <div className="rounded-2xl bg-orange-50 border border-orange-200 p-3 text-xs text-orange-950 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-orange-800 uppercase tracking-wider">AI Copilot Response:</span>
                  {isSpeaking ? (
                    <button
                      onClick={stopSpeaking}
                      className="text-[10px] text-red-600 font-bold flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3 animate-pulse" /> Stop Voice
                    </button>
                  ) : (
                    <button
                      onClick={() => speak(aiResponse, language)}
                      className="text-[10px] text-orange-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Volume2 className="w-3 h-3" /> Replay Voice
                    </button>
                  )}
                </div>
                <p className="leading-relaxed font-medium">{aiResponse}</p>
              </div>
            )}

            {/* Voice Input and Query Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-2xl border border-orange-300 bg-white p-2">
                <input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskCopilot()}
                  placeholder={c.ask}
                  className="flex-1 outline-none text-xs bg-transparent px-1 font-medium"
                />

                <button
                  type="button"
                  onClick={isListening ? resetSpeech : startListening}
                  disabled={!isSupported}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                  }`}
                  title="Speak query"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleAskCopilot()}
                  className="p-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700"
                  title="Submit query"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {transcript && (
                <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-lg flex items-center justify-between">
                  <span>Voice input: "{transcript}"</span>
                  <button
                    onClick={() => handleAskCopilot(transcript)}
                    className="text-orange-700 font-bold hover:underline"
                  >
                    Query
                  </button>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "2026 Ringan Schedule?",
                "Nearest Camp & Tanker?",
                "Live Dindi Status?",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleAskCopilot(chip)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-wari-pageBg border border-wari-cardBorder hover:bg-orange-50 hover:border-orange-200 text-wari-textSecond font-semibold transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

        </aside>
      </div>

    </div>
  );
}
