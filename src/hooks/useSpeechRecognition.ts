"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LangKey } from "@/lib/translations";

const LANG_TO_BCP47: Record<LangKey, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
};

interface SpeechRecognitionResult {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
  speak: (text: string, langOverride?: LangKey) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionResult {
  const { language } = useLanguage();
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    stopListening();

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = LANG_TO_BCP47[language] ?? "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };

    recognition.onresult = (event: any) => {
      let finalStr = "";
      let interimStr = "";
      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalStr += item[0].transcript;
        } else {
          interimStr += item[0].transcript;
        }
      }
      if (interimStr) {
        setInterimTranscript(interimStr.trim());
      }
      if (finalStr) {
        setTranscript(finalStr.trim());
        setInterimTranscript("");
      } else if (interimStr) {
        // also set transcript for real-time reactivity
        setTranscript(interimStr.trim());
      }
    };

    recognition.onerror = (e: any) => {
      console.warn("[WariOS Speech] Recognition error", e);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.warn("[WariOS Speech] start error", err);
    }
  }, [isSupported, language, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const reset = useCallback(() => {
    stopListening();
    setTranscript("");
    setInterimTranscript("");
  }, [stopListening]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, langOverride?: LangKey) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const cleanText = text
        .replace(/[*_#`[\]()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetLang = langOverride ?? language;
      utterance.lang = LANG_TO_BCP47[targetLang] ?? "en-IN";
      utterance.rate = 0.95; // Clear pace
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = targetLang === "mr" ? "mr" : targetLang === "hi" ? "hi" : "en";
      let preferredVoice = voices.find((v) =>
        v.lang.toLowerCase().replace(/_/g, "-").startsWith(langPrefix)
      );

      // If Marathi voice is not installed in the browser/OS, fall back to Hindi or Indian English voice
      // which can phonetically pronounce Devanagari text accurately
      if (!preferredVoice && targetLang === "mr") {
        preferredVoice =
          voices.find((v) => v.lang.toLowerCase().startsWith("hi")) ||
          voices.find((v) => v.lang.toLowerCase().includes("in")) ||
          voices.find((v) => v.lang.toLowerCase().startsWith("en-in"));
      }

      if (!preferredVoice && targetLang === "hi") {
        preferredVoice =
          voices.find((v) => v.lang.toLowerCase().includes("in")) ||
          voices.find((v) => v.lang.toLowerCase().startsWith("en-in"));
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    reset,
    speak,
    isSpeaking,
    stopSpeaking,
  };
}
