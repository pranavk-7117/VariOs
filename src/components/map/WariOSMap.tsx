"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLiveGps } from "@/context/LiveGpsContext";
import { getLiveCrowdClusters } from "@/lib/live-ops";
import {
  Crosshair,
  Radio,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  TUKARAM_MAHARAJ_SCHEDULE_2026,
  DNYANESHWAR_MAHARAJ_SCHEDULE_2026,
  SANT_DNYANESHWAR_ROUTE_CONFIG,
} from "@/lib/palkhi-schedule";

// 20 High-Precision Waypoints from Alandi to Pandharpur (lat, lng)
export const WARI_ROUTE_WAYPOINTS: [number, number][] =
  SANT_DNYANESHWAR_ROUTE_CONFIG.route_waypoints.map((w) => [w.lat, w.lng]);

export const CHECKPOINT_COORDS: Record<string, [number, number]> = {
  CP1: [18.5204, 73.8567],
  CP2: [18.3437, 74.0293],
  CP3: [18.2145, 74.1456], // Dive Ghat
  CP4: [18.2753, 74.1573], // Jejuri
  CP5: [17.9861, 74.2956],
  CP6: [17.9862, 74.4356],
  CP7: [17.8543, 74.7653],
  CP8: [17.6805, 75.3308],
};

const RISK_COLORS: Record<string, string> = {
  CRITICAL:  "#B91C1C",
  HIGH:      "#E85A1C",
  ATTENTION: "#F59E0B",
  NORMAL:    "#10B981",
};

interface WariOSMapProps {
  height?: string;
  showLayerControl?: boolean;
  zoom?: number;
  interactiveGpsControls?: boolean;
}

