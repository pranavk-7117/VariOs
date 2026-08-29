"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  SimulationState,
  DecisionStage,
  OperationalEvent,
  Alert,
} from "@/lib/types";
import { INITIAL_SIMULATION_STATE } from "@/lib/constants";
import {
  executeDispatchAction,
  resetSimulationState,
  tickSimulationEngine,
} from "@/lib/simulation-engine";

interface SimulationContextType {
  state: SimulationState;
  isMitigated: boolean;
  // Simulation controls
  setIsSimulating: (val: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  resetAll: () => void;
  // Operational dispatch actions
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
  requestLeaderAssistance: (type: "WATER" | "MEDICAL" | "HALT", details: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SimulationState>(INITIAL_SIMULATION_STATE);

  // Live simulation tick loop — runs continuously while isSimulating = true
  useEffect(() => {
    if (!state.isSimulating) return;

    const interval = setInterval(() => {
      setState((prev) => tickSimulationEngine(prev));
    }, 4000 / state.simulationSpeed);

    return () => clearInterval(interval);
  }, [state.isSimulating, state.simulationSpeed]);

  const setIsSimulating = (val: boolean) => {
    setState((prev) => ({ ...prev, isSimulating: val }));
  };

  const setSimulationSpeed = (speed: number) => {
    setState((prev) => ({ ...prev, simulationSpeed: speed }));
  };

  const resetAll = useCallback(() => {
    setState(resetSimulationState());
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
    setState((prev) => executeDispatchAction("EXECUTE_FULL_MITIGATION_RESPONSE", prev));
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
        etaNextHalt: "Calculating...",
        nextHalt: "Nearest Halt",
        status: "NORMAL" as const,
        lat: params.lat,
        lng: params.lng,
        weatherDelayMinutes: 0,
        terrainFactor: 1.0,
        rerouted: false,
        routeColor: "#10B981",
        isCustomRegistered: true,
        passcode,
      };

      setState((prev) => ({
        ...prev,
        dindis: [newDindi, ...prev.dindis],
        events: [
          {
            id: `EV-${now}`,
            timestamp: timeString,
            eventType: "DISPATCH" as const,
            severity: "INFO" as const,
            source: "Dindi Leader Registration",
            description: `NEW DINDI: ${params.name} | Leader: ${params.leader} | Passcode: ${passcode} | ~${params.count} pilgrims`,
          },
          ...prev.events,
        ],
      }));

      return { dindiId, passcode, dindiNumber };
    },
    []
  );

  const requestLeaderAssistance = useCallback(
    (type: "WATER" | "MEDICAL" | "HALT", details: string) => {
      const ts = new Date();
      const timeString = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
      const typeLabel = type === "WATER" ? "💧 Water Tanker" : type === "MEDICAL" ? "🚑 Medical Aid" : "⛺ Halt Request";

      const newAlert: Alert = {
        id: `ALT-LEADER-${Date.now()}`,
        title: `${typeLabel} — Dindi Leader Request`,
        location: "Dindi Leader GPS Position",
        severity: type === "MEDICAL" ? "HIGH" : "MEDIUM",
        cause: details,
        forecastText: "Immediate coordination required for live dindi",
        recommendedAction: type === "WATER" ? "Dispatch nearest water tanker" : type === "MEDICAL" ? "Dispatch medical team to GPS coordinates" : "Acknowledge halt and update route board",
        timestamp: timeString,
        status: "ACTIVE",
        timeToCriticalMinutes: type === "MEDICAL" ? 5 : 15,
        priorityScore: type === "MEDICAL" ? 80 : 40,
        scoreBreakdown: { density: 10, urgency: type === "MEDICAL" ? 40 : 15, population: 10, resource: type === "MEDICAL" ? 20 : 15 },
      };

      setState((prev) => ({
        ...prev,
        events: [
          {
            id: `EV-LEADER-${Date.now()}`,
            timestamp: timeString,
            eventType: "ALERT" as const,
            severity: type === "MEDICAL" ? ("WARNING" as const) : ("INFO" as const),
            source: "Dindi Leader Request",
            description: `${typeLabel}: ${details}`,
          },
          ...prev.events,
        ],
        alerts: [newAlert, ...prev.alerts],
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
        requestLeaderAssistance,
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
