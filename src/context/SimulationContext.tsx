"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  SimulationState,
  DecisionStage,
  OperationalEvent,
  Alert,
  VolunteerTask,
  Volunteer,
} from "@/lib/types";
import { LIVE_INITIAL_STATE, DEMO_INITIAL_STATE } from "@/lib/constants";
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
  requestLeaderAssistance: (type: "WATER" | "MEDICAL" | "HALT", details: string) => void;
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

function computeLiveCamps(dindis: Dindi[], baseCamps: Camp[]): Camp[] {
  return baseCamps.map((camp) => {
    const assignedPilgrims = dindis
      .filter((d) => d.isCustomRegistered)
      .filter((d) => {
        const closest = baseCamps
          .map((c) => ({ c, dist: getDistanceKm(d.lat, d.lng, c.lat, c.lng) }))
          .sort((a, b) => a.dist - b.dist)[0];
        return closest?.c.id === camp.id;
      })
      .reduce((sum, d) => sum + d.pilgrimCount, 0);

    const occupancyPercent = Math.min(100, Math.round((assignedPilgrims / camp.capacity) * 100));
    return {
      ...camp,
      currentOccupancy: assignedPilgrims,
      occupancyPercent,
      waterStockPercent: 95,
      waterBurnRateLitersPerMin: Math.max(20, Math.round(assignedPilgrims * 0.05)),
      minutesToWaterDepletion: 360,
      foodStockPercent: 92,
      shelterStatus: occupancyPercent > 90 ? "ATTENTION" : "STABLE",
      status: occupancyPercent > 90 ? "ATTENTION" : "NORMAL",
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
              camps: computeLiveCamps(parsed, LIVE_SUPPORT_CAMPS),
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
    (type: "WATER" | "MEDICAL" | "HALT", details: string) => {
      const ts = new Date();
      const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
      const typeLabel = type === "WATER" ? "💧 Water Tanker" : type === "MEDICAL" ? "🚑 Medical Aid" : "⛺ Halt Request";
      const nowId = Date.now();

      setState((prev) => {
        const liveClusters = getLiveCrowdClusters(prev);
        const topCluster = liveClusters[0];
        const nearestCamp = topCluster?.nearestCamp;
        const nearestTanker = topCluster?.nearestTanker;
        const nearestMedical = topCluster?.nearestMedical;
        const assignedVolunteer =
          topCluster?.nearestVolunteers[0] ??
          prev.volunteers
            .map((volunteer) => ({ volunteer, distanceKm: getDistanceKm(18.5138, 73.8589, volunteer.lat, volunteer.lng) }))
            .sort((a, b) => a.distanceKm - b.distanceKm)[0];
        const etaMinutes = nearestTanker?.distanceKm ? Math.max(5, Math.round((nearestTanker.distanceKm / 25) * 60)) : 15;

        const newAlert: Alert = {
          id: `ALT-LEADER-${nowId}`,
          title: `${typeLabel} — Dindi Leader Request`,
          location: nearestCamp?.item.name ?? "Live Dindi GPS Position",
          severity: type === "MEDICAL" ? "HIGH" : "MEDIUM",
          cause: details,
          forecastText: `Immediate assistance dispatched. Assigned field volunteer: ${assignedVolunteer?.item.name ?? "Corridor Seva Desk"}. Estimated response: ${etaMinutes} min.`,
          recommendedAction:
            type === "WATER"
              ? `Dispatch water tanker ${nearestTanker?.item.id ?? "T-03"} from ${nearestTanker?.item.currentHub ?? "Hadapsar Hub"} to ${nearestCamp?.item.name ?? "Dindi position"}.`
              : type === "MEDICAL"
                ? `Alert medical station ${nearestMedical?.item.name ?? "Deenanath Mangeshkar"} and mobilize field doctor.`
                : `Acknowledge halt at ${nearestCamp?.item.name ?? "nearest safe rest ground"}.`,
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
              campName: nearestCamp?.item.name ?? "Live Dindi GPS Location",
              volunteerId: assignedVolunteer.item.id,
              volunteerName: assignedVolunteer.item.name,
              title:
                type === "WATER"
                  ? `Verify water tanker ${nearestTanker?.item.id ?? "T-03"} arrival`
                  : type === "MEDICAL"
                    ? "Verify medical emergency response team"
                    : "Verify halt capacity and devotee rest area",
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
            volunteer.id === assignedVolunteer?.item.id
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
    []
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
        camps: !prev.isSimulating ? computeLiveCamps(remaining, LIVE_SUPPORT_CAMPS) : prev.camps,
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