const WariOSMapInner: React.FC<WariOSMapProps> = ({
  height = "500px",
  showLayerControl = true,
  zoom = 9,
  interactiveGpsControls = true,
}) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const liveMarkerRef = useRef<any>(null);
  const liveDindiLayerRef = useRef<any>(null);
  const liveSupportLayerRef = useRef<any>(null);
  const hasAutoFitLiveDindisRef = useRef(false);
  const simulatedPalkhiMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const { state } = useSimulation();
  const { t } = useLanguage();
  const { coords, isTracking, toggleTracking, boundDindiId, nearestCheckpoint, simulatedAdvance } =
    useLiveGps();

  // March Simulation States (Interpolation along the 20 waypoints)
  const [isMarchPlaying, setIsMarchPlaying] = useState<boolean>(false);
  const [marchSegment, setMarchSegment] = useState<number>(0);
  const [marchStep, setMarchStep] = useState<number>(0);
  const [currentSectorText, setCurrentSectorText] = useState<string>("Alandi Temple ➔ Vishrantwadi");
  const [routeProgressPercent, setRouteProgressPercent] = useState<number>(0);
  const liveClusters = getLiveCrowdClusters(state);
  const primaryLiveCluster = liveClusters[0];

  const totalStepsPerSegment = 80;

  // Initialize Map
  useEffect(() => {
    let isCancelled = false;

    import("leaflet").then((L) => {
      if (isCancelled || !containerRef.current) return;
      LRef.current = L;

      // Ensure container is not already initialized
      if ((containerRef.current as any)._leaflet_id) {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        delete (containerRef.current as any)._leaflet_id;
      }

      const iconDefault = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      L.Marker.prototype.options.icon = iconDefault;

      const map = L.map(containerRef.current, {
        center: [18.15, 74.5],
        zoom,
        zoomControl: true,
        attributionControl: true,
      });

      // OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Route polyline — orange dashed line
      const routeLine = L.polyline(WARI_ROUTE_WAYPOINTS, {
        color: "#E85A1C",
        weight: 5,
        opacity: 0.85,
        dashArray: "6, 8",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Fit map bounds to show complete Pune to Pandharpur corridor
      map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });

      // 20 Detailed Waypoints Layer (Alandi to Pandharpur)
      const waypoint20Layer = L.layerGroup();
      SANT_DNYANESHWAR_ROUTE_CONFIG.route_waypoints.forEach((wp) => {
        const isStart = wp.sequence === 1;
        const isEnd = wp.sequence === 20;
        const isRingan = wp.type.toLowerCase().includes("ringan");

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              background:${isStart ? "#6B1D47" : isEnd ? "#E85A1C" : isRingan ? "#D97706" : "#2563EB"};
              border:2px solid white;
              border-radius:10px;
              padding:2px 6px;
              font-size:10px;
              font-weight:800;
              color:white;
              white-space:nowrap;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
              display:flex;align-items:center;gap:4px;
            ">
              <span style="background:rgba(255,255,255,0.25);border-radius:50%;width:14px;height:14px;display:flex;align-items:center;justify-content:center;font-size:9px;">
                ${wp.sequence}
              </span>
              <span>${wp.location.split(",")[0]}</span>
            </div>
          `,
          iconAnchor: [35, 12],
          popupAnchor: [0, -14],
        });

        L.marker([wp.lat, wp.lng], { icon })
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;padding:6px;min-width:220px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:10px;font-weight:800;padding:2px 6px;border-radius:4px;background:#EFF6FF;color:#1E40AF">
                  STAGE #${wp.sequence} of 20
                </span>
                <span style="font-size:11px;font-weight:700;color:#E85A1C">${wp.distance_from_start_km} km</span>
              </div>
              <div style="font-weight:800;font-size:14px;color:#1C1529;margin-bottom:3px">
                ${wp.location}
              </div>
              <div style="font-size:11px;color:#4B5563;margin-bottom:4px">
                Type: <strong>${wp.type}</strong>
              </div>
              <div style="font-size:10px;color:#6B7280;font-mono">
                ${wp.lat.toFixed(4)}°N, ${wp.lng.toFixed(4)}°E
              </div>
            </div>
          `, { maxWidth: 250 })
          .addTo(waypoint20Layer);
      });
      waypoint20Layer.addTo(map);

      // Checkpoints layer
      const checkpointLayer = L.layerGroup();
      if (state.isSimulating) state.checkpoints.forEach((cp) => {
        const cpCoords = CHECKPOINT_COORDS[cp.shortCode];
        if (!cpCoords) return;

        const color = RISK_COLORS[cp.risk] ?? "#10B981";
        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              background:${color};
              border:3px solid white;
              border-radius:50%;
              width:22px;height:22px;
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 2px 8px rgba(0,0,0,0.25);
              font-size:9px;font-weight:700;color:white;
              font-family:monospace;
            ">${cp.shortCode.replace("CP","")}</div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -14],
        });

        const marker = L.marker(cpCoords, { icon });
        marker.bindPopup(`
          <div style="font-family:system-ui,sans-serif;padding:4px;min-width:180px">
            <div style="font-weight:700;font-size:14px;color:#1C1529;margin-bottom:6px">
              ${cp.name}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px">
              <div style="color:#6A6070">Density</div>
              <div style="font-weight:600;color:${color}">${cp.currentDensity}%</div>
              <div style="color:#6A6070">Forecast 45m</div>
              <div style="font-weight:600;color:#1C1529">${cp.forecast45Min}%</div>
              <div style="color:#6A6070">Volunteers</div>
              <div style="font-weight:600;color:#1C1529">${cp.assignedVolunteers}</div>
              <div style="color:#6A6070">Risk</div>
              <div style="font-weight:700;color:${color}">${cp.risk}</div>
            </div>
          </div>
        `, { maxWidth: 250 });

        checkpointLayer.addLayer(marker);
      });
      if (state.isSimulating) checkpointLayer.addTo(map);

      // Camps layer
      const campLayer = L.layerGroup();
      state.camps.forEach((camp) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:#3B82F6;border:2px solid white;border-radius:6px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.2)">⛺</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -14],
        });

        L.marker([camp.lat, camp.lng], { icon })
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;padding:4px;min-width:160px">
              <div style="font-weight:700;font-size:13px;color:#1C1529;margin-bottom:4px">${camp.name}</div>
              <div style="font-size:12px;color:#6A6070">Occupancy: <strong style="color:#1C1529">${camp.currentOccupancy.toLocaleString()}</strong></div>
              <div style="font-size:12px;color:#6A6070">Water: <strong style="color:#3B82F6">${camp.waterStockPercent}%</strong></div>
            </div>
          `, { maxWidth: 200 })
          .addTo(campLayer);
      });
      campLayer.addTo(map);

      // Medical station markers
      const medLayer = L.layerGroup();
      state.medicalStations.forEach((ms) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:#10B981;border:2px solid white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.2)">🏥</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -14],
        });

        L.marker([ms.lat, ms.lng], { icon })
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;padding:4px;min-width:160px">
              <div style="font-weight:700;font-size:13px;color:#1C1529;margin-bottom:4px">${ms.name}</div>
              <div style="font-size:12px;color:#6A6070">Occupancy: <strong style="color:#1C1529">${ms.occupancyPercent}%</strong></div>
              <div style="font-size:12px;color:#6A6070">Beds: <strong style="color:#10B981">${ms.occupiedBeds}/${ms.capacityBeds}</strong></div>
            </div>
          `, { maxWidth: 200 })
          .addTo(medLayer);
      });
      medLayer.addTo(map);

      // 2026 Ringans & Halts Layer
      const ringanHaltLayer = L.layerGroup();
      const allEvents = [...DNYANESHWAR_MAHARAJ_SCHEDULE_2026, ...TUKARAM_MAHARAJ_SCHEDULE_2026];
      allEvents.forEach((ev) => {
        const isRingan = ev.isRingan;
        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              background:${isRingan ? "#D97706" : "#4F46E5"};
              border:2px solid white;
              border-radius:8px;
              padding:2px 5px;
              font-size:9px;
              font-weight:700;
              color:white;
              white-space:nowrap;
              box-shadow:0 2px 6px rgba(0,0,0,0.25);
              display:flex;align-items:center;gap:3px;
            ">
              <span>${isRingan ? "🔥" : "🚩"}</span>
              <span>${ev.locationName.split(" ")[0]}</span>
            </div>
          `,
          iconAnchor: [30, 10],
          popupAnchor: [0, -12],
        });

        L.marker([ev.lat, ev.lng], { icon })
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;padding:6px;min-width:210px">
              <div style="display:flex;align-items:center;justify-content:between;margin-bottom:4px">
                <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:${isRingan ? "#FEF3C7;color:#92400E" : "#EEF2FF;color:#3730A3"}">
                  ${isRingan ? "RINGAN CEREMONY" : "2026 PALKHI HALT"}
                </span>
                <span style="font-size:10px;color:#6A6070;font-weight:600">${ev.date}</span>
              </div>
              <div style="font-weight:700;font-size:13px;color:#1C1529;margin-bottom:2px">
                ${ev.locationName}
              </div>
              <div style="font-size:11px;color:#4B5563;line-height:1.4;margin-bottom:4px">
                ${ev.description}
              </div>
              <div style="font-size:10px;color:#E85A1C;font-weight:600">
                Palkhi: ${ev.palkhi === "DNYANESHWAR_MAHARAJ" ? "Sant Dnyaneshwar Mauli" : "Sant Tukaram Maharaj"}
              </div>
            </div>
          `, { maxWidth: 240 })
          .addTo(ringanHaltLayer);
      });
      ringanHaltLayer.addTo(map);

      // Create Simulated Moving Marker along the Route
      const simulatedIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;border-radius:50%;background:#D97706;opacity:0.4;animation:ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position:absolute;width:26px;height:26px;border-radius:50%;background:#D97706;border:2.5px solid white;box-shadow:0 0 12px rgba(217,119,6,0.9);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">
              🚩
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      if (state.isSimulating) {
      const simMarker = L.marker(WARI_ROUTE_WAYPOINTS[0], { icon: simulatedIcon, zIndexOffset: 2000 })
        .bindPopup("<b>🚩 Sant Dnyaneshwar Maharaj Palkhi Chariot (Rath)</b><br>Live Route March Simulation Active");
      simMarker.addTo(map);
      simulatedPalkhiMarkerRef.current = simMarker;
      }

      // Layer controls
      if (showLayerControl) {
        const overlays = {
          "🚩 20 Route Waypoints": waypoint20Layer,
          "🌟 2026 Ringans & Halts": ringanHaltLayer,
          "🔴 Checkpoints": checkpointLayer,
          "⛺ Camps": campLayer,
          "🏥 Medical Stations": medLayer,
        };
        L.control.layers(undefined, overlays, { collapsed: false }).addTo(map);
      }

      mapRef.current = map;
    });

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerRef.current && (containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;
    const L = LRef.current;
    const map = mapRef.current;

    if (liveDindiLayerRef.current) {
      map.removeLayer(liveDindiLayerRef.current);
      liveDindiLayerRef.current = null;
    }

    const liveDindis = state.dindis.filter((dindi) => dindi.isCustomRegistered);
    if (liveDindis.length === 0) return;

    const layer = L.layerGroup();
    liveDindis.forEach((dindi) => {
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;border-radius:50%;background:${dindi.routeColor};opacity:0.35;animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:absolute;width:30px;height:30px;border-radius:50%;background:${dindi.routeColor};border:3px solid white;box-shadow:0 0 14px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:800;">
              D
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20],
      });

      L.marker([dindi.lat, dindi.lng], { icon, zIndexOffset: 2200 })
        .bindPopup(`
          <div style="font-family:system-ui,sans-serif;padding:6px;min-width:210px">
            <div style="font-weight:800;font-size:14px;color:#1C1529">${dindi.name}</div>
            <div style="font-size:12px;color:#6A6070;margin-top:3px">Leader: <strong>${dindi.leader}</strong></div>
            <div style="font-size:12px;color:#6A6070">Live count: <strong>${dindi.pilgrimCount.toLocaleString()}</strong></div>
            <div style="font-size:12px;color:#6A6070">Pace: <strong>${dindi.currentPaceKmH} km/h</strong></div>
            <div style="font-size:11px;color:#10B981;margin-top:4px;font-weight:700">Real leader-registered GPS</div>
          </div>
        `)
        .addTo(layer);
    });

    layer.addTo(map);
    liveDindiLayerRef.current = layer;

    if (!state.isSimulating && !hasAutoFitLiveDindisRef.current) {
      const bounds = L.latLngBounds(liveDindis.map((dindi) => [dindi.lat, dindi.lng]));
      map.fitBounds(bounds.pad(0.5), { maxZoom: 15, padding: [40, 40] });
      hasAutoFitLiveDindisRef.current = true;
    }
  }, [state.dindis, state.isSimulating]);

  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;
    const L = LRef.current;
    const map = mapRef.current;

    if (liveSupportLayerRef.current) {
      map.removeLayer(liveSupportLayerRef.current);
      liveSupportLayerRef.current = null;
    }

    if (state.isSimulating) return;

    const layer = L.layerGroup();
    const makeIcon = (label: string, color: string, shape: "round" | "square" = "round") =>
      L.divIcon({
        className: "",
        html: `<div style="background:${color};border:2px solid white;border-radius:${shape === "round" ? "50%" : "7px"};width:24px;height:24px;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,0.25)">${label}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
      });

    state.tankers.forEach((tanker) => {
      L.marker([tanker.lat, tanker.lng], { icon: makeIcon("W", "#2563EB", "square") })
        .bindPopup(`<strong>${tanker.id}</strong><br>${tanker.currentHub}<br>${tanker.capacityLiters.toLocaleString()}L | ${tanker.status}`)
        .addTo(layer);
    });

    state.volunteers.forEach((volunteer) => {
      L.marker([volunteer.lat, volunteer.lng], { icon: makeIcon("V", "#7C3AED") })
        .bindPopup(`<strong>${volunteer.name}</strong><br>${volunteer.locationName}<br>${volunteer.phone ?? "No phone"}<br>${volunteer.skills.join(", ")}`)
        .addTo(layer);
    });

    state.sanitationCrews.forEach((crew) => {
      L.marker([crew.lat, crew.lng], { icon: makeIcon("S", "#0F766E", "square") })
        .bindPopup(`<strong>${crew.name}</strong><br>${crew.zone}<br>${crew.status}`)
        .addTo(layer);
    });

    layer.addTo(map);
    liveSupportLayerRef.current = layer;
  }, [state.isSimulating, state.tankers, state.volunteers, state.sanitationCrews]);

  // March Simulation Interpolation Interval Engine
  useEffect(() => {
    if (!isMarchPlaying || !simulatedPalkhiMarkerRef.current) return;

    const interval = setInterval(() => {
      setMarchStep((prevStep) => {
        let nextStep = prevStep + 1;
        let seg = marchSegment;

        if (nextStep > totalStepsPerSegment) {
          nextStep = 0;
          seg = seg + 1;
          if (seg >= WARI_ROUTE_WAYPOINTS.length - 1) {
            seg = 0; // Loop back to Alandi
          }
          setMarchSegment(seg);
        }

        const start = WARI_ROUTE_WAYPOINTS[seg];
        const end = WARI_ROUTE_WAYPOINTS[seg + 1];

        // Linear interpolation
        const fraction = nextStep / totalStepsPerSegment;
        const lat = start[0] + (end[0] - start[0]) * fraction;
        const lng = start[1] + (end[1] - start[1]) * fraction;

        simulatedPalkhiMarkerRef.current.setLatLng([lat, lng]);

        // Calculate progress percentage
        const overall = Math.round(
          ((seg + fraction) / (WARI_ROUTE_WAYPOINTS.length - 1)) * 100
        );
        setRouteProgressPercent(overall);

        const fromName = SANT_DNYANESHWAR_ROUTE_CONFIG.route_waypoints[seg]?.location.split(",")[0] || "Alandi";
        const toName = SANT_DNYANESHWAR_ROUTE_CONFIG.route_waypoints[seg + 1]?.location.split(",")[0] || "Pandharpur";
        setCurrentSectorText(`${fromName} ➔ ${toName}`);

        return nextStep;
      });
    }, 75);

    return () => clearInterval(interval);
  }, [isMarchPlaying, marchSegment]);

  // Update Live GPS User / Dindi Marker whenever coords changes
  useEffect(() => {
    if (!mapRef.current || !LRef.current || !coords) return;
    const L = LRef.current;
    const map = mapRef.current;

    if (liveMarkerRef.current) {
      map.removeLayer(liveMarkerRef.current);
      liveMarkerRef.current = null;
    }
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
      accuracyCircleRef.current = null;
    }

    const latLng: [number, number] = [coords.lat, coords.lng];

    if (coords.accuracy > 0 && coords.accuracy < 2000) {
      accuracyCircleRef.current = L.circle(latLng, {
        radius: Math.max(30, coords.accuracy),
        color: "#E85A1C",
        fillColor: "#E85A1C",
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map);
    }

    const liveIcon = L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;inset:0;border-radius:50%;background:#E85A1C;opacity:0.4;animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:#E85A1C;box-shadow:0 0 14px rgba(232,90,28,0.8);border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:13px;">
            📍
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20],
    });

    const marker = L.marker(latLng, { icon: liveIcon, zIndexOffset: 1000 });
    marker.bindPopup(`
      <div style="font-family:system-ui,sans-serif;padding:6px;min-width:200px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10B981;"></span>
          <span style="font-weight:700;font-size:13px;color:#E85A1C;">LIVE DEVICE GPS BEACON</span>
        </div>
        <div style="font-weight:700;font-size:14px;color:#1C1529;margin-bottom:4px">
          ${boundDindiId}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;color:#6A6070">
          <div>Latitude:</div>
          <div style="font-weight:600;color:#1C1529">${coords.lat.toFixed(5)}°N</div>
          <div>Longitude:</div>
          <div style="font-weight:600;color:#1C1529">${coords.lng.toFixed(5)}°E</div>
          <div>Speed:</div>
          <div style="font-weight:700;color:#E85A1C">${coords.speedKmH} km/h</div>
          <div>Accuracy:</div>
          <div style="font-weight:600;color:#10B981">±${coords.accuracy}m</div>
          ${
            nearestCheckpoint
              ? `<div>Nearest Stage:</div><div style="font-weight:700;color:#1C1529">${nearestCheckpoint.name} (${nearestCheckpoint.distanceKm} km)</div>`
              : ""
          }
        </div>
      </div>
    `);

    marker.addTo(map);
    liveMarkerRef.current = marker;
  }, [coords, boundDindiId, nearestCheckpoint]);

  const handleCenterOnLocation = () => {
    if (!mapRef.current || !coords) return;
    mapRef.current.flyTo([coords.lat, coords.lng], 13, {
      animate: true,
      duration: 1.2,
    });
    if (liveMarkerRef.current) {
      liveMarkerRef.current.openPopup();
    }
  };

  const handleCenterOnMarchingPalkhi = () => {
    if (!mapRef.current || !simulatedPalkhiMarkerRef.current) return;
    const curLatLng = simulatedPalkhiMarkerRef.current.getLatLng();
    mapRef.current.flyTo([curLatLng.lat, curLatLng.lng], 12, {
      animate: true,
      duration: 1.0,
    });
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-card border border-wari-cardBorder">
      <div
        ref={containerRef}
        style={{ height, width: "100%" }}
      />

      {/* Floating Status & Simulation Control Card (Top Right) */}
      {interactiveGpsControls && (
        <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur border border-wari-cardBorder rounded-2xl p-3.5 shadow-lg max-w-[280px] space-y-2.5 text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-wari-cardBorder">
            <div className="flex items-center gap-2">
              <span className="text-base">🚩</span>
              <span className="font-bold text-sm text-wari-textPrimary truncate">
                Sant Dnyaneshwar Palkhi
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-wari-textMuted">
              <span>Mode:</span>
              <span className="font-bold text-emerald-700">
                {isMarchPlaying ? "Route March Active" : "GPS Live Stream"}
              </span>
            </div>
            <div className="flex justify-between text-wari-textMuted">
              <span>Current Sector:</span>
              <span className="font-bold text-wari-textPrimary truncate max-w-[140px]" title={currentSectorText}>
                {currentSectorText}
              </span>
            </div>
            <div className="flex justify-between text-wari-textMuted">
              <span>Route Progress:</span>
              <span className="font-bold text-wari-orange font-mono">
                {routeProgressPercent}% (240km)
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-wari-pageBg h-1.5 rounded-full overflow-hidden border border-wari-cardBorder">
            <div
              className="h-full bg-gradient-to-r from-wari-orange to-wari-plum rounded-full transition-all duration-300"
              style={{ width: `${routeProgressPercent}%` }}
            />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => setIsMarchPlaying((p) => !p)}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                isMarchPlaying
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "btn-primary text-xs"
              }`}
            >
              {isMarchPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause March</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Play March</span>
                </>
              )}
            </button>

            <button
              onClick={handleCenterOnLocation}
              title="Center on My Real Device GPS"
              className="p-1.5 rounded-xl bg-wari-pageBg hover:bg-wari-orangeLight border border-wari-cardBorder text-wari-textSecond hover:text-wari-orange transition-all"
            >
              <Crosshair className="w-4 h-4" />
            </button>

            <button
              onClick={handleCenterOnMarchingPalkhi}
              title="Follow Marching Palkhi Chariot"
              className="p-1.5 rounded-xl bg-wari-pageBg hover:bg-wari-orangeLight border border-wari-cardBorder text-wari-textSecond hover:text-wari-orange transition-all"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!state.isSimulating && primaryLiveCluster && (
        <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur border border-wari-cardBorder rounded-2xl p-3.5 shadow-lg max-w-[300px] space-y-2 text-xs animate-fadeIn">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-wari-cardBorder">
            <span className="font-bold text-sm text-wari-textPrimary">Live MMCOE Ops</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              primaryLiveCluster.overcrowdedBy > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
            }`}>
              {primaryLiveCluster.risk}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-wari-pageBg rounded-lg p-2 border border-wari-cardBorder">
              <span className="block text-wari-textMuted">People</span>
              <strong>{primaryLiveCluster.totalPilgrims.toLocaleString()} / {primaryLiveCluster.capacity.toLocaleString()}</strong>
            </div>
            <div className="bg-wari-pageBg rounded-lg p-2 border border-wari-cardBorder">
              <span className="block text-wari-textMuted">Occupancy</span>
              <strong>{primaryLiveCluster.occupancyPercent}%</strong>
            </div>
          </div>
          <div className="space-y-1 text-wari-textSecond">
            <div><strong>Next halt:</strong> {primaryLiveCluster.nearestCamp?.item.name ?? "Assign halt"}</div>
            <div><strong>Medical:</strong> {primaryLiveCluster.nearestMedical?.item.name ?? "Assign post"}</div>
            <div><strong>Water:</strong> {primaryLiveCluster.nearestTanker?.item.currentHub ?? "Assign tanker"}</div>
            <div><strong>Volunteers:</strong> {primaryLiveCluster.nearestVolunteers.map((v) => v.item.name).join(", ") || "Assign team"}</div>
          </div>
        </div>
      )}

      {/* Live GPS Telemetry Strip at Bottom of Map */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur border border-wari-cardBorder rounded-xl p-2.5 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div>
            <span className="font-bold text-wari-textPrimary block text-xs">
              Live Real-Time Palkhi GPS Broadcast ({boundDindiId})
            </span>
            <span className="text-[11px] text-wari-textMuted">
              {coords
                ? `${coords.lat.toFixed(5)}°N, ${coords.lng.toFixed(5)}°E (Acc: ±${coords.accuracy}m)`
                : "Acquiring GPS Fix via Device Geolocation..."}
            </span>
          </div>
        </div>

        {nearestCheckpoint && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-wari-pageBg rounded-lg border border-wari-cardBorder text-[11px]">
            <span className="text-wari-textMuted">Nearest Stage:</span>
            <span className="font-bold text-wari-orange truncate max-w-[160px]">
              {nearestCheckpoint.name} ({nearestCheckpoint.distanceKm} km)
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggleTracking}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isTracking
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-gray-100 text-gray-700 border border-gray-300"
            }`}
          >
            {isTracking ? "● GPS Active" : "○ GPS Paused"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const WariOSMap = WariOSMapInner;
