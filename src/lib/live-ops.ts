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
  dindiShortRoute: {
    dindi: Dindi;
    routeName: string;
    routeType: "SHORTEST_PRIMARY" | "MAIN_CORRIDOR";
    routeWaypoints: string;
    distanceKm: number;
    paceKmH: number;
    etaMinutes: number;
    arrivalWindow: string;
    departureWindow: string;
    actionNote: string;
  };
  dindiLongRoute: {
    dindi: Dindi;
    routeName: string;
    routeType: "STAGGERED_BYPASS" | "SCENIC_OUTER";
    routeWaypoints: string;
    distanceKm: number;
    paceKmH: number;
    etaMinutes: number;
    arrivalWindow: string;
    departureWindow: string;
    actionNote: string;
  };
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

export function computeDindiSyncPlan(
  dindis: Dindi[],
  camps: Camp[],
  targetCampId?: string
): DindiSyncPlan | null {
  const registered = dindis.filter((d) => d.isCustomRegistered);
  if (registered.length < 2) return null;

  const targetCamp =
    camps.find((c) => c.id === targetCampId) ??
    camps.find((c) => c.occupancyPercent >= 90) ??
    camps[0];

  const sortedByCount = [...registered].sort((a, b) => b.pilgrimCount - a.pilgrimCount);
  const dindiA = sortedByCount[0];
  const dindiB = sortedByCount[1];

  const baseDistKm = nearest(dindiA.lat, dindiA.lng, camps)?.distanceKm ?? 4.2;
  const shortDistKm = Math.max(3.2, Math.round(baseDistKm * 10) / 10);
  const longDistKm = Math.round((shortDistKm + 3.4) * 10) / 10;

  const paceA = dindiA.speedKmH && dindiA.speedKmH > 1 ? dindiA.speedKmH : (dindiA.currentPaceKmH || 3.8);
  const paceB = dindiB.speedKmH && dindiB.speedKmH > 1 ? dindiB.speedKmH : 3.2; // Slightly slowed for pacing

  const etaShortMin = Math.round((shortDistKm / paceA) * 60);
  const etaLongMin = Math.round((longDistKm / paceB) * 60);
  const staggerDelta = Math.max(35, etaLongMin - etaShortMin);

  const totalPilgrims = dindiA.pilgrimCount + dindiB.pilgrimCount;
  const campCapacity = targetCamp.capacity || 40000;
  const peakBeforePct = Math.round((totalPilgrims / campCapacity) * 100);
  const peakAfterPct = Math.round((Math.max(dindiA.pilgrimCount, dindiB.pilgrimCount) / campCapacity) * 100);

  const rationale = `By assigning ${dindiA.name} to the Shortest Direct Express Route and rerouting ${dindiB.name} via the Scenic Riverside Bypass, their arrivals at ${targetCamp.name} are staggered by +${staggerDelta} min. When ${dindiB.name} arrives, ${dindiA.name} will have completed prasad and started moving to the next transit sector. This prevents entrance bottlenecks and cuts camp peak load from ${peakBeforePct}% to a safe ${peakAfterPct}%.`;

  return {
    targetCamp,
    convergingDindis: [dindiA, dindiB],
    totalPilgrims,
    dindiShortRoute: {
      dindi: dindiA,
      routeName: "Primary Express Corridor (NH-965 Direct Highway)",
      routeType: "SHORTEST_PRIMARY",
      routeWaypoints: "Main Pilgrim Spine → NH-965 Highway → Gate A Main Entrance",
      distanceKm: shortDistKm,
      paceKmH: paceA,
      etaMinutes: etaShortMin,
      arrivalWindow: `+${etaShortMin}m (Batch 1)`,
      departureWindow: `+${etaShortMin + 50}m`,
      actionNote: `Take shortest direct route (${shortDistKm} km). Proceed to ${targetCamp.name} for immediate meal service & rest, then depart by +${etaShortMin + 50}m before Batch 2 arrives.`,
    },
    dindiLongRoute: {
      dindi: dindiB,
      routeName: "Scenic Riverside Outer Bypass (Mutha Canal Corridor)",
      routeType: "STAGGERED_BYPASS",
      routeWaypoints: "Bifurcation Junction 3 → Mutha Canal Shaded Road → Gate B Auxiliary Approach",
      distanceKm: longDistKm,
      paceKmH: paceB,
      etaMinutes: etaLongMin,
      arrivalWindow: `+${etaLongMin}m (Batch 2 - +${staggerDelta}m Offset)`,
      departureWindow: `+${etaLongMin + 50}m`,
      actionNote: `Reroute to outer bypass (+3.4 km). Enjoy shaded open corridor. Arrive at ${targetCamp.name} after Batch 1 departs with zero entrance queueing.`,
    },
    staggerDeltaMinutes: staggerDelta,
    campPeakOccupancyBefore: peakBeforePct,
    campPeakOccupancyAfter: peakAfterPct,
    optimizationRationale: rationale,
    advanceAlerts: [
      {
        department: "FOOD_PRASAD",
        scheduledTime: `T + ${Math.max(10, etaShortMin - 15)}m`,
        action: `Prepare Batch 1 Maha-Prasad (${dindiA.pilgrimCount.toLocaleString()} meals) at ${targetCamp.name} for ${dindiA.name}.`,
        targetBatch: "Batch 1",
      },
      {
        department: "WATER_TANKER",
        scheduledTime: `T + ${Math.max(10, etaShortMin - 10)}m`,
        action: `Connect Primary Tanker T-01 at ${targetCamp.name} for Batch 1 hydration stations.`,
        targetBatch: "Batch 1",
      },
      {
        department: "FOOD_PRASAD",
        scheduledTime: `T + ${Math.max(20, etaLongMin - 15)}m`,
        action: `Prepare Fresh Batch 2 Maha-Prasad (${dindiB.pilgrimCount.toLocaleString()} meals) at ${targetCamp.name} for ${dindiB.name}.`,
        targetBatch: "Batch 2",
      },
      {
        department: "SANITATION",
        scheduledTime: `T + ${etaShortMin + 45}m`,
        action: `Rapid disinfection & bio-pod cleanout at ${targetCamp.name} during 15-minute inter-batch turnover gap.`,
        targetBatch: "Inter-batch Gap",
      },
      {
        department: "VOLUNTEER_MARSHAL",
        scheduledTime: `T + ${etaShortMin + 50}m`,
        action: `Guide ${dindiA.name} to exit lane at ${targetCamp.name} towards next transit sector to clear space for incoming ${dindiB.name}.`,
        targetBatch: "Handover",
      },
    ],
  };
}

