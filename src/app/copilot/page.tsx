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
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

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
    "What is the official 2026 Palkhi & Ringan schedule?",
    "When is the Katewadi & Akluj Ringan 2026?",
    "Why is CP4 becoming dangerous?",
    "What will happen if we do nothing?",
    "Which camp will overflow next?",
    "Where should I send the next water tanker?",
  ],
  hi: [
    "2026 पालखी और रिंगण का पूरा शेड्यूल क्या है?",
    "अकलूज और काटेवाडी रिंगण 2026 कब है?",
    "CP4 खतरनाक क्यों हो रहा है?",
    "अगर कुछ नहीं किया तो क्या होगा?",
    "कौन सा शिविर अगला भर जाएगा?",
    "अगला पानी का टैंकर कहाँ भेजें?",
  ],
  mr: [
    "अधिकृत २०२६ पालखी आणि रिंगण वेळापत्रक काय आहे?",
    "काटेवाडी आणि अकलूज रिंगण २०२६ कधी आहे?",
    "CP4 धोकादायक का होत आहे?",
    "काही केले नाही तर काय होईल?",
    "कोणता तळ पुढे भरेल?",
    "पुढील पाण्याचा टँकर कुठे पाठवावा?",
  ],
};

export default function CopilotPage() {
  const { state, executeFullMitigation, isMitigated } = useSimulation();
  const { t, language } = useLanguage();
  const { transcript, isListening, isSupported, startListening, stopListening, reset } =
    useSpeechRecognition();

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "m-1",
      sender: "WARIOS_AI",
      structured: {
        headline: "Active Operational Advisory: Checkpoint 4 Chokepoint",
        forecastText:
          "Checkpoint 4 (Dive Ghat Apex) is projected to reach 97% capacity (10,000 threshold) in 43 minutes if no bypass intervention is executed.",
        rootCauses: [
          "Dindi #14 walking speed dropped 21% (3.2 km/h) on the wet 14% mountain incline.",
          "Precipitation radar logged 18mm/h unseasonal rainfall across the Dive Ghat sector.",
          "Downstream Camp 6 (Saswad) intake queue operating at 120% capacity, impeding flow egress.",
        ],
        impacts: [
          { label: "Camp 6 Overcapacity", value: "+21% Surge" },
          { label: "Medical ICU Load", value: "+14% Stress" },
          { label: "Water Depletion Risk", value: "34 Minutes Left" },
        ],
        recommendations: [
          "1. Divert Dindi #14 to Bypass Route B (East Saswad Link).",
          "2. Mobilize 5 specialized traffic volunteers to Dive Ghat Apex.",
          "3. Dispatch Water Tanker T-03 (12,000L) from Hub 2 to Camp 6.",
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

    let aiMsg: MessageItem;
    const lower = query.toLowerCase();

    if (
      lower.includes("code") ||
      lower.includes("passcode") ||
      lower.includes("कोड") ||
      lower.includes("dindi-") ||
      lower.includes("live-gps") ||
      lower.includes("phone gps") ||
      lower.includes("locate my dindi") ||
      lower.includes("माझी दिंडी")
    ) {
      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline:
            language === "mr"
              ? "दिंडी पासकोड व थेट GPS शोध प्रणाली"
              : language === "hi"
              ? "दिंडी पासकोड एवं लाइव GPS खोज प्रणाली"
              : "Dindi Passcode & Live GPS Locator Intelligence",
          forecastText:
            language === "mr"
              ? "प्रत्येक दिंडीसाठी स्वतंत्र सांकेतिक कोड तयार केला आहे. हॅकथॉन प्रात्यक्षिकासाठी 'LIVE-GPS-2026' हा विशेष कोड प्रविष्ट केल्यास आपल्या फोनचे उपग्रह GPS थेट कार्यान्वित होते."
              : language === "hi"
              ? "प्रत्येक दिंडी के लिए अद्वितीय कोड उपलब्ध है। हैकाथॉन लाइव डेमो के लिए 'LIVE-GPS-2026' कोड दर्ज करने पर आपके फोन का लाइव GPS मानचित्र पर स्ट्रीम होता है।"
              : "Individual passcode access is configured for every Dindi. For live Hackathon testing, code 'LIVE-GPS-2026' streams your actual phone device GPS coordinates directly onto OpenStreetMap in real time.",
          rootCauses: [
            "⭐ Special Hackathon Phone Live GPS Code: LIVE-GPS-2026",
            "Leading Front Dindi: DINDI-F01 (Sitole Deshmukh — Dive Ghat Apex)",
            "Center Chariot: RATH-MAULI (Sacred Paduka of Sant Dnyaneshwar)",
            "Tukaram Maharaj Cohort: DINDI-14 (Dehukar — 38,000 pilgrims)",
          ],
          impacts: [
            { label: "Hackathon Live Code", value: "LIVE-GPS-2026" },
            { label: "Active Tracking", value: "Real-Time Satellite Fix" },
            { label: "Status", value: "Ready to Broadcast" },
          ],
          recommendations: [
            language === "mr"
              ? "आपला दिंडी कोड 'दिंडी ट्रॅकर' टॅबमध्ये किंवा वर दिलेल्या कोड शोध पट्टीमध्ये प्रविष्ट करा."
              : "Enter your Dindi code on the 'Dindi Tracker' page or top navigation bar to lock telemetry.",
          ],
          confidence: 100,
        },
      };
    } else if (
      lower.includes("2026") ||
      lower.includes("schedule") ||
      lower.includes("itinerary") ||
      lower.includes("ringan") ||
      lower.includes("रिंगण") ||
      lower.includes("वेळापत्रक") ||
      lower.includes("शेड्यूल") ||
      lower.includes("katewadi") ||
      lower.includes("काटेवाडी") ||
      lower.includes("akluj") ||
      lower.includes("अकलूज") ||
      lower.includes("wakhari") ||
      lower.includes("वाखरी") ||
      lower.includes("dehu") ||
      lower.includes("alandi")
    ) {
      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline:
            language === "mr"
              ? "अधिकृत २०२६ वारी पालखी आणि रिंगण वेळापत्रक"
              : language === "hi"
              ? "आधिकारिक 2026 वारी पालखी और रिंगण कार्यक्रम"
              : "Official 2026 Wari Palkhi & Ringan Schedule Intelligence",
          forecastText:
            language === "mr"
              ? "संत तुकाराम महाराज पालखी ११ जुलै २०२६ रोजी देहूहून आणि संत ज्ञानेश्वर माउली पालखी १२ जुलै २०२६ रोजी आळंदीहून प्रस्थान करेल. दोन्हींचे पंढरपुरात आगमन २८ जुलै २०२६ रोजी होईल व २९ जुलै रोजी आषाढी एकादशी महापूजा संपन्न होईल."
              : language === "hi"
              ? "संत तुकाराम महाराज पालखी 11 जुलाई 2026 को देहू से और संत ज्ञानेश्वर माउली पालखी 12 जुलाई 2026 को आलंदी से प्रस्थान करेगी। दोनों पालखियों का पंढरपुर आगमन 28 जुलाई 2026 को होगा और 29 जुलाई को आषाढ़ी एकादशी महापूजा होगी।"
              : "Sant Tukaram Maharaj Palkhi departs Dehu on 11-Jul-2026; Sant Dnyaneshwar Mauli Palkhi departs Alandi on 12-Jul-2026 (8 PM). Both arrive in Pandharpur on 28-Jul-2026 with Ashadhi Ekadashi Mahapuja on 29-Jul-2026.",
          rootCauses: [
            language === "mr"
              ? "काटेवाडी रिंगण: २० जुलै २०२६ (शेळ्या-मेंढ्यांचे पारंपरिक रिंगण)."
              : "Katewadi Ringan: 20-Jul-2026 (Traditional Goat & Sheep Ringan).",
            language === "mr"
              ? "अकलूज गोल रिंगण व नीरवसमाधी: २४ जुलै २०२६ (माने विद्यालय मैदान)."
              : "Akluj Gol Ringan & Niravsamadhi: 24-Jul-2026 (Mane Vidyalaya Ground).",
            language === "mr"
              ? "वाखरी महा रिंगण: २७ जुलै २०२६ (दोन्ही पालख्यांचा भव्य संगम)."
              : "Wakhari Maha Ringan: 27-Jul-2026 (Grand convergence before Pandharpur entry).",
          ],
          impacts: [
            { label: "Katewadi Ringan", value: "20-Jul-2026" },
            { label: "Akluj Gol Ringan", value: "24-Jul-2026" },
            { label: "Ashadhi Ekadashi", value: "29-Jul-2026" },
          ],
          recommendations: [
            language === "mr"
              ? "तपशीलवार दिवसनिहाय थांबे आणि नकाशा 'दिंडी आणि पालखी' टॅबमध्ये उपलब्ध आहेत."
              : "Detailed daily halts, camp locations, and GPS tracking are active in the Dindi & Map tabs.",
          ],
          confidence: 99,
        },
      };
    } else if (
      lower.includes("nothing") ||
      lower.includes("counterfactual") ||
      lower.includes("कुछ नहीं") ||
      lower.includes("काही केले नाही")
    ) {
      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline:
            language === "mr"
              ? "काही कृती न केल्यास होणारा परिणाम (Counterfactual Analysis)"
              : language === "hi"
              ? "कोई कार्रवाई न करने पर परिणाम (Counterfactual Analysis)"
              : "Counterfactual Analysis: Outcome If No Action Is Taken",
          forecastText:
            language === "mr"
              ? "जर हस्तक्षेप केला नाही, तर CP4 घनता 45 मिनिटांत 101% होईल आणि घाटात गंभीर कोंडी निर्माण होईल."
              : language === "hi"
              ? "यदि कोई हस्तक्षेप नहीं किया गया, तो 45 मिनट में CP4 घनत्व 101% हो जाएगा और गंभीर गतिरोध पैदा होगा।"
              : "If no intervention is authorized, CP4 density will reach 101% catastrophic gridlock in 45 minutes, creating severe compression waves on the mountain incline.",
          rootCauses: [
            language === "mr"
              ? "दिंडी १४ मधील ३८,००० वारकरी दिंडी ७ च्या प्रवाहात अडकतील."
              : language === "hi"
              ? "दिंडी 14 के 38,000 तीर्थयात्री दिंडी 7 के प्रवाह में फंस जाएंगे।"
              : "38,000 pilgrims from Dindi #14 will collide with oncoming Dindi #7 flow.",
            language === "mr"
              ? "तळ ६ मधील पाणी २७ मिनिटांत संपेल."
              : language === "hi"
              ? "शिविर 6 का पानी 27 मिनट में समाप्त हो जाएगा।"
              : "Camp 6 water reserves will completely deplete in 27 minutes.",
            language === "mr"
              ? "सासवड ग्रामीण रुग्णालयात अतिदक्षता खाटांवर ८९% ताण येईल."
              : language === "hi"
              ? "सासवड ग्रामीण अस्पताल में आईसीयू बेड पर 89% दबाव आएगा।"
              : "Saswad Rural Hospital will experience 89% ICU bed surge.",
          ],
          impacts: [
            { label: "CP4 Density", value: "101% (Gridlock)" },
            { label: "Camp 6 Occupancy", value: "134% (Overrun)" },
            { label: "Water Stock", value: "0 min (Depleted in 27m)" },
          ],
          recommendations: [
            language === "mr"
              ? "तातडीची कारवाई: गर्दी नियंत्रण आणि बायपास मार्ग सुरू करा."
              : language === "hi"
              ? "तत्काल कार्रवाई: भीड़ नियंत्रण और बाईपास मार्ग शुरू करें।"
              : "Immediate action required: Execute multi-agency response to avert hazardous crowd compression.",
          ],
          confidence: 95,
          showCounterfactual: true,
        },
      };
    } else if (
      lower.includes("tanker") ||
      lower.includes("water") ||
      lower.includes("पानी") ||
      lower.includes("पाणी") ||
      lower.includes("टँकर") ||
      lower.includes("टैंकर")
    ) {
      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline:
            language === "mr"
              ? "जल लॉजिस्टिक्स वाटप शिफारस"
              : language === "hi"
              ? "जल रसद आवंटन सलाह"
              : "Water Logistics Allocation Advice",
          forecastText:
            language === "mr"
              ? "तळ ६ (सासवड पालखी मैदान) मध्ये १८% पाणी शिल्लक आहे. पाण्याचा वापर ४२० लिटर/मिनिट असून ३४ मिनिटांत पाणी संपेल."
              : language === "hi"
              ? "शिविर 6 (सासवड पालखी मैदान) में केवल 18% पानी बचा है। 420 लीटर/मिनट की दर से 34 मिनट में पानी समाप्त हो जाएगा।"
              : "Camp 6 (Saswad Palkhi Maidan) has 18% water stock remaining with an active consumption burn rate of 420 L/min. Depletion will occur in 34 minutes.",
          rootCauses: [
            "54,000 pilgrims at Camp 6 (120% capacity) consuming 420 L/min.",
            "Nearest available unit is Tanker T-03 (12,000L) stationed at Hub 2 (1.8km away).",
          ],
          impacts: [
            { label: "Hub 2 Distance", value: "1.8 km" },
            { label: "Estimated Transit", value: "12 min" },
            { label: "Buffer Added", value: "+44 minutes" },
          ],
          recommendations: [
            language === "mr"
              ? "टँकर T-03 ताबडतोब हब २ वरून तळ ६ कडे रवाना करा."
              : language === "hi"
              ? "टैंकर T-03 को तुरंत हब 2 से शिविर 6 की ओर रवाना करें।"
              : "Dispatch Tanker T-03 immediately from Hub 2 to Camp 6 Tanker Bay #1.",
          ],
          confidence: 88,
        },
      };
    } else if (
      lower.includes("camp") ||
      lower.includes("overflow") ||
      lower.includes("शिविर") ||
      lower.includes("तळ")
    ) {
      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline:
            language === "mr"
              ? "तळ क्षमता व तात्पुरता निवारा वाटप"
              : language === "hi"
              ? "शिविर क्षमता और आश्रय आवंटन"
              : "Camp Capacity & Shelter Allocation",
          forecastText:
            "Camp 6 (Saswad) is currently at 120% capacity (54,000 pilgrims vs 45,000 capacity). Camp 3 (Dive Ghat Base) is at 90%.",
          rootCauses: [
            "Early arrivals accumulating due to rain delays on Dive Ghat pass.",
            "Backup Shelter B (Capacity 20,000) is currently on standby.",
          ],
          impacts: [
            { label: "Camp 6 Occupancy", value: "120% (Critical)" },
            { label: "Camp 3 Occupancy", value: "90% (Attention)" },
            { label: "Shelter B Space", value: "20,000 Available" },
          ],
          recommendations: [
            language === "mr"
              ? "सासवड बॅकअप शेल्टर बी (क्षमता २०,०००) त्वरित खुले करण्याचे आदेश द्या."
              : language === "hi"
              ? "सासवड बैकअप शेल्टर बी (क्षमता 20,000) तुरंत खोलने के निर्देश दें।"
              : "Authorize District Collectorate to open Saswad Backup Shelter B immediately.",
          ],
          confidence: 93,
        },
      };
    } else if (
      lower.includes("volunteer") ||
      lower.includes("स्वयंसेवक") ||
      lower.includes("सेवा")
    ) {
      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline:
            language === "mr"
              ? "स्मार्ट सेवा स्वयंसेवक तैनाती"
              : language === "hi"
              ? "स्मार्ट सेवा स्वयंसेवक तैनाती"
              : "Smart Seva Deployment Advice",
          forecastText:
            "Dive Ghat Apex (CP4) requires 5 specialized volunteers with Traffic Control and First-Aid skills to marshal Bypass B entry.",
          rootCauses: [
            "Identified 5 nearest qualified volunteers within 2.5km of CP4 Apex with >75% battery.",
          ],
          impacts: [
            { label: "Qualified Units", value: "VOL-102, 106, 110, 112, 105" },
            { label: "Mean Distance", value: "1.2 km" },
            { label: "ETA to Apex", value: "4 minutes" },
          ],
          recommendations: [
            language === "mr"
              ? "स्मार्ट सेवा मेश नेटवर्कद्वारे ५ स्वयंसेवकांना CP4 Apex कडे नियुक्त करा."
              : language === "hi"
              ? "स्मार्ट सेवा मेश नेटवर्क के माध्यम से 5 स्वयंसेवकों को CP4 Apex पर तैनात करें।"
              : "Deploy all 5 volunteers via Smart Seva mesh network to CP4 Apex.",
          ],
          confidence: 96,
        },
      };
    } else {
      aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "WARIOS_AI",
        structured: {
          headline:
            language === "mr"
              ? `कार्यचालन स्थिती विश्लेषण ('${query}')`
              : language === "hi"
              ? `संचालन स्थिति विश्लेषण ('${query}')`
              : "Operational Status Summary",
          forecastText: `Assessment for '${query}': WariOS identifies the Dive Ghat mountain chokepoint as the primary systemic risk across the corridor.`,
          rootCauses: [
            "Dindi #14 speed compression wave (3.2 km/h).",
            "18mm/h rainfall reducing incline traction by 35%.",
          ],
          impacts: [
            { label: "System Risk", value: "Critical" },
            { label: "Corridor Load", value: "88% Capacity" },
          ],
          recommendations: [
            language === "mr"
              ? "मार्ग सुरळीत करण्यासाठी बहु-एजन्सी कृती योजना अंमलात आणा."
              : language === "hi"
              ? "मार्ग सामान्य करने के लिए बहु-एजेंसी कार्य योजना निष्पादित करें।"
              : "Execute multi-agency response plan to restore nominal corridor throughput.",
          ],
          confidence: 91,
        },
      };
    }

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuery("");
    reset();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-base p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-wari-orange to-wari-plum text-white flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
              {t("copilot.title")}
            </h1>
            <p className="text-sm text-wari-textSecond mt-0.5">
              Multi-lingual Telemetry Grounded Copilot (Hindi, Marathi, English)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-live flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            State Grounded
          </span>
        </div>
      </div>

      {/* Suggested Inquiries */}
      <div className="card-base p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-wari-textMuted">
          <HelpCircle className="w-4 h-4 text-wari-orange" />
          <span>Suggested Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="px-3.5 py-2 rounded-xl bg-wari-pageBg hover:bg-wari-orangeLight hover:border-orange-200 text-xs font-medium text-wari-textPrimary border border-wari-cardBorder transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {msg.sender === "USER" ? (
              <div className="flex justify-end">
                <div className="bg-wari-orange text-white px-5 py-3 rounded-2xl max-w-lg text-sm font-medium shadow-sm">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div className="card-base p-6 space-y-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-wari-cardBorder">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-wari-orange" />
                    <span className="text-sm font-bold text-wari-textPrimary">
                      {msg.structured?.headline}
                    </span>
                  </div>
                  <span className="text-xs text-wari-textMuted font-mono">
                    Confidence: {msg.structured?.confidence}%
                  </span>
                </div>

                {/* Forecast Statement */}
                <p className="text-sm text-wari-textPrimary leading-relaxed font-semibold">
                  {msg.structured?.forecastText}
                </p>

                {/* Root Causes */}
                <div className="bg-wari-pageBg rounded-xl p-4 border border-wari-cardBorder space-y-2">
                  <span className="text-xs font-bold text-wari-textMuted uppercase tracking-wider block">
                    Root Causes:
                  </span>
                  <div className="space-y-1.5 text-xs text-wari-textSecond">
                    {msg.structured?.rootCauses.map((rc, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="text-wari-orange font-bold">•</span>
                        <span>{rc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cascading Impact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {msg.structured?.impacts.map((imp, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-xl border border-wari-cardBorder text-center shadow-sm"
                    >
                      <span className="text-wari-textMuted text-xs block mb-1">{imp.label}</span>
                      <span className="text-orange-600 font-bold text-sm">{imp.value}</span>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="pt-3 border-t border-wari-cardBorder space-y-3">
                  <div>
                    <span className="text-xs font-bold text-wari-textPrimary block mb-1.5">
                      Recommended Operational Response:
                    </span>
                    <div className="space-y-1 text-xs text-wari-textSecond">
                      {msg.structured?.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-wari-orange font-bold">→</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {!isMitigated ? (
                      <button
                        onClick={executeFullMitigation}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Execute Recommended Plan</span>
                      </button>
                    ) : (
                      <div className="badge-normal flex items-center gap-2 px-4 py-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Plan Executed & Verified</span>
                      </div>
                    )}
                  </div>
                </div>
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
          placeholder={isListening ? t("copilot.listening") : t("copilot.placeholder")}
          className="flex-1 bg-transparent px-4 py-2 text-sm text-wari-textPrimary placeholder:text-wari-textMuted focus:outline-none"
        />

        {/* Speech Mic button */}
        {isSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            title={isListening ? "Stop listening" : t("copilot.micTip")}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              isListening
                ? "bg-red-500 text-white border-red-400 animate-pulse"
                : "bg-wari-pageBg text-wari-textSecond hover:text-wari-orange border-wari-cardBorder hover:border-wari-orange"
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
