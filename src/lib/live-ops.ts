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

const LIVE_HOLDING_CAPACITY = 400;
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
      const key = `${dindi.lat.toFixed(CO_LOCATION_PRECISION)},${dindi.lng.toFixed(CO_LOCATION_PRECISION)}`;
      groups.set(key, [...(groups.get(key) ?? []), dindi]);
    });

  return Array.from(groups.entries())
    .map(([key, dindis]) => {
      const totalPilgrims = dindis.reduce((sum, dindi) => sum + dindi.pilgrimCount, 0);
      const occupancyPercent = Math.round((totalPilgrims / LIVE_HOLDING_CAPACITY) * 100);
      const [lat, lng] = key.split(",").map(Number);
      const clusterName =
        dindis.length > 1
          ? `${dindis.map((dindi) => dindi.name).join(" + ")} co-located`
          : dindis[0].name;

      return {
        id: `LIVE-CLUSTER-${key}`,
        name: clusterName,
        lat,
        lng,
        dindis,
        totalPilgrims,
        capacity: LIVE_HOLDING_CAPACITY,
        occupancyPercent,
        overcrowdedBy: Math.max(0, totalPilgrims - LIVE_HOLDING_CAPACITY),
        risk: riskForOccupancy(occupancyPercent),
        nearestCamp: nearest(lat, lng, params.camps),
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
