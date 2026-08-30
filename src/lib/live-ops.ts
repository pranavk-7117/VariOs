import { Camp, Dindi, MedicalStation, SanitationCrew, Volunteer, WaterTanker } from "./types";

export interface DistanceTagged<T> {
  item: T;
  distanceKm: number;
}

export interface LiveCrowdCluster {
  id: string;
  name: string;
  lat: number;
  lng: number;
  dindis: Dindi[];
  totalPilgrims: number;
  capacity: number;
  occupancyPercent: number;
  overcrowdedBy: number;
  risk: "NORMAL" | "ATTENTION" | "HIGH" | "CRITICAL";
  nearestCamp?: DistanceTagged<Camp>;
  nearestMedical?: DistanceTagged<MedicalStation>;
  nearestTanker?: DistanceTagged<WaterTanker>;
  nearestVolunteers: DistanceTagged<Volunteer>[];
  nearestSanitationCrew?: DistanceTagged<SanitationCrew>;
}

const CO_LOCATION_PRECISION = 3;

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return Math.round(radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function nearest<T extends { lat: number; lng: number }>(
  lat: number,
  lng: number,
  items: T[],
): DistanceTagged<T> | undefined {
  return items
    .map((item) => ({ item, distanceKm: getDistanceKm(lat, lng, item.lat, item.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
}

function riskForOccupancy(percent: number): LiveCrowdCluster["risk"] {
  if (percent >= 200) return "CRITICAL";
  if (percent >= 125) return "HIGH";
  if (percent >= 90) return "ATTENTION";
  return "NORMAL";
}

export function getLiveCrowdClusters(params: {
  dindis: Dindi[];
  camps: Camp[];
  medicalStations: MedicalStation[];
  tankers: WaterTanker[];
  volunteers: Volunteer[];
  sanitationCrews: SanitationCrew[];
}): LiveCrowdCluster[] {
  const groups = new Map<string, Dindi[]>();

  params.dindis
    .filter((dindi) => dindi.isCustomRegistered)
    .forEach((dindi) => {
      const targetCamp = (dindi as any).reroutedCampId
        ? params.camps.find((c) => c.id === (dindi as any).reroutedCampId)
        : null;
      const effectiveLat = targetCamp ? targetCamp.lat : dindi.lat;
      const effectiveLng = targetCamp ? targetCamp.lng : dindi.lng;

      const key = `${effectiveLat.toFixed(CO_LOCATION_PRECISION)},${effectiveLng.toFixed(CO_LOCATION_PRECISION)}`;
      groups.set(key, [...(groups.get(key) ?? []), dindi]);
    });

  return Array.from(groups.entries())
    .map(([key, dindis]) => {
      const [lat, lng] = key.split(",").map(Number);
      const nearestCamp = nearest(lat, lng, params.camps);
      const holdingCapacity = nearestCamp?.item.capacity ?? 40000;
      const totalPilgrims = dindis.reduce((sum, dindi) => sum + dindi.pilgrimCount, 0);
      const occupancyPercent = Math.round((totalPilgrims / holdingCapacity) * 100);
      const overcrowdedBy = Math.max(0, totalPilgrims - holdingCapacity);
      const clusterName =
        dindis.length > 1
          ? `${dindis.map((dindi) => dindi.name).join(" + ")} co-located`
          : `${dindis[0].name} (${nearestCamp?.item.name ?? "Corridor Sector"})`;

      return {
        id: `LIVE-CLUSTER-${key}`,
        name: clusterName,
        lat,
        lng,
        dindis,
        totalPilgrims,
        capacity: holdingCapacity,
        occupancyPercent,
        overcrowdedBy: Math.max(0, totalPilgrims - holdingCapacity),
        risk: riskForOccupancy(occupancyPercent),
        nearestCamp,
        nearestMedical: nearest(lat, lng, params.medicalStations),
        nearestTanker: nearest(
          lat,
          lng,
          params.tankers.filter((tanker) => tanker.status === "AVAILABLE"),
        ),
        nearestVolunteers: params.volunteers
          .map((item) => ({ item, distanceKm: getDistanceKm(lat, lng, item.lat, item.lng) }))
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 5),
        nearestSanitationCrew: nearest(
          lat,
          lng,
          params.sanitationCrews.filter((crew) => crew.status === "AVAILABLE"),
        ),
      };
    })
    .sort((a, b) => b.occupancyPercent - a.occupancyPercent);
}

export function formatLiveClusterAnswer(cluster: LiveCrowdCluster): {
  headline: string;
  forecastText: string;
  rootCauses: string[];
  impacts: { label: string; value: string }[];
  recommendations: string[];
} {
  const dindiNames = cluster.dindis.map((dindi) => `${dindi.name} (${dindi.pilgrimCount.toLocaleString()})`);

  return {
    headline: `Live Crowd Intelligence: ${cluster.name}`,
    forecastText: `${dindiNames.join(" and ")} are at the same live GPS location. Their leader-entered count is ${cluster.totalPilgrims.toLocaleString()} people against a local holding capacity of ${cluster.capacity.toLocaleString()}, so the area is at ${cluster.occupancyPercent}% capacity.`,
    rootCauses: [
      `${cluster.dindis.length} registered Dindis share the same location fix (${cluster.lat.toFixed(4)}, ${cluster.lng.toFixed(4)}).`,
      `Crowd count is based on leader-entered pilgrim totals, not demo data.`,
      cluster.overcrowdedBy > 0
        ? `Overcrowding is ${cluster.overcrowdedBy.toLocaleString()} people above the safe local capacity.`
        : "Current crowd is within the safe local capacity.",
    ],
    impacts: [
      { label: "Live People", value: cluster.totalPilgrims.toLocaleString() },
      { label: "Capacity Used", value: `${cluster.occupancyPercent}%` },
      { label: "Nearest Halt", value: cluster.nearestCamp ? `${cluster.nearestCamp.item.name} (${cluster.nearestCamp.distanceKm} km)` : "Unavailable" },
    ],
    recommendations: [
      cluster.nearestCamp
        ? `Move overflow toward ${cluster.nearestCamp.item.name}; verify it can accept at least ${cluster.overcrowdedBy.toLocaleString()} extra people.`
        : "Add a verified halt/rest location before dispatching this group.",
      cluster.nearestMedical
        ? `Keep ${cluster.nearestMedical.item.name} on standby for heat, fatigue, or crush-risk cases.`
        : "Register the nearest medical post for dispatch readiness.",
      cluster.nearestTanker
        ? `Send available water unit ${cluster.nearestTanker.item.id} from ${cluster.nearestTanker.item.currentHub}.`
        : "Register an available water tanker or water point for resource optimization.",
      cluster.nearestSanitationCrew
        ? `Dispatch sanitation crew ${cluster.nearestSanitationCrew.item.name} if the halt extends.`
        : "Register a sanitation crew for toilet and waste coverage near the halt.",
    ],
  };
}

export interface DindiSyncPlan {
  targetCamp: Camp;
  convergingDindis: Dindi[];
  totalPilgrims: number;
  batches: import("./types").DindiBatch[];
  // Legacy 2-dindi compat fields
  dindiShortRoute: import("./types").DindiBatch;
  dindiLongRoute: import("./types").DindiBatch;
  staggerDeltaMinutes: number;
  campPeakOccupancyBefore: number;
  campPeakOccupancyAfter: number;
  optimizationRationale: string;
  advanceAlerts: {
    department: "FOOD_PRASAD" | "WATER_TANKER" | "SANITATION" | "VOLUNTEER_MARSHAL";
    scheduledTime: string;
    action: string;
    targetBatch: string;
  }[];
}

// Route configs for each batch slot
const ROUTE_CONFIGS = [
  {
    routeType: "SHORTEST_PRIMARY" as const,
    routeName: "Primary Express Corridor (NH-965 Direct Highway)",
    routeWaypoints: "Main Pilgrim Spine → NH-965 Highway → Gate A Main Entrance",
    extraDistKm: 0,
    paceMultiplier: 1.0,
  },
  {
    routeType: "STAGGERED_BYPASS" as const,
    routeName: "Scenic Riverside Outer Bypass (Mutha Canal Corridor)",
    routeWaypoints: "Bifurcation Junction 3 → Mutha Canal Shaded Road → Gate B Auxiliary Approach",
    extraDistKm: 3.4,
    paceMultiplier: 0.84,
  },
  {
    routeType: "HOLDING_LOOP" as const,
    routeName: "Extended Holding Loop (Outer Ring Buffer Route)",
    routeWaypoints: "Ring Road Entry → Outer Buffer Loop → Gate C Service Lane Approach",
    extraDistKm: 7.2,
    paceMultiplier: 0.75,
  },
];

export function computeDindiSyncPlan(
  dindis: Dindi[],
  camps: Camp[],
  targetCampId?: string
): DindiSyncPlan | null {
  const registered = dindis.filter((d) => d.isCustomRegistered && d.batchStatus !== "DEPARTED");
  if (registered.length < 2) return null;

  const targetCamp =
    camps.find((c) => c.id === targetCampId) ??
    camps.find((c) => c.occupancyPercent >= 90) ??
    camps[0];

  // Sort by pilgrim count desc — largest Dindi goes first (needs most space, serves fastest)
  const sortedDindis = [...registered].sort((a, b) => b.pilgrimCount - a.pilgrimCount);

  const baseDistKm = nearest(sortedDindis[0].lat, sortedDindis[0].lng, camps)?.distanceKm ?? 4.2;
  const shortDistKm = Math.max(3.2, Math.round(baseDistKm * 10) / 10);

  // Build N batches sequentially to avoid referencing batches before initialization
  const batches: import("./types").DindiBatch[] = [];
  for (let idx = 0; idx < sortedDindis.length; idx++) {
    const dindi = sortedDindis[idx];
    const cfg = ROUTE_CONFIGS[Math.min(idx, ROUTE_CONFIGS.length - 1)];
    const distKm = Math.round((shortDistKm + cfg.extraDistKm) * 10) / 10;
    const pace = (dindi.speedKmH && dindi.speedKmH > 1 ? dindi.speedKmH : dindi.currentPaceKmH || 3.8) * cfg.paceMultiplier;
    const eta = Math.round((distKm / Math.max(pace, 1)) * 60);
    const staggerMinutes = idx === 0 ? 0 : batches.reduce((s, b) => Math.max(s, b.etaMinutes), 0) + 55;
    const effectiveEta = idx === 0 ? eta : staggerMinutes;
    const batch1Eta = batches[0]?.etaMinutes ?? eta;

    batches.push({
      batchNumber: idx + 1,
      dindi,
      routeName: cfg.routeName,
      routeType: cfg.routeType,
      routeWaypoints: cfg.routeWaypoints,
      distanceKm: distKm,
      paceKmH: Math.round(pace * 10) / 10,
      etaMinutes: effectiveEta,
      arrivalWindow: idx === 0
        ? `+${eta}m (Batch 1)`
        : `+${effectiveEta}m (Batch ${idx + 1} - +${effectiveEta - batch1Eta}m Offset)`,
      departureWindow: `+${effectiveEta + 50}m`,
      actionNote: idx === 0
        ? `Take shortest direct route (${distKm} km). Proceed to ${targetCamp.name} for immediate meal service & rest, then depart by +${effectiveEta + 50}m before Batch 2 arrives.`
        : idx === 1
        ? `Reroute to outer bypass (+${cfg.extraDistKm} km). Enjoy shaded open corridor. Arrive at ${targetCamp.name} after Batch 1 departs with zero entrance queueing.`
        : `Follow extended holding loop (+${cfg.extraDistKm} km buffer). Arrive at ${targetCamp.name} only after Batch ${idx} fully clears — zero wait guaranteed.`,
    });
  }

  const totalPilgrims = sortedDindis.reduce((s, d) => s + d.pilgrimCount, 0);
  const campCapacity = targetCamp.capacity || 40000;
  const peakBeforePct = Math.round((totalPilgrims / campCapacity) * 100);
  const peakAfterPct = Math.round((Math.max(...sortedDindis.map(d => d.pilgrimCount)) / campCapacity) * 100);
  const staggerDelta = batches.length >= 2 ? batches[1].etaMinutes - batches[0].etaMinutes : 55;

  const rationaleLines = batches.map((b, i) =>
    i === 0
      ? `${b.dindi.name} → ${b.routeName} (arrives T+${b.etaMinutes}m)`
      : `${b.dindi.name} → ${b.routeName} (arrives T+${b.etaMinutes}m, +${b.etaMinutes - batches[0].etaMinutes}m after Batch 1)`
  );

  const rationale = `${rationaleLines.join("; ")}. This staggering prevents simultaneous arrival at ${targetCamp.name} and cuts peak camp load from ${peakBeforePct}% (all at once) to a manageable ${peakAfterPct}% per batch window.`;

  // Build advance logistics notifications for all batches
  const advanceAlerts: DindiSyncPlan["advanceAlerts"] = [];
  batches.forEach((b) => {
    advanceAlerts.push({
      department: "FOOD_PRASAD",
      scheduledTime: `T + ${Math.max(10, b.etaMinutes - 15)}m`,
      action: `Prepare Batch ${b.batchNumber} Maha-Prasad (${b.dindi.pilgrimCount.toLocaleString()} meals) at ${targetCamp.name} for ${b.dindi.name}.`,
      targetBatch: `Batch ${b.batchNumber}`,
    });
    advanceAlerts.push({
      department: "WATER_TANKER",
      scheduledTime: `T + ${Math.max(10, b.etaMinutes - 10)}m`,
      action: `Connect Primary Tanker at ${targetCamp.name} for Batch ${b.batchNumber} hydration stations (${b.dindi.pilgrimCount.toLocaleString()} pilgrims).`,
      targetBatch: `Batch ${b.batchNumber}`,
    });
    if (b.batchNumber > 1) {
      advanceAlerts.push({
        department: "SANITATION",
        scheduledTime: `T + ${batches[b.batchNumber - 2].etaMinutes + 45}m`,
        action: `Rapid disinfection & bio-pod cleanout at ${targetCamp.name} during inter-batch gap (Batch ${b.batchNumber - 1} departure → Batch ${b.batchNumber} arrival).`,
        targetBatch: `Inter-batch Gap ${b.batchNumber - 1}→${b.batchNumber}`,
      });
      advanceAlerts.push({
        department: "VOLUNTEER_MARSHAL",
        scheduledTime: `T + ${batches[b.batchNumber - 2].etaMinutes + 50}m`,
        action: `Guide ${batches[b.batchNumber - 2].dindi.name} to exit lane at ${targetCamp.name} toward next transit sector to clear space for incoming ${b.dindi.name}.`,
        targetBatch: `Handover ${b.batchNumber - 1}→${b.batchNumber}`,
      });
    }
  });

  return {
    targetCamp,
    convergingDindis: sortedDindis,
    totalPilgrims,
    batches,
    dindiShortRoute: batches[0],
    dindiLongRoute: batches[1] ?? batches[0],
    staggerDeltaMinutes: staggerDelta,
    campPeakOccupancyBefore: peakBeforePct,
    campPeakOccupancyAfter: peakAfterPct,
    optimizationRationale: rationale,
    advanceAlerts,
  };
}

/**
 * After Batch N departs a camp, evaluate whether current water/food stock
 * is sufficient for the next incoming batch. Returns a sufficiency result
 * that the context can use to auto-generate refill tasks when needed.
 */
export function computeResourceSufficiency(
  camp: Camp,
  incomingDindi: Dindi
): import("./types").ResourceSufficiencyResult {
  const SAFETY_MARGIN = 1.5; // 1.5× headroom buffer
  const campCapacity = camp.capacity || 40000;

  const requiredWaterPct = Math.round(
    (incomingDindi.pilgrimCount / campCapacity) * 100 * SAFETY_MARGIN
  );
  const requiredFoodPct = Math.round(
    (incomingDindi.pilgrimCount / campCapacity) * 100 * SAFETY_MARGIN
  );

  const waterSufficient = camp.waterStockPercent >= requiredWaterPct;
  const foodSufficient = camp.foodStockPercent >= requiredFoodPct;
  const waterShortfallPct = Math.max(0, requiredWaterPct - camp.waterStockPercent);
  const foodShortfallPct = Math.max(0, requiredFoodPct - camp.foodStockPercent);

  let recommendation = "";
  if (waterSufficient && foodSufficient) {
    recommendation = `✅ Camp has sufficient resources for ${incomingDindi.name} (${incomingDindi.pilgrimCount.toLocaleString()} pilgrims). Water: ${camp.waterStockPercent}% ≥ ${requiredWaterPct}% needed. Food: ${camp.foodStockPercent}% ≥ ${requiredFoodPct}% needed. No refill required.`;
  } else {
    const parts: string[] = [];
    if (!waterSufficient) parts.push(`Water: ${camp.waterStockPercent}% remaining but ${requiredWaterPct}% needed (shortfall ${waterShortfallPct}%) — tanker dispatch auto-triggered`);
    if (!foodSufficient) parts.push(`Food: ${camp.foodStockPercent}% remaining but ${requiredFoodPct}% needed (shortfall ${foodShortfallPct}%) — kitchen dispatch auto-triggered`);
    recommendation = `⚠️ Insufficient resources for ${incomingDindi.name} (${incomingDindi.pilgrimCount.toLocaleString()} pilgrims). ${parts.join(". ")}.`;
  }

  return {
    campId: camp.id,
    campName: camp.name,
    incomingDindiName: incomingDindi.name,
    incomingPilgrims: incomingDindi.pilgrimCount,
    currentWaterPct: camp.waterStockPercent,
    currentFoodPct: camp.foodStockPercent,
    requiredWaterPct,
    requiredFoodPct,
    waterSufficient,
    foodSufficient,
    waterShortfallPct,
    foodShortfallPct,
    recommendation,
    autoTasksGenerated: !waterSufficient || !foodSufficient,
  };
}

