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
  const q = query.toLowerCase();

  // Marathi Devanagari and Romanized keywords
  if (
    /[\u0900-\u097F]/.test(query) &&
    /आहे|कुठे|जवळचे|वेळापत्रक|तळ|रिंगण|रुग्णालय|टँकर|पाणी|वारकरी|संख्या|सांगा/.test(query)
  ) {
    return "mr";
  }
  if (
    /\b(aahe|ahe|kuthe|javal|velapatrak|ringan|varkari|pani|panyacha|tanker|tal|shambhar|saanga|kay)\b/.test(
      q
    )
  ) {
    return "mr";
  }

  // Hindi Devanagari and Romanized / Hinglish keywords
  if (
    /[\u0900-\u097F]/.test(query) &&
    /है|कहाँ|नजदीक|नजदीकी|पानी|टैंकर|अस्पताल|शेड्यूल|शिविर|कितना|बताओ/.test(query)
  ) {
    return "hi";
  }
  if (
    /\b(kahan|kaha|hai|sabse|nazdik|nazdiki|pani|paani|tanker|aspataal|hospital|batao|kitna|shahar|kaunsa)\b/.test(
      q
    )
  ) {
    return "hi";
  }

  return defaultLang;
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
                : "Live Operations Ready. Telemetry active across 8 corridor camps, mobile water tankers, and verified hospitals.",
            rootCauses: [
              "8 Verified Corridor Camps operational with verified safe holding capacities (20k–60k).",
              "Real emergency hospitals and water tankers mapped with live GPS coordinates.",
              "Multilingual voice recognition and audio response supported in English, Hindi, and Marathi.",
            ],
            impacts: [
              { label: "Corridor Camps", value: "8 Active" },
              { label: "Registered Dindis", value: `${liveDindis.length} Live` },
              { label: "Water Reserves", value: `${state.tankers.length} Tankers` },
            ],
            recommendations: [
              "1. Ask: 'Where is the nearest water tanker?' / 'sabse nazdiki water tanker kahan hai'",
              "2. Ask: 'What is the official 2026 Palkhi & Ringan schedule?'",
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

    // ── 1. WATER TANKER INTENT ──
    if (
      /water|tanker|पानी|पाणी|टँकर|टैंकर|जल|tahn|paani|pani/.test(qLower)
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
    // ── 2. HOSPITAL & MEDICAL INTENT ──
    else if (
      /hospital|medical|doctor|ambulance|रुग्णालय|दवाखाना|अस्पताल|इलाज|डॉक्टर|रुग्ण|emergency|icu/.test(
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
          "Verified Emergency Medical Facilities:\n1. Deenanath Mangeshkar Hospital (Erandwane - 020-40151000)\n2. Sassoon General Hospital (Station Road - 020-26128000)\n3. Saswad Sub-District Hospital (Saswad - 02115-222233)\n4. Jejuri Rural Hospital (Jejuri)\nFor urgent field evacuations, dial 108 for immediate ambulance dispatch.";
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
    // ── 3. PALKHI & RINGAN SCHEDULE INTENT ──
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
    // ── 4. CAMPS & SAFE CAPACITY INTENT ──
    else if (
      /camp|halt|तळ|पडका|शिविर|थांबा|capacity|क्षमता|buffer|बफर|camp 1|camp 2|camp 3|camp 4|camp 5|camp 6|camp 7|camp 8/.test(
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
    // ── 5. VOLUNTEER DISPATCH & SEVA INTENT ──
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
    // ── 6. GENERAL LIVE OPERATIONS TELEMETRY ──
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
            "Ask about water tankers, hospitals, or camp capacities.",
            "Register Dindis at /dindi to broadcast live GPS beacons.",
          ],
          confidence: 96,
        },
      };
      speak(forecastText, targetLang);
    }

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
                      onClick={() => speak(msg.structured?.forecastText || "", language)}
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
                      Operational Context:
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
