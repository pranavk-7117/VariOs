"use client";

import { useState, useCallback, useEffect } from "react";
import { useLiveGps } from "@/context/LiveGpsContext";
import { useSimulation } from "@/context/SimulationContext";
import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { parseDindiRegistrationSpeech } from "@/lib/speech-intents";

type Stage = "IDLE" | "FORM" | "REGISTERING" | "ACTIVE";

interface RegistrationResult {
  dindiId: string;
  passcode: string;
  dindiNumber: number;
  name: string;
  leader: string;
  count: number;
}

export default function DindiLeaderRegisterCard() {
  const { coords, isTracking, toggleTracking, setBoundDindiId } = useLiveGps();
  const { registerDynamicDindi, updateLiveDindiLocation, requestLeaderAssistance, addEventLog } = useSimulation();
  const { transcript, isListening, isSupported, startListening, reset } = useSpeechRecognition();

  const [stage, setStage] = useState<Stage>("IDLE");
  const [form, setForm] = useState({
    leader: "",
    mandal: "",
    count: "100",
    route: "Sant Dnyaneshwar Maharaj",
  });
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [assistanceSent, setAssistanceSent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [livePos, setLivePos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!transcript || stage !== "FORM") return;
    const parsed = parseDindiRegistrationSpeech(transcript);
    setForm((prev) => ({
      ...prev,
      leader: parsed.leader || prev.leader,
      mandal: parsed.mandal || prev.mandal,
      count: parsed.count || prev.count,
    }));
  }, [transcript, stage]);

  useEffect(() => {
    if (coords && stage === "ACTIVE") {
      setLivePos({ lat: coords.lat, lng: coords.lng });
      if (result) {
        updateLiveDindiLocation(result.dindiId, coords.lat, coords.lng, coords.speedKmH);
      }
    }
  }, [coords, stage, result, updateLiveDindiLocation]);

  const startRegistration = useCallback(() => {
    if (!form.leader.trim() || !form.mandal.trim()) {
      alert("Please enter Leader Name and Mandal name.");
      return;
    }
    setStage("REGISTERING");

    const doRegister = (lat: number, lng: number) => {
      const res = registerDynamicDindi({
        name: form.mandal,
        leader: form.leader,
        count: parseInt(form.count, 10) || 100,
        route: form.route,
        lat,
        lng,
      });
      setResult({
        ...res,
        name: form.mandal,
        leader: form.leader,
        count: parseInt(form.count, 10) || 100,
      });
      setBoundDindiId(form.mandal);
      setLivePos({ lat, lng });
      setStage("ACTIVE");
      if (!isTracking) toggleTracking();
    };

    if (!navigator.geolocation) {
      doRegister(17.6731, 75.3287);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => doRegister(pos.coords.latitude, pos.coords.longitude),
      () => doRegister(17.6731, 75.3287),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [form, registerDynamicDindi, isTracking, toggleTracking, setBoundDindiId]);

  const sendAssistance = (type: "WATER" | "MEDICAL" | "HALT") => {
    const posStr = livePos
      ? `Lat ${livePos.lat.toFixed(5)}, Lng ${livePos.lng.toFixed(5)}`
      : "GPS position unavailable";
    const details = `From leader ${result?.leader} (${result?.name}) at ${posStr}`;
    requestLeaderAssistance(type, details);
    addEventLog({
      eventType: "ALERT",
      severity: type === "MEDICAL" ? "WARNING" : "INFO",
      source: "Dindi Leader Quick Action",
      description: `Leader ${result?.leader} requested ${type} assistance at ${posStr}`,
    });
    setAssistanceSent(type);
    setTimeout(() => setAssistanceSent(null), 4000);
  };

  const copyPasscode = () => {
    if (result) {
      navigator.clipboard.writeText(result.passcode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (stage === "IDLE") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-md mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🚩</span>
          <div>
            <h2 className="text-lg font-bold text-orange-800">दिंडी नेते नोंदणी</h2>
            <p className="text-sm text-orange-600">Dindi Leader Self-Registration &amp; Live GPS Broadcast</p>
          </div>
        </div>
        <p className="text-sm text-stone-600 mb-4">
          Are you a Dindi leader or volunteer? Register your Dindi in one tap. Your phone GPS will live-track your
          position on the WariOS tactical map so authorities and pilgrims can always find you.
        </p>
        <button
          onClick={() => setStage("FORM")}
          className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-semibold py-3 px-4 transition-all text-sm shadow"
        >
          🚀 Register as Dindi Leader — माझी दिंडी सुरू करा
        </button>
      </div>
    );
  }

  if (stage === "FORM") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h2 className="text-base font-bold text-orange-800">Dindi Registration Form</h2>
          </div>
          <button onClick={() => setStage("IDLE")} className="text-xs text-stone-500 hover:text-stone-700 underline">
            Cancel
          </button>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl bg-white border border-orange-200 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-orange-900">Voice Fill</p>
              <p className="text-[11px] text-stone-600">
                Say: "My name is Pranav, mandal name Dindi A, count 500" or Hindi/Marathi equivalents.
              </p>
              {transcript && <p className="mt-1 text-[11px] text-emerald-700 font-medium">Heard: {transcript}</p>}
            </div>
            <button
              type="button"
              onClick={isListening ? reset : startListening}
              disabled={!isSupported}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
                isListening
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              } disabled:bg-stone-100 disabled:text-stone-400`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isListening ? "Listening" : "Speak Details"}
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1">Leader / Volunteer Name *</label>
            <input
              type="text"
              placeholder="e.g. ह.भ.प. Sopan Maharaj"
              value={form.leader}
              onChange={(e) => setForm((f) => ({ ...f, leader: e.target.value }))}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1">Dindi / Mandal Name *</label>
            <input
              type="text"
              placeholder="e.g. Shri Vitthal Bhakti Mandal, Pune"
              value={form.mandal}
              onChange={(e) => setForm((f) => ({ ...f, mandal: e.target.value }))}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">Pilgrim Count</label>
              <input
                type="number"
                min={1}
                max={5000}
                value={form.count}
                onChange={(e) => setForm((f) => ({ ...f, count: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">Palkhi Route</label>
              <select
                value={form.route}
                onChange={(e) => setForm((f) => ({ ...f, route: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="Sant Dnyaneshwar Maharaj">Mauli (Alandi)</option>
                <option value="Sant Tukaram Maharaj">Tukaram (Dehu)</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
            📍 <strong>GPS Permission Required:</strong> Your phone live location will be shared with WariOS to track
            your Dindi on the tactical map. Your data stays private and is used only for pilgrimage coordination.
          </div>
        </div>

        <button
          onClick={startRegistration}
          className="mt-4 w-full rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold py-3 px-4 transition-all text-sm shadow"
        >
          🚀 Register &amp; Broadcast Live Phone GPS
        </button>
      </div>
    );
  }

  if (stage === "REGISTERING") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-md mb-6 text-center">
        <div className="animate-pulse text-4xl mb-3">📡</div>
        <p className="text-orange-800 font-semibold">Acquiring GPS signal...</p>
        <p className="text-xs text-stone-500 mt-1">Allow location access in the browser prompt</p>
      </div>
    );
  }

  if (stage === "ACTIVE" && result) {
    return (
      <div className="rounded-2xl border border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-md mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white text-xl shadow">
            🚩
          </span>
          <div>
            <p className="font-bold text-green-800 text-sm">LIVE — Dindi Registered &amp; Broadcasting GPS</p>
            <p className="text-xs text-green-600">Visible on WariOS Tactical Map</p>
          </div>
          <span className="ml-auto relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
          </span>
        </div>

        <div className="rounded-xl bg-white border border-green-200 p-4 mb-4 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-stone-500">Dindi / Mandal</span>
            <span className="font-semibold text-stone-800">{result.name}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-500">Leader</span>
            <span className="font-semibold text-stone-800">{result.leader}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-500">Pilgrims</span>
            <span className="font-semibold text-stone-800">~{result.count}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-500">Live GPS</span>
            <span className="font-mono text-green-700 text-xs">
              {livePos ? `${livePos.lat.toFixed(5)}, ${livePos.lng.toFixed(5)}` : "Acquiring..."}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-orange-600 text-white p-4 mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">Your Dindi Passcode</p>
          <p className="text-3xl font-bold font-mono tracking-wider">{result.passcode}</p>
          <p className="text-xs opacity-80 mt-1">Share this with your pilgrims to let them track your Dindi</p>
          <button
            onClick={copyPasscode}
            className="mt-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-1.5 transition-all"
          >
            {copied ? "✅ Copied!" : "📋 Copy Passcode"}
          </button>
        </div>

        <p className="text-xs font-bold text-stone-600 uppercase tracking-wide mb-2">Leader Quick Actions</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => sendAssistance("WATER")}
            className="flex flex-col items-center gap-1 rounded-xl border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-800 py-3 px-2 text-xs font-semibold transition-all"
          >
            <span className="text-xl">💧</span>
            <span>Water Tanker</span>
            <span className="text-xs opacity-70 font-normal">Request</span>
          </button>
          <button
            onClick={() => sendAssistance("MEDICAL")}
            className="flex flex-col items-center gap-1 rounded-xl border-2 border-red-300 bg-red-50 hover:bg-red-100 active:scale-95 text-red-800 py-3 px-2 text-xs font-semibold transition-all"
          >
            <span className="text-xl">🚑</span>
            <span>Medical Aid</span>
            <span className="text-xs opacity-70 font-normal">Emergency</span>
          </button>
          <button
            onClick={() => sendAssistance("HALT")}
            className="flex flex-col items-center gap-1 rounded-xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-800 py-3 px-2 text-xs font-semibold transition-all"
          >
            <span className="text-xl">⛺</span>
            <span>Mark Halt</span>
            <span className="text-xs opacity-70 font-normal">Rest / Lunch</span>
          </button>
        </div>

        {assistanceSent && (
          <div className="rounded-lg bg-green-100 border border-green-300 p-2 text-center text-xs text-green-800 font-semibold animate-pulse mb-3">
            ✅ Request sent to WariOS Control Room!
          </div>
        )}

        <div className="text-xs text-stone-500 text-center">
          Dindi #{result.dindiNumber} is now visible on the{" "}
          <a href="/" className="text-orange-600 underline">Tactical Map</a>{" "}
          and the{" "}
          <a href="/dindis" className="text-orange-600 underline">Dindi Board</a>
        </div>
      </div>
    );
  }

  return null;
}
