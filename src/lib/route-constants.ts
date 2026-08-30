// Route and checkpoint constants extracted to break circular imports
// between WariOSMap.tsx (component) and LiveGpsContext.tsx (context).
// WariOSMap previously exported CHECKPOINT_COORDS and was imported by
// LiveGpsContext, while WariOSMap itself uses LiveGpsContext → circular.
import { SANT_DNYANESHWAR_ROUTE_CONFIG } from "./palkhi-schedule";

export const WARI_ROUTE_WAYPOINTS: [number, number][] =
  SANT_DNYANESHWAR_ROUTE_CONFIG.route_waypoints.map((w) => [w.lat, w.lng]);

export const CHECKPOINT_COORDS: Record<string, [number, number]> = {
  CP1: [18.5204, 73.8567],
  CP2: [18.3437, 74.0293],
  CP3: [18.2145, 74.1456], // Dive Ghat
  CP4: [18.2753, 74.1573], // Jejuri
  CP5: [17.9861, 74.2956],
  CP6: [17.9862, 74.4356],
  CP7: [17.8543, 74.7653],
  CP8: [17.6805, 75.3308],
};
