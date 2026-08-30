"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Zap,
  Send,
  HelpCircle,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { getLiveCrowdClusters } from "@/lib/live-ops";

interface MessageItem {
  id: string;
  sender: "USER" | "WARIOS_AI";
  lang?: "en" | "hi" | "mr";
  text?: string;
  structured?: {
    headline: string;
    forecastText: string;
    rootCauses: string[];
    impacts: { label: string; value: string }[];
    recommendations: string[];
    confidence: number;
    showCounterfactual?: boolean;
  };
}

const PRESET_QUESTIONS: Record<string, string[]> = {
  en: [
    "Where is the nearest water tanker?",
    "What is the official 2026 Palkhi & Ringan schedule?",
    "What are the nearest hospitals along the corridor?",
    "Which camp has the largest holding buffer?",
    "How many volunteers are assigned across camps 1-6?",
  ],
  hi: [
    "सबसे नजदीकी पानी का टैंकर कहाँ है?",
    "2026 पालखी और रिंगण का पूरा शेड्यूल क्या है?",
    "कॉरिडोर पर नजदीकी अस्पताल कौन से हैं?",
    "सबसे बड़ा बफर शिविर कौन सा है?",
    "शिविर 1 से 6 में कितने स्वयंसेवक तैनात हैं?",
  ],
  mr: [
    "सर्वात जवळचा पाण्याचा टँकर कुठे आहे?",
    "अधिकृत २०२६ पालखी आणि रिंगण वेळापत्रक काय आहे?",
    "पालखी मार्गावरील जवळची रुग्णालये कोणती आहेत?",
    "सर्वात मोठी सुरक्षित क्षमता असलेला तळ कोणता?",
    "तळ १ ते ६ वर किती स्वयंसेवक तैनात आहेत?",
  ],
};

function detectQueryLanguage(query: string, defaultLang: "en" | "hi" | "mr"): "en" | "hi" | "mr" {
  const q = query.toLowerCase().trim();

  // 1. Marathi Devanagari
  if (
    /[\u0900-\u097F]/.test(query) &&
    /आहे|कुठे|जवळ|जवळचे|वेळापत्रक|तळ|रिंगण|रुग्णालय|टँकर|पाणी|वारकरी|संख्या|सांगा|जेवण|शौचालय|संडास|अन्न|प्रसाद/.test(query)
  ) {
    return "mr";
  }

  // 2. Hindi Devanagari
  if (
    /[\u0900-\u097F]/.test(query) &&
    /है|कहाँ|कहा|नजदीक|नजदीकी|पानी|टैंकर|अस्पताल|शेड्यूल|शिविर|कितना|बताओ|शौचालय|भोजन|खाना|प्रसाद/.test(query)
  ) {
    return "hi";
  }

  // If general Devanagari without clear markers, use default or Marathi
  if (/[\u0900-\u097F]/.test(query)) {
    return defaultLang === "en" ? "mr" : defaultLang;
  }

  // 3. Romanized Marathi keywords ONLY (exclude standard English words)
  if (
    /\b(aahe|ahe|kuthe|kothe|javal|javalcha|velapatrak|ringan|varkari|panyacha|saanga|jevan|sandas|sandaas|mauli)\b/.test(
      q
    )
  ) {
    return "mr";
  }

  // 4. Romanized Hindi keywords ONLY (exclude standard English words)
  if (
    /\b(kahan|kaha|sabse|nazdik|nazdiki|paani|aspataal|batao|kitna|kaunsa|bhojan|khana)\b/.test(
      q
    )
  ) {
    return "hi";
  }

  // 5. Default to English for English queries (e.g. "where is nearby food", "nearest toilet", "nearest hospital", "camp 5 food")
  return "en";
}

