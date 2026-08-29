import {
  SimulationState,
  Checkpoint,
  Dindi,
  Camp,
  WaterTanker,
  Volunteer,
  Alert,
  OperationalEvent,
  BeforeAfterMetric,
  IncidentScore,
} from "./types";
import { INITIAL_SIMULATION_STATE } from "./constants";

export function calculateCrowdRisk(density: number, growthRate: number): "NORMAL" | "ATTENTION" | "HIGH" | "CRITICAL" {
  const projected = density + growthRate * 2.5;
  if (projected >= 95 || density >= 90) return "CRITICAL";
  if (projected >= 85 || density >= 80) return "HIGH";
  if (projected >= 70 || density >= 60) return "ATTENTION";
  return "NORMAL";
}

export function calculateDindiETA(
  currentKm: number,
  targetKm: number,
  baseSpeedKmH: number,
  weatherRainMm: number,
  elevationSlope: number
): { etaMinutes: number; speedKmH: number; paceDropPercent: number } {
  let speed = baseSpeedKmH;
  if (weatherRainMm > 10) speed *= 0.85;
  if (weatherRainMm > 25) speed *= 0.7;
  if (elevationSlope > 0.08) speed *= 0.8;

  const distance = Math.max(0.5, targetKm - currentKm);
  const hours = distance / Math.max(1.0, speed);
  const paceDrop = Math.max(0, Math.round(((baseSpeedKmH - speed) / baseSpeedKmH) * 100));

  return {
    etaMinutes: Math.round(hours * 60),
    speedKmH: Number(speed.toFixed(1)),
    paceDropPercent: paceDrop,
  };
}

export function calculateWaterForecast(
  stockPercent: number,
  burnRateLitersMin: number,
  tankCapacityLiters: number = 50000
): { minutesLeft: number; risk: "NORMAL" | "ATTENTION" | "HIGH" | "CRITICAL" } {
  const remainingLiters = (stockPercent / 100) * tankCapacityLiters;
  const minutes = Math.max(1, Math.round(remainingLiters / Math.max(10, burnRateLitersMin)));
  let risk: "NORMAL" | "ATTENTION" | "HIGH" | "CRITICAL" = "NORMAL";
  if (minutes < 40 || stockPercent < 20) risk = "CRITICAL";
  else if (minutes < 75 || stockPercent < 35) risk = "HIGH";
  else if (minutes < 120 || stockPercent < 50) risk = "ATTENTION";
  return { minutesLeft: minutes, risk };
}

export function calculateIncidentPriorityScore(
  density: number,
  timeToCriticalMin: number,
  affectedPeople: number,
  resourceDeficit: number
): IncidentScore {
  const densityRisk = Math.min(35, Math.round((density / 100) * 35));
  const timeUrgency = Math.min(25, Math.round(Math.max(0, (60 - timeToCriticalMin) / 60) * 25));
  const populationImpact = Math.min(20, Math.round((affectedPeople / 40000) * 20));
  const resourcePressure = Math.min(20, Math.round((resourceDeficit / 100) * 20));
  const total = densityRisk + timeUrgency + populationImpact + resourcePressure;

  return {
    total: Math.min(100, Math.max(10, total)),
    densityRisk,
    timeUrgency,
    populationImpact,
    resourcePressure,
  };
}

export function resetSimulationState(): SimulationState {
  return JSON.parse(JSON.stringify(INITIAL_SIMULATION_STATE));
}

