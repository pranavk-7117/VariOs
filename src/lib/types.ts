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
  speedKmH?: number;
  route?: string;
  reroutedCampId?: string;
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

export interface FoodSupplyUnit {
  id: string;
  name: string;
  mealsCapacity: number;
  status: "AVAILABLE" | "EN_ROUTE" | "SERVING";
  currentHub: string;
  assignedCampId?: string;
  distanceKm: number;
  etaMinutes: number;
  leadName: string;
  phone: string;
  vehicleNumber: string;
  lat: number;
  lng: number;
}

export type VolunteerSkill =
  | "MEDICAL"
  | "TRAFFIC"
  | "CROWD_CONTROL"
  | "MARATHI_HINDI"
  | "LOGISTICS";

export interface Volunteer {
  id: string;
  assignedCampId?: string;
  name: string;
  phone?: string;
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

export interface VolunteerTask {
  id: string;
  campId?: string;
  campName: string;
  volunteerId: string;
  volunteerName: string;
  title: string;
  type: "WATER_TANKER" | "FOOD_SUPPLY" | "MEDICAL" | "HALT" | "CROWD" | "SANITATION" | "GENERAL";
  etaMinutes: number;
  status: "ASSIGNED" | "IN_PROGRESS" | "VERIFIED" | "REJECTED";
  remarks?: string;
  createdAt: string;
  updatedAt: string;
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
  status: "AVAILABLE" | "EN_ROUTE" | "ON_DUTY";
  leadName: string;
  phone?: string;
  activeToiletsCleaned: number;
  mobilePodsCount: number;
  zone: string;
  assignedCampId?: string;
  distanceKm?: number;
  etaMinutes?: number;
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
  foodSupplies: FoodSupplyUnit[];
  volunteers: Volunteer[];
  medicalStations: MedicalStation[];
  sanitationCrews: SanitationCrew[];
  volunteerTasks: VolunteerTask[];
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
  structured?: {
    headline: string;
    forecastText: string;
    rootCauses: string[];
    impacts: { label: string; value: string }[];
    recommendations: string[];
    confidence: number;
    showCounterfactual?: boolean;
  };
}
