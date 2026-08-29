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
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLiveGps } from "@/context/LiveGpsContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { parseReportIntent } from "@/lib/speech-intents";

type TaskStatus = "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";

interface Task {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM";
  location: string;
  status: TaskStatus;
  desc: string;
}

export default function VolunteerPortal() {
  const { state, addEventLog, reportVolunteerIncident, updateVolunteerTask } = useSimulation();
  const { coords } = useLiveGps();
  const { transcript, isListening, isSupported, startListening, reset } = useSpeechRecognition();

  const [isAvailable, setIsAvailable] = useState(true);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"report" | "dindis" | "team">("report");
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [remarksByTask, setRemarksByTask] = useState<Record<string, string>>({});

  // Only real registered Dindis
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
    const severity = intent === "Medical Emergency" ? "CRITICAL" : intent === "Sanitation Full" || intent === "Lost Pilgrim" ? "MEDIUM" : "HIGH";
    handle1TapReport(intent, "", severity);
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const advanceTask = (id: string) => {
    setMyTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next: TaskStatus = t.status === "ASSIGNED" ? "IN_PROGRESS" : "COMPLETED";
        addEventLog({
          eventType: "DISPATCH",
          severity: "INFO",
          source: "Volunteer Task Update",
          description: `Task "${t.title}" → ${next}`,
        });
        return { ...t, status: next };
      })
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">

      {/* ── PORTAL HEADER ── */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👷</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Volunteer Seva Portal</h1>
              <p className="text-sm text-purple-100">Field coordination · Incident reporting · Live GPS</p>
            </div>
          </div>

          {/* Availability toggle */}
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-2 ${
              isAvailable
                ? "bg-emerald-500 border-emerald-300 text-white"
                : "bg-white/10 border-white/20 text-white/70"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-white animate-ping" : "bg-gray-400"}`} />
            {isAvailable ? "🟢 ON DUTY" : "⚪ BREAK"}
          </button>
        </div>

        {coords && (
          <div className="mt-3 text-xs text-purple-100 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono">{coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E</span>
            <span className="ml-auto font-semibold bg-white/20 px-2 py-0.5 rounded-full">
              {coords.speedKmH} km/h
            </span>
          </div>
        )}
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="flex gap-2 bg-wari-pageBg p-1 rounded-xl border border-wari-cardBorder">
        {[
          { id: "report", label: "🚨 Report Incident" },
          { id: "dindis", label: `🚩 Dindis (${realDindis.length})` },
          { id: "team", label: "👥 Volunteers" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white shadow text-wari-textPrimary"
                : "text-wari-textSecond hover:text-wari-textPrimary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: INCIDENT REPORT ── */}
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

            <div className="rounded-xl bg-wari-pageBg border border-wari-cardBorder p-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-xs font-bold text-wari-textPrimary">Voice Incident Report</p>
                <p className="text-[11px] text-wari-textMuted">
                  Say water shortage, medical emergency, crowd surge, road blocked, sanitation full, or lost pilgrim in English, Hindi, or Marathi.
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
                    : "bg-purple-600 text-white hover:bg-purple-700"
                } disabled:bg-stone-100 disabled:text-stone-400`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isListening ? "Listening" : "Speak Report"}
              </button>
            </div>

            {/* Success confirmation */}
            {reportSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Transmitted:</strong> {reportSuccess} — Command Centre notified with your GPS.</span>
              </div>
            )}

            {/* No GPS warning */}
            {!coords && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Enable phone GPS for precise auto-location. Reports still sent with manual location note.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
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

          {/* My Assigned Tasks */}
          <div className="rounded-2xl border border-wari-cardBorder bg-white p-5 space-y-3">
            <h2 className="text-sm font-bold text-wari-textPrimary flex items-center gap-2">
              <Clock className="w-4 h-4 text-wari-orange" />
              My Assigned Seva Tasks
            </h2>
            {state.volunteerTasks.length === 0 && myTasks.length === 0 ? (
              <div className="text-center py-8 text-wari-textMuted">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-wari-cardBorder" />
                <p className="text-sm">No tasks assigned yet.</p>
                <p className="text-xs mt-1">Tasks from Command Centre will appear here.</p>
              </div>
            ) : (
              <>
              {state.volunteerTasks.map((task) => (
                <div key={task.id} className="border border-orange-200 bg-orange-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-white text-orange-800 border-orange-200">
                        {task.type}
                      </span>
                      <div className="font-bold text-wari-textPrimary text-sm mt-1">{task.title}</div>
                      <div className="text-xs text-wari-textMuted">Camp: {task.campName}</div>
                      <div className="text-xs text-wari-textMuted">Assigned to: {task.volunteerName} · ETA {task.etaMinutes} min</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                      task.status === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : task.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <textarea
                    value={remarksByTask[task.id] ?? task.remarks ?? ""}
                    onChange={(event) => setRemarksByTask((prev) => ({ ...prev, [task.id]: event.target.value }))}
                    placeholder="Add remarks: tanker reached, delayed, wrong location, crowd issue..."
                    className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-300 min-h-20"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateVolunteerTask(task.id, "IN_PROGRESS", remarksByTask[task.id])}
                      className="rounded-xl bg-amber-100 text-amber-900 border border-amber-200 py-2 text-xs font-bold"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => updateVolunteerTask(task.id, "VERIFIED", remarksByTask[task.id] || "Verified on ground")}
                      className="rounded-xl bg-emerald-600 text-white py-2 text-xs font-bold"
                    >
                      Approve / Reached
                    </button>
                    <button
                      onClick={() => updateVolunteerTask(task.id, "REJECTED", remarksByTask[task.id] || "Not verified on ground")}
                      className="rounded-xl bg-red-600 text-white py-2 text-xs font-bold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}

              {myTasks.map((t) => (
                <div key={t.id} className="border border-wari-cardBorder rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        t.priority === "HIGH" ? "bg-red-50 text-red-800 border-red-200" : "bg-blue-50 text-blue-800 border-blue-200"
                      }`}>
                        {t.priority}
                      </span>
                      <div className="font-bold text-wari-textPrimary text-sm mt-1">{t.title}</div>
                      <div className="text-xs text-wari-textMuted">📍 {t.location}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                      t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  {t.status !== "COMPLETED" && (
                    <button
                      onClick={() => advanceTask(t.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        t.status === "ASSIGNED"
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {t.status === "ASSIGNED" ? "✅ Accept & Start" : "🏁 Mark Resolved"}
                    </button>
                  )}
                </div>
              ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: APPROACHING DINDIS ── */}
      {activeTab === "dindis" && (
        <div className="rounded-2xl border border-wari-cardBorder bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold text-wari-textPrimary">Registered Dindis in Your Sector</h2>
          {realDindis.length === 0 ? (
            <div className="text-center py-12 text-wari-textMuted">
              <span className="text-4xl block mb-3">🚩</span>
              <p className="text-sm font-medium">No Dindis registered yet.</p>
              <p className="text-xs mt-1">Dindi leaders register at <strong>/dindi</strong> and they appear here instantly.</p>
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
                    <span className="text-[10px] font-mono font-bold bg-orange-600 text-white px-2 py-0.5 rounded">
                      {d.passcode}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs pt-2 border-t border-orange-200">
                    <span>👥 <strong>{d.pilgrimCount.toLocaleString()}</strong></span>
                    <span>⚡ <strong className="text-emerald-700">{d.currentPaceKmH} km/h</strong></span>
                    <span>📍 <strong>{d.lat.toFixed(3)}, {d.lng.toFixed(3)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: VOLUNTEER TEAM ── */}
      {activeTab === "team" && (
        <div className="rounded-2xl border border-wari-cardBorder bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold text-wari-textPrimary">Ground Volunteer Team</h2>
          {state.volunteers.length === 0 ? (
            <div className="text-center py-12 text-wari-textMuted">
              <span className="text-4xl block mb-3">👷</span>
              <p className="text-sm font-medium">No volunteers registered yet.</p>
              <p className="text-xs mt-1">
                In Live Mode, only volunteers who register appear here.
                Switch to <strong>Demo Archive</strong> to see historical volunteer data.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.volunteers.map((v) => (
                <div key={v.id} className="p-4 rounded-xl border border-wari-cardBorder space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-wari-textPrimary">{v.name}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      {v.status}
                    </span>
                  </div>
                  <div className="text-wari-textMuted">📍 {v.locationName}</div>
                  {v.currentTask && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 font-semibold">
                      Assigned: {v.currentTask}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-wari-cardBorder">
                    <span className="font-mono text-wari-textMuted">{v.phone || "—"}</span>
                    {v.phone && (
                      <a
                        href={`tel:${v.phone}`}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
