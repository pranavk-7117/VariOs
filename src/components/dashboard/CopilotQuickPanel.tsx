"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Zap, Sliders, CheckCircle2, HelpCircle, Mic, MicOff, ArrowRight } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

const PROMPT_CHIPS: Record<string, string[]> = {
  en: [
    "Are any live Dindis overcrowded?",
    "Where is the nearest rest place?",
    "Where should I send water?",
    "Which Dindis are at the same location?",
  ],
  hi: [
    "Are any live Dindis overcrowded?",
    "Where is the nearest rest place?",
    "Where should I send water?",
    "Which Dindis are at the same location?",
  ],
  mr: [
    "Are any live Dindis overcrowded?",
    "Where is the nearest rest place?",
    "Where should I send water?",
    "Which Dindis are at the same location?",
  ],
};

export const CopilotQuickPanel: React.FC = () => {
  const { state, executeFullMitigation, isMitigated } = useSimulation();
  const { t, language } = useLanguage();
  const { transcript, isListening, isSupported, startListening, stopListening } =
    useSpeechRecognition();
  const [query, setQuery] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const canUseSpeech = hasMounted && isSupported;
  const isLiveMode = !state.isSimulating;
  const liveDindis = state.dindis.filter((dindi) => dindi.isCustomRegistered);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (transcript) setQuery(transcript);
  }, [transcript]);

  const chips = PROMPT_CHIPS[language] ?? PROMPT_CHIPS.en;

  return (
    <div className="card-base flex flex-col h-full">
      <div className="px-5 py-4 border-b border-wari-cardBorder flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-wari-orange to-wari-plum flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-wari-textPrimary">{t("copilot.title")}</h3>
            <p className="text-xs text-wari-textMuted">Telemetry analysis and decision assistance</p>
          </div>
        </div>
        <Link
          href="/copilot"
          className="p-1.5 rounded-xl bg-wari-pageBg hover:bg-wari-orange/10 text-wari-textSecond border border-wari-cardBorder transition-colors"
          title="Open Full Copilot"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div
          className={`p-4 rounded-xl border transition-all ${
            isLiveMode
              ? "bg-emerald-50 border-emerald-200"
              : isMitigated
              ? "bg-emerald-50 border-emerald-200"
              : "bg-wari-orangeLight border-orange-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isLiveMode || isMitigated ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
            }`}>
              {isLiveMode ? "Live Data Grounded" : isMitigated ? "Mitigation Verified" : "Active Risk Assessment"}
            </span>
            <span className="text-xs text-wari-textMuted">Confidence: {isLiveMode ? "94" : "91"}%</span>
          </div>

          <h4 className="text-sm font-bold text-wari-textPrimary leading-snug mb-3">
            {isLiveMode
              ? liveDindis.length > 0
                ? `${liveDindis.length} live Dindi registrations are being tracked from leader-entered counts and GPS.`
                : "Live Mode is ready. Register a Dindi to start crowd and resource calculations."
              : isMitigated
              ? "CP4 surge averted. Density normalized to 82% via Bypass Route B."
              : "Checkpoint 4 is projected to reach 97% capacity in 43 minutes."}
          </h4>

          <div className="bg-white rounded-lg p-3 border border-wari-cardBorder space-y-1.5 text-xs mb-3">
            <span className="font-bold text-wari-textSecond block">
              {isLiveMode ? "Live Inputs:" : "Contributing Factors:"}
            </span>
            <div className="space-y-1 text-wari-textSecond">
              {isLiveMode ? (
                <>
                  <div>- Leader-entered Dindi count: {state.totalPilgrims.toLocaleString()}</div>
                  <div>- Registered live Dindis: {liveDindis.length}</div>
                  <div>- Copilot answers use live state before demo archive data</div>
                </>
              ) : (
                <>
                  <div>- Dindi #14 speed -21% (3.2 km/h) on wet incline</div>
                  <div>- 18mm/h rainfall causing queue compression at Dive Ghat</div>
                  <div>- Camp 6 intake operating at 120% capacity</div>
                </>
              )}
            </div>
          </div>

          {!isLiveMode && (
            <div className="flex gap-2">
              {!isMitigated ? (
                <button
                  onClick={executeFullMitigation}
                  className="btn-primary flex-1 flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {t("brief.executeResponse")}
                </button>
              ) : (
                <div className="flex-1 py-2 px-4 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Plan Executed
                </div>
              )}
              <Link href="/simulator">
                <button className="btn-secondary flex items-center gap-1.5 px-3">
                  <Sliders className="w-3.5 h-3.5 text-wari-orange" />
                  What-If
                </button>
              </Link>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-wari-textMuted mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-wari-orange" />
            <span>Quick Inquiry{canUseSpeech ? ` - ${t("copilot.micTip")}` : ""}</span>
          </div>

          {canUseSpeech && (
            <div className="flex items-center gap-2 mb-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("copilot.placeholder")}
                className="input-base text-xs"
              />
              <button
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                title={isListening ? t("copilot.listening") : "Hold to speak"}
                className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-500 border-red-300 text-white animate-pulse"
                    : "bg-wari-pageBg border-wari-cardBorder text-wari-textSecond hover:border-wari-orange"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip, idx) => (
              <Link
                key={idx}
                href={`/copilot?q=${encodeURIComponent(chip)}`}
                className="px-3 py-1.5 rounded-xl bg-wari-pageBg hover:bg-wari-orangeLight hover:border-orange-200 text-xs text-wari-textSecond border border-wari-cardBorder transition-all"
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
