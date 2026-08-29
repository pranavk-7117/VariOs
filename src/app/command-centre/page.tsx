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
import { getDistanceKm, getLiveCrowdClusters, computeDindiSyncPlan } from "@/lib/live-ops";
import { VolunteerTask } from "@/lib/types";

const copy = {
  en: {
    title: "|| Pandhari's Path, Vitthal's Meeting Path ||",
    subtitle: "Live Real Mode · Central Command & Authority Oversight · Zero Fake Data",
    deleteReset: "Delete & Reset Live Data",
    liveOps: "Live Operations",
    map: "Live Tactical Route Map",
    quick: "Direct Command Dispatches",
    timeline: "Wari Operation Timeline",
    alerts: "Important Alerts & Feeds",
    copilot: "WariOS AI Copilot (Voice & RAG)",
    fullMap: "View Full Tactical Map",
    ask: "Ask Copilot in English, Hindi, or Marathi...",
    routeDesc: "Pune (Alandi) → Pandharpur (240 km) · Real OpenStreetMap corridor waypoints, camps & registered Dindis",
    volunteerMatrixTitle: "Camps 1–6 Ground Volunteer & Resource Dispatch Matrix",
    volunteerMatrixSubtitle: "Assign tasks (e.g. water tanker, medical triage, crowd control) to specific camp volunteers. Status and remarks sync automatically.",
    verifiedCampsBadge: "6 VERIFIED CAMPS",
    assignedVolunteer: "Assigned Ground Volunteer:",
    pendingVerification: "Pending Verification",
    noPendingTasks: "✓ No pending tasks at",
    dispatchTaskBtn: "Dispatch Task to Camp",
    volunteer: "Volunteer",
    capacity: "Capacity",
    water: "Water",
    searchDindi: "🔍 Search Dindi / Code",
    searchPlaceholder: "e.g. DND-1234, Sopan Maharaj, Mandal...",
    selectDindi: "Select Dindi for Live Context",
    noDindiOption: "No live Dindis registered yet",
    awaitingDindi: "Awaiting live Dindi registration",
    registerDindiPrompt: "Register from /dindi to broadcast GPS.",
    closestCamp: "Closest Camp (1-6)",
    nearestHospital: "Nearest Hospital",
    waterLogistics: "Water Logistics",
    campVolunteer: "Camp Volunteer",
    kmAway: "km away",
    volunteerFeedTitle: "Volunteer Live Task Sync",
    totalBadge: "TOTAL",
    remarksLabel: "Volunteer Remarks:",
    dismiss: "Dismiss",
    noTasksRunning: "No dispatch tasks currently running. Click 'Dispatch Task to Camp Volunteer' above to stage a tanker or triage team.",
    copilotDesc: "Ask about Ringan dates, 2026 Palkhi halts, overcrowding, or nearest facilities in Marathi, Hindi, or English.",
    openFull: "Open Full →",
    stopVoice: "Stop Voice",
    replayVoice: "Replay Voice",
    voiceInputLabel: "Voice input:",
    queryBtn: "Query",
    chips: ["2026 Ringan Schedule?", "Nearest Camp & Tanker?", "Live Dindi Status?"],
    dispatchModalTitle: "Dispatch Task to",
    dispatchModalDesc: "This task will appear instantly on the assigned volunteer dashboard for verification.",
    taskTypeLabel: "Task / Resource Type",
    taskTitleLabel: "Task Title / Details",
    etaLabel: "Estimated Arrival (ETA Minutes)",
    assignedContactLabel: "Assigned Ground Contact",
    notesLabel: "Special Instructions / Dispatch Notes",
    notesPlaceholder: "e.g. Tanker T-03 driver Sanjay Shinde (982214401). Verify water discharge level and report back.",
    cancel: "Cancel",
    dispatchSubmit: "🚀 Dispatch to Volunteer",
    metricPilgrims: "Total Warkaris",
    metricWater: "Water Stock",
    metricVolunteers: "Live Volunteers",
    metricTasks: "Active Tasks",
    metricAlerts: "Active Alerts",
    metricMedical: "Medical Capacity",
    liveDindisBadge: "Live Dindis",
    liveGpsReady: "Live GPS Ready",
    campsSupplied: "Camps 1–6 Supplied",
    campsStaffed: "6 Camps Staffed",
    verifiedBadge: "Verified",
    criticalBadge: "CRITICAL",
    normalFlow: "Normal Flow",
    traumaReady: "Trauma Hubs Ready",
    available: "AVAILABLE",
  },
  hi: {
    title: "|| पंढरी की राह, विठ्ठल से मिलने की राह ||",
    subtitle: "लाइव कार्यप्रणाली · केंद्रीय कमान व प्रशासनिक निगरानी · वास्तविक डेटा",
    deleteReset: "लाइव डेटा रीसेट करें",
    liveOps: "लाइव संचालन",
    map: "लाइव पालखी मार्ग मानचित्र",
    quick: "प्रत्यक्ष कमान प्रेषण",
    timeline: "वारी संचालन टाइमलाइन",
    alerts: "महत्वपूर्ण सूचनाएं एवं अलर्ट",
    copilot: "WariOS AI सहायक (ध्वनि और RAG)",
    fullMap: "पूरा मानचित्र देखें",
    ask: "हिंदी, मराठी या अंग्रेजी में पूछें...",
    routeDesc: "पुणे (आळंदी) → पंढरपुर (240 किमी) · वास्तविक ओपनस्ट्रीटमैप मार्ग, शिविर और पंजीकृत दिंडियां",
    volunteerMatrixTitle: "शिविर 1 से 6 स्वयंसेवक एवं संसाधन प्रेषण मैट्रिक्स",
    volunteerMatrixSubtitle: "पानी का टैंकर, चिकित्सा दल, भीड़ नियंत्रण कार्य विशिष्ट शिविर स्वयंसेवकों को सौंपें। स्थिति स्वचालित रूप से सिंक होती है।",
    verifiedCampsBadge: "6 सत्यापित शिविर",
    assignedVolunteer: "तैनात शिविर स्वयंसेवक:",
    pendingVerification: "सत्यापन लंबित",
    noPendingTasks: "✓ कोई लंबित कार्य नहीं -",
    dispatchTaskBtn: "कार्य सौंपें - शिविर",
    volunteer: "स्वयंसेवक",
    capacity: "क्षमता",
    water: "पानी",
    searchDindi: "🔍 दिंडी / कोड खोजें",
    searchPlaceholder: "उदा. DND-1234, सोपान महाराज, मंडल...",
    selectDindi: "लाइव संदर्भ हेतु दिंडी चुनें",
    noDindiOption: "अभी तक कोई दिंडी पंजीकृत नहीं",
    awaitingDindi: "लाइव दिंडी पंजीकरण की प्रतीक्षा",
    registerDindiPrompt: "GPS प्रसारित करने के लिए /dindi पर पंजीकरण करें।",
    closestCamp: "निकटतम शिविर (1-6)",
    nearestHospital: "निकटतम अस्पताल",
    waterLogistics: "जल आपूर्ति",
    campVolunteer: "शिविर स्वयंसेवक",
    kmAway: "किमी दूर",
    volunteerFeedTitle: "स्वयंसेवक लाइव कार्य सिंक",
    totalBadge: "कुल",
    remarksLabel: "स्वयंसेवक टिप्पणी:",
    dismiss: "हटाएं",
    noTasksRunning: "वर्तमान में कोई कार्य नहीं चल रहा। टैंकर या राहत दल तैनात करने के लिए ऊपर 'कार्य सौंपें' पर क्लिक करें।",
    copilotDesc: "रिंगण तिथियां, 2026 पालखी पड़ाव, भीड़ या नजदीकी सुविधाओं के बारे में हिंदी, मराठी या अंग्रेजी में पूछें।",
    openFull: "पूरा खोलें →",
    stopVoice: "आवाज रोकें",
    replayVoice: "आवाज दोबारा सुनें",
    voiceInputLabel: "आवाज इनपुट:",
    queryBtn: "पूछें",
    chips: ["2026 रिंगण शेड्यूल?", "निकटतम शिविर व टैंकर?", "लाइव दिंडी स्थिति?"],
    dispatchModalTitle: "कार्य सौंपें -",
    dispatchModalDesc: "यह कार्य सत्यापन हेतु तैनात स्वयंसेवक के डैशबोर्ड पर तुरंत दिखाई देगा।",
    taskTypeLabel: "कार्य / संसाधन प्रकार",
    taskTitleLabel: "कार्य शीर्षक / विवरण",
    etaLabel: "पहुंचने का अनुमानित समय (मिनट)",
    assignedContactLabel: "तैनात शिविर संपर्क",
    notesLabel: "विशेष निर्देश / प्रेषण नोट",
    notesPlaceholder: "उदा. टैंकर T-03 चालक संजय शिंदे (982214401)। पानी का स्तर जांचें और रिपोर्ट करें।",
    cancel: "रद्द करें",
    dispatchSubmit: "🚀 स्वयंसेवक को भेजें",
    metricPilgrims: "कुल वारकरी",
    metricWater: "जल भंडार",
    metricVolunteers: "सक्रिय स्वयंसेवक",
    metricTasks: "सक्रिय कार्य",
    metricAlerts: "सक्रिय अलर्ट",
    metricMedical: "चिकित्सा क्षमता",
    liveDindisBadge: "लाइव दिंडी",
    liveGpsReady: "लाइव GPS सक्रिय",
    campsSupplied: "शिविर 1 से 6 जल आपूर्ति",
    campsStaffed: "6 शिविरों में स्वयंसेवक",
    verifiedBadge: "सत्यापित",
    criticalBadge: "गंभीर",
    normalFlow: "सामान्य प्रवाह",
    traumaReady: "आईसीयू तैयार",
    available: "उपलब्ध",
  },
  mr: {
    title: "|| पंढरीची वाट, विठ्ठलाच्या भेटीची वाट ||",
    subtitle: "थेट कार्यप्रणाली · मध्यवर्ती नियंत्रण कक्ष व प्रशासकीय देखरेख · प्रत्यक्ष डेटा",
    deleteReset: "थेट डेटा रीसेट करा",
    liveOps: "थेट कार्यचालन",
    map: "थेट पालखी मार्ग नकाशा",
    quick: "थेट कमांड प्रेषण",
    timeline: "वारी कार्यचालन टाइमलाइन",
    alerts: "महत्त्वाच्या सूचना व इशारे",
    copilot: "WariOS AI सहाय्यक (आवाज व RAG)",
    fullMap: "पूर्ण नकाशा पाहा",
    ask: "मराठी, हिंदी किंवा इंग्रजीत विचारा...",
    routeDesc: "पुणे (आळंदी) → पंढरपूर (२४० किमी) · थेट ओपनस्ट्रीटनकाशा मार्ग, तळ आणि नोंदणीकृत दिंड्या",
    volunteerMatrixTitle: "तळ १ ते ६ स्वयंसेवक आणि संसाधन नियुक्ती मॅट्रिक्स",
    volunteerMatrixSubtitle: "पाण्याचा टँकर, वैद्यकीय पथक, गर्दी नियंत्रण कार्ये विशिष्ट तळ स्वयंसेवकांना नियुक्त करा. स्थिती स्वयंचलितपणे सिंक होते.",
    verifiedCampsBadge: "६ अधिकृत तळ",
    assignedVolunteer: "नियुक्त तळ स्वयंसेवक:",
    pendingVerification: "सत्यापन प्रलंबित",
    noPendingTasks: "✓ कोणतीही प्रलंबित कार्ये नाहीत -",
    dispatchTaskBtn: "कार्य नियुक्त करा - तळ",
    volunteer: "स्वयंसेवक",
    capacity: "क्षमता",
    water: "पाणी",
    searchDindi: "🔍 दिंडी / कोड शोधा",
    searchPlaceholder: "उदा. DND-1234, सोपान महाराज, मंडळ...",
    selectDindi: "थेट माहितीसाठी दिंडी निवडा",
    noDindiOption: "अद्याप कोणतीही दिंडी नोंदणीकृत नाही",
    awaitingDindi: "थेट दिंडी नोंदणीची प्रतीक्षा",
    registerDindiPrompt: "GPS प्रसारीत करण्यासाठी /dindi वर नोंदणी करा.",
    closestCamp: "जवळचा तळ (१-६)",
    nearestHospital: "जवळचे रुग्णालय",
    waterLogistics: "पाणी पुरवठा",
    campVolunteer: "तळ स्वयंसेवक",
    kmAway: "किमी अंतरावर",
    volunteerFeedTitle: "स्वयंसेवक थेट कार्य सिंक",
    totalBadge: "एकूण",
    remarksLabel: "स्वयंसेवक शेरा:",
    dismiss: "बंद करा",
    noTasksRunning: "सध्या कोणतीही प्रेषण कार्ये चालू नाहीत. टँकर किंवा मदत पथक पाठवण्यासाठी वरील 'कार्य नियुक्त करा' बटणावर क्लिक करा.",
    copilotDesc: "रिंगण तारखा, २०२६ पालखी मुक्काम, गर्दी किंवा जवळच्या सुविधांबद्दल मराठी, हिंदी किंवा इंग्रजीत विचारा.",
    openFull: "पूर्ण उघडा →",
    stopVoice: "आवाज थांबवा",
    replayVoice: "आवाज पुन्हा ऐका",
    voiceInputLabel: "आवाज इनपुट:",
    queryBtn: "विचारा",
    chips: ["२०२६ रिंगण वेळापत्रक?", "जवळचा तळ व टँकर?", "थेट दिंडी स्थिती?"],
    dispatchModalTitle: "कार्य नियुक्त करा -",
    dispatchModalDesc: "हे कार्य पडताळणीसाठी नियुक्त केलेल्या स्वयंसेवकाच्या डॅशबोर्डवर तत्काळ दिसेल.",
    taskTypeLabel: "कार्य / संसाधन प्रकार",
    taskTitleLabel: "कार्याचे शीर्षक / तपशील",
    etaLabel: "अंदाजे पोहोचण्याची वेळ (मिनिटे)",
    assignedContactLabel: "नियुक्त तळ संपर्क",
    notesLabel: "विशेष सूचना / प्रेषण टीप",
    notesPlaceholder: "उदा. टँकर T-03 चालक संजय शिंदे (982214401). पाणी साठा तपासा आणि कळवा.",
    cancel: "रद्द करा",
    dispatchSubmit: "🚀 स्वयंसेवकाकडे पाठवा",
    metricPilgrims: "एकूण वारकरी",
    metricWater: "पाणी साठा",
    metricVolunteers: "सक्रिय स्वयंसेवक",
    metricTasks: "सक्रिय कार्ये",
    metricAlerts: "सक्रिय इशारे",
    metricMedical: "वैद्यकीय क्षमता",
    liveDindisBadge: "थेट दिंड्या",
    liveGpsReady: "थेट GPS सज्ज",
    campsSupplied: "तळ १ ते ६ पाणीपुरवठा",
    campsStaffed: "६ तळांवर स्वयंसेवक सज्ज",
    verifiedBadge: "सत्यापित",
    criticalBadge: "गंभीर",
    normalFlow: "सुरळीत प्रवाह",
    traumaReady: "आयसीयू सज्ज",
    available: "उपलब्ध",
  },
};

