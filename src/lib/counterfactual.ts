export interface SimulationScenarioPreset {
  id: string;
  name: string;
  description: string;
  rainMmH: number;
  pilgrimMultiplier: number;
  dindiSpeedKmH: number;
  waterSupplyFactor: number;
  checkpointCapacityFactor: number;
}

export const SCENARIO_PRESETS: SimulationScenarioPreset[] = [
  {
    id: "dive_ghat_rain",
    name: "Sudden Dive Ghat Downpour",
    description: "25mm/h cloudburst on 14% mountain incline causing severe slippage and pace collapse.",
    rainMmH: 25,
    pilgrimMultiplier: 1.0,
    dindiSpeedKmH: 2.8,
    waterSupplyFactor: 1.0,
    checkpointCapacityFactor: 0.9,
  },
  {
    id: "mass_arrival_surge",
    name: "Mass Dindi Arrival Compression",
    description: "3 concurrent Dindis (95,000 pilgrims) arriving at Saswad bottleneck within 30 minutes.",
    rainMmH: 5,
    pilgrimMultiplier: 1.4,
    dindiSpeedKmH: 3.8,
    waterSupplyFactor: 0.8,
    checkpointCapacityFactor: 1.0,
  },
  {
    id: "water_tanker_gridlock",
    name: "Water Supply Logistics Crisis",
    description: "Saswad bypass blocked by local traffic; Camp 6 water reserves rapidly depleting.",
    rainMmH: 0,
    pilgrimMultiplier: 1.1,
    dindiSpeedKmH: 4.0,
    waterSupplyFactor: 0.4,
    checkpointCapacityFactor: 1.0,
  },
  {
    id: "heatwave_medical_surge",
    name: "Heatwave Dehydration Surge",
    description: "36°C afternoon heat index triggering 200+ heat exhaustion cases along Lonand sector.",
    rainMmH: 0,
    pilgrimMultiplier: 1.0,
    dindiSpeedKmH: 3.6,
    waterSupplyFactor: 0.7,
    checkpointCapacityFactor: 1.0,
  },
];

export interface CounterfactualComparison {
  metricName: string;
  category: "CROWD" | "CAMP" | "MEDICAL" | "WATER";
  unit: string;
  noActionValue: string | number;
  wariosValue: string | number;
  delta: string;
  isImprovement: boolean;
  timeline: {
    minute: number;
    noAction: number;
    warios: number;
  }[];
}

export function generateCounterfactualData(
  rainMmH: number = 18,
  pilgrimMultiplier: number = 1.0,
  dindiSpeed: number = 3.2
): CounterfactualComparison[] {
  // CP4 Density Timeline
  const cp4Base = 91;
  const cp4Timeline = [
    { minute: 0, noAction: cp4Base, warios: cp4Base },
    { minute: 10, noAction: Math.min(105, cp4Base + 2.5), warios: 88 },
    { minute: 20, noAction: Math.min(105, cp4Base + 5.2), warios: 86 },
    { minute: 30, noAction: Math.min(105, cp4Base + 7.8), warios: 84 },
    { minute: 45, noAction: 101, warios: 82 },
  ];

  // Camp 6 Occupancy Timeline
  const camp6Timeline = [
    { minute: 0, noAction: 120, warios: 120 },
    { minute: 10, noAction: 124, warios: 110 },
    { minute: 20, noAction: 128, warios: 98 },
    { minute: 30, noAction: 131, warios: 90 },
    { minute: 45, noAction: 134, warios: 85 },
  ];

  // Medical Trauma Load Timeline
  const medicalTimeline = [
    { minute: 0, noAction: 73, warios: 73 },
    { minute: 10, noAction: 78, warios: 70 },
    { minute: 20, noAction: 82, warios: 68 },
    { minute: 30, noAction: 86, warios: 65 },
    { minute: 45, noAction: 89, warios: 63 },
  ];

  // Water Buffer Timeline (minutes remaining)
  const waterTimeline = [
    { minute: 0, noAction: 34, warios: 34 },
    { minute: 10, noAction: 24, warios: 50 },
    { minute: 20, noAction: 14, warios: 65 },
    { minute: 30, noAction: 4, warios: 74 },
    { minute: 45, noAction: 0, warios: 78 },
  ];

  return [
    {
      metricName: "CP4 Dive Ghat Density",
      category: "CROWD",
      unit: "%",
      noActionValue: "101%",
      wariosValue: "82%",
      delta: "-19% Density Reduction",
      isImprovement: true,
      timeline: cp4Timeline,
    },
    {
      metricName: "Camp 6 (Saswad) Occupancy",
      category: "CAMP",
      unit: "%",
      noActionValue: "134%",
      wariosValue: "85%",
      delta: "-49% Overcapacity Cleared",
      isImprovement: true,
      timeline: camp6Timeline,
    },
    {
      metricName: "Medical Trauma Surge Load",
      category: "MEDICAL",
      unit: "%",
      noActionValue: "89%",
      wariosValue: "63%",
      delta: "-26% ICU Load Relief",
      isImprovement: true,
      timeline: medicalTimeline,
    },
    {
      metricName: "Water Reserve Depletion",
      category: "WATER",
      unit: "min",
      noActionValue: "0 min (Depleted in 27m)",
      wariosValue: "78 min (Fully Buffered)",
      delta: "Shortage Prevented",
      isImprovement: true,
      timeline: waterTimeline,
    },
  ];
}
