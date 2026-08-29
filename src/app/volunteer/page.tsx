"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Users,
  Stethoscope,
  Building2,
  Construction,
  Phone,
  MapPin,
  Clock,
  Mic,
  MicOff,
  Send,
  ShieldAlert,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLiveGps } from "@/context/LiveGpsContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { parseReportIntent } from "@/lib/speech-intents";
import { VolunteerTask } from "@/lib/types";

export default function VolunteerPortal() {
  const { state, addEventLog, reportVolunteerIncident, updateVolunteerTask } = useSimulation();
  const { coords } = useLiveGps();
  const { transcript, isListening, isSupported, startListening, reset } = useSpeechRecognition();

  const [isAvailable, setIsAvailable] = useState(true);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "report" | "dindis" | "team">("tasks");
  const [selectedCampId, setSelectedCampId] = useState<string>("ALL");
  const [remarksByTask, setRemarksByTask] = useState<Record<string, string>>({});

  // Filter tasks by selected camp (or show all)
  const filteredTasks = state.volunteerTasks.filter((t) =>
    selectedCampId === "ALL" ? true : t.campId === selectedCampId
  );

  // Real registered Dindis
  const realDindis = state.dindis.filter((d) => d.isCustomRegistered);

  const handle1TapReport = (label: string, _emoji: string, severity: "HIGH" | "CRITICAL" | "MEDIUM") => {
    reportVolunteerIncident({
      label,
      severity,
      lat: coords?.lat,
      lng: coords?.lng,
    });

    setReportSuccess(label);
    setTimeout(() => setReportSuccess(null), 5000);
  };

  React.useEffect(() => {
    if (!transcript) return;
    const intent = parseReportIntent(transcript);
    if (!intent) return;
    const severity =
      intent === "Medical Emergency"
        ? "CRITICAL"
        : intent === "Sanitation Full" || intent === "Lost Pilgrim"
        ? "MEDIUM"
        : "HIGH";
    handle1TapReport(intent, "", severity);
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn pb-12">

      {/* ── PORTAL HEADER ── */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 p-5 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👷</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Volunteer Seva & Verification Portal</h1>
              <p className="text-xs text-purple-200">
                Ground coordination · Camps 1–6 Tasks · Resource Verification · Live Sync
              </p>
            </div>
          </div>

          {/* Availability toggle */}
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-2 self-start sm:self-auto ${
              isAvailable
                ? "bg-emerald-500 border-emerald-300 text-white shadow-sm"
                : "bg-white/10 border-white/20 text-white/70"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-white animate-ping" : "bg-gray-400"}`} />
            {isAvailable ? "🟢 ON DUTY" : "⚪ BREAK"}
          </button>
        </div>

        {/* Live GPS status */}
        {coords && (
          <div className="mt-3 text-xs text-purple-100 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="font-mono">
              {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
            </span>
            <span className="ml-auto font-semibold bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
              Accuracy ±{coords.accuracy}m · {coords.speedKmH} km/h
            </span>
          </div>
        )}
      </div>

      {/* ── CAMP 1-6 SECTOR SELECTOR ── */}
      <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-purple-700" />
            Select Your Assigned Camp Sector
          </span>
          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
            {selectedCampId === "ALL" ? "All Camps" : state.camps.find((c) => c.id === selectedCampId)?.name || selectedCampId}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCampId("ALL")}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCampId === "ALL"
                ? "bg-purple-700 text-white shadow-sm"
                : "bg-wari-pageBg text-wari-textSecond hover:bg-purple-50"
            }`}
          >
            All Camps
          </button>
          {state.camps.slice(0, 6).map((camp, idx) => (
            <button
              key={camp.id}
              onClick={() => setSelectedCampId(camp.id)}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all truncate text-left sm:text-center ${
                selectedCampId === camp.id
                  ? "bg-purple-700 text-white shadow-sm"
                  : "bg-wari-pageBg text-wari-textSecond hover:bg-purple-50"
              }`}
              title={camp.name}
            >
              Camp {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="flex gap-2 bg-wari-pageBg p-1 rounded-xl border border-wari-cardBorder">
        {[
          { id: "tasks", label: `📋 Assigned Tasks (${filteredTasks.length})` },
          { id: "report", label: "🚨 Report Incident" },
          { id: "dindis", label: `🚩 Dindis (${realDindis.length})` },
          { id: "team", label: "👥 Volunteers (Camps 1–6)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white shadow text-purple-900 border border-purple-100"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: ASSIGNED TASKS & VERIFICATION ── */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-wari-textPrimary flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-700" />
              Live Tasks from Command Centre
            </h2>
            <span className="text-[11px] text-wari-textMuted">Real-time Command Centre Sync</span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="card-base p-8 text-center space-y-2 border-2 border-dashed border-wari-cardBorder">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <h3 className="font-bold text-wari-textPrimary text-sm">All Clear — No Pending Tasks</h3>
              <p className="text-xs text-wari-textMuted max-w-sm mx-auto">
                When the Command Centre dispatches a resource (e.g. water tanker, medical aid, or crowd marshal) to this camp, it will appear here immediately for verification.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const isVerified = task.status === "VERIFIED";
                const isRejected = task.status === "REJECTED";
                const isInProgress = task.status === "IN_PROGRESS";

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border-2 p-5 space-y-3.5 transition-all ${
                      isVerified
                        ? "bg-emerald-50/70 border-emerald-300"
                        : isRejected
                        ? "bg-red-50/70 border-red-300"
                        : isInProgress
                        ? "bg-blue-50/70 border-blue-300"
                        : "bg-orange-50/70 border-orange-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-800">
                            {task.type}
                          </span>
                          <span className="text-[11px] text-wari-textMuted font-semibold">
                            Camp: {task.campName}
                          </span>
                        </div>
                        <h3 className="font-bold text-wari-textPrimary text-base mt-1">{task.title}</h3>
                        <div className="text-xs text-wari-textSecond mt-0.5 flex flex-wrap items-center gap-3">
                          <span>Assigned Volunteer: <strong>{task.volunteerName}</strong></span>
                          <span>•</span>
                          <span className="font-semibold text-orange-700">ETA: {task.etaMinutes} min</span>
                          <span>•</span>
                          <span className="text-[11px] text-wari-textMuted">Dispatched at {task.createdAt}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 uppercase tracking-wider ${
                          isVerified
                            ? "bg-emerald-200 text-emerald-900 border border-emerald-300"
                            : isRejected
                            ? "bg-red-200 text-red-900 border border-red-300"
                            : isInProgress
                            ? "bg-blue-200 text-blue-900 border border-blue-300"
                            : "bg-amber-200 text-amber-900 border border-amber-300 animate-pulse"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {/* Remarks Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-wari-textSecond block">
                        Volunteer Ground Verification Remarks:
                      </label>
                      <textarea
                        value={remarksByTask[task.id] ?? task.remarks ?? ""}
                        onChange={(event) =>
                          setRemarksByTask((prev) => ({ ...prev, [task.id]: event.target.value }))
                        }
                        placeholder="Add on-ground observations (e.g. Tanker arrived, water tested 12,000L full, queue cleared / or delayed at approach road)..."
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-400 min-h-16"
                      />
                    </div>

                    {/* Interactive Verification Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() =>
                          updateVolunteerTask(
                            task.id,
                            "IN_PROGRESS",
                            remarksByTask[task.id] || "Volunteer acknowledged and monitoring on ground"
                          )
                        }
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          isInProgress
                            ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-200"
                        }`}
                      >
                        ⏳ Start / In Progress
                      </button>

                      <button
                        onClick={() =>
                          updateVolunteerTask(
                            task.id,
                            "VERIFIED",
                            remarksByTask[task.id] || "Resource arrived on site and verified by volunteer"
                          )
                        }
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                          isVerified
                            ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve / Arrival Verified
                      </button>

                      <button
                        onClick={() =>
                          updateVolunteerTask(
                            task.id,
                            "REJECTED",
                            remarksByTask[task.id] || "Not reached / issues reported by volunteer"
                          )
                        }
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                          isRejected
                            ? "bg-red-700 text-white border-red-800 shadow-sm"
                            : "bg-red-100 hover:bg-red-200 text-red-900 border-red-200"
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject / Issue Alert
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: INCIDENT REPORT (1-Tap & Voice in 3 Languages) ── */}
      {activeTab === "report" && (
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-red-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <h2 className="text-sm font-bold text-wari-textPrimary">1-Tap Field Incident Report</h2>
                <p className="text-xs text-wari-textMuted">Real GPS coordinates auto-attached and sent to Command Centre</p>
              </div>
            </div>

            {/* Voice Incident Box */}
            <div className="rounded-xl bg-purple-50/70 border border-purple-200 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-xs font-bold text-purple-950">🎙️ Voice Incident Report (3 Languages)</p>
                <p className="text-[11px] text-purple-800 mt-0.5">
                  Speak in English, Hindi, or Marathi: e.g. "पाणी टंचाई आहे", "पानी का टैंकर चाहिए", "Water shortage at gate", "Medical emergency".
                </p>
                {transcript && <p className="mt-1 text-[11px] text-emerald-800 font-bold">Heard: {transcript}</p>}
              </div>
              <button
                type="button"
                onClick={isListening ? reset : startListening}
                disabled={!isSupported}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shrink-0 ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-purple-700 text-white hover:bg-purple-800"
                } disabled:bg-stone-100 disabled:text-stone-400`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isListening ? "Listening..." : "Speak Incident"}
              </button>
            </div>

            {/* Success confirmation */}
            {reportSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Transmitted:</strong> {reportSuccess} — Command Centre notified with your GPS.</span>
              </div>
            )}

            {/* 1-Tap Incident Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Crowd Surge", emoji: "👥", desc: "High compression", color: "orange", severity: "HIGH" as const },
                { label: "Water Shortage", emoji: "💧", desc: "Tanker empty", color: "blue", severity: "HIGH" as const },
                { label: "Medical Emergency", emoji: "🚑", desc: "Urgent triage", color: "red", severity: "CRITICAL" as const },
                { label: "Road Blocked", emoji: "🚧", desc: "Chokepoint", color: "amber", severity: "HIGH" as const },
                { label: "Sanitation Full", emoji: "🚻", desc: "Mobile toilet", color: "teal", severity: "MEDIUM" as const },
                { label: "Lost Pilgrim", emoji: "🔎", desc: "Needs help", color: "purple", severity: "MEDIUM" as const },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handle1TapReport(item.label, item.emoji, item.severity)}
                  className={`p-4 rounded-xl border-2 text-left transition-all active:scale-95
                    bg-${item.color}-50 hover:bg-${item.color}-100 border-${item.color}-200`}
                >
                  <div className="text-2xl mb-1.5">{item.emoji}</div>
                  <div className={`text-xs font-bold text-${item.color}-900`}>{item.label}</div>
                  <div className={`text-[10px] text-${item.color}-600 mt-0.5`}>{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: REGISTERED DINDIS IN SECTOR ── */}
      {activeTab === "dindis" && (
        <div className="rounded-2xl border border-wari-cardBorder bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold text-wari-textPrimary">Registered Dindis in Pilgrimage Corridor</h2>
          {realDindis.length === 0 ? (
            <div className="text-center py-12 text-wari-textMuted">
              <span className="text-4xl block mb-3">🚩</span>
              <p className="text-sm font-medium">No live Dindis registered yet.</p>
              <p className="text-xs mt-1">
                Dindi leaders self-register at <strong>/dindi</strong> and appear here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {realDindis.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-orange-200 bg-orange-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-orange-900">{d.name}</div>
                      <div className="text-xs text-orange-700">Leader: {d.leader}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-orange-600 text-white px-2.5 py-1 rounded-lg">
                      {d.passcode}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs pt-2 border-t border-orange-200">
                    <span>👥 <strong>{d.pilgrimCount.toLocaleString()} devotees</strong></span>
                    <span>⚡ <strong className="text-emerald-700">{d.currentPaceKmH} km/h</strong></span>
                    <span>📍 <strong>{d.lat.toFixed(4)}°N, {d.lng.toFixed(4)}°E</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: VOLUNTEER ROSTER ACROSS CAMPS 1-6 ── */}
      {activeTab === "team" && (
        <div className="rounded-2xl border border-wari-cardBorder bg-white p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-wari-cardBorder">
            <div>
              <h2 className="text-sm font-bold text-wari-textPrimary">Ground Volunteer Team (Camps 1–6)</h2>
              <p className="text-xs text-wari-textMuted">Assigned volunteers stationed along verified camps</p>
            </div>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full">
              {state.volunteers.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.volunteers.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-xl border border-wari-cardBorder bg-wari-pageBg space-y-2 text-xs hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-wari-textPrimary text-sm">{v.name}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    {v.status}
                  </span>
                </div>
                <div className="text-wari-textMuted flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-600" />
                  <span>{v.locationName}</span>
                </div>
                {v.currentTask && (
                  <div className="p-2 bg-orange-100/70 border border-orange-200 rounded-lg text-[11px] text-orange-950 font-medium">
                    📌 {v.currentTask}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-wari-cardBorder">
                  <span className="font-mono text-wari-textSecond font-semibold">{v.phone || "+91 90000 10001"}</span>
                  {v.phone && (
                    <a
                      href={`tel:${v.phone.replace(/\s+/g, "")}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
