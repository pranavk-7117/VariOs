"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Search,
  Zap,
  CheckCircle2,
  Battery,
  Sparkles,
  AlertTriangle,
  Droplets,
  Users,
  MapPin,
  Clock,
  Phone,
  Compass,
  Radio,
  Construction,
  Stethoscope,
  Building2
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLiveGps } from "@/context/LiveGpsContext";
import { VolunteerSkill } from "@/lib/types";

export default function VolunteersPage() {
  const { state, deployVolunteersCP4, isMitigated, addEventLog } = useSimulation();
  const { coords } = useLiveGps();

  const [isAvailable, setIsAvailable] = useState(true);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"tasks" | "dindis" | "resources" | "team">("tasks");

  const [myTasks, setMyTasks] = useState([
    {
      id: "TSK-01",
      title: "Dive Ghat Apex Bottleneck Marshalling",
      priority: "HIGH",
      location: "Checkpoint 4 — Dive Ghat Apex",
      status: "ASSIGNED",
      desc: "Assist police with barricade channeling and manage pilgrim flow into Bypass B.",
      eta: "Immediate",
    },
    {
      id: "TSK-02",
      title: "Water Tanker T-03 Refill Point Guide",
      priority: "MEDIUM",
      location: "Camp 6 — Saswad Bypass",
      status: "COMPLETED",
      desc: "Directed approaching Dindi #14 to tanker water bay.",
      eta: "Completed 15m ago",
    }
  ]);

  const handleTaskAction = (id: string, nextStatus: string) => {
    setMyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );
    addEventLog({
      eventType: "DISPATCH",
      severity: "INFO",
      source: "Volunteer Seva Portal",
      description: `Task ${id} updated to ${nextStatus} by field volunteer team`,
    });
  };

  const handle1TapIncidentReport = (type: string, label: string, severity: "HIGH" | "CRITICAL" | "MEDIUM") => {
    const posStr = coords
      ? `Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}`
      : "Dive Ghat Apex (Sector 3)";

    addEventLog({
      eventType: "ALERT",
      severity: severity === "CRITICAL" ? "CRITICAL" : "WARNING",
      source: "Volunteer Field Report",
      description: `${label}: Reported by on-ground volunteer at ${posStr}`,
    });

    setReportSuccess(label);
    setTimeout(() => setReportSuccess(null), 4000);
  };

  const filteredVolunteers = state.volunteers.filter((v) => {
    if (skillFilter === "ALL") return true;
    return v.skills.includes(skillFilter as VolunteerSkill);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ── HEADER & AVAILABILITY TOGGLE ── */}
      <div className="card-base p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center shadow-sm text-2xl">
            👷
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
                Smart Seva Volunteer Dashboard
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                VOLUNTEER SEVA PORTAL
              </span>
            </div>
            <p className="text-sm text-wari-textSecond mt-0.5">
              Coordinate field seva, report live incidents with GPS, monitor approaching Dindis & manage resources
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isAvailable
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm"
                : "bg-gray-100 text-gray-700 border border-gray-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-emerald-600 animate-ping" : "bg-gray-400"}`} />
            <span>{isAvailable ? "🟢 AVAILABLE ON DUTY" : "⚪ STANDBY / ON BREAK"}</span>
          </button>
        </div>
      </div>

      {/* ── 1-TAP INCIDENT REPORTING GRID (FIELD SOURCED) ── */}
      <div className="card-base p-6 border-2 border-red-500/40 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-wari-cardBorder">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-wari-textPrimary">
                🚨 1-Tap Field Incident Reporting (Auto GPS Attached)
              </h3>
              <p className="text-xs text-wari-textMuted">
                Instant telemetry report to Command Centre with current phone GPS coordinates
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-full">
            REAL-TIME DISPATCH
          </span>
        </div>

        {/* Success Toast */}
        {reportSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Incident Transmitted:</strong> {reportSuccess}. Command Centre coordinator and team alerted.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => handle1TapIncidentReport("crowd", "👥 Crowd Surge / High Density", "HIGH")}
            className="p-3.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-left transition-all active:scale-98"
          >
            <Users className="w-5 h-5 text-orange-600 mb-1.5" />
            <div className="text-xs font-bold text-orange-900">Crowd Surging</div>
            <div className="text-[10px] text-orange-700 mt-0.5">High compression</div>
          </button>

          <button
            onClick={() => handle1TapIncidentReport("water", "💧 Water Shortage / Empty Tanker", "HIGH")}
            className="p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-all active:scale-98"
          >
            <Droplets className="w-5 h-5 text-blue-600 mb-1.5" />
            <div className="text-xs font-bold text-blue-900">Water Shortage</div>
            <div className="text-[10px] text-blue-700 mt-0.5">Tanker dry</div>
          </button>

          <button
            onClick={() => handle1TapIncidentReport("medical", "🚑 Medical Emergency / Heat Stroke", "CRITICAL")}
            className="p-3.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-left transition-all active:scale-98"
          >
            <Stethoscope className="w-5 h-5 text-red-600 mb-1.5" />
            <div className="text-xs font-bold text-red-900">Medical Issue</div>
            <div className="text-[10px] text-red-700 mt-0.5">Urgent triage</div>
          </button>

          <button
            onClick={() => handle1TapIncidentReport("road", "🚧 Road Obstruction / Chokepoint", "HIGH")}
            className="p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all active:scale-98"
          >
            <Construction className="w-5 h-5 text-amber-600 mb-1.5" />
            <div className="text-xs font-bold text-amber-900">Road Blocked</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Narrow bottleneck</div>
          </button>

          <button
            onClick={() => handle1TapIncidentReport("sanitation", "🚻 Mobile Toilet Full", "MEDIUM")}
            className="p-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-left transition-all active:scale-98 col-span-2 sm:col-span-1"
          >
            <Building2 className="w-5 h-5 text-teal-600 mb-1.5" />
            <div className="text-xs font-bold text-teal-900">Sanitation Issue</div>
            <div className="text-[10px] text-teal-700 mt-0.5">Disinfectant squad</div>
          </button>
        </div>
      </div>

      {/* ── SUB-TABS: TASKS | DINDIS | RESOURCES | VOLUNTEER ROSTER ── */}
      <div className="flex items-center gap-2 border-b border-wari-cardBorder pb-2 text-xs font-semibold">
        {[
          { id: "tasks", label: "📋 Assigned Seva Tasks", count: myTasks.filter(t => t.status !== "COMPLETED").length },
          { id: "dindis", label: "🚩 Approaching Dindis", count: state.dindis.length },
          { id: "resources", label: "💧 Field Resource Status", count: state.tankers.length },
          { id: "team", label: "👥 Volunteer Seva Team", count: state.volunteers.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-wari-orange text-white shadow-sm font-bold"
                : "text-wari-textSecond hover:bg-wari-pageBg hover:text-wari-textPrimary"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: ASSIGNED SEVA TASKS ── */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTasks.map((t) => (
              <div key={t.id} className="card-base p-5 space-y-3 bg-white border border-wari-cardBorder shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      t.priority === "HIGH" ? "bg-red-50 text-red-800 border-red-200" : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}>
                      {t.priority} PRIORITY
                    </span>
                    <h3 className="font-bold text-wari-textPrimary text-base mt-1.5">{t.title}</h3>
                    <p className="text-xs text-wari-textMuted mt-0.5">📍 {t.location}</p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                    t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-wari-textSecond leading-relaxed">{t.desc}</p>

                <div className="pt-2 border-t border-wari-cardBorder flex gap-2">
                  {t.status === "ASSIGNED" && (
                    <button
                      onClick={() => handleTaskAction(t.id, "IN_PROGRESS")}
                      className="w-full py-2.5 bg-wari-orange hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm"
                    >
                      Accept & Start Navigation
                    </button>
                  )}
                  {t.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleTaskAction(t.id, "COMPLETED")}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Seva Task Resolved
                    </button>
                  )}
                  {t.status === "COMPLETED" && (
                    <div className="w-full text-center text-xs font-semibold text-emerald-700 py-1">
                      ✅ Seva Task Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: APPROACHING DINDIS ── */}
      {activeTab === "dindis" && (
        <div className="card-base p-6 space-y-4">
          <h3 className="text-sm font-bold text-wari-textPrimary">Approaching Dindis Along Sector</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.dindis.map((d) => (
              <div key={d.id} className="p-4 bg-wari-pageBg rounded-xl border border-wari-cardBorder space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-wari-textPrimary">#{d.number} — {d.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold font-mono">
                    {d.status}
                  </span>
                </div>
                <div className="text-wari-textMuted">Leader: <strong>{d.leader}</strong></div>
                <div className="flex items-center justify-between pt-1 border-t border-wari-cardBorder font-mono">
                  <span>Devotees: <strong className="text-wari-orange">{d.pilgrimCount.toLocaleString()}</strong></span>
                  <span>Pace: <strong className="text-emerald-600">{d.currentPaceKmH} km/h</strong></span>
                </div>
                <div className="text-[11px] text-blue-700 font-medium">
                  Next Halt: {d.nextHalt} (ETA {d.etaNextHalt})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: RESOURCES ── */}
      {activeTab === "resources" && (
        <div className="card-base p-6 space-y-4">
          <h3 className="text-sm font-bold text-wari-textPrimary">Water, Medical & Camp Logistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {state.tankers.map((t) => (
              <div key={t.id} className="p-4 bg-wari-pageBg rounded-xl border border-wari-cardBorder space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-blue-900">💧 {t.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">{t.status}</span>
                </div>
                <div className="text-wari-textMuted">Capacity: {t.capacityLiters.toLocaleString()} L</div>
                <div className="text-wari-textMuted">Driver: {t.driverName}</div>
                <div className="text-wari-textSecond font-semibold">Location: {t.currentHub} ({t.distanceKm} km)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: VOLUNTEER TEAM ROSTER ── */}
      {activeTab === "team" && (
        <div className="card-base p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-wari-cardBorder">
            <h3 className="text-sm font-bold text-wari-textPrimary">All Registered Ground Volunteers</h3>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 text-xs">
              {["ALL", "MEDICAL", "TRAFFIC", "CROWD_CONTROL", "MARATHI_HINDI"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSkillFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    skillFilter === s ? "bg-purple-600 text-white" : "bg-wari-pageBg text-wari-textSecond hover:bg-gray-100"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVolunteers.map((v) => (
              <div key={v.id} className="p-4 bg-wari-pageBg rounded-xl border border-wari-cardBorder space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-wari-textPrimary">{v.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    {v.status}
                  </span>
                </div>
                <div className="text-wari-textMuted">📍 {v.locationName}</div>
                <div className="flex flex-wrap gap-1">
                  {v.skills.map((s) => (
                    <span key={s} className="text-[9px] px-1.5 py-0.2 rounded bg-white border border-gray-200 text-gray-700 font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-wari-cardBorder flex items-center justify-between">
                  <span className="text-[11px] font-mono text-wari-textMuted">📞 {v.phone || "+91 98220 14892"}</span>
                  <a
                    href={`tel:${v.phone || "+919822014892"}`}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