export function executeDispatchAction(
  actionKey:
    | "REROUTE_DINDI_14"
    | "DISPATCH_TANKER_T03"
    | "DEPLOY_VOLUNTEERS_CP4"
    | "OPEN_BACKUP_SHELTER_B"
    | "EXECUTE_FULL_MITIGATION_RESPONSE",
  state: SimulationState
): SimulationState {
  const newState: SimulationState = JSON.parse(JSON.stringify(state));
  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  if (actionKey === "REROUTE_DINDI_14" || actionKey === "EXECUTE_FULL_MITIGATION_RESPONSE") {
    // 1. Reroute Dindi 14
    newState.dindis = newState.dindis.map((d) => {
      if (d.id === "DINDI-14") {
        return {
          ...d,
          rerouted: true,
          rerouteTarget: "Bypass Route B (East Saswad Link)",
          status: "ATTENTION",
          currentPaceKmH: 3.8,
          paceDropPercent: 8,
          currentSegment: "Bypass Route B (Avoiding CP4 Chokepoint)",
        };
      }
      return d;
    });

    // Update CP4 telemetry
    newState.checkpoints = newState.checkpoints.map((cp) => {
      if (cp.shortCode === "CP4") {
        return {
          ...cp,
          bypassActive: true,
          currentDensity: 82,
          currentCount: 8200,
          trendRate10Min: -6,
          forecast45Min: 82,
          risk: "ATTENTION",
          status: "MITIGATING",
          forecastTrajectory: [
            { minute: 0, density: 82, label: "Current" },
            { minute: 15, density: 81, label: "+15m" },
            { minute: 30, density: 80, label: "+30m" },
            { minute: 45, density: 78, label: "+45m" },
          ],
        };
      }
      return cp;
    });

    newState.events.unshift({
      id: `EV-${Date.now()}-1`,
      timestamp: timeString,
      eventType: "DISPATCH",
      severity: "SUCCESS",
      source: "Traffic Marshall Command",
      description: "Dindi #14 diverted to Bypass Route B. CP4 inflow reduced by 26,000 pilgrims.",
      action: "Dindi Reroute",
      result: "CP4 density growth trend reversed from +18% to -6%.",
    });
  }

  if (actionKey === "DISPATCH_TANKER_T03" || actionKey === "EXECUTE_FULL_MITIGATION_RESPONSE") {
    // 2. Dispatch Tanker T-03
    newState.tankers = newState.tankers.map((t) => {
      if (t.id === "T-03") {
        return {
          ...t,
          status: "EN_ROUTE",
          assignedCampId: "CAMP-06",
          distanceKm: 0.8,
          etaMinutes: 6,
        };
      }
      return t;
    });

    // Improve Camp 6 water projection
    newState.camps = newState.camps.map((c) => {
      if (c.id === "CAMP-06") {
        return {
          ...c,
          assignedTankers: ["T-03"],
          waterStockPercent: 65,
          minutesToWaterDepletion: 78,
          status: "ATTENTION",
        };
      }
      return c;
    });

    newState.events.unshift({
      id: `EV-${Date.now()}-2`,
      timestamp: timeString,
      eventType: "DISPATCH",
      severity: "SUCCESS",
      source: "Logistics Hub 2",
      description: "Water Tanker T-03 (12,000L) dispatched to Camp 6. ETA 6 minutes.",
      action: "Tanker Deployment",
      result: "Camp 6 water crisis averted; depletion buffer extended to 78 min.",
    });
  }

  if (actionKey === "DEPLOY_VOLUNTEERS_CP4" || actionKey === "EXECUTE_FULL_MITIGATION_RESPONSE") {
    // 3. Deploy 5 volunteers
    const deployedIds = ["VOL-102", "VOL-106", "VOL-110", "VOL-112", "VOL-105"];
    newState.volunteers = newState.volunteers.map((v) => {
      if (deployedIds.includes(v.id)) {
        return {
          ...v,
          status: "DEPLOYED",
          currentTask: "Crowd Channeling & Bypass B Marshalling at CP4",
        };
      }
      return v;
    });

    newState.checkpoints = newState.checkpoints.map((cp) => {
      if (cp.shortCode === "CP4") {
        return {
          ...cp,
          assignedVolunteers: 10,
        };
      }
      return cp;
    });

    newState.events.unshift({
      id: `EV-${Date.now()}-3`,
      timestamp: timeString,
      eventType: "DISPATCH",
      severity: "INFO",
      source: "Smart Seva Coordinator",
      description: "5 specialized Traffic & Medical volunteers deployed to CP4 Apex chokepoint.",
      action: "Volunteer Marshaling",
      result: "Pedestrian throughput rate increased by +34%.",
    });
  }

  if (actionKey === "OPEN_BACKUP_SHELTER_B" || actionKey === "EXECUTE_FULL_MITIGATION_RESPONSE") {
    // 4. Open Backup Shelter B at Saswad
    newState.camps = newState.camps.map((c) => {
      if (c.id === "CAMP-06") {
        return {
          ...c,
          shelterStatus: "BACKUP_OPEN",
          currentOccupancy: 38250,
          occupancyPercent: 85,
          status: "NORMAL",
        };
      }
      return c;
    });

    newState.events.unshift({
      id: `EV-${Date.now()}-4`,
      timestamp: timeString,
      eventType: "DISPATCH",
      severity: "SUCCESS",
      source: "District Collectorate Ops",
      description: "Saswad Backup Shelter B (Capacity 20,000) opened. Camp 6 load diverted.",
      action: "Shelter Expansion",
      result: "Camp 6 occupancy reduced from 120% to 85%.",
    });
  }

  if (actionKey === "EXECUTE_FULL_MITIGATION_RESPONSE") {
    newState.isMitigated = true;
    newState.decisionStage = "VERIFIED";

    // Update Alerts
    newState.alerts = newState.alerts.map((alt) => {
      if (alt.id === "ALT-401") {
        return {
          ...alt,
          status: "MITIGATION_IN_PROGRESS",
          title: "CP4 Density Surge — MITIGATION IN PROGRESS",
          severity: "HIGH",
          forecastText: "Controlled bypass active: Projected density normalized to 82%",
          priorityScore: 45,
        };
      }
      if (alt.id === "ALT-402") {
        return {
          ...alt,
          status: "RESOLVED",
          title: "Camp 6 Water Shortage — RESOLVED",
          severity: "LOW",
          priorityScore: 20,
        };
      }
      return alt;
    });

    // Populate Before/After impact metrics
    const beforeAfter: BeforeAfterMetric[] = [
      {
        metric: "CP4 Dive Ghat Density",
        before: "97%",
        after: "82%",
        unit: "%",
        improved: true,
        deltaText: "-15% Density Drop",
      },
      {
        metric: "Camp 6 Capacity Load",
        before: "120%",
        after: "85%",
        unit: "%",
        improved: true,
        deltaText: "-35% Overcapacity Cleared",
      },
      {
        metric: "Medical Trauma Surge Load",
        before: "83%",
        after: "64%",
        unit: "%",
        improved: true,
        deltaText: "-19% Pressure Relief",
      },
      {
        metric: "Camp 6 Water Depletion Buffer",
        before: "34 min",
        after: "78 min",
        unit: "min",
        improved: true,
        deltaText: "+44 min Safe Reserve",
      },
    ];

    newState.beforeAfterSummary = beforeAfter;
    newState.showBeforeAfterModal = true;

    newState.events.unshift({
      id: `EV-${Date.now()}-5`,
      timestamp: timeString,
      eventType: "VERIFICATION",
      severity: "SUCCESS",
      source: "WariOS Verification Core",
      description: "Closed-loop verification complete: All 4 telemetry streams confirm successful stabilization.",
      action: "Telemetry Verification",
      result: "CP4 breach averted; Route operating in nominal state.",
    });
  }

  return newState;
}

export function tickSimulationEngine(state: SimulationState): SimulationState {
  if (!state.isSimulating) return state;

  const nextState: SimulationState = JSON.parse(JSON.stringify(state));

  // If already mitigated, stabilize further
  if (nextState.isMitigated) {
    nextState.checkpoints = nextState.checkpoints.map((cp) => {
      if (cp.shortCode === "CP4" && cp.currentDensity > 78) {
        return { ...cp, currentDensity: Math.max(76, cp.currentDensity - 0.2) };
      }
      return cp;
    });
    return nextState;
  }

  // Under normal unmitigated simulation, CP4 slightly rises
  nextState.checkpoints = nextState.checkpoints.map((cp) => {
    if (cp.shortCode === "CP4" && cp.currentDensity < 96) {
      const nextDensity = Math.min(97, cp.currentDensity + 0.15);
      return {
        ...cp,
        currentDensity: Number(nextDensity.toFixed(1)),
        currentCount: Math.round((nextDensity / 100) * cp.maxCapacity),
      };
    }
    return cp;
  });

  return nextState;
}