export default function CommandCentre() {
  const {
    state,
    requestLeaderAssistance,
    assignCommandTask,
    deleteVolunteerTask,
    resetAll,
    staggerDindiRoutes,
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
  const syncPlan = computeDindiSyncPlan(state.dindis, state.camps);

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
    const isMarathi = /[\u0900-\u097F]/.test(q) && /आहे|कुठे|जवळ|वेळापत्रक|तळ|रिंगण|रुग्णालय|टँकर|पाणी|वारकरी|जेवण|शौचालय|संडास/.test(q) || /\b(aahe|ahe|kuthe|javal|velapatrak|ringan|jevan|sandas|sandaas)\b/.test(lowerQ);
    const isHindi = /[\u0900-\u097F]/.test(q) && /है|कहाँ|नजदीक|पानी|टैंकर|अस्पताल|शेड्यूल|शिविर|शौचालय|भोजन|खाना/.test(q) || /\b(kahan|kaha|hai|sabse|nazdik|paani|bhojan|khana|aspataal)\b/.test(lowerQ);
    const targetLang = isMarathi ? "mr" : isHindi ? "hi" : "en";

    // 1. Toilet / Sanitation
    if (/toilet|toliet|washroom|restroom|sanitation|bathroom|sandaas|sandas|shauchalay|शौचालय|प्रसाधनगृह|संडास|स्वच्छता/.test(lowerQ)) {
      const nearestCrew = state.sanitationCrews[0];
      response = targetLang === "mr"
        ? `जवळची स्वच्छतागृहे: ${nearestCrew?.name ?? "पुणे महापालिका बायो-टॉयलेट पथक १"} (${nearestCrew?.mobilePodsCount ?? 24} मोबाईल पॉड्स) ${nearestCrew?.zone ?? "पुणे झोन"} येथे उपलब्ध आहे. सर्व ८ तळांवर २४ तास स्वतंत्र स्वच्छतागृहे कार्यरत आहेत.`
        : targetLang === "hi"
        ? `नजदीकी शौचालय सुविधा: ${nearestCrew?.name ?? "पुणे बायो-टॉयलेट स्क्वॉड 1"} (${nearestCrew?.mobilePodsCount ?? 24} मोबाइल पॉड्स) ${nearestCrew?.zone ?? "पुणे जोन"} पर 24/7 चालू हैं।`
        : `Nearest Sanitation Facility: ${nearestCrew?.name ?? "Pune Municipal Bio-Toilet Squad 1"} with ${nearestCrew?.mobilePodsCount ?? 24} mobile bio-toilet pods deployed at ${nearestCrew?.zone ?? "Pune Zone"}. Separate 24/7 facilities active across all 8 camps.`;
    }
    // 2. Food / Prasad / Meals (Camp specific)
    else if (/food|prasad|prasadam|meal|meals|anna|annadan|jevan|bhojan|khana|भोजन|जेवण|प्रसाद|अन्नदान|kitchen/.test(lowerQ)) {
      const isCamp5 = /camp\s*5|saswad|सासवड|तळ\s*५|तळ\s*5|शिविर\s*5/.test(lowerQ);
      const isCamp2 = /camp\s*2|hadapsar|हडपसर|तळ\s*२|तळ\s*2|शिविर\s*2/.test(lowerQ);
      const isCamp1 = /camp\s*1|pune|पुणे|तळ\s*१|तळ\s*1|शिविर\s*1/.test(lowerQ);

      const campName = isCamp5 ? "Camp 5 (Saswad Palkhi Maidan)" : isCamp2 ? "Camp 2 (Hadapsar Transit Yard)" : isCamp1 ? "Camp 1 (Pune Racecourse)" : "Camp 5 (Saswad)";
      const meals = isCamp5 ? "45,000" : isCamp2 ? "30,000" : "50,000";

      response = targetLang === "mr"
        ? `${campName} अन्नदान व महाप्रसाद केंद्र: अखंड महाप्रसाद रसोई सज्ज (${meals} जेवणांची क्षमता). गरम खिचडी, भाकरी, पिठलं आणि पिण्याचे पाणी २४ तास उपलब्ध आहे.`
        : targetLang === "hi"
        ? `${campName} भोजन एवं महाप्रसाद केंद्र: केंद्रीय रसोई (${meals} भोजन क्षमता) पर गरमा-गरम महाप्रसाद और शुद्ध पेयजल 24 घंटे उपलब्ध है।`
        : `Food & Maha-Prasad Logistics for ${campName}: Central Annadan Kitchen (${meals} meals prep capacity) operational with hot fresh Khichdi, Bhakri, and potable water around the clock.`;
    }
    // 3. Hospital / Medical
    else if (/hospital|medical|doctor|ambulance|रुग्णालय|दवाखाना|अस्पताल|इलाज|डॉक्टर|emergency|icu/.test(lowerQ)) {
      response = targetLang === "mr"
        ? "पालखी मार्गावरील आणीबाणी रुग्णालये: १. दीनानाथ मंगेशकर रुग्णालय (इरंडवणे - ०२०-४०१५१०००), २. ससून सर्वोपचार रुग्णालय (पुणे स्टेशन - ०२०-२६१२८०००), ३. सासवड उप-जिल्हा रुग्णालय. तातडीच्या मदतीसाठी १०८ रुग्णवाहिका सज्ज आहे."
        : targetLang === "hi"
        ? "कॉरिडोर के आपातकालीन अस्पताल: 1. दीनानाथ मंगेशकर अस्पताल (020-40151000), 2. ससून जनरल अस्पताल (020-26128000), 3. सासवड उप-जिला अस्पताल। आपातकालीन 108 एम्बुलेंस सेवा उपलब्ध है।"
        : "Emergency Hospitals along Corridor: 1. Deenanath Mangeshkar Hospital (Erandwane - 020-40151000), 2. Sassoon General Hospital (Station Road - 020-26128000), 3. Saswad Sub-District Hospital. Dial 108 for immediate 24/7 ambulance dispatch.";
    }
    // 4. Schedule & Ringan
    else if (lowerQ.includes("schedule") || lowerQ.includes("वेळापत्रक") || lowerQ.includes("शेड्यूल") || lowerQ.includes("ringan") || lowerQ.includes("रिंगण")) {
      response =
        targetLang === "mr"
          ? "अधिकृत २०२६ पालखी वेळापत्रक: पहिले उभे रिंगण काटेवाडी येथे १८ जुलै रोजी आहे, दुसरे रिंगण अकलूज येथे २१ जुलै रोजी आहे आणि शेवटचे बाजीराव विहीर येथे २४ जुलै रोजी आहे. आषाढी एकादशी २६ जुलै रोजी पंढरपुरात आहे."
          : targetLang === "hi"
          ? "2026 पालखी रिंगण का शेड्यूल: पहला रिंगण काटेवाडी में 18 जुलाई, दूसरा अकलूज में 21 जुलाई, और बाजीराव विहीर में 24 जुलाई को होगा। आषाढ़ी एकादशी 26 जुलाई को है।"
          : "Official 2026 Palkhi Ringan Schedule: First Ringan at Katewadi on 18 July, Second Ringan at Akluj on 21 July, Bajirao Vihir on 24 July. Ashadhi Ekadashi is on 26 July 2026 at Pandharpur.";
    }
    // 5. Water Tanker
    else if (lowerQ.includes("water") || lowerQ.includes("tanker") || lowerQ.includes("पाणी") || lowerQ.includes("टँकर")) {
      const nearestTanker = state.tankers.find((t) => t.status === "AVAILABLE") || state.tankers[0];
      response = targetLang === "mr"
        ? `उपलब्ध पाण्याचे टँकर: ${state.tankers.length} टँकर तैनात. जवळचा टँकर ${nearestTanker?.id ?? "LIVE-WATER-PUNE-01"} (${nearestTanker?.capacityLiters.toLocaleString()}L) ${nearestTanker?.currentHub ?? "पुणे हब"} येथे उपलब्ध आहे.`
        : targetLang === "hi"
        ? `जल आपूर्ति स्थिति: ${state.tankers.length} टैंकर सक्रिय। नजदीकी टैंकर ${nearestTanker?.id ?? "LIVE-WATER-PUNE-01"} (${nearestTanker?.capacityLiters.toLocaleString()}L) ${nearestTanker?.currentHub ?? "पुणे हब"} पर तैनात है।`
        : `Corridor Water Fleet: ${state.tankers.length} water tankers active. Nearest available tanker is ${nearestTanker?.id ?? "LIVE-WATER-PUNE-01"} (${nearestTanker?.capacityLiters.toLocaleString()}L) stationed at ${nearestTanker?.currentHub ?? "Pune Bhavani Peth Hub"}.`;
    }
    // 6. Camps & Safe Capacity
    else if (lowerQ.includes("camp") || lowerQ.includes("तळ") || lowerQ.includes("शिविर") || lowerQ.includes("capacity") || lowerQ.includes("क्षमता")) {
      response = targetLang === "mr"
        ? "पालखी मार्ग तळ १ ते ८ क्षमता: तळ १ पुणे (४०,०००), तळ २ हडपसर (३०,०००), तळ ३ वाडकी (२५,०००), तळ ४ झाडाचे मठ (२०,०००), तळ ५ सासवड (४५,०००), तळ ६ जेजुरी (५०,०००), तळ ७ लोणंद (३५,०००), तळ ८ फलटण (६०,०००). एकूण सुरक्षित क्षमता: ३,०५,००० भाविक."
        : targetLang === "hi"
        ? "शिविर 1 से 8 सुरक्षित क्षमता: शिविर 1 पुणे (40,000), शिविर 2 हड़पसर (30,000), शिविर 3 वाडकी (25,000), शिविर 4 मठ (20,000), शिविर 5 सासवड (45,000), शिविर 6 जेजुरी (50,000), शिविर 7 लोणंद (35,000), शिविर 8 फलटण (60,000)। कुल क्षमता: 305,000।"
        : "Camps 1–8 Safe Capacities: Camp 1 Pune (40k), Camp 2 Hadapsar (30k), Camp 3 Wadki (25k), Camp 4 Zadache Math (20k), Camp 5 Saswad (45k), Camp 6 Jejuri (50k), Camp 7 Lonand (35k), Camp 8 Phaltan (60k). Total safe corridor buffer: 305,000 devotees.";
    } else {
      response = targetLang === "mr"
        ? `कमांड सेंटर थेट स्थिती: ${liveDindis.length} नोंदणीकृत दिंड्या, ${state.camps.length} अधिकृत तळ कार्यरत, आणि ${state.tankers.length} पाण्याचे टँकर सज्ज आहेत.`
        : targetLang === "hi"
        ? `कमांड सेंटर लाइव स्थिति: ${liveDindis.length} पंजीकृत दिंडियां, ${state.camps.length} शिविर और ${state.tankers.length} पानी के टैंकर सक्रिय हैं।`
        : `Command Status: ${liveDindis.length} live Dindis registered, ${state.camps.length} corridor camps operational, and ${state.tankers.length} water tankers available with 0 active bottlenecks.`;
    }

    setAiResponse(response);
    speak(response, targetLang);
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
      label: c.metricPilgrims,
      value: `${Math.max(state.totalPilgrims, topCluster?.totalPilgrims ?? 0).toLocaleString()}`,
      delta: liveDindis.length > 0 ? `${liveDindis.length} ${c.liveDindisBadge}` : c.liveGpsReady,
      icon: Users,
      tone: "text-orange-700",
    },
    {
      label: c.metricWater,
      value: `${availableTankers} ${language === "mr" ? "टँकर" : language === "hi" ? "टैंकर" : "Tankers"}`,
      delta: c.campsSupplied,
      icon: Droplets,
      tone: "text-blue-600",
    },
    {
      label: c.metricVolunteers,
      value: `${state.volunteers.length}`,
      delta: c.campsStaffed,
      icon: Users,
      tone: "text-purple-700",
    },
    {
      label: c.metricTasks,
      value: `${state.volunteerTasks.filter((t) => t.status !== "VERIFIED").length}`,
      delta: `${state.volunteerTasks.filter((t) => t.status === "VERIFIED").length} ${c.verifiedBadge}`,
      icon: CheckCircle2,
      tone: "text-emerald-700",
    },
    {
      label: c.metricAlerts,
      value: `${activeAlerts.length}`,
      delta: criticalAlerts.length > 0 ? `${criticalAlerts.length} ${c.criticalBadge}` : c.normalFlow,
      icon: AlertTriangle,
      tone: criticalAlerts.length > 0 ? "text-red-600" : "text-amber-600",
    },
    {
      label: c.metricMedical,
      value: `${medicalCapacity}%`,
      delta: c.traumaReady,
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
                {state.isSimulating ? "🧪 Demo Archive" : "🟢 Live Real Mode"} · {c.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <button
                onClick={() => {
                  if (confirm(language === "mr" ? "तुम्हाला नक्की सर्व थेट डेटा रीसेट करायचा आहे का?" : language === "hi" ? "क्या आप वाकई लाइव डेटा रीसेट करना चाहते हैं?" : "Are you sure you want to delete current live data and reset to fresh state?")) {
                    resetAll();
                  }
                }}
                className="rounded-2xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 font-bold px-3 py-2 text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {c.deleteReset}
              </button>

              <div className="rounded-2xl bg-white/85 border border-orange-100 px-4 py-2 flex items-center gap-2 shadow-sm">
                <Clock className="w-4 h-4 text-wari-textPrimary" />
                <div>
                  <div className="font-black text-sm">{state.currentClock}</div>
                  <div className="text-[10px] text-wari-textMuted">{c.liveOps}</div>
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
              {c.volunteerMatrixTitle}
            </h2>
            <p className="text-xs text-wari-textMuted">
              {c.volunteerMatrixSubtitle}
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-orange-100 text-orange-800 px-3 py-1 rounded-full self-start sm:self-auto">
            {c.verifiedCampsBadge}
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
                      {language === "mr" ? `तळ ${idx + 1}` : language === "hi" ? `शिविर ${idx + 1}` : `Camp ${idx + 1}`}
                    </span>
                    <h3 className="font-bold text-wari-textPrimary text-sm mt-1">{camp.name}</h3>
                    <div className="text-[11px] text-wari-textMuted">
                      {c.capacity}: {camp.capacity.toLocaleString()} • {c.water}: {camp.waterStockPercent}%
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    camp.status === "CRITICAL" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {camp.status === "CRITICAL" ? (language === "mr" ? "गंभीर" : language === "hi" ? "गंभीर" : "CRITICAL") : (language === "mr" ? "सामान्य" : language === "hi" ? "सामान्य" : "NORMAL")}
                  </span>
                </div>

                {/* Assigned Volunteer */}
                <div className="p-2.5 rounded-xl bg-white border border-orange-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-wari-textMuted block">{c.assignedVolunteer}</span>
                    <strong className="text-purple-950 font-bold">{assignedVol?.name ?? "Designated Volunteer"}</strong>
                    <div className="text-[10px] text-purple-700 font-mono">{assignedVol?.phone || "+91 90000 10001"}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                    {assignedVol?.status === "AVAILABLE" ? c.available : assignedVol?.status ?? "AVAILABLE"}
                  </span>
                </div>

                {/* Active Tasks on this camp */}
                {pendingTasks.length > 0 ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-orange-900 block">{c.pendingVerification} ({pendingTasks.length}):</span>
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
                  <div className="text-[11px] text-emerald-700 font-medium">{c.noPendingTasks} {language === "mr" ? `तळ ${idx + 1}` : language === "hi" ? `शिविर ${idx + 1}` : `Camp ${idx + 1}`}</div>
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
                  {c.dispatchTaskBtn} {idx + 1} {c.volunteer}
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
                    {c.dispatchModalTitle} {state.camps.find((c) => c.id === dispatchModalCampId)?.name}
                  </h3>
                  <p className="text-xs text-wari-textMuted">
                    {c.dispatchModalDesc}
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
                <label className="text-xs font-bold text-wari-textSecond block mb-1">{c.taskTypeLabel}</label>
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
                <label className="text-xs font-bold text-wari-textSecond block mb-1">{c.taskTitleLabel}</label>
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
                  <label className="text-xs font-bold text-wari-textSecond block mb-1">{c.etaLabel}</label>
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
                  <label className="text-xs font-bold text-wari-textSecond block mb-1">{c.assignedContactLabel}</label>
                  <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900 truncate">
                    {state.volunteers.find((v) => v.assignedCampId === dispatchModalCampId)?.name || "Camp Volunteer"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-wari-textSecond block mb-1">{c.notesLabel}</label>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder={c.notesPlaceholder}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400 min-h-16"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalCampId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  {c.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow transition-all"
                >
                  {c.dispatchSubmit}
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
                  {c.searchDindi}
                </label>
                <input
                  value={dindiSearch}
                  onChange={(event) => setDindiSearch(event.target.value)}
                  placeholder={c.searchPlaceholder}
                  className="mt-1 w-full rounded-xl border border-wari-cardBorder bg-white px-3 py-2 text-xs font-medium outline-none focus:border-wari-orange"
                />
              </div>
              <div className="lg:col-span-4">
                <label className="text-[11px] uppercase font-black text-wari-textMuted tracking-wider">
                  {c.selectDindi}
                </label>
                <select
                  value={selectedDindi?.id ?? ""}
                  onChange={(event) => setSelectedDindiId(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-wari-cardBorder bg-white px-3 py-2 text-xs font-bold outline-none focus:border-wari-orange"
                >
                  {filteredDindis.length === 0 && <option value="">{c.noDindiOption}</option>}
                  {filteredDindis.map((dindi) => (
                    <option key={dindi.id} value={dindi.id}>
                      {dindi.name} · {dindi.passcode} · {dindi.pilgrimCount.toLocaleString()} {language === "mr" ? "भाविक" : language === "hi" ? "श्रद्धालु" : "people"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-4 rounded-2xl bg-orange-50 border border-orange-200 p-2.5 text-xs">
                <div className="font-bold text-orange-950 truncate">
                  {selectedDindi ? `${selectedDindi.name} (${selectedDindi.passcode})` : c.awaitingDindi}
                </div>
                <div className="text-[11px] text-orange-800 mt-0.5">
                  {selectedDindi
                    ? `GPS: ${selectedDindi.lat.toFixed(4)}°N, ${selectedDindi.lng.toFixed(4)}°E · ~${selectedDindi.pilgrimCount.toLocaleString()} ${language === "mr" ? "भाविक" : language === "hi" ? "श्रद्धालु" : "devotees"}`
                    : c.registerDindiPrompt}
                </div>
              </div>
            </div>

            {/* Dynamic Facility Breakdown for Selected Dindi */}
            {selectedFacilities && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
                <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-2.5">
                  <span className="text-[10px] text-purple-700 font-bold block">{c.closestCamp}</span>
                  <strong className="text-purple-950 font-bold block truncate">{selectedFacilities.camp?.item.name ?? "Calculating..."}</strong>
                  <span className="text-purple-700 font-bold text-[11px]">{selectedFacilities.camp?.distanceKm ?? 0} {c.kmAway}</span>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-2.5">
                  <span className="text-[10px] text-red-700 font-bold block">{c.nearestHospital}</span>
                  <strong className="text-red-950 font-bold block truncate">{selectedFacilities.medical?.item.name ?? "Deenanath / Sassoon"}</strong>
                  <span className="text-red-700 font-bold text-[11px]">{selectedFacilities.medical?.distanceKm ?? 0} {c.kmAway}</span>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2.5">
                  <span className="text-[10px] text-blue-700 font-bold block">{c.waterLogistics}</span>
                  <strong className="text-blue-950 font-bold block truncate">{selectedFacilities.tanker?.item.id ?? "T-03 Tanker"}</strong>
                  <span className="text-blue-700 font-bold text-[11px]">{selectedFacilities.tanker?.distanceKm ?? 0} {c.kmAway}</span>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5">
                  <span className="text-[10px] text-emerald-700 font-bold block">{c.campVolunteer}</span>
                  <strong className="text-emerald-950 font-bold block truncate">{selectedFacilities.volunteer?.item.name ?? "Aarav Patil"}</strong>
                  <span className="text-emerald-700 font-bold text-[11px]">{selectedFacilities.volunteer?.distanceKm ?? 0} {c.kmAway}</span>
                </div>
              </div>
            )}
          </div>

          {/* DINDI SYNCHRONIZATION & DYNAMIC ROUTE STAGGERING DISPATCH BANNER */}
          {syncPlan && (
            <div className="rounded-3xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 via-indigo-50 to-white p-5 shadow-card space-y-3 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-purple-200/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <h3 className="font-extrabold text-sm text-purple-950">
                      {language === "mr"
                        ? "दिंडी सिंक्रोनायझेशन आणि डायनॅमिक हॉल्ट प्लॅनिंग"
                        : language === "hi"
                        ? "दिंडी सिंक्रोनाइज़ेशन और डायनेमिक रूट स्टैगरिंग"
                        : "Dindi Synchronization & Dynamic Route Staggering"}
                    </h3>
                    <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full uppercase">
                      Logistics Optimization
                    </span>
                  </div>
                  <p className="text-xs text-purple-900 mt-0.5">
                    {language === "mr"
                      ? `${syncPlan.targetCamp.name} येथे एकाच वेळी गर्दीचा धोका टाळण्यासाठी दिंडींना थेट व बायपास मार्गावर विभागून +${syncPlan.staggerDeltaMinutes} मिनिटांचे आगमन अंतर निश्चित करा.`
                      : language === "hi"
                      ? `${syncPlan.targetCamp.name} पर एक साथ भीड़ का टकराव रोकने के लिए दिंडियों को सीधे व बाईपास मार्ग पर विभाजित कर +${syncPlan.staggerDeltaMinutes} मिनट का अंतराल बनाएं।`
                      : `Prevent simultaneous collision at ${syncPlan.targetCamp.name} by splitting Dindis into Shortest & Bypass Corridors (+${syncPlan.staggerDeltaMinutes}m stagger gap).`}
                  </p>
                </div>

                <button
                  onClick={() => staggerDindiRoutes(syncPlan.targetCamp.id)}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0 self-start sm:self-auto"
                >
                  <span>⚡</span>
                  <span>
                    {language === "mr"
                      ? "स्टॅगर्ड मार्ग प्रेषित करा"
                      : language === "hi"
                      ? "स्टैगर्ड रूट लागू करें"
                      : "Apply Staggered Routes"}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-950 text-[11px]">
                    <span>{syncPlan.dindiShortRoute.dindi.name} (Shortest Route)</span>
                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">Batch 1 · {syncPlan.dindiShortRoute.arrivalWindow}</span>
                  </div>
                  <p className="text-[10px] text-emerald-800">
                    Route: {syncPlan.dindiShortRoute.routeName} ({syncPlan.dindiShortRoute.distanceKm} km, {syncPlan.dindiShortRoute.paceKmH} km/h).
                  </p>
                </div>

                <div className="p-3 bg-white/90 rounded-xl border border-purple-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-950 text-[11px]">
                    <span>{syncPlan.dindiLongRoute.dindi.name} (Scenic Bypass)</span>
                    <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono">Batch 2 · {syncPlan.dindiLongRoute.arrivalWindow}</span>
                  </div>
                  <p className="text-[10px] text-purple-800">
                    Route: {syncPlan.dindiLongRoute.routeName} ({syncPlan.dindiLongRoute.distanceKm} km, {syncPlan.dindiLongRoute.paceKmH} km/h).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* LIVE TACTICAL ROUTE MAP */}
          <div className="rounded-3xl bg-white/90 border border-orange-100 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-wari-textPrimary flex items-center gap-2">
                  {c.map} <span className="badge-live">LIVE</span>
                </h2>
                <p className="text-xs text-wari-textMuted">
                  {c.routeDesc}
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
                {c.volunteerFeedTitle}
              </h2>
              <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                {state.volunteerTasks.length} {c.totalBadge}
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
                      💬 {c.remarksLabel} {task.remarks}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-[10px] text-gray-400">
                    <span>{task.createdAt}</span>
                    <button
                      onClick={() => deleteVolunteerTask(task.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      {c.dismiss}
                    </button>
                  </div>
                </div>
              ))}

              {state.volunteerTasks.length === 0 && (
                <div className="text-xs text-wari-textMuted rounded-2xl bg-wari-pageBg border border-wari-cardBorder p-4 text-center">
                  {c.noTasksRunning}
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
                {c.openFull}
              </Link>
            </div>

            <p className="text-[11px] text-wari-textMuted">
              {c.copilotDesc}
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
                      <Volume2 className="w-3 h-3 animate-pulse" /> {c.stopVoice}
                    </button>
                  ) : (
                    <button
                      onClick={() => speak(aiResponse, language)}
                      className="text-[10px] text-orange-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Volume2 className="w-3 h-3" /> {c.replayVoice}
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
                  <span>{c.voiceInputLabel} "{transcript}"</span>
                  <button
                    onClick={() => handleAskCopilot(transcript)}
                    className="text-orange-700 font-bold hover:underline"
                  >
                    {c.queryBtn}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {c.chips.map((chip) => (
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
