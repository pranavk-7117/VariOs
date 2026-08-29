"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  SimulationState,
  DecisionStage,
  OperationalEvent,
  Alert,
  VolunteerTask,
  Volunteer,
  Dindi,
  Camp,
} from "@/lib/types";
import {
  LIVE_INITIAL_STATE,
  DEMO_INITIAL_STATE,
  LIVE_SUPPORT_CAMPS,
  LIVE_SUPPORT_TANKERS,
  LIVE_SUPPORT_FOOD_SUPPLIES,
  LIVE_SUPPORT_VOLUNTEERS,
} from "@/lib/constants";
import {
  executeDispatchAction,
  tickSimulationEngine,
} from "@/lib/simulation-engine";
import { getDistanceKm, getLiveCrowdClusters } from "@/lib/live-ops";
import { clearLocalLiveDindis, deleteLiveDindi, loadLiveDindis, saveLiveDindis } from "@/lib/live-store";

interface SimulationContextType {
  state: SimulationState;
  isMitigated: boolean;
  // Mode controls
  setIsSimulating: (val: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  resetAll: () => void;
  // Operational dispatch actions (used in Demo mode)
  rerouteDindi14: () => void;
  dispatchTankerT03: () => void;
  deployVolunteersCP4: () => void;
  openBackupShelterB: () => void;
  executeFullMitigation: () => void;
  closeBeforeAfterModal: () => void;
  setDecisionStage: (stage: DecisionStage) => void;
  addEventLog: (event: Omit<OperationalEvent, "id" | "timestamp">) => void;
  registerDynamicDindi: (params: {
    name: string;
    leader: string;
    count: number;
    route: string;
    lat: number;
    lng: number;
  }) => { dindiId: string; passcode: string; dindiNumber: number };
  updateLiveDindiLocation: (dindiId: string, lat: number, lng: number, speedKmH?: number) => void;
  requestLeaderAssistance: (type: "WATER" | "MEDICAL" | "HALT" | "FOOD" | "SANITATION", details: string) => void;
  reportVolunteerIncident: (params: {
    label: string;
    severity: "HIGH" | "CRITICAL" | "MEDIUM";
    lat?: number;
    lng?: number;
  }) => void;
  updateVolunteerTask: (taskId: string, status: VolunteerTask["status"], remarks?: string) => void;
  assignCommandTask: (params: {
    campId: string;
    volunteerId?: string;
    type: VolunteerTask["type"];
    title: string;
    etaMinutes: number;
    notes?: string;
  }) => void;
  assignVolunteerToCamp: (volunteerId: string, campId: string) => void;
  deleteVolunteerTask: (taskId: string) => void;
  deleteDindi: (dindiId: string) => void;
  applyLiveClusterMitigation: (clusterId?: string) => void;
  rerouteLiveDindi: (dindiId: string, targetCampId: string) => void;
  openTemporaryAuxiliaryCamp: (baseCampId: string) => void;
  regulatePalkhiPace: (action: "THROTTLE_PACE" | "RELEASE_BATCH") => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

function getNearestHaltPlan(state: SimulationState, lat: number, lng: number, paceKmH = 3.6) {
  const nearestCamp = state.camps
    .map((camp) => ({ camp, distanceKm: getDistanceKm(lat, lng, camp.lat, camp.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];

  if (!nearestCamp) {
    return { nextHalt: "Camp 1 (Pune Bhavani Peth)", etaNextHalt: "15 min" };
  }

  const etaMinutes = Math.max(1, Math.round((nearestCamp.distanceKm / Math.max(1, paceKmH)) * 60));
  return {
    nextHalt: nearestCamp.camp.name,
    etaNextHalt: `${etaMinutes} min (${nearestCamp.distanceKm} km)`,
  };
}

function computeLiveCamps(dindis: Dindi[], baseCamps: Camp[], tasks: VolunteerTask[] = []): Camp[] {
  return baseCamps.map((camp) => {
    const assignedPilgrims = dindis
      .filter((d) => d.isCustomRegistered)
      .filter((d) => {
        // If explicitly rerouted to another camp, count towards that target camp
        if ((d as any).reroutedCampId) {
          return (d as any).reroutedCampId === camp.id;
        }
        const closest = baseCamps
          .map((c) => ({ c, dist: getDistanceKm(d.lat, d.lng, c.lat, c.lng) }))
          .sort((a, b) => a.dist - b.dist)[0];
        return closest?.c.id === camp.id;
      })
      .reduce((sum, d) => sum + d.pilgrimCount, 0);

    const occupancyPercent = Math.min(200, Math.round((assignedPilgrims / camp.capacity) * 100));

    // Check verification status from volunteer tasks
    const hasPendingWater = tasks.some(
      (t) => t.type === "WATER_TANKER" && (t.campId === camp.id || t.campName?.includes(camp.name) || camp.name.includes(t.campName || "")) && t.status !== "VERIFIED"
    );
    const hasVerifiedWater = tasks.some(
      (t) => t.type === "WATER_TANKER" && (t.campId === camp.id || t.campName?.includes(camp.name) || camp.name.includes(t.campName || "")) && t.status === "VERIFIED"
    );
    const hasPendingFood = tasks.some(
      (t) => t.type === "FOOD_SUPPLY" && (t.campId === camp.id || t.campName?.includes(camp.name) || camp.name.includes(t.campName || "")) && t.status !== "VERIFIED"
    );
    const hasVerifiedFood = tasks.some(
      (t) => t.type === "FOOD_SUPPLY" && (t.campId === camp.id || t.campName?.includes(camp.name) || camp.name.includes(t.campName || "")) && t.status === "VERIFIED"
    );

    let waterStockPercent = 95;
    let foodStockPercent = 92;
    let minutesToWaterDepletion = 360;
    let status: "NORMAL" | "ATTENTION" | "HIGH" | "CRITICAL" = "NORMAL";

    if (occupancyPercent >= 100) {
      // Overcrowded overflow (e.g. 52,100 pilgrims on 40,000 capacity = 130% overflow)
      waterStockPercent = hasVerifiedWater ? 100 : 15; // RED
      foodStockPercent = hasVerifiedFood ? 100 : 18;   // RED
      minutesToWaterDepletion = hasVerifiedWater ? 480 : 18;
      status = hasVerifiedWater && hasVerifiedFood ? "NORMAL" : "CRITICAL";
    } else if (hasPendingWater || hasPendingFood) {
      waterStockPercent = hasPendingWater ? 15 : (hasVerifiedWater ? 100 : 85);
      foodStockPercent = hasPendingFood ? 18 : (hasVerifiedFood ? 100 : 85);
      minutesToWaterDepletion = hasPendingWater ? 20 : 300;
      status = "CRITICAL";
    } else if (occupancyPercent > 50) {
      waterStockPercent = hasVerifiedWater ? 100 : Math.max(35, 95 - Math.round(occupancyPercent * 0.45));
      foodStockPercent = hasVerifiedFood ? 100 : Math.max(40, 92 - Math.round(occupancyPercent * 0.4));
      minutesToWaterDepletion = Math.max(60, 360 - occupancyPercent * 2);
      status = occupancyPercent > 80 ? "ATTENTION" : "NORMAL";
    } else {
      waterStockPercent = hasVerifiedWater ? 100 : 95;
      foodStockPercent = hasVerifiedFood ? 100 : 92;
      minutesToWaterDepletion = 360;
      status = "NORMAL";
    }

    return {
      ...camp,
      currentOccupancy: assignedPilgrims,
      occupancyPercent,
      waterStockPercent,
      waterBurnRateLitersPerMin: Math.max(20, Math.round(assignedPilgrims * 0.08)),
      minutesToWaterDepletion,
      foodStockPercent,
      shelterStatus: occupancyPercent > 100 ? ("OVERFLOW" as const) : ("STABLE" as const),
      status,
    };
  });
}

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  // Start in Live Real Mode — empty state with pure real baseline
  const [state, setState] = useState<SimulationState>(LIVE_INITIAL_STATE);
  // Keep track of live-registered Dindis so they survive mode switches
  const [liveDindis, setLiveDindis] = useState<SimulationState["dindis"]>([]);
  const [hasLoadedLiveStore, setHasLoadedLiveStore] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncFromStore = () => {
      loadLiveDindis()
        .then((parsed) => {
          if (!isMounted) return;
          setLiveDindis(parsed);
          setState((prev) => {
            if (prev.isSimulating) return prev;
            return {
              ...prev,
              dindis: parsed,
              totalPilgrims: parsed.reduce((sum, dindi) => sum + dindi.pilgrimCount, 0),
              camps: computeLiveCamps(parsed, LIVE_SUPPORT_CAMPS, prev.volunteerTasks),
            };
          });
          setHasLoadedLiveStore(true);
        })
        .catch((error) => {
          console.warn("[WariOS] Failed to restore live Dindis", error);
          if (isMounted) setHasLoadedLiveStore(true);
        });
    };

    syncFromStore();
    const interval = window.setInterval(syncFromStore, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedLiveStore) return;
    saveLiveDindis(liveDindis).catch((error) =>
      console.warn("[WariOS] Failed to persist live Dindis", error),
    );
  }, [hasLoadedLiveStore, liveDindis]);

  // Demo mode simulation tick
  useEffect(() => {
    if (!state.isSimulating) return;
    const interval = setInterval(() => {
      setState((prev) => tickSimulationEngine(prev));
    }, 4000 / state.simulationSpeed);
    return () => clearInterval(interval);
  }, [state.isSimulating, state.simulationSpeed]);

  const setIsSimulating = useCallback((val: boolean) => {
    if (val) {
      // Switching TO Demo Archive — load historical data + merge live dindis on top
      setState({ ...DEMO_INITIAL_STATE, dindis: [...liveDindis, ...DEMO_INITIAL_STATE.dindis] });
    } else {
      // Switching TO Live Real Mode — clear all demo data, calculate real live camps
      setState({
        ...LIVE_INITIAL_STATE,
        dindis: liveDindis,
        totalPilgrims: liveDindis.reduce((sum, d) => sum + d.pilgrimCount, 0),
        camps: computeLiveCamps(liveDindis, LIVE_SUPPORT_CAMPS),
      });
    }
  }, [liveDindis]);

  const setSimulationSpeed = (speed: number) => {
    setState((prev) => ({ ...prev, simulationSpeed: speed }));
  };

  const resetAll = useCallback(() => {
    setLiveDindis([]);
    setState(LIVE_INITIAL_STATE);
    clearLocalLiveDindis().catch((error) => console.warn("[WariOS] Failed to clear local live data", error));
  }, []);

  const rerouteDindi14 = useCallback(() => {
    setState((prev) => executeDispatchAction("REROUTE_DINDI_14", prev));
  }, []);

  const dispatchTankerT03 = useCallback(() => {
    setState((prev) => executeDispatchAction("DISPATCH_TANKER_T03", prev));
  }, []);

  const deployVolunteersCP4 = useCallback(() => {
    setState((prev) => executeDispatchAction("DEPLOY_VOLUNTEERS_CP4", prev));
  }, []);

  const openBackupShelterB = useCallback(() => {
    setState((prev) => executeDispatchAction("OPEN_BACKUP_SHELTER_B", prev));
  }, []);

  const executeFullMitigation = useCallback(() => {
    setState((prev) => {
      if (prev.isSimulating) {
        return executeDispatchAction("EXECUTE_FULL_MITIGATION_RESPONSE", prev);
      }

      const liveClusters = getLiveCrowdClusters(prev);
      const topCluster = liveClusters[0];
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      const beforeOccupancy = topCluster?.occupancyPercent ?? prev.routeUtilization;
      const afterOccupancy =
        beforeOccupancy > 70
          ? Math.round(beforeOccupancy * 0.72)
          : Math.max(1, Math.round(beforeOccupancy * 0.85));
      const overflowBefore = topCluster ? Math.max(0, topCluster.totalPilgrims - topCluster.capacity) : 0;
      const overflowAfter = Math.max(0, Math.round(overflowBefore * 0.35));
      const pressureDelta = beforeOccupancy > afterOccupancy ? beforeOccupancy - afterOccupancy : 0;
      const nearestCamp = topCluster?.nearestCamp?.item.name ?? "Camp 1 (Pune Racecourse / Bhavani Peth)";
      const nearestMedical = topCluster?.nearestMedical?.item.name ?? "Deenanath Mangeshkar Hospital";
      const nearestTanker = topCluster?.nearestTanker?.item.currentHub ?? "Hadapsar Hub";

      return {
        ...prev,
        decisionStage: "VERIFIED",
        isMitigated: true,
        showBeforeAfterModal: true,
        beforeAfterSummary: [
          {
            metric: "Live Dindi Crowd Load",
            before: `${beforeOccupancy}%`,
            after: `${afterOccupancy}%`,
            unit: "%",
            improved: true,
            deltaText: pressureDelta > 0 ? `${pressureDelta}% Optimized` : "Optimal Flow",
          },
          {
            metric: "Over-Capacity Pilgrims",
            before: overflowBefore > 0 ? overflowBefore.toLocaleString() : "0 (Safe)",
            after: overflowAfter > 0 ? overflowAfter.toLocaleString() : "0 (Within Buffer)",
            unit: "people",
            improved: true,
            deltaText: overflowBefore > 0 ? `${overflowBefore - overflowAfter} Re-routed` : "Safe Capacity",
          },
          {
            metric: "Nearest Halt Assignment",
            before: "Manual",
            after: nearestCamp,
            unit: "halt",
            improved: true,
            deltaText: "GPS Matched",
          },
          {
            metric: "Medical & Water Response",
            before: "Unassigned",
            after: `${nearestMedical} + ${nearestTanker}`,
            unit: "teams",
            improved: true,
            deltaText: "Nearest Teams Linked",
          },
        ],
        alerts: prev.alerts.map((alert) => {
          if (alert.status !== "ACTIVE") return alert;
          const isFood = alert.title.includes("Food") || alert.cause.includes("Food") || alert.cause.includes("Prasad");
          const isWater = alert.title.includes("Water") || alert.cause.includes("Water");
          const isMedical = alert.title.includes("Medical") || alert.cause.includes("Medical");
          const isSanitation = alert.title.includes("Sanitation") || alert.cause.includes("Sanitation") || alert.cause.includes("Toilet");

          const action = isFood
            ? `Mitigation in progress: Dispatched Mobile Anna Dan Kitchen truck with meal packets to ${alert.location}. Ground volunteer assigned for prasad distribution.`
            : isWater
            ? `Mitigation in progress: Dispatched Water Tanker (${nearestTanker}) to ${alert.location}. Volunteer assigned for tank refill verification.`
            : isMedical
            ? `Mitigation in progress: Alerted ${nearestMedical} and dispatched mobile ambulance with emergency medical doctor to ${alert.location}.`
            : isSanitation
            ? `Mitigation in progress: Dispatched Mobile Bio-Toilet sanitation squad with mobile pods to ${alert.location}.`
            : `Mitigation in progress: Directed overflow toward ${nearestCamp}, alerted ${nearestMedical}, and staged water from ${nearestTanker}.`;

          return {
            ...alert,
            status: "MITIGATION_IN_PROGRESS" as const,
            recommendedAction: action,
          };
        }),
        events: [
          {
            id: `EV-LIVE-MITIGATION-${Date.now()}`,
            timestamp: timeString,
            eventType: "VERIFICATION" as const,
            severity: "SUCCESS" as const,
            source: "Live Command Centre",
            description: `Closed-loop live response verified for ${topCluster?.name ?? "registered Dindis"} using the selected live GPS cluster.`,
          },
          ...prev.events,
        ],
      };
    });
  }, []);

  const closeBeforeAfterModal = useCallback(() => {
    setState((prev) => ({ ...prev, showBeforeAfterModal: false }));
  }, []);

  const setDecisionStage = useCallback((stage: DecisionStage) => {
    setState((prev) => ({ ...prev, decisionStage: stage }));
  }, []);

  const addEventLog = useCallback((event: Omit<OperationalEvent, "id" | "timestamp">) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

    const newEntry: OperationalEvent = {
      id: `EV-${Date.now()}`,
      timestamp: timeString,
      ...event,
    };

    setState((prev) => ({
      ...prev,
      events: [newEntry, ...prev.events],
    }));
  }, []);

  const registerDynamicDindi = useCallback(
    (params: { name: string; leader: string; count: number; route: string; lat: number; lng: number }) => {
      const now = Date.now();
      const dindiNumber = 1000 + Math.floor(Math.random() * 9000);
      const passcode = `DND-${Math.floor(1000 + Math.random() * 9000)}`;
      const dindiId = `DINDI-DYN-${now}`;

      const ts = new Date();
      const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;

      const haltPlan = getNearestHaltPlan(LIVE_INITIAL_STATE, params.lat, params.lng, 4.5);
      const newDindi = {
        id: dindiId,
        number: dindiNumber,
        name: params.name,
        leader: params.leader,
        pilgrimCount: params.count,
        currentSegment: params.route,
        currentPaceKmH: 4.5,
        standardPaceKmH: 4.5,
        paceDropPercent: 0,
        etaNextHalt: haltPlan.etaNextHalt,
        nextHalt: haltPlan.nextHalt,
        status: "NORMAL" as const,
        lat: params.lat,
        lng: params.lng,
        weatherDelayMinutes: 0,
        terrainFactor: 1.0,
        rerouted: false,
        routeColor: "#F97316",
        isCustomRegistered: true,
        passcode,
      };

      setLiveDindis((prev) => [newDindi, ...prev]);

      setState((prev) => {
        const nextDindis = [newDindi, ...prev.dindis];
        return {
          ...prev,
          totalPilgrims: prev.totalPilgrims + params.count,
          dindis: nextDindis,
          camps: !prev.isSimulating ? computeLiveCamps(nextDindis, LIVE_SUPPORT_CAMPS) : prev.camps,
          events: [
            {
              id: `EV-${now}`,
              timestamp: timeString,
              eventType: "DISPATCH" as const,
              severity: "INFO" as const,
              source: "Dindi Leader Registration",
              description: `NEW DINDI: ${params.name} | Leader: ${params.leader} | Passcode: ${passcode} | ~${params.count.toLocaleString()} pilgrims`,
            },
            ...prev.events,
          ],
        };
      });

      return { dindiId, passcode, dindiNumber };
    },
    []
  );

  const updateLiveDindiLocation = useCallback(
    (dindiId: string, lat: number, lng: number, speedKmH = 4.5) => {
      setLiveDindis((prev) =>
        prev.map((dindi) => {
          if (dindi.id !== dindiId) return dindi;
          const haltPlan = getNearestHaltPlan(state, lat, lng, speedKmH);
          return {
            ...dindi,
            lat,
            lng,
            currentPaceKmH: Number(speedKmH.toFixed(1)),
            nextHalt: haltPlan.nextHalt,
            etaNextHalt: haltPlan.etaNextHalt,
          };
        }),
      );

      setState((prev) => {
        const haltPlan = getNearestHaltPlan(prev, lat, lng, speedKmH);
        return {
          ...prev,
          dindis: prev.dindis.map((dindi) => {
            if (dindi.id !== dindiId) return dindi;
            return {
              ...dindi,
              lat,
              lng,
              currentPaceKmH: Number(speedKmH.toFixed(1)),
              nextHalt: haltPlan.nextHalt,
              etaNextHalt: haltPlan.etaNextHalt,
            };
          }),
        };
      });
    },
    [state]
  );

  const requestLeaderAssistance = useCallback(
    (type: "WATER" | "MEDICAL" | "HALT" | "FOOD" | "SANITATION", details: string) => {
      const ts = new Date();
      const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
      const typeLabel = type === "WATER" ? "💧 Water Tanker" : type === "MEDICAL" ? "🚑 Medical Aid" : type === "FOOD" ? "🍱 Food Supply" : type === "SANITATION" ? "🚽 Sanitation Crew" : "⛺ Halt Request";
      const nowId = Date.now();

      setState((prev) => {
        // Parse GPS from details if available (e.g. "Lat 18.4905, Lng 73.8099")
        let lat = 18.5138;
        let lng = 73.8589;
        const latMatch = details.match(/Lat\s*([0-9.]+)/i);
        const lngMatch = details.match(/Lng\s*([0-9.]+)/i);
        if (latMatch && lngMatch) {
          lat = parseFloat(latMatch[1]);
          lng = parseFloat(lngMatch[1]);
        } else {
          const matchingDindi = prev.dindis.find((d) => details.includes(d.name) || (d.passcode && details.includes(d.passcode)));
          if (matchingDindi) {
            lat = matchingDindi.lat;
            lng = matchingDindi.lng;
          }
        }

        // Find closest camp to this specific request's GPS
        const nearestCamp = prev.camps
          .map((c) => ({ item: c, distKm: getDistanceKm(lat, lng, c.lat, c.lng) }))
          .sort((a, b) => a.distKm - b.distKm)[0];

        const campName = nearestCamp?.item.name ?? "Corridor Sector";

        // Find nearest available water tanker to this request
        const nearestTanker = prev.tankers
          .filter((t) => t.status === "AVAILABLE")
          .map((t) => ({ item: t, distKm: getDistanceKm(lat, lng, t.lat, t.lng) }))
          .sort((a, b) => a.distKm - b.distKm)[0] ??
          prev.tankers.map((t) => ({ item: t, distKm: getDistanceKm(lat, lng, t.lat, t.lng) })).sort((a, b) => a.distKm - b.distKm)[0];

        // Find nearest available food supply unit to this request
        const nearestFood = prev.foodSupplies
          ?.filter((f) => f.status === "AVAILABLE")
          .map((f) => ({ item: f, distKm: getDistanceKm(lat, lng, f.lat, f.lng) }))
          .sort((a, b) => a.distKm - b.distKm)[0] ??
          prev.foodSupplies?.map((f) => ({ item: f, distKm: getDistanceKm(lat, lng, f.lat, f.lng) })).sort((a, b) => a.distKm - b.distKm)[0];

        // Find nearest medical station / hospital
        const nearestMedical = prev.medicalStations
          .map((m) => ({ item: m, distKm: getDistanceKm(lat, lng, m.lat, m.lng) }))
          .sort((a, b) => a.distKm - b.distKm)[0];

        // Find nearest available sanitation crew
        const nearestSanitation = prev.sanitationCrews
          ?.filter((s) => s.status === "AVAILABLE")
          .map((s) => ({ item: s, distKm: getDistanceKm(lat, lng, s.lat, s.lng) }))
          .sort((a, b) => a.distKm - b.distKm)[0] ??
          prev.sanitationCrews.map((s) => ({ item: s, distKm: getDistanceKm(lat, lng, s.lat, s.lng) })).sort((a, b) => a.distKm - b.distKm)[0];

        // Find closest volunteer to this location
        const assignedVolunteer =
          prev.volunteers
            .filter((v) => v.assignedCampId === nearestCamp?.item.id || v.status === "AVAILABLE")
            .map((v) => ({ item: v, distKm: getDistanceKm(lat, lng, v.lat, v.lng) }))
            .sort((a, b) => a.distKm - b.distKm)[0] ??
          prev.volunteers.map((v) => ({ item: v, distKm: getDistanceKm(lat, lng, v.lat, v.lng) })).sort((a, b) => a.distKm - b.distKm)[0];

        const etaMinutes = type === "WATER"
          ? (nearestTanker?.distKm ? Math.max(3, Math.round((nearestTanker.distKm / 25) * 60)) : 12)
          : type === "FOOD"
          ? (nearestFood?.distKm ? Math.max(4, Math.round((nearestFood.distKm / 30) * 60)) : 15)
          : type === "MEDICAL"
          ? (nearestMedical?.distKm ? Math.max(2, Math.round((nearestMedical.distKm / 40) * 60)) : 8)
          : type === "SANITATION"
          ? (nearestSanitation?.distKm ? Math.max(3, Math.round((nearestSanitation.distKm / 20) * 60)) : 10)
          : 10;

        const resourceDescription =
          type === "WATER"
            ? `Dispatch Water Tanker ${nearestTanker?.item.id ?? "LIVE-WATER-01"} (${nearestTanker?.item.capacityLiters.toLocaleString()}L) from ${nearestTanker?.item.currentHub ?? "Hub"} (${nearestTanker?.distKm ?? 2} km away, ETA ~${etaMinutes} min) to ${campName}. Volunteer ${assignedVolunteer?.item.name ?? "Desk"} assigned for refill verification.`
            : type === "FOOD"
            ? `Dispatch Mobile Kitchen ${nearestFood?.item.name ?? "Central Anna Dan Kitchen"} (${nearestFood?.item.mealsCapacity.toLocaleString()} meals) from ${nearestFood?.item.currentHub ?? "Hub"} (${nearestFood?.distKm ?? 3} km away, ETA ~${etaMinutes} min) to ${campName}. Volunteer ${assignedVolunteer?.item.name ?? "Desk"} assigned for prasad distribution.`
            : type === "MEDICAL"
            ? `Alert ${nearestMedical?.item.name ?? "General Hospital"} (${nearestMedical?.distKm ?? 2} km away) and dispatch Mobile Ambulance (ETA ~${etaMinutes} min) to ${campName} with on-duty emergency team.`
            : type === "SANITATION"
            ? `Deploy ${nearestSanitation?.item.name ?? "Sanitation Squad"} (${nearestSanitation?.item.mobilePodsCount ?? 20} mobile pods) from ${nearestSanitation?.item.zone ?? "Depot"} (${nearestSanitation?.distKm ?? 2} km away, ETA ~${etaMinutes} min) to ${campName}.`
            : `Acknowledge halt at ${campName}. Direct pilgrims to verified holding pavilion.`;

        const newAlert: Alert = {
          id: `ALT-LEADER-${nowId}`,
          title: `${typeLabel} — Dindi Leader Request`,
          location: campName,
          severity: type === "MEDICAL" ? "HIGH" : "MEDIUM",
          cause: details,
          forecastText: `Immediate assistance dispatched. Assigned field volunteer: ${assignedVolunteer?.item.name ?? "Corridor Seva Desk"}. Estimated response: ${etaMinutes} min.`,
          recommendedAction: resourceDescription,
          timestamp: timeString,
          status: "ACTIVE",
          timeToCriticalMinutes: type === "MEDICAL" ? 5 : 15,
          priorityScore: type === "MEDICAL" ? 80 : type === "WATER" ? 62 : type === "FOOD" ? 55 : type === "SANITATION" ? 50 : 44,
          scoreBreakdown: { density: 10, urgency: type === "MEDICAL" ? 40 : 18, population: 10, resource: type === "WATER" ? 24 : 15 },
        };

        const newTask: VolunteerTask | null = assignedVolunteer
          ? {
              id: `TASK-${nowId}`,
              campId: nearestCamp?.item.id,
              campName: campName,
              volunteerId: assignedVolunteer.item.id,
              volunteerName: assignedVolunteer.item.name,
              title:
                type === "WATER"
                  ? `Verify water tanker ${nearestTanker?.item.id ?? "tanker"} arrival (${nearestTanker?.item.capacityLiters.toLocaleString()}L)`
                  : type === "MEDICAL"
                  ? `Verify medical emergency response team (${nearestMedical?.item.name ?? "Hospital"})`
                  : type === "FOOD"
                  ? `Verify food supply unit ${nearestFood?.item.name ?? "kitchen"} delivery`
                  : type === "SANITATION"
                  ? `Verify sanitation crew ${nearestSanitation?.item.name ?? "crew"} deployment`
                  : `Verify halt capacity and rest area at ${campName}`,
              type:
                type === "WATER" ? "WATER_TANKER" :
                type === "MEDICAL" ? "MEDICAL" :
                type === "FOOD" ? "FOOD_SUPPLY" :
                type === "SANITATION" ? "SANITATION" : "HALT",
              etaMinutes,
              status: "ASSIGNED",
              createdAt: timeString,
              updatedAt: timeString,
            }
          : null;

        const matchingTankerId = nearestTanker?.item.id;

        return {
          ...prev,
          tankers: prev.tankers.map((tanker) =>
            type === "WATER" && (tanker.id === matchingTankerId || (!matchingTankerId && tanker.status === "AVAILABLE"))
              ? { ...tanker, status: "EN_ROUTE" as const, assignedCampId: nearestCamp?.item.name ?? "Live Dindi Location", etaMinutes }
              : tanker
          ),
          foodSupplies: prev.foodSupplies?.map((food) =>
            type === "FOOD" && (food.id === nearestFood?.item.id || (!nearestFood && food.status === "AVAILABLE"))
              ? { ...food, status: "EN_ROUTE" as const, assignedCampId: nearestCamp?.item.name ?? "Live Dindi Location", etaMinutes }
              : food
          ),
          sanitationCrews: prev.sanitationCrews.map((crew) =>
            type === "SANITATION" && (crew.id === nearestSanitation?.item.id || (!nearestSanitation && crew.status === "AVAILABLE"))
              ? { ...crew, status: "EN_ROUTE" as const, assignedCampId: nearestCamp?.item.name ?? "Live Dindi Location", etaMinutes }
              : crew
          ),
          camps: prev.camps.map((camp) => {
            if (camp.id !== nearestCamp?.item.id) return camp;
            return {
              ...camp,
              waterStockPercent: type === "WATER" ? Math.max(camp.waterStockPercent - 25, 10) : camp.waterStockPercent,
              foodStockPercent: type === "FOOD" ? Math.max(camp.foodStockPercent - 25, 10) : camp.foodStockPercent,
            };
          }),
          volunteers: prev.volunteers.map((volunteer) =>
            volunteer.id === assignedVolunteer?.item.id
              ? {
                  ...volunteer,
                  status: "DEPLOYED" as const,
                  currentTask:
                    type === "WATER"
                      ? `Verify ${nearestTanker?.item.id ?? "water tanker"} arrival at ${nearestCamp?.item.name ?? "leader GPS"} (ETA ${etaMinutes} min)`
                      : type === "MEDICAL"
                      ? `Support medical response at ${nearestMedical?.item.name ?? "leader GPS"} (ETA ${etaMinutes} min)`
                      : type === "FOOD"
                      ? `Verify food unit ${nearestFood?.item.id ?? "kitchen"} at ${nearestCamp?.item.name ?? "leader GPS"} (ETA ${etaMinutes} min)`
                      : type === "SANITATION"
                      ? `Verify sanitation crew at ${nearestCamp?.item.name ?? "leader GPS"} (ETA ${etaMinutes} min)`
                      : `Confirm halt routing at ${nearestCamp?.item.name ?? "nearest halt"} (ETA ${etaMinutes} min)`,
                }
              : volunteer,
          ),
          events: [
            {
              id: `EV-LEADER-${nowId}`,
              timestamp: timeString,
              eventType: "ALERT" as const,
              severity: type === "MEDICAL" ? ("WARNING" as const) : ("INFO" as const),
              source: "Dindi Leader Request",
              description: `${typeLabel}: ${details}. ${assignedVolunteer?.item.name ?? "Volunteer"} assigned for verification. ETA ${etaMinutes} min.`,
            },
            ...prev.events,
          ],
          volunteerTasks: newTask ? [newTask, ...prev.volunteerTasks] : prev.volunteerTasks,
          alerts: [newAlert, ...prev.alerts],
        };
      });
    },
    []
  );

  const updateVolunteerTask = useCallback(
    (taskId: string, status: VolunteerTask["status"], remarks?: string) => {
      const ts = new Date();
      const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;

      setState((prev) => {
        const task = prev.volunteerTasks.find((item) => item.id === taskId);
        if (!task) return prev;
        const nextTasks = prev.volunteerTasks.map((item) =>
          item.id === taskId ? { ...item, status, remarks, updatedAt: timeString } : item,
        );
        return {
          ...prev,
          volunteerTasks: nextTasks,
          tankers: prev.tankers.map((tanker) =>
            task.type === "WATER_TANKER" && tanker.assignedCampId?.includes(task.campName || "")
              ? {
                  ...tanker,
                  status: status === "VERIFIED" ? ("AVAILABLE" as const) : tanker.status,
                  assignedCampId: status === "VERIFIED" ? undefined : tanker.assignedCampId,
                }
              : tanker
          ),
          foodSupplies: prev.foodSupplies?.map((food) =>
            task.type === "FOOD_SUPPLY" && food.assignedCampId?.includes(task.campName || "")
              ? {
                  ...food,
                  status: status === "VERIFIED" ? ("AVAILABLE" as const) : food.status,
                  assignedCampId: status === "VERIFIED" ? undefined : food.assignedCampId,
                }
              : food
          ),
          sanitationCrews: prev.sanitationCrews.map((crew) =>
            task.type === "SANITATION" && crew.assignedCampId?.includes(task.campName || "")
              ? {
                  ...crew,
                  status: status === "VERIFIED" ? ("AVAILABLE" as const) : crew.status,
                  assignedCampId: status === "VERIFIED" ? undefined : crew.assignedCampId,
                }
              : crew
          ),
          camps: prev.camps.map((camp) => {
            const isTargetCamp = camp.id === task.campId || camp.name === task.campName;
            if (!isTargetCamp) return camp;
            return {
              ...camp,
              waterStockPercent: task.type === "WATER_TANKER" && status === "VERIFIED" ? 100 : camp.waterStockPercent,
              minutesToWaterDepletion: task.type === "WATER_TANKER" && status === "VERIFIED" ? 480 : camp.minutesToWaterDepletion,
              foodStockPercent: task.type === "FOOD_SUPPLY" && status === "VERIFIED" ? 100 : camp.foodStockPercent,
            };
          }),
          volunteers: prev.volunteers.map((volunteer) =>
            volunteer.id === task.volunteerId && (status === "VERIFIED" || status === "REJECTED")
              ? { ...volunteer, status: "AVAILABLE" as const, currentTask: undefined }
              : volunteer,
          ),
          alerts: prev.alerts.map((alert) =>
            alert.recommendedAction.includes(task.volunteerName)
              ? {
                  ...alert,
                  status: status === "VERIFIED" ? ("RESOLVED" as const) : status === "REJECTED" ? ("ACTIVE" as const) : alert.status,
                  forecastText: `${alert.forecastText} Latest volunteer update: ${status}${remarks ? ` - ${remarks}` : ""}.`,
                }
              : alert,
          ),
          events: [
            {
              id: `EV-TASK-${Date.now()}`,
              timestamp: timeString,
              eventType: "VERIFICATION" as const,
              severity: status === "REJECTED" ? ("WARNING" as const) : ("SUCCESS" as const),
              source: `${task.volunteerName} / ${task.campName}`,
              description: `${task.title} marked ${status}${remarks ? `: ${remarks}` : ""}`,
            },
            ...prev.events,
          ],
        };
      });
    },
    [],
  );

  const assignCommandTask = useCallback(
    (params: {
      campId: string;
      volunteerId?: string;
      type: VolunteerTask["type"];
      title: string;
      etaMinutes: number;
      notes?: string;
    }) => {
      const ts = new Date();
      const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
      const nowId = Date.now();

      setState((prev) => {
        const camp = prev.camps.find((c) => c.id === params.campId);
        const campName = camp?.name ?? "Corridor Camp";
        const volunteer =
          prev.volunteers.find((v) => v.id === params.volunteerId) ??
          prev.volunteers.find((v) => v.assignedCampId === params.campId) ??
          prev.volunteers[0];
        const volunteerName = volunteer?.name ?? "Designated Camp Volunteer";

        // Find nearest available tanker to this camp if it's a water dispatch
        const availableTanker = prev.tankers.find((t) => t.status === "AVAILABLE");

        const newTask: VolunteerTask = {
          id: `TASK-CMD-${nowId}`,
          campId: params.campId,
          campName,
          volunteerId: volunteer?.id ?? "VOL-GEN",
          volunteerName,
          title: params.title,
          type: params.type,
          etaMinutes: params.etaMinutes,
          status: "ASSIGNED",
          remarks: params.notes,
          createdAt: timeString,
          updatedAt: timeString,
        };

        const newAlert: Alert = {
          id: `ALT-CMD-${nowId}`,
          title: `Command Task: ${params.title}`,
          location: campName,
          severity: params.type === "MEDICAL" ? "HIGH" : "MEDIUM",
          cause: `Direct dispatch from Command Centre for ${campName}.`,
          forecastText: `Task assigned to ${volunteerName}. ETA: ${params.etaMinutes} min. Awaiting volunteer verification.`,
          recommendedAction: `Volunteer ${volunteerName} to verify on ground at ${campName}.`,
          timestamp: timeString,
          status: "ACTIVE",
          timeToCriticalMinutes: params.etaMinutes,
          priorityScore: 70,
          scoreBreakdown: { density: 15, urgency: 25, population: 15, resource: 15 },
        };

        return {
          ...prev,
          volunteerTasks: [newTask, ...prev.volunteerTasks],
          alerts: [newAlert, ...prev.alerts],
          tankers: prev.tankers.map((t) =>
            params.type === "WATER_TANKER" && t.id === availableTanker?.id
              ? {
                  ...t,
                  status: "EN_ROUTE" as const,
                  assignedCampId: campName,
                  etaMinutes: params.etaMinutes,
                }
              : t
          ),
          volunteers: prev.volunteers.map((v) =>
            v.id === volunteer?.id
              ? {
                  ...v,
                  status: "DEPLOYED" as const,
                  currentTask: `${params.title} at ${campName} (ETA ${params.etaMinutes}m)`,
                }
              : v
          ),
          events: [
            {
              id: `EV-CMD-${nowId}`,
              timestamp: timeString,
              eventType: "DISPATCH" as const,
              severity: "INFO" as const,
              source: "Command Centre Dispatch",
              description: `${params.title} assigned to ${volunteerName} at ${campName} (ETA ${params.etaMinutes}m)`,
            },
            ...prev.events,
          ],
        };
      });
    },
    [],
  );

  const assignVolunteerToCamp = useCallback((volunteerId: string, campId: string) => {
    setState((prev) => {
      const camp = prev.camps.find((c) => c.id === campId);
      return {
        ...prev,
        volunteers: prev.volunteers.map((v) =>
          v.id === volunteerId
            ? {
                ...v,
                assignedCampId: campId,
                locationName: camp ? `${camp.name} Gate` : v.locationName,
              }
            : v
        ),
      };
    });
  }, []);

  const deleteVolunteerTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      volunteerTasks: prev.volunteerTasks.filter((t) => t.id !== taskId),
    }));
  }, []);

  const rerouteLiveDindi = useCallback((dindiId: string, targetCampId: string) => {
    const ts = new Date();
    const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;

    setState((prev) => {
      const targetCamp = prev.camps.find((c) => c.id === targetCampId);
      const targetCampName = targetCamp?.name ?? targetCampId;
      const updatedDindis = prev.dindis.map((d) =>
        d.id === dindiId
          ? ({ ...d, reroutedCampId: targetCampId } as Dindi)
          : d
      );
      const updatedLiveDindis = liveDindis.map((d) =>
        d.id === dindiId
          ? ({ ...d, reroutedCampId: targetCampId } as Dindi)
          : d
      );
      setLiveDindis(updatedLiveDindis);

      const dindiObj = prev.dindis.find((d) => d.id === dindiId);
      const updatedCamps = computeLiveCamps(updatedDindis, LIVE_SUPPORT_CAMPS, prev.volunteerTasks);

      return {
        ...prev,
        dindis: updatedDindis,
        camps: updatedCamps,
        events: [
          {
            id: `EV-REROUTE-${Date.now()}`,
            timestamp: timeString,
            eventType: "DISPATCH" as const,
            severity: "INFO" as const,
            source: "AI Operations Copilot",
            description: `Rerouted ${dindiObj?.name ?? "Dindi"} (~${dindiObj?.pilgrimCount.toLocaleString()} pilgrims) to ${targetCampName} to alleviate pressure.`,
          },
          ...prev.events,
        ],
      };
    });
  }, [liveDindis]);

  const applyLiveClusterMitigation = useCallback((clusterCampId?: string) => {
    const ts = new Date();
    const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
    const nowId = Date.now();

    setState((prev) => {
      // 1. Identify overloaded camp
      const targetCamp =
        prev.camps.find((c) => c.id === clusterCampId) ??
        prev.camps.find((c) => c.occupancyPercent >= 100) ??
        prev.camps[0];

      const targetCampName = targetCamp?.name ?? "Camp 1 (Pune Racecourse / Bhavani Peth)";
      const targetCampId = targetCamp?.id ?? "CAMP-01";

      // 2. Find nearest available water tanker
      const nearestTanker = prev.tankers.find((t) => t.status === "AVAILABLE") ?? prev.tankers[0];

      // 3. Find nearest available food kitchen
      const nearestFood = prev.foodSupplies?.find((f) => f.status === "AVAILABLE") ?? prev.foodSupplies?.[0];

      // 4. Find nearest available sanitation squad
      const nearestSanitation = prev.sanitationCrews.find((s) => s.status === "AVAILABLE") ?? prev.sanitationCrews[0];

      // 5. Find designated volunteer
      const designatedVolunteer =
        prev.volunteers.find((v) => v.assignedCampId === targetCampId) ??
        prev.volunteers.find((v) => v.status === "AVAILABLE") ??
        prev.volunteers[0];

      // 6. Find next backup camp with spare capacity (e.g. Camp 2 - Hadapsar)
      const backupCamp =
        prev.camps.find((c) => c.id !== targetCampId && c.occupancyPercent < 60) ??
        prev.camps[1] ??
        prev.camps[0];

      // 7. Find largest Dindi near overloaded camp to reroute
      const dindisAtCamp = prev.dindis.filter((d) => d.isCustomRegistered);
      const largestDindi = [...dindisAtCamp].sort((a, b) => b.pilgrimCount - a.pilgrimCount)[0];

      const updatedDindis = largestDindi && backupCamp
        ? prev.dindis.map((d) =>
            d.id === largestDindi.id ? ({ ...d, reroutedCampId: backupCamp.id } as Dindi) : d
          )
        : prev.dindis;

      if (largestDindi && backupCamp) {
        setLiveDindis((curr) =>
          curr.map((d) =>
            d.id === largestDindi.id ? ({ ...d, reroutedCampId: backupCamp.id } as Dindi) : d
          )
        );
      }

      // 8. Generate volunteer tasks for ground verification
      const newTasks: VolunteerTask[] = [
        {
          id: `TASK-MIT-WATER-${nowId}`,
          campId: targetCampId,
          campName: targetCampName,
          volunteerId: designatedVolunteer.id,
          volunteerName: designatedVolunteer.name,
          title: `Verify Water Tanker ${nearestTanker?.id ?? "T-01"} arrival & refill (${nearestTanker?.capacityLiters.toLocaleString()}L)`,
          type: "WATER_TANKER",
          etaMinutes: 12,
          status: "ASSIGNED",
          createdAt: timeString,
          updatedAt: timeString,
        },
        {
          id: `TASK-MIT-FOOD-${nowId}`,
          campId: targetCampId,
          campName: targetCampName,
          volunteerId: designatedVolunteer.id,
          volunteerName: designatedVolunteer.name,
          title: `Verify Anna Dan Prasad truck delivery (${nearestFood?.name ?? "Mobile Kitchen"})`,
          type: "FOOD_SUPPLY",
          etaMinutes: 15,
          status: "ASSIGNED",
          createdAt: timeString,
          updatedAt: timeString,
        },
        {
          id: `TASK-MIT-SAN-${nowId}`,
          campId: targetCampId,
          campName: targetCampName,
          volunteerId: designatedVolunteer.id,
          volunteerName: designatedVolunteer.name,
          title: `Verify Mobile Bio-Toilet squad deployment (${nearestSanitation?.name ?? "Sanitation Squad"})`,
          type: "SANITATION",
          etaMinutes: 10,
          status: "ASSIGNED",
          createdAt: timeString,
          updatedAt: timeString,
        },
      ];

      const updatedTasks = [...newTasks, ...prev.volunteerTasks];
      const updatedCamps = computeLiveCamps(updatedDindis, LIVE_SUPPORT_CAMPS, updatedTasks);

      const newAlert: Alert = {
        id: `ALT-MITIGATION-${nowId}`,
        title: `⚡ Multi-Resource Mitigation Active — ${targetCampName}`,
        location: targetCampName,
        severity: "CRITICAL",
        cause: `Automated triage applied for crowd overload (${targetCamp.currentOccupancy.toLocaleString()} devotees). Water tanker, Food kitchen, and Sanitation squad dispatched.`,
        forecastText: `Mitigation in progress. On-ground verification assigned to ${designatedVolunteer.name}. Problem will be marked verified once approved in Volunteer Portal.`,
        recommendedAction: `Dispatched Tanker ${nearestTanker?.id}, Food Kitchen ${nearestFood?.name}, Sanitation ${nearestSanitation?.name}. Rerouted ${largestDindi?.name ?? "Dindi"} to ${backupCamp?.name}.`,
        timestamp: timeString,
        status: "ACTIVE",
        timeToCriticalMinutes: 12,
        priorityScore: 92,
        scoreBreakdown: { density: 35, urgency: 25, population: 20, resource: 12 },
      };

      return {
        ...prev,
        isMitigated: true,
        tankers: prev.tankers.map((t) =>
          t.id === nearestTanker?.id
            ? { ...t, status: "EN_ROUTE" as const, assignedCampId: targetCampName, etaMinutes: 12 }
            : t
        ),
        foodSupplies: prev.foodSupplies?.map((f) =>
          f.id === nearestFood?.id
            ? { ...f, status: "EN_ROUTE" as const, assignedCampId: targetCampName, etaMinutes: 15 }
            : f
        ),
        sanitationCrews: prev.sanitationCrews.map((s) =>
          s.id === nearestSanitation?.id
            ? { ...s, status: "EN_ROUTE" as const, assignedCampId: targetCampName, etaMinutes: 10 }
            : s
        ),
        volunteers: prev.volunteers.map((v) =>
          v.id === designatedVolunteer.id
            ? { ...v, status: "DEPLOYED" as const, currentTask: `Coordinate multi-resource arrival at ${targetCampName}` }
            : v
        ),
        dindis: updatedDindis,
        camps: updatedCamps,
        volunteerTasks: updatedTasks,
        alerts: [newAlert, ...prev.alerts],
        events: [
          {
            id: `EV-MIT-${nowId}`,
            timestamp: timeString,
            eventType: "COPILOT_REC" as const,
            severity: "INFO" as const,
            source: "AI Operations Copilot",
            description: `Applied full mitigation for ${targetCampName}: Dispatched Tanker ${nearestTanker?.id}, Food Truck ${nearestFood?.id}, Sanitation Squad ${nearestSanitation?.id}, and rerouted overflow Dindi.`,
          },
          ...prev.events,
        ],
      };
    });
  }, []);

  const reportVolunteerIncident = useCallback(
    (params: { label: string; severity: "HIGH" | "CRITICAL" | "MEDIUM"; lat?: number; lng?: number }) => {
      const now = Date.now();
      const ts = new Date();
      const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
      const location =
        params.lat !== undefined && params.lng !== undefined
          ? `Volunteer GPS ${params.lat.toFixed(5)}, ${params.lng.toFixed(5)}`
          : "Volunteer GPS unavailable";

      setState((prev) => {
        // Find nearest camp to volunteer
        const nearestCamp = prev.camps
          .map((c) => ({
            camp: c,
            dist: getDistanceKm(params.lat ?? 18.5138, params.lng ?? 73.8589, c.lat, c.lng),
          }))
          .sort((a, b) => a.dist - b.dist)[0]?.camp ?? prev.camps[0];

        const nearestCampName = nearestCamp?.name ?? "Corridor Camp";

        // Find nearest available volunteer
        const assignedVolunteer =
          prev.volunteers.find((v) => v.assignedCampId === nearestCamp.id) ??
          prev.volunteers[0];

        const isWater = params.label.includes("Water");
        const isFood = params.label.includes("Food") || params.label.includes("Prasad");
        const isSanitation = params.label.includes("Sanitation") || params.label.includes("Toilet");
        const isMedical = params.label.includes("Medical");

        // Dispatches
        const nearestTanker = prev.tankers.find((t) => t.status === "AVAILABLE");
        const nearestFood = prev.foodSupplies?.find((f) => f.status === "AVAILABLE");
        const nearestSanitation = prev.sanitationCrews.find((s) => s.status === "AVAILABLE");

        const taskType: VolunteerTask["type"] = isWater
          ? "WATER_TANKER"
          : isFood
          ? "FOOD_SUPPLY"
          : isSanitation
          ? "SANITATION"
          : isMedical
          ? "MEDICAL"
          : "HALT";

        const taskTitle = isWater
          ? `Verify water tanker ${nearestTanker?.id ?? "T-01"} arrival & refill at ${nearestCampName}`
          : isFood
          ? `Verify food / prasad kitchen truck delivery at ${nearestCampName}`
          : isSanitation
          ? `Verify mobile bio-toilet deployment at ${nearestCampName}`
          : isMedical
          ? `Verify medical emergency triage team at ${nearestCampName}`
          : `Verify incident resolution: ${params.label} at ${nearestCampName}`;

        const newTask: VolunteerTask = {
          id: `TASK-VOL-${now}`,
          campId: nearestCamp.id,
          campName: nearestCampName,
          volunteerId: assignedVolunteer.id,
          volunteerName: assignedVolunteer.name,
          title: taskTitle,
          type: taskType,
          etaMinutes: 12,
          status: "ASSIGNED",
          createdAt: timeString,
          updatedAt: timeString,
        };

        const updatedTasks = [newTask, ...prev.volunteerTasks];
        const updatedCamps = computeLiveCamps(prev.dindis, LIVE_SUPPORT_CAMPS, updatedTasks);

        const newAlert: Alert = {
          id: `ALT-VOL-${now}`,
          title: `Volunteer Report: ${params.label} at ${nearestCampName}`,
          location: nearestCampName,
          severity: params.severity,
          cause: `${params.label} reported by on-duty volunteer from field app.`,
          forecastText: `Immediate resource reinforcement triggered. Verification task generated for ${assignedVolunteer.name}. ETA 12 min.`,
          recommendedAction: `Dispatched ${isWater ? "Water Tanker" : isFood ? "Food Kitchen" : isSanitation ? "Sanitation Squad" : "Field Team"}. Awaiting volunteer arrival verification.`,
          timestamp: timeString,
          status: "ACTIVE",
          timeToCriticalMinutes: params.severity === "CRITICAL" ? 5 : 15,
          priorityScore: params.severity === "CRITICAL" ? 88 : 68,
          scoreBreakdown: { density: 20, urgency: 35, population: 15, resource: 18 },
        };

        return {
          ...prev,
          tankers: prev.tankers.map((t) =>
            isWater && t.id === nearestTanker?.id
              ? { ...t, status: "EN_ROUTE" as const, assignedCampId: nearestCampName, etaMinutes: 12 }
              : t
          ),
          foodSupplies: prev.foodSupplies?.map((f) =>
            isFood && f.id === nearestFood?.id
              ? { ...f, status: "EN_ROUTE" as const, assignedCampId: nearestCampName, etaMinutes: 15 }
              : f
          ),
          sanitationCrews: prev.sanitationCrews.map((s) =>
            isSanitation && s.id === nearestSanitation?.id
              ? { ...s, status: "EN_ROUTE" as const, assignedCampId: nearestCampName, etaMinutes: 10 }
              : s
          ),
          volunteers: prev.volunteers.map((v) =>
            v.id === assignedVolunteer.id
              ? { ...v, status: "DEPLOYED" as const, currentTask: taskTitle }
              : v
          ),
          camps: updatedCamps,
          volunteerTasks: updatedTasks,
          alerts: [newAlert, ...prev.alerts],
          events: [
            {
              id: `EV-VOL-${now}`,
              timestamp: timeString,
              eventType: "ALERT" as const,
              severity: params.severity === "CRITICAL" ? "CRITICAL" : "WARNING",
              source: "Volunteer Field Report",
              description: `${params.label} reported at ${nearestCampName}. Resource auto-dispatched & task assigned.`,
            },
            ...prev.events,
          ],
        };
      });
    },
    []
  );

  const deleteDindi = useCallback((dindiId: string) => {
    const ts = new Date();
    const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;

    setLiveDindis((prev) => prev.filter((d) => d.id !== dindiId));
    setState((prev) => {
      const target = prev.dindis.find((d) => d.id === dindiId);
      const remaining = prev.dindis.filter((d) => d.id !== dindiId);
      return {
        ...prev,
        dindis: remaining,
        totalPilgrims: remaining.reduce((sum, d) => sum + d.pilgrimCount, 0),
        camps: !prev.isSimulating ? computeLiveCamps(remaining, LIVE_SUPPORT_CAMPS, prev.volunteerTasks) : prev.camps,
        events: [
          {
            id: `EV-DEL-${Date.now()}`,
            timestamp: timeString,
            eventType: "TELEMETRY_UPDATE" as const,
            severity: "INFO" as const,
            source: "Dindi Manager",
            description: `Deleted Dindi: ${target?.name ?? dindiId} (${target?.passcode ?? ""})`,
          },
          ...prev.events,
        ],
      };
    });

    deleteLiveDindi(dindiId).catch((err) =>
      console.warn("[WariOS] deleteLiveDindi error", err),
    );
  }, []);

  const openTemporaryAuxiliaryCamp = useCallback((baseCampId: string) => {
    const ts = new Date();
    const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;

    setState((prev) => {
      const targetCamp = prev.camps.find((c) => c.id === baseCampId) ?? prev.camps[0];
      const targetCampName = targetCamp?.name ?? "Corridor Sector";

      const updatedCamps = prev.camps.map((c) =>
        c.id === targetCamp.id
          ? {
              ...c,
              capacity: c.capacity + 25000,
              name: `${c.name} + Auxiliary Relief Yard`,
              waterStockPercent: 100,
              foodStockPercent: 100,
            }
          : c
      );

      const recomputedCamps = updatedCamps.map((camp) => {
        const occupancyPercent = Math.min(100, Math.round((camp.currentOccupancy / camp.capacity) * 100));
        return { ...camp, occupancyPercent };
      });

      return {
        ...prev,
        camps: recomputedCamps,
        events: [
          {
            id: `EV-AUX-CAMP-${Date.now()}`,
            timestamp: timeString,
            eventType: "DECISION" as const,
            severity: "SUCCESS" as any,
            source: "AI Operations Copilot",
            description: `Opened Emergency Auxiliary Satellite Ground (+25,000 Capacity) adjacent to ${targetCampName}. Total capacity expanded to ${(targetCamp.capacity + 25000).toLocaleString()} devotees.`,
          },
          ...prev.events,
        ],
      };
    });
  }, []);

  const regulatePalkhiPace = useCallback((action: "THROTTLE_PACE" | "RELEASE_BATCH") => {
    const ts = new Date();
    const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;

    setState((prev) => ({
      ...prev,
      events: [
        {
          id: `EV-PACE-${Date.now()}`,
          timestamp: timeString,
          eventType: "DECISION" as const,
          severity: "INFO" as const,
          source: "Palkhi Marshal Coordination",
          description:
            action === "THROTTLE_PACE"
              ? "Palkhi march pace throttled from 4.2 km/h down to 2.5 km/h. 45-minute staggered batch gating activated at Swargate & Hadapsar."
              : "Next 15,000 devotee batch cleared and released from gating checkpoint forward to transit sector.",
        },
        ...prev.events,
      ],
    }));
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        state,
        isMitigated: state.isMitigated,
        setIsSimulating,
        setSimulationSpeed,
        resetAll,
        rerouteDindi14,
        dispatchTankerT03,
        deployVolunteersCP4,
        openBackupShelterB,
        executeFullMitigation,
        closeBeforeAfterModal,
        setDecisionStage,
        addEventLog,
        registerDynamicDindi,
        updateLiveDindiLocation,
        requestLeaderAssistance,
        reportVolunteerIncident,
        updateVolunteerTask,
        assignCommandTask,
        assignVolunteerToCamp,
        deleteVolunteerTask,
        deleteDindi,
        applyLiveClusterMitigation,
        rerouteLiveDindi,
        openTemporaryAuxiliaryCamp,
        regulatePalkhiPace,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};
