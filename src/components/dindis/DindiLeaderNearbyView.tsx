"use client";

import React, { useState } from "react";
import { 
  Droplets, 
  Stethoscope, 
  Building2, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Flame, 
  Construction, 
  Users, 
  Compass, 
  Radio, 
  HeartHandshake
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLiveGps } from "@/context/LiveGpsContext";
import { getDistanceKm } from "@/lib/live-ops";

export const DindiLeaderNearbyView: React.FC<{ selectedDindiId?: string }> = ({ selectedDindiId }) => {
  const { state, requestLeaderAssistance, addEventLog } = useSimulation();
  const { coords } = useLiveGps();

  const [requestSent, setRequestSent] = useState<string | null>(null);

  const activeDindi =
    state.dindis.find((d) => d.id === selectedDindiId) ??
    state.dindis.find((d) => d.passcode === selectedDindiId) ??
    state.dindis.find((d) => d.isCustomRegistered);
  const currentLat = coords?.lat ?? activeDindi?.lat ?? 18.4905;
  const currentLng = coords?.lng ?? activeDindi?.lng ?? 73.8099;

  // Compute nearby facilities
  const nearbyTankers = state.tankers
    .map((t) => ({ ...t, distKm: getDistanceKm(currentLat, currentLng, t.lat, t.lng) }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 3);

  const nearbyMedical = state.medicalStations
    .map((m) => ({ ...m, distKm: getDistanceKm(currentLat, currentLng, m.lat, m.lng) }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 3);

  const nearbyCamps = state.camps
    .map((c) => ({ ...c, distKm: getDistanceKm(currentLat, currentLng, c.lat, c.lng) }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 3);

  // Compute nearby volunteers
  const nearbyVolunteers = state.volunteers
    .map((v) => ({ ...v, distKm: getDistanceKm(currentLat, currentLng, v.lat, v.lng) }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 4);

  const handleQuickRequest = (type: "WATER" | "MEDICAL" | "HALT" | "ROAD" | "SANITATION", label: string) => {
    const posStr = coords ? `Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}` : "Sector 3 Dive Ghat";
    
    if (type === "WATER" || type === "MEDICAL" || type === "HALT") {
      requestLeaderAssistance(type, `${label} requested by Dindi leader at ${posStr}`);
    } else {
      addEventLog({
        eventType: "ALERT",
        severity: "WARNING",
        source: "Dindi Leader Report",
        description: `${label}: Reported by Dindi leader at ${posStr}`,
      });
    }

    setRequestSent(label);
    setTimeout(() => setRequestSent(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* ── 1-TAP QUICK ACTIONS / REQUESTS ── */}
      <div className="card-base p-6 border-2 border-amber-500/40 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-wari-cardBorder">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-wari-orange animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-wari-textPrimary">
                🚨 Dindi Leader 1-Tap Quick Actions & Assistance
              </h3>
              <p className="text-xs text-wari-textMuted">
                Instantly alerts corridor authorities and nearest volunteers with your live GPS location
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
            INSTANT DISPATCH
          </span>
        </div>

        {/* Confirmation Toast */}
        {requestSent && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Request Transmitted:</strong> {requestSent}. Control room & nearest field seva teams notified.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => handleQuickRequest("WATER", "💧 Urgent Water Tanker Request")}
            className="p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-all active:scale-98"
          >
            <Droplets className="w-5 h-5 text-blue-600 mb-1.5" />
            <div className="text-xs font-bold text-blue-900">Request Water</div>
            <div className="text-[10px] text-blue-700 mt-0.5">Tanker refill</div>
          </button>

          <button
            onClick={() => handleQuickRequest("MEDICAL", "🚑 Medical Emergency / First Aid")}
            className="p-3.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-left transition-all active:scale-98"
          >
            <Stethoscope className="w-5 h-5 text-red-600 mb-1.5" />
            <div className="text-xs font-bold text-red-900">Medical Aid</div>
            <div className="text-[10px] text-red-700 mt-0.5">Doctor / Ambulance</div>
          </button>

          <button
            onClick={() => handleQuickRequest("HALT", "⛺ Halt / Rest Extension Request")}
            className="p-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-all active:scale-98"
          >
            <Building2 className="w-5 h-5 text-purple-600 mb-1.5" />
            <div className="text-xs font-bold text-purple-900">Halt Request</div>
            <div className="text-[10px] text-purple-700 mt-0.5">Camp capacity</div>
          </button>

          <button
            onClick={() => handleQuickRequest("ROAD", "🚧 Road Bottleneck / Diversion Notice")}
            className="p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all active:scale-98"
          >
            <Construction className="w-5 h-5 text-amber-600 mb-1.5" />
            <div className="text-xs font-bold text-amber-900">Road Blocked</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Traffic slowdown</div>
          </button>

          <button
            onClick={() => handleQuickRequest("SANITATION", "🚻 Mobile Toilet Sanitization")}
            className="p-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-left transition-all active:scale-98 col-span-2 sm:col-span-1"
          >
            <Users className="w-5 h-5 text-teal-600 mb-1.5" />
            <div className="text-xs font-bold text-teal-900">Sanitation</div>
            <div className="text-[10px] text-teal-700 mt-0.5">Mobile toilet crew</div>
          </button>
        </div>
      </div>

      {/* ── 2 COLUMN: NEARBY FACILITIES & NEARBY VOLUNTEERS WITH PHONES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT (6 COLS): NEARBY PUBLIC FACILITIES */}
        <div className="lg:col-span-6 card-base p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-wari-cardBorder">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-wari-orange" />
              <h3 className="text-sm font-bold text-wari-textPrimary">
                Nearby Verified Public Facilities
              </h3>
            </div>
            <span className="text-[10px] text-wari-textMuted font-mono font-bold">
              GPS SORTED
            </span>
          </div>

          <div className="space-y-3">
            {/* Water Tankers */}
            <div>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1.5">
                💧 Closest Water Tankers & Points
              </span>
              <div className="space-y-1.5">
                {nearbyTankers.map((t) => (
                  <div key={t.id} className="p-3 bg-wari-pageBg rounded-xl border border-wari-cardBorder flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-wari-textPrimary">{t.id} — {t.currentHub}</div>
                      <div className="text-[11px] text-wari-textMuted">Capacity: {t.capacityLiters.toLocaleString()}L • Driver: {t.driverName}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600 block">{t.distKm} km away</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Posts */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1.5">
                🏥 Closest Medical & Emergency Posts
              </span>
              <div className="space-y-1.5">
                {nearbyMedical.map((m) => (
                  <div key={m.id} className="p-3 bg-wari-pageBg rounded-xl border border-wari-cardBorder flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-wari-textPrimary">{m.name}</div>
                      <div className="text-[11px] text-wari-textMuted">{m.doctorCount} Doctors • {m.availableAmbulances} Ambulances • {m.heatStrokeKits} Kits</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 block">{m.distKm} km away</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{m.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Camps & Halts */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-1.5">
                ⛺ Closest Halts & Rest Grounds
              </span>
              <div className="space-y-1.5">
                {nearbyCamps.map((c) => (
                  <div key={c.id} className="p-3 bg-wari-pageBg rounded-xl border border-wari-cardBorder flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-wari-textPrimary">{c.name}</div>
                      <div className="text-[11px] text-wari-textMuted">Capacity: {c.capacity.toLocaleString()} • Water: {c.waterStockPercent}%</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-600 block">{c.distKm} km away</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        c.status === "CRITICAL" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (6 COLS): NEARBY VOLUNTEERS WITH CONTACT PHONE NUMBERS */}
        <div className="lg:col-span-6 card-base p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-wari-cardBorder">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-wari-orange" />
              <h3 className="text-sm font-bold text-wari-textPrimary">
                Nearby Ground Volunteers & Contact Numbers
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
              DIRECT SEVA CALL
            </span>
          </div>

          <p className="text-xs text-wari-textMuted">
            Dindi leaders can call on-ground volunteers directly for route guidance, water assistance, crowd marshalling, or medical support.
          </p>

          <div className="space-y-3">
            {nearbyVolunteers.map((v) => (
              <div
                key={v.id}
                className="p-4 bg-wari-pageBg border border-wari-cardBorder rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-wari-textPrimary">{v.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      {v.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-wari-textMuted">
                    📍 {v.locationName} ({v.distKm} km away)
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {v.skills.map((s) => (
                      <span key={s} className="text-[9px] px-1.5 py-0.2 bg-white border border-gray-200 rounded text-gray-700 font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Call Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <a
                    href={`tel:${v.phone || "+919822014892"}`}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Volunteer</span>
                  </a>
                  <span className="text-[11px] font-mono text-wari-textSecond font-semibold">
                    {v.phone || "+91 98220 14892"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
