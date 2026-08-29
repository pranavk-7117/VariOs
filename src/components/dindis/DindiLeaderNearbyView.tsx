"use client";

import React, { useState, useEffect } from "react";
import { 
  Droplets, 
  Stethoscope, 
  Building2, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Construction, 
  Users, 
  Radio, 
  HeartHandshake,
  Hospital as HospitalIcon,
  Clock
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLiveGps } from "@/context/LiveGpsContext";
import { getDistanceKm } from "@/lib/live-ops";
import { fetchLiveNearbyHospitals, RealHospital } from "@/lib/nearby-places";

export const DindiLeaderNearbyView: React.FC<{ selectedDindiId?: string }> = ({ selectedDindiId }) => {
  const { state, requestLeaderAssistance, addEventLog } = useSimulation();
  const { coords } = useLiveGps();

  const [requestSent, setRequestSent] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<RealHospital[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);

  const activeDindi =
    state.dindis.find((d) => d.id === selectedDindiId) ??
    state.dindis.find((d) => d.passcode === selectedDindiId) ??
    state.dindis.find((d) => d.isCustomRegistered);

  // If a Dindi is selected, prioritize its live GPS; else use device live GPS; else default to corridor start (18.5138, 73.8589)
  const currentLat = activeDindi?.lat ?? coords?.lat ?? 18.5138;
  const currentLng = activeDindi?.lng ?? coords?.lng ?? 73.8589;
  const locationLabel = activeDindi ? activeDindi.name : coords ? "Your Phone GPS" : "Pune Corridor Base";

  // Fetch real nearby hospitals whenever coordinates change
  useEffect(() => {
    let isMounted = true;
    setIsLoadingHospitals(true);
    fetchLiveNearbyHospitals(currentLat, currentLng, 20)
      .then((data) => {
        if (isMounted) {
          setHospitals(data.slice(0, 4));
          setIsLoadingHospitals(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingHospitals(false);
      });
    return () => {
      isMounted = false;
    };
  }, [currentLat, currentLng]);

  // Compute nearby tankers
  const nearbyTankers = state.tankers
    .map((t) => {
      const distKm = getDistanceKm(currentLat, currentLng, t.lat, t.lng);
      const eta = Math.max(1, Math.round((distKm / 25) * 60)); // 25 km/h urban/highway tanker speed
      return { ...t, distKm, calculatedEta: eta };
    })
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 3);

  // Compute nearby verified camps (Camps 1-6)
  const nearbyCamps = state.camps
    .map((c) => {
      const distKm = getDistanceKm(currentLat, currentLng, c.lat, c.lng);
      const walkingHours = (distKm / 3.8).toFixed(1);
      return { ...c, distKm, walkingHours };
    })
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 3);

  // Compute nearby volunteers
  const nearbyVolunteers = state.volunteers
    .map((v) => ({ ...v, distKm: getDistanceKm(currentLat, currentLng, v.lat, v.lng) }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 4);

  // Compute nearby food supply kitchens
  const nearbyFood = (state.foodSupplies || [])
    .map((f) => {
      const distKm = getDistanceKm(currentLat, currentLng, f.lat, f.lng);
      const eta = Math.max(1, Math.round((distKm / 30) * 60));
      return { ...f, distKm, calculatedEta: eta };
    })
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 3);

  // Compute nearby sanitation crews & bio-toilets
  const nearbySanitation = state.sanitationCrews
    .map((s) => {
      const distKm = getDistanceKm(currentLat, currentLng, s.lat, s.lng);
      return { ...s, distKm };
    })
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 3);

  const handleQuickRequest = (type: "WATER" | "MEDICAL" | "HALT" | "ROAD" | "SANITATION" | "FOOD", label: string) => {
    const posStr = activeDindi
      ? `${activeDindi.name} (Code: ${activeDindi.passcode || activeDindi.number}) at Lat ${activeDindi.lat.toFixed(4)}, Lng ${activeDindi.lng.toFixed(4)}`
      : coords
      ? `Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}`
      : "Corridor GPS";
    
    if (type === "WATER" || type === "MEDICAL" || type === "HALT" || type === "FOOD" || type === "SANITATION") {
      requestLeaderAssistance(type, `${label} requested for ${posStr}`);
    } else {
      addEventLog({
        eventType: "ALERT",
        severity: "WARNING",
        source: "Dindi Leader Report",
        description: `${label}: Reported for ${posStr}`,
      });
    }

    setRequestSent(label);
    setTimeout(() => setRequestSent(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* ── 1-TAP QUICK ACTIONS / REQUESTS ── */}
      <div className="card-base p-6 border-2 border-amber-500/40 bg-white space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-wari-cardBorder gap-2">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-wari-orange animate-pulse shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-wari-textPrimary">
                🚨 Dindi Leader 1-Tap Quick Actions & Assistance
              </h3>
              <p className="text-xs text-wari-textMuted">
                Live context: <strong className="text-orange-700">{locationLabel}</strong> ({currentLat.toFixed(4)}°N, {currentLng.toFixed(4)}°E)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
            GPS LINKED DISPATCH
          </span>
        </div>

        {/* Confirmation Toast */}
        {requestSent && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Request Transmitted:</strong> {requestSent}. Control room & nearest field seva teams notified with live coordinates.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => handleQuickRequest("WATER", "💧 Urgent Water Tanker Request")}
            className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-all active:scale-98"
          >
            <Droplets className="w-4 h-4 text-blue-600 mb-1" />
            <div className="text-xs font-bold text-blue-900">Water Tanker</div>
            <div className="text-[10px] text-blue-700">Refill supply</div>
          </button>

          <button
            onClick={() => handleQuickRequest("FOOD", "🍱 Urgent Prasad & Food Supply Request")}
            className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all active:scale-98"
          >
            <Building2 className="w-4 h-4 text-amber-600 mb-1" />
            <div className="text-xs font-bold text-amber-900">Food / Prasad</div>
            <div className="text-[10px] text-amber-700">Mobile kitchen</div>
          </button>

          <button
            onClick={() => handleQuickRequest("SANITATION", "🚻 Mobile Toilet Clean & Servicing")}
            className="p-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-left transition-all active:scale-98"
          >
            <Users className="w-4 h-4 text-teal-600 mb-1" />
            <div className="text-xs font-bold text-teal-900">Sanitation</div>
            <div className="text-[10px] text-teal-700">Bio-toilet team</div>
          </button>

          <button
            onClick={() => handleQuickRequest("MEDICAL", "🚑 Medical Emergency / First Aid")}
            className="p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-left transition-all active:scale-98"
          >
            <Stethoscope className="w-4 h-4 text-red-600 mb-1" />
            <div className="text-xs font-bold text-red-900">Medical Aid</div>
            <div className="text-[10px] text-red-700">Doctor / ICU</div>
          </button>

          <button
            onClick={() => handleQuickRequest("HALT", "⛺ Halt / Rest Ground Request")}
            className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-all active:scale-98"
          >
            <Building2 className="w-4 h-4 text-purple-600 mb-1" />
            <div className="text-xs font-bold text-purple-900">Halt Request</div>
            <div className="text-[10px] text-purple-700">Rest capacity</div>
          </button>

          <button
            onClick={() => handleQuickRequest("ROAD", "🚧 Road Bottleneck / Diversion Notice")}
            className="p-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-left transition-all active:scale-98"
          >
            <Construction className="w-4 h-4 text-orange-600 mb-1" />
            <div className="text-xs font-bold text-orange-900">Road Blocked</div>
            <div className="text-[10px] text-orange-700">Traffic assist</div>
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
              GPS SORTED FROM {activeDindi ? activeDindi.name.slice(0, 15) : "LOCATION"}
            </span>
          </div>

          <div className="space-y-4">
            {/* Closest Verified Hospitals & Medical Stations (Real GPS Lookup) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <HospitalIcon className="w-3.5 h-3.5 text-red-600" />
                  Closest Hospitals & Trauma Centres
                </span>
                {isLoadingHospitals && (
                  <span className="text-[10px] text-wari-textMuted animate-pulse">Scanning live...</span>
                )}
              </div>
              <div className="space-y-2">
                {hospitals.map((h) => (
                  <div key={h.id} className="p-3 bg-red-50/60 rounded-xl border border-red-200/80 flex items-center justify-between text-xs hover:border-red-300 transition-colors">
                    <div className="space-y-0.5">
                      <div className="font-bold text-red-950 flex items-center gap-1.5">
                        <span>{h.name}</span>
                      </div>
                      <div className="text-[11px] text-red-700">
                        {h.doctorCount} Doctors • {h.availableAmbulances} Ambulances • {h.heatStrokeKits} Heat Kits
                      </div>
                      {h.address && (
                        <div className="text-[10px] text-red-600 font-mono">📍 {h.address}</div>
                      )}
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-bold text-red-700 text-sm block">{h.distKm} km</span>
                      {h.emergencyPhone && (
                        <a
                          href={`tel:${h.emergencyPhone.replace(/\s+/g, "")}`}
                          className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-bold inline-flex items-center gap-1 mt-1 hover:bg-red-700"
                        >
                          <Phone className="w-2.5 h-2.5" /> Call
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Camps & Halts */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-1.5">
                ⛺ Closest Halts & Rest Grounds (Camps 1–8)
              </span>
              <div className="space-y-2">
                {nearbyCamps.map((c) => (
                  <div key={c.id} className="p-3 bg-wari-pageBg rounded-xl border border-wari-cardBorder flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-wari-textPrimary">{c.name}</div>
                      <div className="text-[11px] text-wari-textMuted">
                        Capacity: {c.capacity.toLocaleString()} • Water: {c.waterStockPercent}% • Food: {c.foodStockPercent}% • Approx. {c.walkingHours}h walk
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-bold text-purple-600 text-sm block">{c.distKm} km away</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        c.status === "CRITICAL" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                      }`}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Water Tankers */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1.5">
                💧 Closest Water Tankers & Points
              </span>
              <div className="space-y-2">
                {nearbyTankers.map((t) => (
                  <div key={t.id} className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-blue-950">{t.id} — {t.currentHub}</div>
                      <div className="text-[11px] text-blue-800">
                        {t.capacityLiters.toLocaleString()}L • Driver: {t.driverName}
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-bold text-blue-700 text-sm block">{t.distKm} km</span>
                      <span className="text-[10px] text-blue-600 font-semibold block">ETA ~{t.calculatedEta}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anna Dan & Prasad Kitchens */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1.5">
                🍲 Closest Anna Dan & Prasad Kitchens
              </span>
              <div className="space-y-2">
                {nearbyFood.map((f) => (
                  <div key={f.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-amber-950">{f.name}</div>
                      <div className="text-[11px] text-amber-800">
                        {f.mealsCapacity.toLocaleString()} Meals • {f.leadName} ({f.phone})
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-bold text-amber-700 text-sm block">{f.distKm} km</span>
                      <span className="text-[10px] text-amber-600 font-semibold block">ETA ~{f.calculatedEta}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Bio-Toilet Pods & Sanitation */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-1.5">
                🚻 Closest Washrooms & Mobile Bio-Toilet Squads
              </span>
              <div className="space-y-2">
                {nearbySanitation.map((s) => (
                  <div key={s.id} className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-teal-950">{s.name}</div>
                      <div className="text-[11px] text-teal-800">
                        {s.mobilePodsCount || 20} Mobile Pods • Lead: {s.leadName} {s.phone ? `(${s.phone})` : ""}
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-bold text-teal-700 text-sm block">{s.distKm} km</span>
                      <span className="text-[10px] text-teal-600 font-semibold block">{s.status}</span>
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
                Nearby Ground Volunteers & Seva Contacts
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
              DIRECT CALL
            </span>
          </div>

          <p className="text-xs text-wari-textMuted">
            Dindi leaders can call on-ground volunteers stationed along Camps 1–6 directly for route guidance, water assistance, or medical aid.
          </p>

          <div className="space-y-3">
            {nearbyVolunteers.map((v) => (
              <div
                key={v.id}
                className="p-4 bg-wari-pageBg border border-wari-cardBorder rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-purple-300 transition-colors"
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
