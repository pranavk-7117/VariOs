"use client";

import React, { useState } from "react";
import {
  Users,
  Crown,
  Sparkles,
  Radio,
  CheckCircle2,
  ArrowDown,
  Compass,
} from "lucide-react";
import {
  SANT_DNYANESHWAR_DINDI_STRUCTURE,
  DindiMemberUnit,
} from "@/lib/palkhi-schedule";
import { useLiveGps } from "@/context/LiveGpsContext";

export const DindiProcessionFormation: React.FC = () => {
  const { boundDindiId, setBoundDindiId } = useLiveGps();
  const { front_dindis, center_unit, rear_dindis } =
    SANT_DNYANESHWAR_DINDI_STRUCTURE.dindi_structure;

  const [selectedUnit, setSelectedUnit] = useState<DindiMemberUnit>(
    front_dindis[3] // Sitole Deshmukh
  );

  const totalFrontMembers = front_dindis.reduce(
    (acc, d) => acc + d.approx_members,
    0
  );
  const totalRearMembers = rear_dindis.reduce(
    (acc, d) => acc + d.approx_members,
    0
  );

  return (
    <div className="card-base p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-wari-cardBorder">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-300 text-wari-orange flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-wari-textPrimary">
              Sant Dnyaneshwar Maharaj Palkhi — Traditional Procession Formation
            </h3>
            <p className="text-xs text-wari-textSecond mt-0.5">
              Official order of Front Dindis, Center Chariot (Rath), and Rear Dindi Cohorts (पालखी दिंडी रचना)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-normal font-semibold text-xs">
            {totalFrontMembers + totalRearMembers} Registered Cohort Members
          </span>
        </div>
      </div>

      {/* Procession Visualizer Grid */}
      <div className="space-y-4">
        {/* SECTION 1: FRONT DINDIS (पुढे चालणाऱ्या दिंड्या) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Front Formation (पुढे चालणाऱ्या दिंड्या)
              </h4>
            </div>
            <span className="text-xs text-wari-textMuted font-mono">
              {front_dindis.length} Units • {totalFrontMembers} Devotees
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {front_dindis.map((d, idx) => {
              const isSelected = selectedUnit.head_chief === d.head_chief;
              const isLeading = d.position.includes("Leading");

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedUnit(d)}
                  className={`p-3.5 rounded-xl border text-left transition-all text-xs space-y-1.5 ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-300"
                      : "bg-wari-pageBg border-wari-cardBorder hover:border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-wari-textPrimary font-mono">
                      {d.dindi_number}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isLeading
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {d.position}
                    </span>
                  </div>

                  <p className="font-bold text-wari-textPrimary truncate">
                    {d.head_chief}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-wari-textMuted pt-1 border-t border-wari-cardBorder/60">
                    <span>Origin: {d.location_origin}</span>
                    <span className="font-semibold text-wari-textPrimary">
                      ~{d.approx_members}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Procession Flow Down Arrow */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-wari-textMuted py-1">
          <ArrowDown className="w-4 h-4 text-wari-orange animate-bounce" />
          <span>Marching Forward (मार्गक्रमण)</span>
          <ArrowDown className="w-4 h-4 text-wari-orange animate-bounce" />
        </div>

        {/* SECTION 2: CENTER SANCTUARY (मध्यभागी - मुख्य रथ व पादुका) */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-wari-orange text-white flex items-center justify-center shadow-md">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wider">
                  Center Sanctuary (मुख्य रथ)
                </span>
                <h4 className="text-base font-bold text-amber-950 mt-0.5">
                  {center_unit.name}
                </h4>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-800 bg-white/80 px-3 py-1 rounded-xl border border-amber-200">
              Sant Dnyaneshwar Maharaj Paduka (पादुका)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/90 p-3 rounded-xl border border-amber-200">
              <span className="text-amber-800 font-bold block mb-0.5">
                🪔 Sacred Relic:
              </span>
              <p className="text-wari-textPrimary font-semibold">
                {center_unit.contains}
              </p>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-amber-200">
              <span className="text-amber-800 font-bold block mb-0.5">
                🐎 Ceremonial Escort:
              </span>
              <p className="text-wari-textPrimary font-semibold">
                {center_unit.escort}
              </p>
            </div>
          </div>
        </div>

        {/* Procession Flow Down Arrow */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-wari-textMuted py-1">
          <ArrowDown className="w-4 h-4 text-wari-orange" />
          <span>Following Chariot (रथाच्या मागे)</span>
          <ArrowDown className="w-4 h-4 text-wari-orange" />
        </div>

        {/* SECTION 3: REAR DINDIS (रथाच्या मागे चालणाऱ्या दिंड्या) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Rear Formation (रथाच्या मागे चालणाऱ्या दिंड्या)
              </h4>
            </div>
            <span className="text-xs text-wari-textMuted font-mono">
              {rear_dindis.length} Units • {totalRearMembers} Devotees
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rear_dindis.map((d, idx) => {
              const isSelected = selectedUnit.head_chief === d.head_chief;
              const isFirstBehind = d.position.includes("First");

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedUnit(d)}
                  className={`p-3.5 rounded-xl border text-left transition-all text-xs space-y-1.5 ${
                    isSelected
                      ? "bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-300"
                      : "bg-wari-pageBg border-wari-cardBorder hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-wari-textPrimary font-mono">
                      {d.dindi_number}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isFirstBehind
                          ? "bg-purple-100 text-purple-800 border border-purple-300"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {d.position}
                    </span>
                  </div>

                  <p className="font-bold text-wari-textPrimary truncate">
                    {d.head_chief}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-wari-textMuted pt-1 border-t border-wari-cardBorder/60">
                    <span>Origin: {d.location_origin}</span>
                    <span className="font-semibold text-wari-textPrimary">
                      ~{d.approx_members} Devotees
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Dindi Details & Live GPS Link Panel */}
      <div className="p-4 rounded-xl bg-wari-pageBg border border-wari-cardBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-wari-textPrimary">
              Selected: {selectedUnit.dindi_number} ({selectedUnit.position})
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-white font-semibold text-wari-orange border border-wari-cardBorder">
              {selectedUnit.head_chief}
            </span>
          </div>
          <p className="text-xs text-wari-textSecond mt-0.5">
            Origin: <strong>{selectedUnit.location_origin}</strong> • Cohort Size: <strong>{selectedUnit.approx_members} Pilgrims</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setBoundDindiId(selectedUnit.dindi_number.replace(" ", "-"))}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Transmit Live GPS as {selectedUnit.dindi_number}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