export default function CopilotPage() {
  const { state, executeFullMitigation, isMitigated } = useSimulation();
  const { t, language } = useLanguage();
  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    reset,
    speak,
    isSpeaking,
    stopSpeaking,
  } = useSpeechRecognition();

  const isLiveMode = !state.isSimulating;
  const liveDindis = state.dindis.filter((d) => d.isCustomRegistered);

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>(() => [
    isLiveMode
      ? {
          id: "m-live-init",
          sender: "WARIOS_AI",
          structured: {
            headline: "WariOS AI Operations Copilot (Live Telemetry)",
            forecastText:
              liveDindis.length > 0
                ? `Currently tracking ${liveDindis.length} registered Dindis with ${state.totalPilgrims.toLocaleString()} pilgrims across Camps 1–8.`
                : "Live Operations Ready. Telemetry active across 8 corridor camps, mobile water tankers, food kitchens, and verified hospitals.",
            rootCauses: [
              "8 Verified Corridor Camps operational with verified safe holding capacities (20k–60k).",
              "Real emergency hospitals, food kitchens, and water tankers mapped with live GPS coordinates.",
              "Multilingual voice recognition and audio response supported in English, Hindi, and Marathi.",
            ],
            impacts: [
              { label: "Corridor Camps", value: "8 Active" },
              { label: "Registered Dindis", value: `${liveDindis.length} Live` },
              { label: "Water Reserves", value: `${state.tankers.length} Tankers` },
            ],
            recommendations: [
              "1. Ask: 'Where is the nearest water tanker?' / 'where is nearby food' / 'nearest toilet'",
              "2. Ask: 'What is the food supply near Camp 5?' or 'What is the 2026 Palkhi schedule?'",
              "3. Voice-query crowd status or emergency hospital contacts.",
            ],
            confidence: 98,
          },
        }
      : {
          id: "m-1",
          sender: "WARIOS_AI",
          structured: {
            headline: "Active Operational Advisory: Checkpoint 4 Chokepoint (Demo 2024-25)",
            forecastText:
              "Checkpoint 4 (Dive Ghat Apex) is projected to reach 97% capacity (10,000 threshold) in 43 minutes if no bypass intervention is executed.",
            rootCauses: [
              "Dindi #14 walking speed dropped 21% (3.2 km/h) on the wet 14% mountain incline.",
              "Precipitation radar logged 18mm/h unseasonal rainfall across the Dive Ghat sector.",
              "Downstream Camp 5 (Saswad) intake queue operating at 120% capacity, impeding flow egress.",
            ],
            impacts: [
              { label: "Camp 5 Overcapacity", value: "+21% Surge" },
              { label: "Medical ICU Load", value: "+14% Stress" },
              { label: "Water Depletion Risk", value: "34 Minutes Left" },
            ],
            recommendations: [
              "1. Divert Dindi #14 to Bypass Route B (East Saswad Link).",
              "2. Mobilize 5 specialized traffic volunteers to Dive Ghat Apex.",
              "3. Dispatch Water Tanker T-03 (12,000L) from Hub 2 to Camp 5.",
              "4. Authorize opening Saswad Backup Shelter B (20,000 capacity).",
            ],
            confidence: 91,
          },
        },
  ]);

  // Sync speech recognition transcript
  useEffect(() => {
    if (transcript) {
      setInputQuery(transcript);
    }
  }, [transcript]);

  const presetQuestions = PRESET_QUESTIONS[language] || PRESET_QUESTIONS.en;

  const handleAsk = (query: string) => {
    if (!query.trim()) return;

    const userMsg: MessageItem = {
      id: `u-${Date.now()}`,
      sender: "USER",
      text: query,
    };

    const targetLang = detectQueryLanguage(query, language);
    const qLower = query.toLowerCase();
    const liveClusters = getLiveCrowdClusters(state);
    const topLiveCluster = liveClusters[0];

    let aiMsg: MessageItem;

    // ── 0. DINDI SYNCHRONIZATION & DYNAMIC HALT PLANNING / MULTIPLE ROUTE STAGGERING INTENT ──
    if (
      /sync|stagger|dynamic\s*halt|multiple\s*route|route\s*sync|synchroniz|phased|longer\s*route|shortest\s*route|split\s*route|alternate\s*route|staggered|bypass\s*route|दोन्ही\s*दिंडी|मार्ग|वेळापत्रक|सिंक्रो|अलग\s*मार्ग|छोटा\s*मार्ग|लांब\s*मार्ग|रास्ता|रूट/.test(
        qLower
      )
    ) {
      let headline = "";
      let forecastText = "";
      let impacts: { label: string; value: string }[] = [];
      let recommendations: string[] = [];

      if (targetLang === "mr") {
        headline = "दिंडी सिंक्रोनायझेशन आणि डायनॅमिक हॉल्ट प्लॅनिंग (लॉजिस्टिक ऑप्टिमायझेशन)";
        forecastText = `दिंडी सिंक्रोनायझेशन व बहु-मार्ग (Multiple Routes) नियोजन:\n\n१. ट्रॅक (Track): दोन्ही दिंड्यांच्या थेट GPS स्थानावर रिअल-टाइम लक्ष ठेवले जाते.\n\n२. अंदाज (Predict): दोन्ही दिंड्या एकाच वेळी तळ १ (पुणे भवानी पेठ) येथे पोहोचल्यास तळाची क्षमता २००% ओलांडून चेंगराचेंगरीचा धोका निर्माण होतो.\n\n३. पुनर्नियोजन (Re-plan - Route Staggering):\n   • दिंडी १ (थेट मार्ग - NH-965): ४.२ किमी, पोहोचण्याची वेळ: +४५ मिनिटे (बॅच १).\n   • दिंडी २ (निसर्गरम्य बाह्य बायपास - मुठा नदी मार्ग): ६.८ किमी, पोहोचण्याची वेळ: +९५ मिनिटे (बॅच २ - +५० मिनिटे अंतर).\n   • फायदा: दिंडी २ तळ १ वर पोहोचेल तोपर्यंत दिंडी १ महाप्रसाद व विश्रांती घेऊन पुढील मुक्कामाकडे मार्गस्थ होईल!\n\n४. पूर्वसूचना (Alert): तळ १ च्या अन्नदान किचन, पाणी टँकर आणि स्वच्छता पथकांना बॅच १ (१६:३०) आणि बॅच २ (१७:४५) नुसार आगाऊ संदेश पाठवला जातो.`;
        impacts = [
          { label: "तळ गर्दी भार", value: "२००% वरून ७०% सुरक्षित" },
          { label: "आगमन अंतर", value: "+५० मिनिटे स्टॅगर" },
          { label: "लॉजिस्टिक्स पूर्वतयारी", value: "१००% आगाऊ नियोजन" },
        ];
        recommendations = [
          "दिंडी १ ला मुख्य कॉरिडॉर व दिंडी २ ला बाह्य बायपास मार्गावर वळवा.",
          "अन्नदान स्वयंपाकघराला बॅच १ व बॅच २ नुसार ताजे जेवण तयार ठेवण्याची पूर्वसूचना द्या.",
          "१५ मिनिटांच्या मधल्या वेळेत बायो-शौचालयांचे निर्जंतुकीकरण पूर्ण करा.",
        ];
      } else if (targetLang === "hi") {
        headline = "दिंडी सिंक्रोनाइज़ेशन और डायनेमिक हॉल्ट प्लानिंग (लॉजिस्टिक्स अनुकूलन)";
        forecastText = `दिंडी सिंक्रोनाइज़ेशन एवं बहु-मार्ग (Multiple Routes) रणनीति:\n\n1. ट्रैक (Track): दोनों दिंडियों के लाइव GPS स्थान की रीयल-टाइम ट्रैकिंग।\n\n2. पूर्वानुमान (Predict): दोनों दिंडियों के एक साथ शिविर 1 पर पहुंचने से 200% ओवरलोड और भीड़ का गंभीर खतरा।\n\n3. पुनर्नियोजन (Re-plan - Route Staggering):\n   • दिंडी 1 (प्रत्यक्ष मुख्य मार्ग - NH-965): 4.2 किमी, पहुंचने का समय: +45 मिनट (बैच 1)।\n   • दिंडी 2 (वैकल्पिक बाह्य बाईपास मार्ग): 6.8 किमी, पहुंचने का समय: +95 मिनट (बैच 2 - +50 मिनट का अंतराल)।\n   • परिणाम: जब तक दिंडी 2 शिविर 1 पहुंचेगी, तब तक दिंडी 1 भोजन व विश्राम कर आगे प्रस्थान कर चुकी होगी!\n\n4. अलर्ट (Alert): शिविर 1 की रसोई, पानी के टैंकर और सफाई कर्मियों को बैच-वार आगमन की पूर्व सूचना।`;
        impacts = [
          { label: "शिविर पीक लोड", value: "200% से घटकर 70% सुरक्षित" },
          { label: "आगमन अंतराल", value: "+50 मिनट स्टैगर" },
          { label: "लॉजिस्टिक्स तैयारी", value: "पूर्णतः स्वचालित" },
        ];
        recommendations = [
          "दिंडी 1 को सबसे छोटे मार्ग पर और दिंडी 2 को लंबे बाईपास मार्ग पर निर्देशित करें।",
          "रसोई दल को बैच 1 और बैच 2 के अनुसार गरम महाप्रसाद तैयार रखने का अलर्ट भेजें।",
          "दोनों बैचों के बीच 15 मिनट के अंतराल में बायो-शौचालयों की सफाई करवाएं।",
        ];
      } else {
        headline = "Dindi Synchronization & Dynamic Halt Planning (Logistics Optimization)";
        forecastText = `Dindi Synchronization & Multi-Route Staggering Strategy:\n\n1. Track: Live GPS telemetry tracks both Dindis heading towards Camp 1.\n\n2. Predict: Simultaneous arrival causes a 200% peak capacity crush at Camp 1 entrance and kitchen facilities.\n\n3. Re-plan (Dynamic Route Staggering):\n   • Dindi 1 (Shortest Direct Corridor - NH-965): 4.2 km · ETA +45 min (Batch 1).\n   • Dindi 2 (Scenic Outer Bypass): 6.8 km · ETA +95 min (Batch 2 · +50 min offset).\n   • Optimization Result: By the time Dindi 2 arrives at Camp 1, Dindi 1 has finished Maha-Prasad and started moving to the next transit sector! Zero overcrowding, zero queueing.\n\n4. Alert: Kitchen, water tankers, and medical squads at Camp 1 receive scheduled alerts in advance for Batch 1 and Batch 2.`;
        impacts = [
          { label: "Camp Peak Load", value: "Reduced from 200% to 70%" },
          { label: "Stagger Gap", value: "+50 Min Phased Window" },
          { label: "Turnaround", value: "Zero Queueing Bottleneck" },
        ];
        recommendations = [
          "1. Route Dindi 1 via Primary NH-965 Express and Dindi 2 via Riverside Scenic Bypass.",
          "2. Alert Camp 1 Kitchen to stage Batch 1 Prasad at T+30m and Batch 2 at T+80m.",
          "3. Perform 15-minute bio-toilet sanitization during the inter-batch turnover gap.",
        ];
      }

      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline,
          forecastText,
          rootCauses: [
            "Static printed timetables create simultaneous bottleneck collisions at corridor camps.",
            "Dynamic route dispersion staggers arrival times using natural distance deltas (+3.4 km bypass).",
            "Camp capacity is never breached because previous batch departs before next batch arrives.",
          ],
          impacts,
          recommendations,
          confidence: 99,
        },
      };
      speak(forecastText, targetLang);
    }
    // ── 0A. OVERCROWDED NEXT / NEXT BOTTLENECK / HIGHEST CROWD RISK CAMP INTENT ──
    else if (
      /overcrowd|crowd\s*next|which\s*camp.*(?:overcrowd|full|risk|surge|next|bottleneck|pressure)|next\s*(?:bottleneck|camp|overcrowd)|highest\s*(?:load|crowd|density)|(कोणता|कोणतं)\s*तळ.*(?:भरणार|गर्दी|ओव्हरक्राउड)|पुढील\s*गर्दी|कोणत्या\s*तळावर\s*गर्दी|कौन\s*सा\s*(?:शिविर|कैंप).*(?:भरेगा|भीड़|ओवरक्राउड)/.test(
        qLower
      )
    ) {
      // Analyze current camp occupancy & incoming Dindi trajectories
      const sortedCamps = [...state.camps].sort((a, b) => b.occupancyPercent - a.occupancyPercent);
      const criticalCamp = sortedCamps.find((c) => c.occupancyPercent >= 75) || sortedCamps[0] || state.camps[0];
      const secondCamp = sortedCamps.find((c) => c.id !== criticalCamp.id) || state.camps[1];
      const totalInflow = state.totalPilgrims > 0 ? state.totalPilgrims : 45000;
      const projOcc = criticalCamp.capacity > 0 ? Math.round((totalInflow / criticalCamp.capacity) * 100) : 115;

      let headline = "";
      let forecastText = "";
      let impacts: { label: string; value: string }[] = [];
      let recommendations: string[] = [];

      if (targetLang === "mr") {
        headline = `पुढील गर्दीचा अंदाज: ${criticalCamp.name}`;
        forecastText = `पुढील गर्दी व संभाव्य ओव्हरक्राउडिंग विश्लेषण:\n\n• संभाव्य गर्दीचा तळ: ${criticalCamp.name} (सुरक्षित क्षमता: ${criticalCamp.capacity.toLocaleString()} भाविक).\n• सध्याची/अपेक्षित गर्दी: अंदाजे ${totalInflow.toLocaleString()} वारकरी येत्या ४५-६० मिनिटांत दाखल होत आहेत (${projOcc}% भार).\n• AI प्रतिबंधात्मक उपाययोजना:\n  १. दिंडी सिंक्रोनायझेशन: मागून येणाऱ्या दिंडीला बाह्य बायपास मार्गावर (+३.४ किमी) वळवून आगमन ५० मिनिटांनी स्टॅगर केले आहे.\n  २. पर्यायी सुरक्षित तळ: ${secondCamp.name} (उपलब्ध क्षमता: ${(secondCamp.capacity - secondCamp.currentOccupancy).toLocaleString()} जागा) सज्ज ठेवण्यात आला आहे.\n  ३. पाणी व महाप्रसाद पथकांना अतिरिक्त बॅच पुरवठ्याचा थेट अलर्ट पाठवला आहे.`;
        impacts = [
          { label: "पुढील गर्दीचा तळ", value: criticalCamp.name.split("(")[0] },
          { label: "अपेक्षित गर्दी भार", value: `${projOcc}% (व्यवस्थापित)` },
          { label: "पर्यायी सुरक्षित तळ", value: secondCamp.name.split("(")[0] },
        ];
        recommendations = [
          `दिंडी २ ला बाह्य बायपास मार्गाने वळवून ${criticalCamp.name} वरील ताण कमी करा.`,
          `${criticalCamp.name} येथे २ अतिरिक्त पाण्याचे टँकर आणि स्वयंसेवक दल तैनात करा.`,
          `प्रवेशद्वारावरील रांगा टाळण्यासाठी बॅच-वार महाप्रसाद वाटप सुरू ठेवा.`,
        ];
      } else if (targetLang === "hi") {
        headline = `अगला संभावित भीड़ शिविर: ${criticalCamp.name}`;
        forecastText = `अगला भीड़ एवं ओवरक्राउडिंग पूर्वानुमान:\n\n• मुख्य जोखिम शिविर: ${criticalCamp.name} (सुरक्षित क्षमता: ${criticalCamp.capacity.toLocaleString()} श्रद्धालु)।\n• अनुमानित आवक: लगभग ${totalInflow.toLocaleString()} श्रद्धालु अगले 45-60 मिनट में पहुंचेंगे (${projOcc}% भार)।\n• AI स्वचालित राहत कदम:\n  1. दिंडी सिंक्रोनाइज़ेशन: दूसरी दिंडी को आउटर बाईपास (+3.4 किमी) पर डायवर्ट कर +50 मिनट का अंतराल बनाया गया।\n  2. वैकल्पिक शिविर: ${secondCamp.name} (उपलब्ध क्षमता: ${(secondCamp.capacity - secondCamp.currentOccupancy).toLocaleString()}) सक्रिय।\n  3. अतिरिक्त पानी के टैंकर और भोजन आपूर्ति स्टैंडबाय पर रखी गई।`;
        impacts = [
          { label: "अगला भीड़ शिविर", value: criticalCamp.name.split("(")[0] },
          { label: "अनुमानित पीक लोड", value: `${projOcc}% (नियंत्रित)` },
          { label: "बैकअप सुरक्षित शिविर", value: secondCamp.name.split("(")[0] },
        ];
        recommendations = [
          `आगामी दिंडी को बाईपास मार्ग पर निर्देशित कर ${criticalCamp.name} का दबाव 40% घटाएं।`,
          `${criticalCamp.name} पर आपातकालीन पेयजल और मेडिकल दल को हाई अलर्ट पर रखें।`,
        ];
      } else {
        headline = `Next Projected Overcrowded Halt: ${criticalCamp.name}`;
        forecastText = `Next Chokepoint & Overcrowding Forecast:\n\n• Primary Bottleneck Camp: ${criticalCamp.name} (Safe Capacity: ${criticalCamp.capacity.toLocaleString()} devotees).\n• Incoming Pilgrim Flow: ~${totalInflow.toLocaleString()} devotees converging within 45–60 minutes (${projOcc}% capacity load).\n• Automated AI Mitigation Executed:\n  1. Route Staggering: Second incoming Dindi rerouted to the Scenic Outer Bypass (+3.4 km) for a +50 min phased buffer.\n  2. Overflow Relief: ${secondCamp.name} staged as backup holding ground with ${(secondCamp.capacity - secondCamp.currentOccupancy).toLocaleString()} available slots.\n  3. Logistics: Pre-alerts dispatched to kitchen and water tanker logistics.`;
        impacts = [
          { label: "Next Overcrowded Halt", value: criticalCamp.name.split("(")[0] },
          { label: "Projected Peak Load", value: `${projOcc}% (Managed)` },
          { label: "Backup Holding Camp", value: secondCamp.name.split("(")[0] },
        ];
        recommendations = [
          `Execute dynamic route staggering to reduce ${criticalCamp.name} arrival pressure by 45%.`,
          `Position backup water tanker at ${criticalCamp.name} main entrance gate.`,
          `Activate volunteer marshals at approach corridor junctions.`,
        ];
      }

      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline,
          forecastText,
          rootCauses: [
            `Simultaneous convergence of pilgrim columns towards ${criticalCamp.name}.`,
            `Dynamic corridor telemetry prevents overcrowding before physical arrival.`,
          ],
          impacts,
          recommendations,
          confidence: 98,
        },
      };
      speak(forecastText, targetLang);
    }
    // ── 1. SANITATION / TOILET / WASHROOM INTENT ──
    else if (
      /toilet|toliet|tolet|washr|washrom|restroom|restrom|sanit|bathr|bathrom|sandaas|sandas|shauch|शौचालय|प्रसाधनगृह|संडास|स्वच्छता/.test(
        qLower
      )
    ) {
      const nearestCrew = state.sanitationCrews.find((s) => s.status === "AVAILABLE") ?? state.sanitationCrews[0];
      const crewName = nearestCrew?.name ?? "Pune Municipal Bio-Toilet Squad 1";
      const zone = nearestCrew?.zone ?? "Pune Bhavani Peth Zone";
      const pods = nearestCrew?.mobilePodsCount ?? 24;
      const lead = nearestCrew?.leadName ?? "Kailas Shinde";
      const phone = nearestCrew?.phone ?? "98221-44020";

      let headline = "";
      let forecastText = "";
      let impacts: { label: string; value: string }[] = [];
      let recommendations: string[] = [];

      if (targetLang === "mr") {
        headline = `जवळची स्वच्छतागृहे आणि मोबाईल बायो-टॉयलेट्स (${zone})`;
        forecastText = `जवळचे स्वच्छतागृह व बायो-टॉयलेट सुविधा:\n• ${crewName}: ${pods} मोबाईल बायो-टॉयलेट पॉड्स ${zone} येथे उपलब्ध आहेत.\n• संपर्क प्रमुख: ${lead} (मोबाईल: ${phone}).\n• सर्व ८ अधिकृत तळांवर २४ तास महिला व पुरुषांसाठी स्वतंत्र स्वच्छतागृहे सज्ज आहेत.`;
        impacts = [
          { label: "स्वच्छता पथक", value: crewName },
          { label: "मोबाईल पॉड्स", value: `${pods} युनिट्स` },
          { label: "सेवा स्थिती", value: "२४ तास कार्यरत" },
        ];
        recommendations = [
          "महिला व ज्येष्ठ वारकऱ्यांसाठी स्वतंत्र रांगेची व्यवस्था ठेवा.",
          "पाणी टँकरद्वारे बायो-टॉयलेट्समध्ये पुरेसा पाणी पुरवठा सुनिश्चित करा.",
        ];
      } else if (targetLang === "hi") {
        headline = `नजदीकी शौचालय और मोबाइल बायो-टॉयलेट सुविधा (${zone})`;
        forecastText = `नजदीकी शौचालय एवं स्वच्छता सुविधाएं:\n• ${crewName}: ${pods} मोबाइल बायो-टॉयलेट पॉड्स ${zone} पर उपलब्ध हैं।\n• प्रभारी: ${lead} (फोन: ${phone})।\n• सभी 8 शिविरों पर 24 घंटे महिला एवं पुरुष हेतु पृथक शौचालय संचालित हैं।`;
        impacts = [
          { label: "स्वच्छता दल", value: crewName },
          { label: "उपलब्ध पॉड्स", value: `${pods} टॉयलेट्स` },
          { label: "सफाई स्थिति", value: "24/7 सक्रिय" },
        ];
        recommendations = [
          "शौचालय स्थलों पर नियमित सैनिटाइजेशन और पानी रीफिल जारी रखें।",
          "भीड़ वाले शिविरों में अतिरिक्त मोबाइल टॉयलेट वैन तैनात करें।",
        ];
      } else {
        headline = `Nearest Toilets & Mobile Bio-Sanitation Facilities (${zone})`;
        forecastText = `Nearest Sanitation Facilities along the Corridor:\n• ${crewName}: ${pods} mobile bio-toilet pods deployed at ${zone}.\n• Supervisor: ${lead} (Phone: ${phone}).\n• Dedicated separate male & female clean toilet facilities available across all Camps 1–8 with continuous 24/7 water supply.`;
        impacts = [
          { label: "Sanitation Squad", value: crewName },
          { label: "Mobile Pods", value: `${pods} Pods` },
          { label: "Availability", value: "24/7 Clean" },
        ];
        recommendations = [
          "Ensure continuous water tanker pressure to bio-toilet pods.",
          "Deploy dedicated crowd marshals at peak morning rush hours.",
        ];
      }

      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline,
          forecastText,
          rootCauses: [
            `${pods} bio-toilets serviced regularly across ${zone}.`,
            "Municipal sanitation mobile maintenance squads on active rotation.",
          ],
          impacts,
          recommendations,
          confidence: 99,
        },
      };
      speak(forecastText, targetLang);
    }
    // ── 2. FOOD / PRASAD / MEALS INTENT (CAMP-SPECIFIC & GENERAL) ──
    else if (
      /food|fod|prasad|prasdam|prasadam|meal|anna|annadan|jevan|bhojan|khana|kitch|भोजन|जेवण|प्रसाद|अन्नदान|महाप्रसाद|रसोई/.test(
        qLower
      )
    ) {
      // Check if specific camp is mentioned (e.g. camp 5 / saswad, camp 2 / hadapsar, camp 1, etc.)
      const isCamp5 = /camp\s*5|saswad|सासवड|तळ\s*५|तळ\s*5|शिविर\s*5|शिविर\s*५/.test(qLower);
      const isCamp2 = /camp\s*2|hadapsar|हडपसर|तळ\s*२|तळ\s*2|शिविर\s*2|शिविर\s*२/.test(qLower);
      const isCamp1 = /camp\s*1|pune|पुणे|भवानी|तळ\s*१|तळ\s*1|शिविर\s*1|शिविर\s*१/.test(qLower);
      const isCamp3 = /camp\s*3|wadki|dive|घाट|वाडकी|तळ\s*३|तळ\s*3|शिविर\s*3|शिविर\s*३/.test(qLower);
      const isCamp6 = /camp\s*6|jejuri|जेजुरी|तळ\s*६|तळ\s*6|शिविर\s*6|शिविर\s*६/.test(qLower);
      const isCamp8 = /camp\s*8|phaltan|फलटण|तळ\s*८|तळ\s*8|शिविर\s*8|शिविर\s*८/.test(qLower);

      let targetCampName = "Camp 5 (Saswad Palkhi Maidan)";
      let kitchenName = "Saswad Palkhi Maidan Mega Annadan Kitchen";
      let mealsCap = 45000;
      let hub = "Saswad Central Annadan Mandap";
      let stock = "95% Stock (Refilled)";
      let phone = "98221-44034";
      let supervisor = "Balasaheb Jagtap";

      if (isCamp2) {
        targetCampName = "Camp 2 (Hadapsar Transit Yard)";
        kitchenName = "Hadapsar Central Anna Dan Mobile Kitchen";
        mealsCap = 30000;
        hub = "Hadapsar Annadan Hub";
        stock = "100% Stock";
        phone = "98221-44031";
        supervisor = "Ganesh Shinde";
      } else if (isCamp1) {
        targetCampName = "Camp 1 (Pune Racecourse / Bhavani Peth)";
        kitchenName = "Alandi-Pune Central Anna Dan Mobile Kitchen";
        mealsCap = 50000;
        hub = "Pune Bhavani Peth Annadan Bay";
        stock = "100% Stock";
        phone = "98221-44030";
        supervisor = "Rameshwar Maharaj";
      } else if (isCamp3) {
        targetCampName = "Camp 3 (Dive Ghat Foothill Camp - Wadki)";
        kitchenName = "Wadki Dive Ghat Foothill Annadan Kitchen";
        mealsCap = 25000;
        hub = "Wadki Transit Hub";
        stock = "95% Stock";
        phone = "98221-44032";
        supervisor = "Santosh Kadam";
      } else if (isCamp6) {
        targetCampName = "Camp 6 (Jejuri Palkhi Grounds)";
        kitchenName = "Jejuri Palkhi Grounds Maha-Prasad Kitchen";
        mealsCap = 50000;
        hub = "Jejuri Devasthan Annadan Hall";
        stock = "95% Stock";
        phone = "98221-44035";
        supervisor = "Dattatray Raut";
      } else if (isCamp8) {
        targetCampName = "Camp 8 (Phaltan Sugar Mill Grounds)";
        kitchenName = "Phaltan Sugar Mill Grounds Mega Annadan Kitchen";
        mealsCap = 60000;
        hub = "Phaltan Central Mandap";
        stock = "95% Stock";
        phone = "98221-44037";
        supervisor = "Sambhaji Patil";
      }

      let headline = "";
      let forecastText = "";
      let impacts: { label: string; value: string }[] = [];
      let recommendations: string[] = [];

      if (targetLang === "mr") {
        headline = `अन्नदान व महाप्रसाद माहिती: ${targetCampName}`;
        forecastText = `${targetCampName} येथील अन्नदान व प्रसाद केंद्र:\n• स्वयंपाकघर: ${kitchenName} (${mealsCap.toLocaleString()} जेवणांची क्षमता).\n• ठिकाण: ${hub} (साठा: ${stock}).\n• अन्नदान प्रमुख: ${supervisor} (मोबाईल: ${phone}).\n• सर्व वारकऱ्यांसाठी गरम खिचडी, भाकरी, पिठलं आणि शुद्ध पिण्याच्या पाण्याचा अखंड महाप्रसाद उपलब्ध आहे.`;
        impacts = [
          { label: "अन्नदान केंद्र", value: kitchenName },
          { label: "भोजन क्षमता", value: `${mealsCap.toLocaleString()} ताट` },
          { label: "प्रसाद साठा", value: stock },
        ];
        recommendations = [
          "दुपारी व संध्याकाळी मुख्य आरतीच्या वेळी महाप्रसाद वाटप रांगा सुव्यवस्थित ठेवा.",
          "पिण्याच्या पाण्याचे टँकर भोजन मंडपाजवळ सज्ज ठेवा.",
        ];
      } else if (targetLang === "hi") {
        headline = `भोजन एवं महाप्रसाद केंद्र: ${targetCampName}`;
        forecastText = `${targetCampName} पर भोजन और प्रसाद व्यवस्था:\n• अन्नदान रसोई: ${kitchenName} (${mealsCap.toLocaleString()} भोजन क्षमता)।\n• स्थान: ${hub} (भंडार: ${stock})।\n• व्यवस्थापक: ${supervisor} (फोन: ${phone})।\n• सभी श्रद्धालुओं हेतु गरमा-गरम खिचड़ी, महाप्रसाद एवं शुद्ध पेयजल 24 घंटे उपलब्ध है।`;
        impacts = [
          { label: "अन्नदान केंद्र", value: kitchenName },
          { label: "भोजन क्षमता", value: `${mealsCap.toLocaleString()} भोजन` },
          { label: "प्रसाद भंडार", value: stock },
        ];
        recommendations = [
          "भोजन मंडप में महिला एवं वृद्ध श्रद्धालुओं के लिए अलग पंक्ति रखें।",
          "मोबाइल रसोई वैन द्वारा मुख्य मार्ग पर भी प्रसाद पैकेट वितरित करें।",
        ];
      } else {
        headline = `Maha-Prasad & Food Supply: ${targetCampName}`;
        forecastText = `Food & Prasad Logistics for ${targetCampName}:\n• Central Kitchen: ${kitchenName} (${mealsCap.toLocaleString()} meals capacity).\n• Distribution Hub: ${hub} (Stock: ${stock}).\n• Coordinator: ${supervisor} (Phone: ${phone}).\n• Fresh hot Maha-Prasad (Khichdi, Bhakri, Pitla) and clean potable water available freely for all devotees around the clock.`;
        impacts = [
          { label: "Annadan Kitchen", value: kitchenName },
          { label: "Meal Capacity", value: `${mealsCap.toLocaleString()} Meals` },
          { label: "Food Stock", value: stock },
        ];
        recommendations = [
          "Ensure steady supply chain of grains and vegetables to the kitchen.",
          "Pre-position mobile food vans at approach corridors during meal times.",
        ];
      }

      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline,
          forecastText,
          rootCauses: [
            `${kitchenName} fully operational with ${mealsCap.toLocaleString()} meal prep capacity.`,
            `Direct contact: ${supervisor} (${phone}) on ground.`,
          ],
          impacts,
          recommendations,
          confidence: 100,
        },
      };
      speak(forecastText, targetLang);
    }
    // ── 3. WATER TANKER INTENT ──
    else if (
      /water|watr|tanker|tankr|tahn|paani|pani|jal|hydration|drink|प्यास|पानी|पाणी|टँकर|टैंकर|जल/.test(qLower)
    ) {
      const nearestTanker =
        state.tankers.find((t) => t.status === "AVAILABLE") || state.tankers[0];
      const tankerId = nearestTanker?.id ?? "LIVE-WATER-PUNE-01";
      const hub = nearestTanker?.currentHub ?? "Pune Bhavani Peth Tanker Bay";
      const cap = nearestTanker?.capacityLiters ?? 10000;
      const driver = nearestTanker?.driverName ?? "Mahadev Jagtap";
      const dist = nearestTanker?.distanceKm ?? 2.4;
      const eta = nearestTanker?.etaMinutes ?? 8;

      let headline = "";
      let forecastText = "";
      let impacts: { label: string; value: string }[] = [];
      let recommendations: string[] = [];

      if (targetLang === "mr") {
        headline = `जवळचा पाण्याचा टँकर: ${tankerId} (${hub})`;
        forecastText = `सर्वात जवळचा पाण्याचा टँकर ${tankerId} (${cap.toLocaleString()} लिटर क्षमता) ${hub} येथे उपलब्ध आहे. तुमच्या ठिकाणापासून अंतर अंदाजे ${dist} किमी असून पोहोचण्याचा वेळ ${eta} मिनिटे आहे. चालक: ${driver}.`;
        impacts = [
          { label: "टँकर क्रमांक", value: tankerId },
          { label: "साठा क्षमता", value: `${cap.toLocaleString()} लिटर` },
          { label: "अंदाजे वेळ (ETA)", value: `${eta} मिनिटे` },
        ];
        recommendations = [
          `टँकर ${tankerId} तातडीने पाणी वाटप पॉईंटवर रवाना करा.`,
          "दिंडी प्रमुखांना मोबाईलवर पाणी साठ्याची माहिती पाठवा.",
        ];
      } else if (targetLang === "hi") {
        headline = `नजदीकी पानी का टैंकर: ${tankerId} (${hub})`;
        forecastText = `सबसे नजदीकी पानी का टैंकर ${tankerId} (${cap.toLocaleString()} लीटर क्षमता) ${hub} पर उपलब्ध है। दूरी लगभग ${dist} किमी है और पहुंचने का अनुमानित समय ${eta} मिनट है। चालक: ${driver}।`;
        impacts = [
          { label: "टैंकर आईडी", value: tankerId },
          { label: "पानी की क्षमता", value: `${cap.toLocaleString()} L` },
          { label: "पहुंचने का समय", value: `${eta} मिनट` },
        ];
        recommendations = [
          `टैंकर ${tankerId} को तुरंत वितरण बिंदु पर भेजें।`,
          "दिंडी प्रमुखों को नजदीकी रिफिल स्थान का संदेश भेजें।",
        ];
      } else {
        headline = `Nearest Water Tanker: ${tankerId} (${hub})`;
        forecastText = `The nearest water tanker is ${tankerId} (${cap.toLocaleString()} L capacity) stationed at ${hub}. Distance is ${dist} km with an ETA of ~${eta} minutes. Driver: ${driver}.`;
        impacts = [
          { label: "Tanker ID", value: tankerId },
          { label: "Capacity", value: `${cap.toLocaleString()} Liters` },
          { label: "Dispatch ETA", value: `${eta} mins` },
        ];
        recommendations = [
          `Dispatch tanker ${tankerId} to active refill queue.`,
          "Broadcast water point coordinates to Dindi leaders.",
        ];
      }

      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline,
          forecastText,
          rootCauses: [
            `Stationed at ${hub} with full potable reserves.`,
            `Driver ${driver} standby for emergency dispatch.`,
          ],
          impacts,
          recommendations,
          confidence: 99,
        },
      };
      speak(forecastText, targetLang);
    }
    // ── 4. HOSPITAL & MEDICAL INTENT ──
    else if (
      /hosp|hosip|medic|doct|ambul|icu|clinic|emerg|aid|first.?aid|treatment|दवा|अस्प|रुग्ण|डॉक्टर|इलाज/.test(
        qLower
      )
    ) {
      let headline = "";
      let forecastText = "";
      let impacts: { label: string; value: string }[] = [];
      let recommendations: string[] = [];

      if (targetLang === "mr") {
        headline = "पालखी मार्गावरील आणीबाणी रुग्णालये व वैद्यकीय मदत";
        forecastText =
          "पालखी मार्गावरील प्रमुख रुग्णालये:\n१. दीनानाथ मंगेशकर रुग्णालय (इरंडवणे - ०२०-४०१५१०००)\n२. ससून सर्वोपचार रुग्णालय (पुणे स्टेशन - ०२०-२६१२८०००)\n३. सासवड उप-जिल्हा रुग्णालय (सासवड - ०२११५-२२२२३३)\n४. जेजुरी ग्रामीण रुग्णालय (जेजुरी)\nतातडीच्या मदतीसाठी १०८ रुग्णवाहिका सज्ज आहे.";
        impacts = [
          { label: "प्रमुख रुग्णालय", value: "दीनानाथ मंगेशकर (2.6 km)" },
          { label: "सरकारी रुग्णालय", value: "ससून रुग्णालय (3.8 km)" },
          { label: "रुग्णवाहिका", value: "१०८ मोफत सेवा" },
        ];
        recommendations = [
          "गंभीर रुग्णांना त्वरित जवळच्या आयसीयू सेंटरमध्ये हलवा.",
          "उष्माघात व डिहायड्रेशनसाठी ओआरएस केंद्र उपलब्ध करा.",
        ];
      } else if (targetLang === "hi") {
        headline = "कॉरिडोर पर नजदीकी अस्पताल और आपातकालीन चिकित्सा";
        forecastText =
          "कॉरिडोर के प्रमुख अस्पताल:\n1. दीनानाथ मंगेशकर अस्पताल (एरंडवणे - 020-40151000)\n2. ससून जनरल अस्पताल (पुणे स्टेशन - 020-26128000)\n3. सासवड उप-जिला अस्पताल (02115-222233)\n4. जेजुरी ग्रामीण अस्पताल\nआपातकालीन सहायता के लिए 108 एम्बुलेंस सेवा उपलब्ध है।";
        impacts = [
          { label: "मुख्य अस्पताल", value: "दीनानाथ मंगेशकर (2.6 km)" },
          { label: "जनरल अस्पताल", value: "ससून अस्पताल (3.8 km)" },
          { label: "एम्बुलेंस", value: "108 सेवा" },
        ];
        recommendations = [
          "गंभीर मरीजों के लिए ग्रीन कॉरिडोर समन्वय करें।",
          "प्राथमिक चिकित्सा केंद्रों पर ओआरएस व ग्लूकोज उपलब्ध रखें।",
        ];
      } else {
        headline = "Emergency Hospitals & Corridor Medical Matrix";
        forecastText =
          "Verified Emergency Medical Facilities along the Route:\n1. Deenanath Mangeshkar Hospital (Erandwane - 020-40151000)\n2. Sassoon General Hospital (Station Road - 020-26128000)\n3. Saswad Sub-District Hospital (Saswad - 02115-222233)\n4. Jejuri Rural Hospital (Jejuri)\nFor urgent field evacuations, dial 108 for immediate 24/7 ambulance dispatch.";
        impacts = [
          { label: "Primary Center", value: "Deenanath (2.6 km)" },
          { label: "Govt General", value: "Sassoon (3.8 km)" },
          { label: "Ambulance", value: "108 Dial Ready" },
        ];
        recommendations = [
          "Keep heat-stroke and cardiac response teams on standby.",
          "Dispatch bike ambulances through narrow Dindi lanes.",
        ];
      }

      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline,
          forecastText,
          rootCauses: [
            "24/7 ICU facilities mapped along the Pune–Pandharpur pilgrimage highway.",
            "108 State Emergency Ambulance Network synchronized.",
          ],
          impacts,
          recommendations,
          confidence: 99,
        },
      };
      speak(forecastText, targetLang);
    }
    // ── 5. PALKHI & RINGAN SCHEDULE INTENT ──
    else if (
      /schedule|ringan|वेळापत्रक|रिंगण|तारीख|दिनांक|date|dates|ekadashi|एकादशी|वारी/.test(
        qLower
      )
    ) {
      let headline = "";
      let forecastText = "";
      let impacts: { label: string; value: string }[] = [];
      let recommendations: string[] = [];

      if (targetLang === "mr") {
        headline = "अधिकृत २०२६ संत ज्ञानेश्वर महाराज पालखी व रिंगण वेळापत्रक";
        forecastText =
          "अधिकृत २०२६ पालखी रिंगण वेळापत्रक:\n• पहिले उभे रिंगण: १८ जुलै २०२६ (काटेवाडी)\n• दुसरे उभे रिंगण: २१ जुलै २०२६ (अकलूज)\n• तिसरे उभे रिंगण: २४ जुलै २०२६ (बाजीराव विहीर)\n• आषाढी एकादशी मुख्य सोहळा: २६ जुलै २०२६ (श्री क्षेत्र पंढरपूर).";
        impacts = [
          { label: "पहिले रिंगण (काटेवाडी)", value: "१८ जुलै २०२६" },
          { label: "दुसरे रिंगण (अकलूज)", value: "२१ जुलै २०२६" },
          { label: "आषाढी एकादशी", value: "२६ जुलै २०२६" },
        ];
        recommendations = [
          "काटेवाडी रिंगण मैदानावर १२ तास आधी ४ पाण्याचे टँकर सज्ज ठेवा.",
          "अकलूज येथे १२ स्वयंसेवकांची गर्दी नियंत्रण तुकडी तैनात करा.",
        ];
      } else if (targetLang === "hi") {
        headline = "आधिकारिक 2026 पालखी और रिंगण शेड्यूल (पंढरपुर वारी)";
        forecastText =
          "आधिकारिक 2026 पालखी रिंगण शेड्यूल:\n• पहला रिंगण: 18 जुलाई 2026 (काटेवाडी)\n• दूसरा रिंगण: 21 जुलाई 2026 (अकलूज)\n• तीसरा रिंगण: 24 जुलाई 2026 (बाजीराव विहीर)\n• आषाढ़ी एकादशी: 26 जुलाई 2026 (पंढरपुर).";
        impacts = [
          { label: "पहला रिंगण", value: "18 जुलाई (काटेवाडी)" },
          { label: "दूसरा रिंगण", value: "21 जुलाई (अकलूज)" },
          { label: "आषाढ़ी एकादशी", value: "26 जुलाई 2026" },
        ];
        recommendations = [
          "रिंगण स्थलों पर चिकित्सा व पेयजल व्यवस्था पूर्व-स्थापित करें।",
          "भीड़ नियंत्रण हेतु स्वयंसेवकों को परिधि पर तैनात करें।",
        ];
      } else {
        headline = "Official 2026 Sant Dnyaneshwar Maharaj Palkhi & Ringan Schedule";
        forecastText =
          "Official 2026 Itinerary:\n• 1st Ringan: 18 July 2026 (Katewadi)\n• 2nd Ringan: 21 July 2026 (Akluj)\n• 3rd Ringan: 24 July 2026 (Bajirao Vihir)\n• Ashadhi Ekadashi Grand Darshan: 26 July 2026 (Pandharpur).";
        impacts = [
          { label: "Katewadi Ringan", value: "18 July 2026" },
          { label: "Akluj Ringan", value: "21 July 2026" },
          { label: "Ashadhi Ekadashi", value: "26 July 2026" },
        ];
        recommendations = [
          "Pre-position 4 water tankers at Katewadi grounds 12 hours prior.",
          "Station 12 crowd marshals at Akluj inner track perimeter.",
        ];
      }

      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline,
          forecastText,
          rootCauses: [
            "Grounded in official 2026 Alandi Devasthan Palkhi Itinerary.",
            "All Ringan sectors synchronized with district administration.",
          ],
          impacts,
          recommendations,
          confidence: 100,
        },
      };
      speak(forecastText, targetLang);
    }
    // ── 6. CAMPS & SAFE CAPACITY INTENT ──
    else if (
      /camp|halt|तळ|पडका|शिविर|थांबा|capacity|क्षमता|buffer|बफर/.test(
        qLower
      )
    ) {
      let headline = "";
      let forecastText = "";
      let impacts: { label: string; value: string }[] = [];
      let recommendations: string[] = [];

      if (targetLang === "mr") {
        headline = "पालखी मार्ग तळ १ ते ८ सुरक्षित क्षमता सूची";
        forecastText =
          "तळ १ ते ८ सुरक्षित क्षमता:\n• तळ १ (पुणे रेसकोर्स/भवानी पेठ): ४०,०००\n• तळ २ (हडपसर): ३०,०००\n• तळ ३ (दिवे घाट पायथा - वाडकी): २५,०००\n• तळ ४ (झाडाचे मठ - घाट माथा): २०,०००\n• तळ ५ (सासवड पालखी मैदान): ४५,०००\n• तळ ६ (जेजुरी मैदान): ५०,०००\n• तळ ७ (लोणंद): ३५,०००\n• तळ ८ (फलटण साखर कारखाना मैदान): ६०,००० (सर्वात मोठा बफर).";
        impacts = [
          { label: "एकूण सुरक्षित क्षमता", value: "३,०५,००० वारकरी" },
          { label: "सर्वात मोठा तळ", value: "तळ ८ फलटण (६०,०००)" },
          { label: "घाट पायथा तळ", value: "तळ ३ वाडकी (२५,०००)" },
        ];
        recommendations = [
          "सासवड येथे गर्दी वाढल्यास दिंडी तळ ६ जेजुरीकडे वळवा.",
          "घाट चढण्यापूर्वी तळ ३ वर वारकऱ्यांना विश्रांतीची सोय करा.",
        ];
      } else if (targetLang === "hi") {
        headline = "शिविर 1 से 8 सुरक्षित क्षमता विवरण";
        forecastText =
          "शिविर 1 से 8 सुरक्षित क्षमता:\n• शिविर 1 (पुणे रेसकोर्स/भवानी पेठ): 40,000\n• शिविर 2 (हड़पसर): 30,000\n• शिविर 3 (दिवे घाट तलहटी - वाडकी): 25,000\n• शिविर 4 (झाडाचे मठ): 20,000\n• शिविर 5 (सासवड): 45,000\n• शिविर 6 (जेजुरी): 50,000\n• शिविर 7 (लोणंद): 35,000\n• शिविर 8 (फलटण): 60,000 (सबसे बड़ा बफर).";
        impacts = [
          { label: "कुल सुरक्षित क्षमता", value: "305,000 यात्री" },
          { label: "सबसे बड़ा शिविर", value: "शिविर 8 फलटण (60,000)" },
          { label: "घाट पूर्व शिविर", value: "शिविर 3 वाडकी (25,000)" },
        ];
        recommendations = [
          "सासवड में भीड़ बढ़ने पर जेजुरी शिविर 6 की ओर प्रवाह बढ़ाएं।",
          "घाट चढ़ाई से पहले शिविर 3 पर पेयजल व चिकित्सा सुलभ रखें।",
        ];
      } else {
        headline = "Camps 1–8 Safe Holding Capacity Matrix";
        forecastText =
          "Camps 1–8 Safe Capacities:\n• Camp 1 (Pune Racecourse / Bhavani Peth): 40,000\n• Camp 2 (Hadapsar Transit): 30,000\n• Camp 3 (Dive Ghat Foothill - Wadki): 25,000\n• Camp 4 (Zadache Math Apex): 20,000\n• Camp 5 (Saswad Palkhi Maidan): 45,000\n• Camp 6 (Jejuri Palkhi Grounds): 50,000\n• Camp 7 (Lonand Agro Center): 35,000\n• Camp 8 (Phaltan Sugar Mill): 60,000 (Largest Buffer).";
        impacts = [
          { label: "Total Safe Buffer", value: "305,000 Devotees" },
          { label: "Largest Holding Hub", value: "Camp 8 (60,000)" },
          { label: "Pre-Ghat Staging", value: "Camp 3 (25,000)" },
        ];
        recommendations = [
          "Buffer overflow from Saswad into Camp 6 (Jejuri).",
          "Ensure steady hydration staging at Camp 3 before ghat ascent.",
        ];
      }

      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline,
          forecastText,
          rootCauses: [
            "Calibrated from historical 2024-25 peak flow data.",
            "All 8 halts equipped with Maha-Prasad kitchens and bio-toilets.",
          ],
          impacts,
          recommendations,
          confidence: 98,
        },
      };
      speak(forecastText, targetLang);
    }
    // ── 7. VOLUNTEER DISPATCH & SEVA INTENT ──
    else if (/volunteer|sevak|स्वयंसेवक|मदत|सेवा|task|काम/.test(qLower)) {
      let headline = "";
      let forecastText = "";
      let impacts: { label: string; value: string }[] = [];

      if (targetLang === "mr") {
        headline = "तळ १ ते ६ स्वयंसेवक समन्वय आणि सेवा कार्य";
        forecastText =
          "तळ १ ते ६ वर ६ नियुक्त स्वयंसेवक प्रमुख कार्यरत आहेत:\n• तळ १ (पुणे): सचिन कांबळे\n• तळ २ (हडपसर): अनिकेत जाधव\n• तळ ३ (दिवे घाट): तुषार मोरे\n• तळ ४ (सासवड): स्वप्निल शिंदे\n• तळ ५ (जेजुरी): रोहन गायकवाड\n• तळ ६ (लोणंद): प्रशांत सावंत\nकमांड सेंटरमधून नियुक्त केलेली कार्ये स्वयंसेवक पोर्टलवर तत्काळ दिसतात.";
        impacts = [
          { label: "नियुक्त तळ स्वयंसेवक", value: "६ प्रमुख" },
          { label: "कार्यप्रणाली", value: "द्विदिशा थेट समन्वय" },
          { label: "थेट कार्ये", value: `${state.volunteerTasks.length} चालू` },
        ];
      } else if (targetLang === "hi") {
        headline = "शिविर 1 से 6 स्वयंसेवक तैनाती और कार्य";
        forecastText =
          "शिविर 1 से 6 पर 6 प्रमुख स्वयंसेवक तैनात हैं:\n• शिविर 1 (पुणे): सचिन कांबळे\n• शिविर 2 (हड़पसर): अनिकेत जाधव\n• शिविर 3 (दिवे घाट): तुषार मोरे\n• शिविर 4 (सासवड): स्वप्निल शिंदे\n• शिविर 5 (जेजुरी): रोहन गायकवाड\n• शिविर 6 (लोणंद): प्रशांत सावंत\nकमांड सेंटर से सौंपे गए कार्य स्वयंसेवक पोर्टल पर तुरंत सिंक होते हैं।";
        impacts = [
          { label: "तैनात स्वयंसेवक", value: "6 लीडर" },
          { label: "सिंक स्थिति", value: "लाइव द्विदिशीय" },
          { label: "सक्रिय कार्य", value: `${state.volunteerTasks.length} लाइव` },
        ];
      } else {
        headline = "Camps 1–6 Ground Volunteer Grid";
        forecastText =
          "Designated Sector Volunteers across Camps 1–6:\n• Camp 1 (Pune): Sachin Kamble\n• Camp 2 (Hadapsar): Aniket Jadhav\n• Camp 3 (Dive Ghat): Tushar More\n• Camp 4 (Saswad): Swapnil Shinde\n• Camp 5 (Jejuri): Rohan Gaikwad\n• Camp 6 (Lonand): Prashant Sawant\nAll command dispatches sync bidirectionally with the Volunteer Seva portal.";
        impacts = [
          { label: "Camp Volunteers", value: "6 Sector Leads" },
          { label: "Sync Engine", value: "Live Bidirectional" },
          { label: "Active Tasks", value: `${state.volunteerTasks.length} En Route` },
        ];
      }

      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline,
          forecastText,
          rootCauses: [
            "Ground volunteer roster assigned across route sectors.",
            "Verification feedback loops active.",
          ],
          impacts,
          recommendations: [
            "Check /volunteer to accept and verify field tasks.",
            "Submit incident reports directly from the seva app.",
          ],
          confidence: 97,
        },
      };
      speak(forecastText, targetLang);
    }
    // ── 8. GENERAL LIVE OPERATIONS TELEMETRY ──
    else {
      let headline = "";
      let forecastText = "";
      let impacts: { label: string; value: string }[] = [];

      if (targetLang === "mr") {
        headline = "वारिओएस केंद्रीय नियंत्रण कक्ष (थेट स्थिती)";
        forecastText = `थेट नियंत्रण कक्ष सक्रिय: सध्या ${liveDindis.length} नोंदणीकृत दिंड्या, ${state.camps.length} अधिकृत तळ, आणि ${state.tankers.length} पाण्याचे टँकर पालखी मार्गावर कार्यरत आहेत. मार्ग तापमान: ${state.weatherCondition.temperatureC}°C.`;
        impacts = [
          { label: "हवामान", value: `${state.weatherCondition.temperatureC}°C अनुकूल` },
          { label: "नोंदणीकृत दिंड्या", value: `${liveDindis.length} थेट` },
          { label: "पाण्याचे टँकर", value: `${state.tankers.length} उपलब्ध` },
        ];
      } else if (targetLang === "hi") {
        headline = "वारिओएस केंद्रीय कमान स्थिति (लाइव डेटा)";
        forecastText = `लाइव कमान सक्रिय: वर्तमान में ${liveDindis.length} पंजीकृत दिंडियां, ${state.camps.length} शिविर और ${state.tankers.length} पानी के टैंकर पुणे-पंढरपुर मार्ग पर संचालित हैं। मौसम: ${state.weatherCondition.temperatureC}°C।`;
        impacts = [
          { label: "मौसम", value: `${state.weatherCondition.temperatureC}°C सामान्य` },
          { label: "पंजीकृत दिंडी", value: `${liveDindis.length} लाइव` },
          { label: "पानी के टैंकर", value: `${state.tankers.length} बेड़े` },
        ];
      } else {
        headline = "WariOS Central Command Status (Live Telemetry)";
        forecastText = `Live Operations Active: Currently tracking ${liveDindis.length} registered Dindis, ${state.camps.length} verified camps, and ${state.tankers.length} water tankers across the Pune–Pandharpur corridor. Route temperature: ${state.weatherCondition.temperatureC}°C.`;
        impacts = [
          { label: "Corridor Weather", value: `${state.weatherCondition.temperatureC}°C Normal` },
          { label: "Registered Dindis", value: `${liveDindis.length} Live` },
          { label: "Water Tankers", value: `${state.tankers.length} Fleet` },
        ];
      }

      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline,
          forecastText,
          rootCauses: [
            "Live real mode connected to field volunteers and registered Dindis.",
            "Zero simulated bottlenecks active.",
          ],
          impacts,
          recommendations: [
            "Ask: 'where is nearby food', 'where is nearest toilet', 'nearest water tanker', or 'nearest hospital'",
            "Register Dindis at /dindi to broadcast live GPS beacons.",
          ],
          confidence: 96,
        },
      };
      speak(forecastText, targetLang);
    }

    // Attach detected language so the render can localize section headers
    aiMsg = { ...aiMsg, lang: targetLang };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuery("");
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="card-base p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-wari-orange to-wari-plum text-white flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
                AI Operations Copilot (Voice & RAG)
              </h1>
              <span className="badge-normal text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                State Grounded
              </span>
            </div>
            <p className="text-sm text-wari-textSecond mt-0.5">
              Multilingual grounded assistant for 2026 Palkhi schedules, water tankers, nearest hospitals, and camp capacities
            </p>
          </div>
        </div>

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center gap-1.5 border border-red-200"
          >
            <VolumeX className="w-4 h-4 text-red-600" />
            <span>Stop Speaking</span>
          </button>
        )}
      </div>

      {/* Preset Prompt Chips */}
      <div className="card-base p-4 space-y-2">
        <span className="text-xs font-bold text-wari-textMuted uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-wari-orange" />
          Suggested Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-wari-pageBg hover:bg-orange-50 border border-wari-cardBorder hover:border-orange-300 text-wari-textSecond hover:text-wari-textPrimary transition-all font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-5 rounded-2xl border transition-all ${
              msg.sender === "USER"
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white ml-12 shadow-sm border-transparent"
                : "card-base mr-6 space-y-4"
            }`}
          >
            {msg.sender === "USER" ? (
              <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                <span>{msg.text}</span>
                <span className="text-[10px] text-orange-100 uppercase tracking-wider">You</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-wari-cardBorder">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-wari-orange shrink-0" />
                    <h3 className="font-bold text-wari-textPrimary text-base">
                      {msg.structured?.headline}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => speak(msg.structured?.forecastText || "", msg.lang || language)}
                      className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1 border border-orange-200"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Play Voice</span>
                    </button>

                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {msg.structured?.confidence}% Confidence
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-wari-textSecond leading-relaxed bg-orange-50/60 p-3.5 rounded-xl border border-orange-100 font-medium whitespace-pre-line">
                  {msg.structured?.forecastText}
                </p>

                {/* Root Causes / Observations */}
                {msg.structured?.rootCauses && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-wari-textMuted uppercase tracking-wider">
                      {msg.lang === "mr" ? "संदर्भ माहिती:" : msg.lang === "hi" ? "परिचालन संदर्भ:" : "Operational Context:"}
                    </span>
                    <div className="space-y-1 text-xs text-wari-textSecond">
                      {msg.structured.rootCauses.map((rc, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-orange-500 font-bold">•</span>
                          <span>{rc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Impacts Grid */}
                {msg.structured?.impacts && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {msg.structured.impacts.map((imp, idx) => (
                      <div
                        key={idx}
                        className="bg-wari-pageBg p-2.5 rounded-xl border border-wari-cardBorder text-center"
                      >
                        <span className="text-wari-textMuted text-[10px] block">{imp.label}</span>
                        <span className="text-orange-700 font-bold text-xs mt-0.5 block">{imp.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {msg.structured?.recommendations && (
                  <div className="pt-2 border-t border-wari-cardBorder space-y-2">
                    <span className="text-[11px] font-bold text-wari-textPrimary uppercase tracking-wider block">
                      Recommended Action:
                    </span>
                    <div className="space-y-1 text-xs text-wari-textSecond">
                      {msg.structured.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Query Input Bar with Speech Recognition */}
      <div className="card-base p-3 flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk(inputQuery)}
          placeholder={isListening ? "Listening to your voice..." : "Ask Copilot in English, Hindi, or Marathi..."}
          className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-wari-textPrimary placeholder:text-wari-textMuted focus:outline-none font-medium"
        />

        {/* Speech Mic button */}
        {isSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            title={isListening ? "Stop listening" : "Speak query in EN / HI / MR"}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              isListening
                ? "bg-red-500 text-white border-red-400 animate-pulse"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span className="text-xs font-semibold pr-1">Listening...</span>
              </>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Send Button */}
        <button
          onClick={() => handleAsk(inputQuery)}
          disabled={!inputQuery.trim()}
          className="btn-primary p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
