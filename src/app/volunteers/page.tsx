"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Search,
  Zap,
  CheckCircle2,
  Battery,
  Sparkles,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { VolunteerSkill } from "@/lib/types";

export default function VolunteersPage() {
  const { state, deployVolunteersCP4, isMitigated } = useSimulation();
  const [skillFilter, setSkillFilter] = useState<string>("ALL");
  const [aiQuery, setAiQuery] = useState("Find 5 volunteers for CP4 Dive Ghat Apex");

  const filteredVolunteers = state.volunteers.filter((v) => {
    if (skillFilter === "ALL") return true;
    return v.skills.includes(skillFilter as VolunteerSkill);
  });

  const top5Recommendations = state.volunteers.slice(0, 5);

  const getSkillBadge = (s: VolunteerSkill) => {
    switch (s) {
      case "MEDICAL":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "TRAFFIC":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CROWD_CONTROL":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "MARATHI_HINDI":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-wari-pageBg text-wari-textPrimary border-wari-cardBorder";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-base p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center shadow-sm">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-wari-textPrimary tracking-tight">
              Smart Seva Volunteer Dispatch
            </h1>
            <p className="text-sm text-wari-textSecond mt-0.5">
              Deploy specialized volunteers, track battery levels, and coordinate crowd marshalling
            </p>
          </div>
        </div>

        <span className="badge-normal font-semibold">
          30 Active Volunteers
        </span>
      </div>

      {/* AI Task Dispatch Search Interaction */}
      <div className="card-base p-6 border-2 border-wari-orange/40 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-wari-cardBorder">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-wari-orange" />
            <span className="text-sm font-bold text-wari-textPrimary">
              Smart Volunteer Dispatch
            </span>
          </div>
          <span className="text-xs text-wari-orange font-semibold">
            Nearest Qualified Match
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-wari-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g. Find 5 volunteers for CP4..."
              className="input-base pl-10 text-xs"
            />
          </div>

          {!isMitigated ? (
            <button
              onClick={deployVolunteersCP4}
              className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Dispatch All 5 to CP4</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto badge-normal flex items-center justify-center gap-2 px-5 py-2.5 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>5 Volunteers Deployed</span>
            </div>
          )}
        </div>

        {/* AI Returned Candidates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {top5Recommendations.map((v) => (
            <div
              key={v.id}
              className="bg-wari-pageBg p-3.5 rounded-xl border border-wari-cardBorder text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-wari-textPrimary truncate">{v.name}</span>
                <span className="text-xs text-wari-orange font-bold">
                  {v.distanceToTargetKm}km
                </span>
              </div>
              <span className="text-xs text-wari-textMuted block truncate">
                {v.locationName}
              </span>
              <div className="flex flex-wrap gap-1">
                {v.skills.slice(0, 2).map((s, sIdx) => (
                  <span
                    key={sIdx}
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${getSkillBadge(s)}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs pt-1 text-wari-textMuted">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <Battery className="w-3.5 h-3.5" />
                  {v.batteryPercent}%
                </span>
                <span className={v.status === "DEPLOYED" ? "text-purple-700 font-bold" : "text-emerald-700"}>
                  {v.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volunteer Directory */}
      <div className="card-base p-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-wari-cardBorder text-xs">
          <span className="font-bold text-sm text-wari-textPrimary">
            Volunteer Directory ({filteredVolunteers.length})
          </span>

          <div className="flex items-center gap-1.5">
            {["ALL", "TRAFFIC", "MEDICAL", "CROWD_CONTROL"].map((flt) => (
              <button
                key={flt}
                onClick={() => setSkillFilter(flt)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  skillFilter === flt
                    ? "bg-wari-orange text-white"
                    : "bg-wari-pageBg text-wari-textSecond border border-wari-cardBorder hover:text-wari-textPrimary"
                }`}
              >
                {flt}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[440px] overflow-y-auto pr-1">
          {filteredVolunteers.map((v) => (
            <div
              key={v.id}
              className="bg-wari-pageBg p-4 rounded-xl border border-wari-cardBorder text-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: v.avatarColor }}
                  />
                  <span className="font-bold text-sm text-wari-textPrimary truncate">{v.name}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    v.status === "DEPLOYED"
                      ? "bg-purple-100 text-purple-800 border border-purple-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="text-xs text-wari-textMuted">
                <span>Sector: {v.locationName}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {v.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] px-2 py-0.5 rounded border ${getSkillBadge(s)}`}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {v.currentTask && (
                <p className="text-xs text-orange-800 bg-orange-50 p-2 rounded-lg border border-orange-200">
                  Task: {v.currentTask}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
