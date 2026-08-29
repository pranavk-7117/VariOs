"use client";

import React, { useState } from "react";
import {
  Droplets,
  Truck,
  Zap,
  CheckCircle2,
  Utensils,
  Trash2,
  Building2,
  Phone,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";
import { getLiveCrowdClusters } from "@/lib/live-ops";

export default function ResourcesPage() {
  const { state, dispatchTankerT03, isMitigated } = useSimulation();
  const { language } = useLanguage();
  const [resourceTab, setResourceTab] = useState<"WATER" | "FOOD" | "SANITATION">("WATER");
  const liveClusters = getLiveCrowdClusters(state);
  const topLiveCluster = liveClusters[0];
  const isLiveMode = !state.isSimulating;

  const pageCopy = {
    en: {
      title: "Resource Logistics Optimizer (Camps 1–8)",
      subtitle: "Monitor water tanker fleets, camp consumption rates, Prasad kitchens, and mobile sanitation squads",
      tabWater: (n: number) => `Water Fleet (${n})`,
      tabFood: (n: number) => `Prasad & Food (${n})`,
      tabSanitation: (n: number) => `Sanitation (${n})`,
      liveBannerTitle: "Live GPS Resource Optimization",
      liveBannerDesc: "Dynamic telemetry calculated from real registered Dindis, verified camps, and mobile tankers.",
      liveTelemetry: "LIVE TELEMETRY",
      liveCrowdLoad: "Live Crowd Load",
      safeCapacity: "of {cap} Safe Capacity",
      nearestHalt: "Nearest Verified Halt",
      nearestWater: "Nearest Water Supply",
      nearestMedical: "Nearest Emergency Medical",
      awaitingDindi: "Awaiting active Dindi live telemetry",
      awaitingDindiDesc: "Register a Dindi from /dindi to calculate nearest verified halts, water tankers, and medical posts in real time.",
      campWaterReserves: "Camp Water Reserves (Camps 1–8)",
      verifiedCamps: "8 VERIFIED CAMPS",
      safeCapacityPilgrims: (cap: number, burn: number) => `Safe Capacity: ${cap.toLocaleString()} pilgrims • Water Burn Rate: ${burn} L/min`,
      stockLabel: (pct: number) => `${pct}% Stock`,
      occupancy: (pct: number) => `Occupancy: ${pct}%`,
      depletionBuffer: (min: number) => `Depletion Buffer: ~${min} min`,
      tankerFleet: (n: number) => `Mobile Water Tanker Fleet (${n} Units)`,
      liveStatus: "LIVE STATUS",
      stationedAt: "Stationed At:",
      driverContact: "Driver / Contact:",
      assigned: (camp: string, eta: number) => `Assigned: ${camp} (ETA ${eta}m)`,
      dispatchTanker: "Dispatch Tanker T-03 (Hub 2)",
      tankerEnRoute: "Tanker T-03 En Route (ETA 6m)",
      waterAdvisory: "Camp 5 (Saswad Palkhi Maidan) Water Advisory",
      depletionIn: "Depletion in 34m",
      resolved: "Resolved",
      foodTitle: "Maha-Prasad & Anna Dan Infrastructure (Camps 1–8)",
      mobileKitchens: (n: number) => `${n} Mobile Kitchens Ready`,
      campFoodReserves: "Camp Food Reserves (Camps 1–8)",
      safeDevoteeCapacity: (cap: number, status: string) => `Safe Devotee Capacity: ${cap.toLocaleString()} • Status: ${status}`,
      foodStock: (pct: number) => `${pct}% Food Stock`,
      devoteesPresent: (n: number) => `Devotees Present: ${n.toLocaleString()}`,
      foodReady: "Hot Khichdi, Sheera & Meals Ready",
      mobileFoodFleet: (n: number) => `Mobile Anna Dan Food Fleet (${n} Units)`,
      vehicleHub: "Vehicle / Hub:",
      sevaTrust: "Seva Trust / Contact:",
      batchCapacity: "Batch Capacity:",
      meals: "meals",
      assignedEta: (camp: string, eta: number) => `Assigned: ${camp} (ETA ~${eta}m)`,
      sanitationTitle: "Corridor Sanitation Crews & Mobile Bio-Toilet Squads",
      sanitationUnits: (n: number) => `${n} Units Active`,
      zone: "Zone:",
      lead: "Lead:",
      bioPods: "Mobile Bio-Pods:",
      podsUnit: "Units",
      dispatchedTo: (camp: string, eta: number) => `Dispatched To: ${camp} (ETA ~${eta}m)`,
      podsActive: (n: number) => `✓ ${n} Mobile pods disinfected & active`,
      kmAway: "km away",
      corridorStart: "Corridor Start",
      readyAtHub: "Ready at Hub",
      etaApprox: "km · ETA ~15m",
    },
    hi: {
      title: "संसाधन रसद अनुकूलक (शिविर 1–8)",
      subtitle: "पानी के टैंकर, शिविर उपभोग दर, प्रसाद रसोई और मोबाइल स्वच्छता दल की निगरानी करें",
      tabWater: (n: number) => `जल बेड़ा (${n})`,
      tabFood: (n: number) => `प्रसाद व भोजन (${n})`,
      tabSanitation: (n: number) => `स्वच्छता (${n})`,
      liveBannerTitle: "लाइव GPS संसाधन अनुकूलन",
      liveBannerDesc: "पंजीकृत दिंडियों, सत्यापित शिविरों और मोबाइल टैंकरों से गतिशील टेलीमेट्री की गणना।",
      liveTelemetry: "लाइव टेलीमेट्री",
      liveCrowdLoad: "लाइव भीड़ भार",
      safeCapacity: "{cap} सुरक्षित क्षमता में से",
      nearestHalt: "निकटतम सत्यापित पड़ाव",
      nearestWater: "निकटतम जल आपूर्ति",
      nearestMedical: "निकटतम आपातकालीन चिकित्सा",
      awaitingDindi: "सक्रिय दिंडी लाइव टेलीमेट्री की प्रतीक्षा",
      awaitingDindiDesc: "निकटतम पड़ाव, टैंकर और चिकित्सा केंद्र की गणना के लिए /dindi पर दिंडी पंजीकृत करें।",
      campWaterReserves: "शिविर जल भंडार (शिविर 1–8)",
      verifiedCamps: "8 सत्यापित शिविर",
      safeCapacityPilgrims: (cap: number, burn: number) => `सुरक्षित क्षमता: ${cap.toLocaleString()} श्रद्धालु • जल उपभोग दर: ${burn} L/min`,
      stockLabel: (pct: number) => `${pct}% भंडार`,
      occupancy: (pct: number) => `अधिभोग: ${pct}%`,
      depletionBuffer: (min: number) => `रिक्तीकरण बफर: ~${min} मिनट`,
      tankerFleet: (n: number) => `मोबाइल जल टैंकर बेड़ा (${n} इकाइयाँ)`,
      liveStatus: "लाइव स्थिति",
      stationedAt: "तैनाती स्थान:",
      driverContact: "चालक / संपर्क:",
      assigned: (camp: string, eta: number) => `नियुक्त: ${camp} (ETA ${eta}m)`,
      dispatchTanker: "टैंकर T-03 भेजें (हब 2)",
      tankerEnRoute: "टैंकर T-03 रास्ते में (ETA 6m)",
      waterAdvisory: "शिविर 5 (सासवड पालखी मैदान) जल सलाह",
      depletionIn: "34 मिनट में रिक्त",
      resolved: "हल हुआ",
      foodTitle: "महा-प्रसाद और अन्न दान बुनियादी ढांचा (शिविर 1–8)",
      mobileKitchens: (n: number) => `${n} मोबाइल रसोई तैयार`,
      campFoodReserves: "शिविर खाद्य भंडार (शिविर 1–8)",
      safeDevoteeCapacity: (cap: number, status: string) => `सुरक्षित क्षमता: ${cap.toLocaleString()} • स्थिति: ${status}`,
      foodStock: (pct: number) => `${pct}% खाद्य भंडार`,
      devoteesPresent: (n: number) => `उपस्थित श्रद्धालु: ${n.toLocaleString()}`,
      foodReady: "गरम खिचड़ी, शीरा और भोजन तैयार",
      mobileFoodFleet: (n: number) => `मोबाइल अन्न दान बेड़ा (${n} इकाइयाँ)`,
      vehicleHub: "वाहन / हब:",
      sevaTrust: "सेवा ट्रस्ट / संपर्क:",
      batchCapacity: "बैच क्षमता:",
      meals: "भोजन",
      assignedEta: (camp: string, eta: number) => `नियुक्त: ${camp} (ETA ~${eta}m)`,
      sanitationTitle: "कॉरिडोर स्वच्छता दल और मोबाइल बायो-शौचालय",
      sanitationUnits: (n: number) => `${n} इकाइयाँ सक्रिय`,
      zone: "क्षेत्र:",
      lead: "प्रमुख:",
      bioPods: "मोबाइल बायो-पॉड:",
      podsUnit: "इकाइयाँ",
      dispatchedTo: (camp: string, eta: number) => `भेजा गया: ${camp} (ETA ~${eta}m)`,
      podsActive: (n: number) => `✓ ${n} मोबाइल पॉड कीटाणुरहित व सक्रिय`,
      kmAway: "किमी दूर",
      corridorStart: "कॉरिडोर प्रारंभ",
      readyAtHub: "हब पर तैयार",
      etaApprox: "किमी · ETA ~15m",
    },
    mr: {
      title: "संसाधन रसद ऑप्टिमायझर (तळ 1–8)",
      subtitle: "पाण्याचे टँकर, तळ उपभोग दर, प्रसाद स्वयंपाकघर आणि मोबाइल स्वच्छता पथकांवर लक्ष ठेवा",
      tabWater: (n: number) => `जल बेड़ा (${n})`,
      tabFood: (n: number) => `प्रसाद व जेवण (${n})`,
      tabSanitation: (n: number) => `स्वच्छता (${n})`,
      liveBannerTitle: "थेट GPS संसाधन ऑप्टिमायझेशन",
      liveBannerDesc: "नोंदणीकृत दिंड्या, अधिकृत तळ आणि मोबाइल टँकरमधून गतिशील टेलीमेट्री गणना.",
      liveTelemetry: "थेट टेलीमेट्री",
      liveCrowdLoad: "थेट गर्दी भार",
      safeCapacity: "{cap} सुरक्षित क्षमतेपैकी",
      nearestHalt: "जवळचा अधिकृत मुक्काम",
      nearestWater: "जवळचा पाणी पुरवठा",
      nearestMedical: "जवळचे आपत्कालीन रुग्णालय",
      awaitingDindi: "सक्रिय दिंडी थेट टेलीमेट्रीची प्रतीक्षा",
      awaitingDindiDesc: "जवळचा मुक्काम, टँकर व वैद्यकीय केंद्र मोजण्यासाठी /dindi वर दिंडी नोंदवा.",
      campWaterReserves: "तळ पाणी साठा (तळ 1–8)",
      verifiedCamps: "8 अधिकृत तळ",
      safeCapacityPilgrims: (cap: number, burn: number) => `सुरक्षित क्षमता: ${cap.toLocaleString()} भाविक • पाणी वापर दर: ${burn} L/min`,
      stockLabel: (pct: number) => `${pct}% साठा`,
      occupancy: (pct: number) => `अधिभोग: ${pct}%`,
      depletionBuffer: (min: number) => `रिक्तीकरण बफर: ~${min} मिनिटे`,
      tankerFleet: (n: number) => `मोबाइल पाण्याचे टँकर (${n} घटक)`,
      liveStatus: "थेट स्थिती",
      stationedAt: "तैनात ठिकाण:",
      driverContact: "चालक / संपर्क:",
      assigned: (camp: string, eta: number) => `नियुक्त: ${camp} (ETA ${eta}m)`,
      dispatchTanker: "टँकर T-03 पाठवा (हब 2)",
      tankerEnRoute: "टँकर T-03 रस्त्यावर (ETA 6m)",
      waterAdvisory: "तळ 5 (सासवड पालखी मैदान) पाणी सूचना",
      depletionIn: "34 मिनिटांत रिक्त",
      resolved: "निराकरण झाले",
      foodTitle: "महाप्रसाद आणि अन्नदान पायाभूत सुविधा (तळ 1–8)",
      mobileKitchens: (n: number) => `${n} मोबाइल स्वयंपाकघर सज्ज`,
      campFoodReserves: "तळ अन्न साठा (तळ 1–8)",
      safeDevoteeCapacity: (cap: number, status: string) => `सुरक्षित क्षमता: ${cap.toLocaleString()} • स्थिती: ${status}`,
      foodStock: (pct: number) => `${pct}% अन्न साठा`,
      devoteesPresent: (n: number) => `उपस्थित भाविक: ${n.toLocaleString()}`,
      foodReady: "गरम खिचडी, शिरा व जेवण तयार",
      mobileFoodFleet: (n: number) => `मोबाइल अन्नदान वाहन (${n} घटक)`,
      vehicleHub: "वाहन / हब:",
      sevaTrust: "सेवा संस्था / संपर्क:",
      batchCapacity: "बॅच क्षमता:",
      meals: "जेवण",
      assignedEta: (camp: string, eta: number) => `नियुक्त: ${camp} (ETA ~${eta}m)`,
      sanitationTitle: "कॉरिडोर स्वच्छता पथक आणि मोबाइल बायो-शौचालय",
      sanitationUnits: (n: number) => `${n} घटक सक्रिय`,
      zone: "विभाग:",
      lead: "प्रमुख:",
      bioPods: "मोबाइल बायो-पॉड:",
      podsUnit: "घटक",
      dispatchedTo: (camp: string, eta: number) => `पाठवले: ${camp} (ETA ~${eta}m)`,
      podsActive: (n: number) => `✓ ${n} मोबाइल पॉड निर्जंतुकीकरण व सक्रिय`,
      kmAway: "किमी अंतरावर",
      corridorStart: "कॉरिडोर प्रारंभ",
      readyAtHub: "हबवर सज्ज",
      etaApprox: "किमी · ETA ~15m",
    },
  };
  const pc = pageCopy[language] ?? pageCopy.en;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="card-base p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
              Resource Logistics Optimizer (Camps 1–8)
            </h1>
            <p className="text-sm text-wari-textSecond mt-0.5">
              {pc.subtitle}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-wari-pageBg p-1 rounded-xl border border-wari-cardBorder self-start md:self-auto">
          <button
            onClick={() => setResourceTab("WATER")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              resourceTab === "WATER"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water Fleet ({state.tankers.length})</span>
          </button>
          <button
            onClick={() => setResourceTab("FOOD")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              resourceTab === "FOOD"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Prasad & Food ({state.camps.length})</span>
          </button>
          <button
            onClick={() => setResourceTab("SANITATION")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              resourceTab === "SANITATION"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sanitation ({state.sanitationCrews.length})</span>
          </button>
        </div>
      </div>

      {/* Live Resource Optimization Banner */}
      {isLiveMode && (
        <div className="card-base p-6 space-y-4 border-2 border-emerald-300 bg-emerald-50/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-wari-textPrimary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Live GPS Resource Optimization
              </h2>
              <p className="text-xs text-wari-textMuted mt-0.5">
                Dynamic telemetry calculated from real registered Dindis, verified camps, and mobile tankers.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full">
              LIVE TELEMETRY
            </span>
          </div>

          {topLiveCluster ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-white border border-emerald-200 p-4 space-y-1">
                <span className="text-wari-textMuted text-[11px] block">Live Crowd Load</span>
                <span className="text-2xl font-black text-wari-textPrimary">{topLiveCluster.totalPilgrims.toLocaleString()}</span>
                <p className="text-emerald-700 font-bold text-[11px]">
                  {topLiveCluster.occupancyPercent}% of {topLiveCluster.capacity.toLocaleString()} Safe Capacity
                </p>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-4 space-y-1">
                <span className="text-wari-textMuted text-[11px] block">Nearest Verified Halt</span>
                <strong className="font-bold text-wari-textPrimary text-sm block truncate">
                  {topLiveCluster.nearestCamp ? topLiveCluster.nearestCamp.item.name : "Camp 1 (Pune Bhavani Peth)"}
                </strong>
                <span className="text-purple-700 font-semibold text-[11px]">
                  {topLiveCluster.nearestCamp ? `${topLiveCluster.nearestCamp.distanceKm} km away` : "Corridor Start"}
                </span>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-4 space-y-1">
                <span className="text-wari-textMuted text-[11px] block">Nearest Water Supply</span>
                <strong className="font-bold text-blue-900 text-sm block truncate">
                  {topLiveCluster.nearestTanker ? `${topLiveCluster.nearestTanker.item.id} (${topLiveCluster.nearestTanker.item.currentHub})` : "Tanker T-03 (12,000L)"}
                </strong>
                <span className="text-blue-700 font-semibold text-[11px]">
                  {topLiveCluster.nearestTanker ? `${topLiveCluster.nearestTanker.distanceKm} km · ETA ~15m` : "Ready at Hub"}
                </span>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-4 space-y-1">
                <span className="text-wari-textMuted text-[11px] block">Nearest Emergency Medical</span>
                <strong className="font-bold text-red-950 text-sm block truncate">
                  {topLiveCluster.nearestMedical ? topLiveCluster.nearestMedical.item.name : "Deenanath Mangeshkar Hospital"}
                </strong>
                <span className="text-red-700 font-semibold text-[11px]">
                  {topLiveCluster.nearestMedical ? `${topLiveCluster.nearestMedical.distanceKm} km away` : "2.6 km away"}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-dashed border-emerald-300 p-5 text-center">
              <p className="text-xs font-bold text-wari-textPrimary">Awaiting active Dindi live telemetry</p>
              <p className="text-[11px] text-wari-textMuted mt-0.5">
                Register a Dindi from <strong>/dindi</strong> to calculate nearest verified halts, water tankers, and medical posts in real time.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: WATER RESERVES & MOBILE FLEET ── */}
      {resourceTab === "WATER" && (
        <div className="space-y-6">
          {!isLiveMode && (
            <div
              className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                isMitigated
                  ? "bg-emerald-50 border-emerald-300"
                  : "bg-red-50 border-red-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl ${
                    isMitigated ? "bg-emerald-100 text-emerald-700" : "bg-red-500 text-white animate-pulse"
                  }`}
                >
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-wari-textPrimary">
                      Camp 5 (Saswad Palkhi Maidan) Water Advisory
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isMitigated ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {isMitigated ? "Resolved" : "Depletion in 34m"}
                    </span>
                  </div>
                  <p className="text-xs text-wari-textSecond mt-1">
                    {isMitigated
                      ? "Tanker T-03 (12,000L) connected. Safe buffer extended to 78 minutes."
                      : "Current stock at 18%. Burn rate of 420 L/min requires immediate replenishment."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isMitigated ? (
                  <button
                    onClick={dispatchTankerT03}
                    className="btn-primary flex items-center gap-2 shrink-0"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Dispatch Tanker T-03 (Hub 2)</span>
                  </button>
                ) : (
                  <div className="badge-normal flex items-center gap-2 px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tanker T-03 En Route (ETA 6m)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Grid: Camps 1-8 Water vs Mobile Tankers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Camps Water Stock Table (7 Cols) */}
            <div className="lg:col-span-7 card-base p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-wari-cardBorder">
                <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Camp Water Reserves (Camps 1–8)
                </h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  8 VERIFIED CAMPS
                </span>
              </div>

              <div className="space-y-3">
                {state.camps.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-wari-pageBg border border-wari-cardBorder text-xs space-y-2.5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-sm text-wari-textPrimary">{c.name}</span>
                        <div className="text-[11px] text-wari-textMuted">
                          Safe Capacity: {c.capacity.toLocaleString()} pilgrims • Water Burn Rate: {c.waterBurnRateLitersPerMin} L/min
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                          c.waterStockPercent <= 20
                            ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                            : c.waterStockPercent <= 50
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {c.waterStockPercent}% Stock
                      </span>
                    </div>

                    {/* Stock Bar */}
                    <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-wari-cardBorder">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          c.waterStockPercent <= 20
                            ? "bg-red-500"
                            : c.waterStockPercent <= 50
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${c.waterStockPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-wari-textMuted">
                      <span>Occupancy: {c.occupancyPercent}%</span>
                      <span
                        className={
                          c.minutesToWaterDepletion < 40 ? "text-red-600 font-bold" : "text-emerald-700 font-semibold"
                        }
                      >
                        Depletion Buffer: ~{c.minutesToWaterDepletion} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Water Tanker Fleet (5 Cols) */}
            <div className="lg:col-span-5 card-base p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-wari-cardBorder">
                <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Mobile Water Tanker Fleet ({state.tankers.length} Units)
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  LIVE STATUS
                </span>
              </div>

              <div className="space-y-3">
                {state.tankers.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-wari-pageBg border border-wari-cardBorder text-xs space-y-2 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold text-sm text-wari-textPrimary">{t.id}</span>
                        <span className="text-xs text-wari-textMuted font-mono">
                          ({t.capacityLiters.toLocaleString()} L)
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          t.status === "AVAILABLE"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.status === "EN_ROUTE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="text-xs text-wari-textSecond space-y-1">
                      <div>
                        <span className="text-wari-textMuted">Stationed At: </span>
                        <strong>{t.currentHub}</strong>
                      </div>
                      <div>
                        <span className="text-wari-textMuted">Driver / Contact: </span>
                        <span>{t.driverName}</span>
                      </div>
                      {t.assignedCampId && (
                        <div className="text-emerald-700 font-semibold">
                          <span>Assigned: {t.assignedCampId} (ETA {t.etaMinutes}m)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PRASAD & ANNA DAN KITCHENS (CAMPS 1-8) ── */}
      {resourceTab === "FOOD" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-wari-textPrimary flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              Maha-Prasad & Anna Dan Infrastructure (Camps 1–8)
            </h2>
            <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full">
              {state.foodSupplies?.length || 6} Mobile Kitchens Ready
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Camps Food Stock (7 Cols) */}
            <div className="lg:col-span-7 card-base p-6 space-y-4">
              <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider pb-2 border-b border-wari-cardBorder flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                Camp Food Reserves (Camps 1–8)
              </h3>
              <div className="space-y-3">
                {state.camps.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-wari-pageBg border border-wari-cardBorder text-xs space-y-2.5 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-wari-textPrimary">{c.name}</span>
                        <div className="text-[11px] text-wari-textMuted">
                          Safe Devotee Capacity: {c.capacity.toLocaleString()} • Status: {c.shelterStatus}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          c.foodStockPercent <= 25
                            ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                            : c.foodStockPercent <= 50
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {c.foodStockPercent}% Food Stock
                      </span>
                    </div>

                    <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-wari-cardBorder">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          c.foodStockPercent <= 25
                            ? "bg-red-500"
                            : c.foodStockPercent <= 50
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${c.foodStockPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-wari-textMuted">
                      <span>Devotees Present: {c.currentOccupancy.toLocaleString()}</span>
                      <span className="text-emerald-700 font-semibold">Hot Khichdi, Sheera & Meals Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Food Trucks Fleet (5 Cols) */}
            <div className="lg:col-span-5 card-base p-6 space-y-4">
              <h3 className="text-sm font-bold text-wari-textPrimary uppercase tracking-wider pb-2 border-b border-wari-cardBorder flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                Mobile Anna Dan Food Fleet ({state.foodSupplies?.length || 6} Units)
              </h3>
              <div className="space-y-3">
                {state.foodSupplies?.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl bg-wari-pageBg border border-wari-cardBorder text-xs space-y-2 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-bold text-sm text-wari-textPrimary">{f.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          f.status === "AVAILABLE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800 animate-pulse"
                        }`}
                      >
                        {f.status}
                      </span>
                    </div>
                    <div className="text-xs text-wari-textSecond space-y-1">
                      <div>
                        <span className="text-wari-textMuted">Vehicle / Hub: </span>
                        <strong>{f.vehicleNumber}</strong> • {f.currentHub}
                      </div>
                      <div>
                        <span className="text-wari-textMuted">Seva Trust / Contact: </span>
                        <span>{f.leadName} ({f.phone})</span>
                      </div>
                      <div>
                        <span className="text-wari-textMuted">Batch Capacity: </span>
                        <strong className="text-amber-800">{f.mealsCapacity.toLocaleString()} meals</strong>
                      </div>
                      {f.assignedCampId && (
                        <div className="text-emerald-700 font-semibold">
                          Assigned: {f.assignedCampId} (ETA ~{f.etaMinutes}m)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SANITATION CREWS & MOBILE PODS ── */}
      {resourceTab === "SANITATION" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-wari-textPrimary flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-teal-600" />
              Corridor Sanitation Crews & Mobile Bio-Toilet Squads
            </h2>
            <span className="text-xs text-teal-800 font-bold bg-teal-100 px-2.5 py-0.5 rounded-full">
              {state.sanitationCrews.length} Units Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.sanitationCrews.map((sc) => (
              <div
                key={sc.id}
                className="card-base p-5 space-y-3 text-xs border border-teal-200 hover:border-teal-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-bold text-sm text-wari-textPrimary">{sc.name}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sc.status === "AVAILABLE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800 animate-pulse"
                    }`}
                  >
                    {sc.status}
                  </span>
                </div>

                <div className="space-y-1 text-wari-textSecond">
                  <p>Zone: <strong>{sc.zone}</strong></p>
                  <p>Lead: <strong>{sc.leadName}</strong> {sc.phone ? `(${sc.phone})` : ""}</p>
                  <p>Mobile Bio-Pods: <strong className="text-teal-800">{sc.mobilePodsCount || 20} Units</strong></p>
                  {sc.assignedCampId && (
                    <p className="text-emerald-700 font-bold">
                      Dispatched To: {sc.assignedCampId} (ETA ~{sc.etaMinutes || 10}m)
                    </p>
                  )}
                </div>

                <div className="text-teal-900 text-xs font-semibold bg-teal-50 border border-teal-200 p-2.5 rounded-xl">
                  ✓ {sc.activeToiletsCleaned} Mobile pods disinfected & active
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
