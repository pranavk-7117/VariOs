import { Dindi } from "./types";

const DB_NAME = "warios-live-ops";
const DB_VERSION = 1;
const DINDI_STORE = "dindis";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function canUseSupabase(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function toSupabaseRow(dindi: Dindi) {
  return {
    id: dindi.id,
    number: dindi.number,
    name: dindi.name,
    leader: dindi.leader,
    pilgrim_count: dindi.pilgrimCount,
    current_segment: dindi.currentSegment,
    current_pace_kmh: dindi.currentPaceKmH,
    standard_pace_kmh: dindi.standardPaceKmH,
    pace_drop_percent: dindi.paceDropPercent,
    eta_next_halt: dindi.etaNextHalt,
    next_halt: dindi.nextHalt,
    status: dindi.status,
    lat: dindi.lat,
    lng: dindi.lng,
    weather_delay_minutes: dindi.weatherDelayMinutes,
    terrain_factor: dindi.terrainFactor,
    rerouted: dindi.rerouted,
    reroute_target: dindi.rerouteTarget ?? null,
    bypass_route_name: dindi.bypassRouteName ?? null,
    is_custom_registered: dindi.isCustomRegistered ?? true,
    passcode: dindi.passcode ?? null,
    route_color: dindi.routeColor,
    updated_at: new Date().toISOString(),
  };
}

function fromSupabaseRow(row: any): Dindi {
  return {
    id: row.id,
    number: row.number,
    name: row.name,
    leader: row.leader,
    pilgrimCount: row.pilgrim_count,
    currentSegment: row.current_segment,
    currentPaceKmH: row.current_pace_kmh,
    standardPaceKmH: row.standard_pace_kmh,
    paceDropPercent: row.pace_drop_percent,
    etaNextHalt: row.eta_next_halt,
    nextHalt: row.next_halt,
    status: row.status,
    lat: row.lat,
    lng: row.lng,
    weatherDelayMinutes: row.weather_delay_minutes,
    terrainFactor: row.terrain_factor,
    rerouted: row.rerouted,
    rerouteTarget: row.reroute_target ?? undefined,
    bypassRouteName: row.bypass_route_name ?? undefined,
    isCustomRegistered: row.is_custom_registered,
    passcode: row.passcode ?? undefined,
    routeColor: row.route_color,
  };
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL/key not configured");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function openLiveDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DINDI_STORE)) {
        db.createObjectStore(DINDI_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadLiveDindis(): Promise<Dindi[]> {
  if (canUseSupabase()) {
    try {
      const rows = await supabaseRequest<any[]>(
        "live_dindis?select=*&is_custom_registered=eq.true&order=updated_at.desc",
      );
      return rows.map(fromSupabaseRow);
    } catch (error) {
      console.warn("[WariOS] Supabase load failed; falling back to IndexedDB", error);
    }
  }

  const db = await openLiveDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DINDI_STORE, "readonly");
    const request = tx.objectStore(DINDI_STORE).getAll();
    request.onsuccess = () => resolve(request.result as Dindi[]);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function saveLiveDindis(dindis: Dindi[]): Promise<void> {
  if (canUseSupabase() && dindis.length > 0) {
    try {
      await supabaseRequest("live_dindis?on_conflict=id", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(dindis.map(toSupabaseRow)),
      });
    } catch (error) {
      console.warn("[WariOS] Supabase save failed; falling back to IndexedDB", error);
    }
  }

  const db = await openLiveDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DINDI_STORE, "readwrite");
    const store = tx.objectStore(DINDI_STORE);
    store.clear();
    dindis.forEach((dindi) => store.put(dindi));
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function deleteLiveDindi(dindiId: string): Promise<void> {
  if (canUseSupabase()) {
    try {
      await supabaseRequest(`live_dindis?id=eq.${encodeURIComponent(dindiId)}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.warn("[WariOS] Supabase delete failed", error);
    }
  }

  const db = await openLiveDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DINDI_STORE, "readwrite");
    tx.objectStore(DINDI_STORE).delete(dindiId);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function clearLocalLiveDindis(): Promise<void> {
  const db = await openLiveDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DINDI_STORE, "readwrite");
    tx.objectStore(DINDI_STORE).clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
