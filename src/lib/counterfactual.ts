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
  dindiSpeed: number = 3.2,
  waterSupplyFactor: number = 1.0
): CounterfactualComparison[] {
  const rainFactor = 1 + rainMmH / 80;
  const speedFactor = 3.4 / Math.max(1.0, dindiSpeed);

  // Dynamic No-Action values
  const noActionDensity = Math.round(Math.min(150, 91 * pilgrimMultiplier * rainFactor * (dindiSpeed < 3.0 ? 1.15 : 0.95)));
  const wariosDensity = Math.round(Math.max(50, noActionDensity * 0.76));

  const noActionCamp = Math.round(Math.min(180, 115 * pilgrimMultiplier * speedFactor));
  const wariosCamp = Math.round(Math.max(55, Math.min(88, noActionCamp * 0.64)));

  const noActionMed = Math.round(Math.min(100, (rainMmH * 1.2) + (pilgrimMultiplier * 42) + Math.max(0, (1 - waterSupplyFactor) * 30)));
  const wariosMed = Math.round(Math.max(35, noActionMed * 0.66));

  const noActionWaterMin = Math.max(0, Math.round((34 * waterSupplyFactor) / Math.max(0.7, pilgrimMultiplier) - (rainMmH > 25 ? 10 : 0)));
  const wariosWaterMin = Math.round(noActionWaterMin + 45 * waterSupplyFactor);

  // Dynamic Timelines
  const cp4Timeline = [
    { minute: 0, noAction: Math.round(noActionDensity * 0.85), warios: Math.round(noActionDensity * 0.85) },
    { minute: 10, noAction: Math.round(noActionDensity * 0.92), warios: Math.round(wariosDensity * 1.05) },
    { minute: 20, noAction: Math.round(noActionDensity * 0.96), warios: Math.round(wariosDensity * 1.02) },
    { minute: 30, noAction: noActionDensity, warios: wariosDensity },
    { minute: 45, noAction: Math.round(noActionDensity * 1.04), warios: wariosDensity },
  ];

  const camp6Timeline = [
    { minute: 0, noAction: Math.round(noActionCamp * 0.88), warios: Math.round(noActionCamp * 0.88) },
    { minute: 10, noAction: Math.round(noActionCamp * 0.94), warios: Math.round(wariosCamp * 1.1) },
    { minute: 20, noAction: Math.round(noActionCamp * 0.98), warios: Math.round(wariosCamp * 1.04) },
    { minute: 30, noAction: noActionCamp, warios: wariosCamp },
    { minute: 45, noAction: Math.round(noActionCamp * 1.05), warios: wariosCamp },
  ];

  const medicalTimeline = [
    { minute: 0, noAction: Math.round(noActionMed * 0.8), warios: Math.round(noActionMed * 0.8) },
    { minute: 10, noAction: Math.round(noActionMed * 0.88), warios: Math.round(wariosMed * 1.08) },
    { minute: 20, noAction: Math.round(noActionMed * 0.94), warios: Math.round(wariosMed * 1.04) },
    { minute: 30, noAction: noActionMed, warios: wariosMed },
    { minute: 45, noAction: Math.round(noActionMed * 1.06), warios: wariosMed },
  ];

  const waterTimeline = [
    { minute: 0, noAction: noActionWaterMin, warios: noActionWaterMin },
    { minute: 10, noAction: Math.max(0, noActionWaterMin - 10), warios: Math.round(wariosWaterMin * 0.7) },
    { minute: 20, noAction: Math.max(0, noActionWaterMin - 20), warios: Math.round(wariosWaterMin * 0.85) },
    { minute: 30, noAction: Math.max(0, noActionWaterMin - 30), warios: Math.round(wariosWaterMin * 0.95) },
    { minute: 45, noAction: Math.max(0, noActionWaterMin - 45), warios: wariosWaterMin },
  ];

  return [
    {
      metricName: "Dive Ghat Chokepoint Density",
      category: "CROWD",
      unit: "%",
      noActionValue: `${noActionDensity}%`,
      wariosValue: `${wariosDensity}%`,
      delta: `-${noActionDensity - wariosDensity}% Density Relief`,
      isImprovement: true,
      timeline: cp4Timeline,
    },
    {
      metricName: "Corridor Camp Peak Occupancy",
      category: "CAMP",
      unit: "%",
      noActionValue: `${noActionCamp}%`,
      wariosValue: `${wariosCamp}%`,
      delta: `-${noActionCamp - wariosCamp}% Overcapacity Cleared`,
      isImprovement: true,
      timeline: camp6Timeline,
    },
    {
      metricName: "Medical & Heat Stress Load",
      category: "MEDICAL",
      unit: "%",
      noActionValue: `${noActionMed}%`,
      wariosValue: `${wariosMed}%`,
      delta: `-${noActionMed - wariosMed}% Trauma Stress Relief`,
      isImprovement: true,
      timeline: medicalTimeline,
    },
    {
      metricName: "Water Reserve Depletion Window",
      category: "WATER",
      unit: "min",
      noActionValue: noActionWaterMin <= 10 ? `${noActionWaterMin} min (Critical)` : `${noActionWaterMin} min remaining`,
      wariosValue: `${wariosWaterMin} min (Fully Buffered)`,
      delta: `+${wariosWaterMin - noActionWaterMin}m Buffer Extended`,
      isImprovement: true,
      timeline: waterTimeline,
    },
  ];
}
