"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  SimulationState,
  DecisionStage,
  OperationalEvent,
  Alert,
  VolunteerTask,
} from "@/lib/types";
import { LIVE_INITIAL_STATE, DEMO_INITIAL_STATE } from "@/lib/constants";
import {
  executeDispatchAction,
  tickSimulationEngine,
} from "@/lib/simulation-engine";
import { getDistanceKm, getLiveCrowdClusters } from "@/lib/live-ops";
import { clearLocalLiveDindis, loadLiveDindis, saveLiveDindis } from "@/lib/live-store";

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
  requestLeaderAssistance: (type: "WATER" | "MEDICAL" | "HALT", details: string) => void;
  reportVolunteerIncident: (params: {
    label: string;
    severity: "HIGH" | "CRITICAL" | "MEDIUM";
    lat?: number;
    lng?: number;
  }) => void;
  updateVolunteerTask: (taskId: string, status: VolunteerTask["status"], remarks?: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

function getNearestHaltPlan(state: SimulationState, lat: number, lng: number, paceKmH = 3.6) {
  const nearestCamp = state.camps
    .map((camp) => ({ camp, distanceKm: getDistanceKm(lat, lng, camp.lat, camp.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];

  if (!nearestCamp) {
    return { nextHalt: "No verified halt", etaNextHalt: "N/A" };
  }

  const etaMinutes = Math.max(1, Math.round((nearestCamp.distanceKm / Math.max(1, paceKmH)) * 60));
  return {
    nextHalt: nearestCamp.camp.name,
    etaNextHalt: `${etaMinutes} min (${nearestCamp.distanceKm} km)`,
  };
}

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  // Start in Live Real Mode — empty state
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
      // Switching TO Live Real Mode — clear all demo data, keep live registered dindis
      setState({ ...LIVE_INITIAL_STATE, dindis: liveDindis });
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
      const afterOccupancy = Math.max(60, Math.round(beforeOccupancy * 0.72));
      const overflowBefore = topCluster ? Math.max(0, topCluster.totalPilgrims - topCluster.capacity) : 0;
      const overflowAfter = Math.max(0, Math.round(overflowBefore * 0.35));
      const nearestCamp = topCluster?.nearestCamp?.item.name ?? "nearest verified halt";
      const nearestMedical = topCluster?.nearestMedical?.item.name ?? "nearest medical post";
      const nearestTanker = topCluster?.nearestTanker?.item.currentHub ?? "nearest water point";

      return {
        ...prev,
        decisionStage: "VERIFIED",
        isMitigated: true,
        showBeforeAfterModal: true,
        beforeAfterSummary: [
          {
            metric: "MMCOE Live Crowd Load",
            before: `${beforeOccupancy}%`,
            after: `${afterOccupancy}%`,
            unit: "%",
            improved: true,
            deltaText: `${Math.max(0, beforeOccupancy - afterOccupancy)}% Pressure Drop`,
          },
          {
            metric: "Over-Capacity Pilgrims",
            before: overflowBefore.toLocaleString(),
            after: overflowAfter.toLocaleString(),
            unit: "people",
            improved: true,
            deltaText: `${Math.max(0, overflowBefore - overflowAfter).toLocaleString()} Re-routed`,
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
        alerts: prev.alerts.map((alert) =>
          alert.status === "ACTIVE"
            ? {
                ...alert,
                status: "MITIGATION_IN_PROGRESS" as const,
                recommendedAction: `Mitigation started: move overflow toward ${nearestCamp}, alert ${nearestMedical}, and stage water from ${nearestTanker}.`,
              }
            : alert,
        ),
        events: [
          {
            id: `EV-LIVE-MITIGATION-${Date.now()}`,
            timestamp: timeString,
            eventType: "VERIFICATION" as const,
            severity: "SUCCESS" as const,
            source: "Live Command Centre",
            description: `Closed-loop live response verified for ${topCluster?.name ?? "registered Dindis"} at MMCOE.`,
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

      // Always persist new Dindi to liveDindis so it survives mode switches
      setLiveDindis((prev) => [newDindi, ...prev]);

      setState((prev) => {
        const nextDindis = [newDindi, ...prev.dindis];
        const liveClusters = getLiveCrowdClusters({
          dindis: nextDindis,
          camps: prev.camps,
          medicalStations: prev.medicalStations,
          tankers: prev.tankers,
          volunteers: prev.volunteers,
          sanitationCrews: prev.sanitationCrews,
        });
        const overloadedCluster = liveClusters.find((cluster) => cluster.overcrowdedBy > 0);
        const liveOverloadAlert: Alert | null = overloadedCluster
          ? {
              id: `ALT-LIVE-CROWD-${now}`,
              title: `Live overcrowding at ${overloadedCluster.name}`,
              location: `Live GPS ${overloadedCluster.lat.toFixed(4)}, ${overloadedCluster.lng.toFixed(4)}`,
              severity: overloadedCluster.risk === "CRITICAL" ? "CRITICAL" : "HIGH",
              cause: `${overloadedCluster.dindis
                .map((dindi) => `${dindi.name} (${dindi.pilgrimCount.toLocaleString()})`)
                .join(" + ")} total ${overloadedCluster.totalPilgrims.toLocaleString()} people at one location.`,
              forecastText: `Leader-entered count is ${overloadedCluster.occupancyPercent}% of the local safe holding capacity (${overloadedCluster.capacity.toLocaleString()}).`,
              recommendedAction: overloadedCluster.nearestCamp
                ? `Move overflow toward ${overloadedCluster.nearestCamp.item.name}; keep medical and water teams on standby.`
                : "Assign the nearest verified halt, water point, and medical post.",
              timestamp: timeString,
              status: "ACTIVE",
              timeToCriticalMinutes: 0,
              priorityScore: Math.min(100, 40 + Math.round(overloadedCluster.occupancyPercent / 3)),
              scoreBreakdown: {
                density: Math.min(40, Math.round(overloadedCluster.occupancyPercent / 6)),
                urgency: 30,
                population: Math.min(20, Math.round(overloadedCluster.totalPilgrims / 50)),
                resource: 10,
              },
            }
          : null;

        return {
          ...prev,
          totalPilgrims: nextDindis
            .filter((dindi) => dindi.isCustomRegistered)
            .reduce((sum, dindi) => sum + dindi.pilgrimCount, 0),
          routeUtilization: liveClusters[0]?.occupancyPercent ?? prev.routeUtilization,
          dindis: nextDindis,
          alerts: liveOverloadAlert ? [liveOverloadAlert, ...prev.alerts] : prev.alerts,
          events: [
          {
            id: `EV-${now}`,
            timestamp: timeString,
            eventType: "DISPATCH" as const,
            severity: "INFO" as const,
            source: "Dindi Leader Registration",
            description: `NEW DINDI: ${params.name} | Leader: ${params.leader} | Passcode: ${passcode} | ~${params.count} pilgrims`,
          },
            ...(liveOverloadAlert
              ? [
                  {
                    id: `EV-LIVE-CROWD-${now}`,
                    timestamp: timeString,
                    eventType: "ALERT" as const,
                    severity: "CRITICAL" as const,
                    source: "Live Crowd Aggregation",
                    description: `${overloadedCluster?.name}: ${overloadedCluster?.totalPilgrims.toLocaleString()} people sharing one location, capacity ${overloadedCluster?.capacity.toLocaleString()}.`,
                  },
                ]
              : []),
            ...prev.events,
          ],
        };
      });

      return { dindiId, passcode, dindiNumber };
    },
    []
  );

  const updateLiveDindiLocation = useCallback(
    (dindiId: string, lat: number, lng: number, speedKmH?: number) => {
      let latestLiveDindis: SimulationState["dindis"] = [];
      setState((prev) => ({
        ...prev,
        dindis: prev.dindis.map((dindi) => {
          if (dindi.id !== dindiId) return dindi;
          const pace = speedKmH ?? dindi.currentPaceKmH;
          const haltPlan = getNearestHaltPlan(prev, lat, lng, pace);
          return {
            ...dindi,
            lat,
            lng,
            currentPaceKmH: pace,
            nextHalt: haltPlan.nextHalt,
            etaNextHalt: haltPlan.etaNextHalt,
          };
        }),
      }));
      setLiveDindis((prev) => {
        latestLiveDindis = prev.map((dindi) => {
          if (dindi.id !== dindiId) return dindi;
          const pace = speedKmH ?? dindi.currentPaceKmH;
          const haltPlan = getNearestHaltPlan(LIVE_INITIAL_STATE, lat, lng, pace);
          return {
            ...dindi,
            lat,
            lng,
            currentPaceKmH: pace,
            nextHalt: haltPlan.nextHalt,
            etaNextHalt: haltPlan.etaNextHalt,
          };
        });
        return latestLiveDindis;
      });
    },
    []
  );

  const requestLeaderAssistance = useCallback(
    (type: "WATER" | "MEDICAL" | "HALT", details: string) => {
      const ts = new Date();
      const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
      const typeLabel = type === "WATER" ? "💧 Water Tanker" : type === "MEDICAL" ? "🚑 Medical Aid" : "⛺ Halt Request";
      const nowId = Date.now();

      setState((prev) => {
        const liveCluster = getLiveCrowdClusters(prev)[0];
        const nearestTanker = liveCluster?.nearestTanker;
        const nearestCamp = liveCluster?.nearestCamp;
        const nearestMedical = liveCluster?.nearestMedical;
        const assignedVolunteer = prev.volunteers
          .filter((volunteer) => volunteer.status === "AVAILABLE")
          .map((volunteer) => ({
            volunteer,
            distanceKm: liveCluster ? getDistanceKm(liveCluster.lat, liveCluster.lng, volunteer.lat, volunteer.lng) : 0,
            campMatch: nearestCamp?.item.id && volunteer.assignedCampId === nearestCamp.item.id ? 0 : 1,
          }))
          .sort((a, b) => a.campMatch - b.campMatch || a.distanceKm - b.distanceKm)[0];
        const etaMinutes =
          type === "WATER" && nearestTanker
            ? Math.max(2, Math.round((nearestTanker.distanceKm / 18) * 60))
            : type === "MEDICAL" && nearestMedical
              ? Math.max(2, Math.round((nearestMedical.distanceKm / 24) * 60))
              : nearestCamp
                ? Math.max(2, Math.round((nearestCamp.distanceKm / 4) * 60))
                : 15;

        const newAlert: Alert = {
          id: `ALT-LEADER-${nowId}`,
          title: `${typeLabel} — Dindi Leader Request`,
          location: liveCluster ? `${liveCluster.name} (${liveCluster.lat.toFixed(5)}, ${liveCluster.lng.toFixed(5)})` : "Dindi Leader GPS Position",
          severity: type === "MEDICAL" ? "HIGH" : "MEDIUM",
          cause: details,
          forecastText: `Immediate coordination required. ETA: ${etaMinutes} min.`,
          recommendedAction:
            type === "WATER"
              ? `Dispatch ${nearestTanker?.item.id ?? "nearest water tanker"} from ${nearestTanker?.item.currentHub ?? "available hub"} and assign ${assignedVolunteer?.volunteer.name ?? "nearest volunteer"} to verify arrival.`
              : type === "MEDICAL"
                ? `Notify ${nearestMedical?.item.name ?? "nearest medical post"} and assign ${assignedVolunteer?.volunteer.name ?? "nearest volunteer"} for triage support.`
                : `Route Dindi toward ${nearestCamp?.item.name ?? "nearest halt"} and assign ${assignedVolunteer?.volunteer.name ?? "nearest volunteer"} for ground confirmation.`,
          timestamp: timeString,
          status: "ACTIVE",
          timeToCriticalMinutes: type === "MEDICAL" ? 5 : 15,
          priorityScore: type === "MEDICAL" ? 80 : type === "WATER" ? 62 : 44,
          scoreBreakdown: { density: 10, urgency: type === "MEDICAL" ? 40 : 18, population: 10, resource: type === "WATER" ? 24 : 15 },
        };
        const newTask: VolunteerTask | null = assignedVolunteer
          ? {
              id: `TASK-${nowId}`,
              campId: nearestCamp?.item.id,
              campName: nearestCamp?.item.name ?? "Leader GPS position",
              volunteerId: assignedVolunteer.volunteer.id,
              volunteerName: assignedVolunteer.volunteer.name,
              title:
                type === "WATER"
                  ? `Verify tanker ${nearestTanker?.item.id ?? ""} arrival`
                  : type === "MEDICAL"
                    ? "Verify medical response"
                    : "Verify halt routing",
              type: type === "WATER" ? "WATER_TANKER" : type === "MEDICAL" ? "MEDICAL" : "HALT",
              etaMinutes,
              status: "ASSIGNED",
              createdAt: timeString,
              updatedAt: timeString,
            }
          : null;

        return {
          ...prev,
          volunteers: prev.volunteers.map((volunteer) =>
            volunteer.id === assignedVolunteer?.volunteer.id
              ? {
                  ...volunteer,
                  status: "DEPLOYED" as const,
                  currentTask:
                    type === "WATER"
                      ? `Verify ${nearestTanker?.item.id ?? "water tanker"} arrival at ${nearestCamp?.item.name ?? "leader GPS"} (ETA ${etaMinutes} min)`
                      : type === "MEDICAL"
                        ? `Support medical response at ${nearestMedical?.item.name ?? "leader GPS"} (ETA ${etaMinutes} min)`
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
              description: `${typeLabel}: ${details}. ${assignedVolunteer?.volunteer.name ?? "Volunteer"} assigned for verification. ETA ${etaMinutes} min.`,
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

      const actionByLabel =
        params.label === "Medical Emergency"
          ? "Dispatch nearest medical volunteer and ambulance; keep crowd-control volunteer at approach lane."
          : params.label === "Water Shortage"
            ? "Dispatch nearest water tanker and notify Dindi leaders about the refill point."
            : params.label === "Crowd Surge"
              ? "Deploy nearby crowd-control volunteers and divert incoming Dindis to the nearest verified halt."
              : params.label === "Road Blocked"
                ? "Assign traffic volunteers, mark blockage on map, and route Dindis through the nearest bypass."
                : params.label === "Sanitation Full"
                  ? "Dispatch sanitation crew and shift queue to the nearest available facility."
                  : "Send nearest volunteer team and open a command-centre follow-up task.";

      const newAlert: Alert = {
        id: `ALT-VOL-${now}`,
        title: `Volunteer Report: ${params.label}`,
        location,
        severity: params.severity,
        cause: `${params.label} reported by an on-duty volunteer from the field app.`,
        forecastText: "Live field report requires command-centre triage and nearest-resource assignment.",
        recommendedAction: actionByLabel,
        timestamp: timeString,
        status: "ACTIVE",
        timeToCriticalMinutes: params.severity === "CRITICAL" ? 5 : params.severity === "HIGH" ? 15 : 30,
        priorityScore: params.severity === "CRITICAL" ? 88 : params.severity === "HIGH" ? 68 : 42,
        scoreBreakdown: {
          density: params.label === "Crowd Surge" ? 30 : 10,
          urgency: params.severity === "CRITICAL" ? 35 : 22,
          population: params.label === "Crowd Surge" ? 18 : 8,
          resource: params.label === "Water Shortage" || params.label === "Sanitation Full" ? 18 : 12,
        },
      };

      setState((prev) => ({
        ...prev,
        alerts: [newAlert, ...prev.alerts],
        events: [
          {
            id: `EV-VOL-${now}`,
            timestamp: timeString,
            eventType: "ALERT" as const,
            severity: params.severity === "CRITICAL" ? "CRITICAL" : params.severity === "HIGH" ? "WARNING" : "INFO",
            source: "Volunteer Field Report",
            description: `${params.label} reported at ${location}`,
          },
          ...prev.events,
        ],
      }));
    },
    []
  );

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
