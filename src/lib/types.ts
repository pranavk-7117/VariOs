export type Role =
  | "COMMANDER"
  | "POLICE"
  | "MEDICAL"
  | "VOLUNTEER"
  | "LOGISTICS"
  | "SANITATION"
  | "DINDI_LEADER";

export type RiskLevel = "NORMAL" | "ATTENTION" | "HIGH" | "CRITICAL";

export type DecisionStage =
  | "DETECTED"
  | "PREDICTED"
  | "EXPLAINED"
  | "RECOMMENDED"
  | "DECIDED"
  | "DISPATCHED"
  | "VERIFIED";

export interface Checkpoint {
  id: string;
  name: string;
  shortCode: string;
  lat: number;
  lng: number;
  currentDensity: number; // 0 - 100%
  maxCapacity: number;
  currentCount: number;
  trendRate10Min: number; // e.g. +18
  forecast45Min: number; // e.g. 96
  risk: RiskLevel;
  status: "NORMAL" | "WARNING" | "CRITICAL" | "MITIGATING" | "RESOLVED";
  elevationMeters: number;
  weatherStatus: string;
  incomingDindis: string[];
  assignedVolunteers: number;
  bypassRouteAvailable: boolean;
  bypassActive: boolean;
  forecastTrajectory: { minute: number; density: number; label: string }[];
}

export interface Dindi {
  id: string;
  number: number;
  name: string;
  leader: string;
  pilgrimCount: number;
  currentSegment: string;
  currentPaceKmH: number;
  standardPaceKmH: number;
  paceDropPercent: number;
  etaNextHalt: string;
  nextHalt: string;
  status: RiskLevel;
  lat: number;
  lng: number;
  weatherDelayMinutes: number;
  terrainFactor: number;
  rerouted: boolean;
  rerouteTarget?: string;
  bypassRouteName?: string;
  isCustomRegistered?: boolean;
  passcode?: string;
  routeColor: string;
}

export interface Camp {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number; // e.g. 54000
  occupancyPercent: number; // e.g. 120%
  waterStockPercent: number;
  waterBurnRateLitersPerMin: number;
  minutesToWaterDepletion: number;
  assignedTankers: string[];
  foodStockPercent: number;
  shelterStatus: "OVERFLOW" | "STABLE" | "BACKUP_OPEN";
  lat: number;
  lng: number;
  status: RiskLevel;
}

export interface WaterTanker {
  id: string;
  capacityLiters: number;
  status: "AVAILABLE" | "DISPATCHED" | "EN_ROUTE" | "DISCHARGING";
  currentHub: string;
  assignedCampId?: string;
  distanceKm: number;
  etaMinutes: number;
  driverName: string;
  lat: number;
  lng: number;
  targetLat?: number;
  targetLng?: number;
}

export type VolunteerSkill =
  | "MEDICAL"
  | "TRAFFIC"
  | "CROWD_CONTROL"
  | "MARATHI_HINDI"
  | "LOGISTICS";

export interface Volunteer {
  id: string;
  name: string;
  skills: VolunteerSkill[];
  locationName: string;
  lat: number;
  lng: number;
  distanceToTargetKm?: number;
  batteryPercent: number;
  status: "AVAILABLE" | "DEPLOYED" | "ON_BREAK";
  currentTask?: string;
  avatarColor: string;
}

export interface MedicalStation {
  id: string;
  name: string;
  capacityBeds: number;
  occupiedBeds: number;
  occupancyPercent: number;
  status: "NORMAL" | "SURGE" | "CRITICAL";
  doctorCount: number;
  availableAmbulances: number;
  heatStrokeKits: number;
  lat: number;
  lng: number;
}

export interface SanitationCrew {
  id: string;
  name: string;
  status: "DISPATCHED" | "AVAILABLE" | "ON_DUTY";
  leadName: string;
  activeToiletsCleaned: number;
  zone: string;
  lat: number;
  lng: number;
}

export interface Alert {
  id: string;
  title: string;
  location: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  cause: string;
  forecastText: string;
  recommendedAction: string;
  timestamp: string;
  status: "ACTIVE" | "MITIGATION_IN_PROGRESS" | "RESOLVED";
  timeToCriticalMinutes: number;
  priorityScore: number;
  scoreBreakdown: {
    density: number;
    urgency: number;
    population: number;
    resource: number;
  };
}

export interface OperationalEvent {
  id: string;
  timestamp: string;
  eventType:
    | "DETECTION"
    | "FORECAST"
    | "ALERT"
    | "COPILOT_REC"
    | "DECISION"
    | "DISPATCH"
    | "TELEMETRY_UPDATE"
    | "VERIFICATION";
  severity: "CRITICAL" | "WARNING" | "INFO" | "SUCCESS";
  source: string;
  description: string;
  action?: string;
  result?: string;
}

export interface IncidentScore {
  total: number;
  densityRisk: number;
  timeUrgency: number;
  populationImpact: number;
  resourcePressure: number;
}

export interface BeforeAfterMetric {
  metric: string;
  before: number | string;
  after: number | string;
  unit: string;
  improved: boolean;
  deltaText: string;
}

export interface SimulationState {
  isSimulating: boolean;
  simulationSpeed: number; // 1x, 2x, 5x
  currentClock: string; // "10:42 AM"
  totalPilgrims: number;
  routeUtilization: number;
  weatherCondition: {
    rainfallMmH: number;
    temperatureC: number;
    heatIndex: "MODERATE" | "HIGH" | "SEVERE";
    activeRainSector: string;
  };
  checkpoints: Checkpoint[];
  dindis: Dindi[];
  camps: Camp[];
  tankers: WaterTanker[];
  volunteers: Volunteer[];
  medicalStations: MedicalStation[];
  sanitationCrews: SanitationCrew[];
  alerts: Alert[];
  events: OperationalEvent[];
  activeIncidentId: string | null;
  decisionStage: DecisionStage;
  isMitigated: boolean;
  showBeforeAfterModal: boolean;
  beforeAfterSummary: BeforeAfterMetric[] | null;

}

export interface CopilotMessage {
  id: string;
  sender: "USER" | "WARIOS_AI";
  timestamp: string;
  text?: string;
  structuredPayload?: {
    situation: string;
    forecast: {
      headline: string;
      horizonMinutes: number;
      breachCapacityPercent: number;
    };
    rootCauses: string[];
    cascadingImpact: { label: string; value: string }[];
    recommendedActions: {
      id: string;
      title: string;
      actionKey: string;
      impactDescription: string;
    }[];
    confidencePercent: number;
    isSimulatedForecast: boolean;
  };
  counterfactualData?: {
    metricName: string;
    noActionVal: string | number;
    wariosVal: string | number;
    divergenceTimeline: { minute: number; noAction: number; warios: number }[];
  }[];
}
