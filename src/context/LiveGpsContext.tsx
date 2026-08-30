"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { CHECKPOINT_COORDS } from "@/lib/route-constants";
import { SANT_DNYANESHWAR_ROUTE_CONFIG } from "@/lib/palkhi-schedule";
import {
  DINDI_CODE_DATABASE,
  DindiCodeInfo,
  lookupDindiCode,
  HACKATHON_LIVE_GPS_CODE,
} from "@/lib/dindi-codes";

export interface GpsCoordinates {
  lat: number;
  lng: number;
  accuracy: number; // meters
  altitude: number | null;
  speed: number | null; // m/s
  speedKmH: number; // km/h
  heading: number | null;
  timestamp: number;
}

export interface NearestCheckpointInfo {
  shortCode: string;
  name: string;
  distanceKm: number;
  stageNumber?: number;
  type?: string;
}

interface LiveGpsContextType {
  isTracking: boolean;
  coords: GpsCoordinates | null;
  error: string | null;
  isSupported: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  toggleTracking: () => void;
  boundDindiId: string;
  setBoundDindiId: (id: string) => void;
  nearestCheckpoint: NearestCheckpointInfo | null;
  simulatedAdvance: () => void;
  activeDindiCode: string;
  activeDindiInfo: DindiCodeInfo | null;
  unlockDindiByCode: (code: string) => {
    success: boolean;
    message: string;
    info?: DindiCodeInfo;
  };
}

// Haversine formula to compute distance in km between two lat/lng pairs
function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const LiveGpsContext = createContext<LiveGpsContextType | undefined>(undefined);

export const LiveGpsProvider = ({ children }: { children: ReactNode }) => {
  const [isTracking, setIsTracking] = useState<boolean>(true); // default active
  const [coords, setCoords] = useState<GpsCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [boundDindiId, setBoundDindiId] = useState<string>("DINDI-F01");
  const [activeDindiCode, setActiveDindiCode] = useState<string>("DINDI-F01");
  const [activeDindiInfo, setActiveDindiInfo] = useState<DindiCodeInfo | null>(
    DINDI_CODE_DATABASE["DINDI-F01"]
  );
  const [nearestCheckpoint, setNearestCheckpoint] = useState<NearestCheckpointInfo | null>(null);

  const isSupported =
    typeof window !== "undefined" && "geolocation" in navigator;

  // Function to unlock and track a Dindi via its access code
  const unlockDindiByCode = useCallback(
    (inputCode: string) => {
      const found = lookupDindiCode(inputCode);
      if (!found) {
        return {
          success: false,
          message: `Invalid Dindi Code "${inputCode}". Please enter a valid Dindi code or use the Hackathon Live GPS code (${HACKATHON_LIVE_GPS_CODE}).`,
        };
      }

      setActiveDindiCode(found.code);
      setActiveDindiInfo(found);
      setBoundDindiId(found.dindiNumber);

      if (found.isLivePhoneGps) {
        setIsTracking(true);
        // Force refresh geolocation
        if (typeof window !== "undefined" && "geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setCoords({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: Math.round(pos.coords.accuracy),
                altitude: pos.coords.altitude,
                speed: pos.coords.speed,
                speedKmH: 4.8,
                heading: pos.coords.heading,
                timestamp: pos.timestamp,
              });
            },
            (err) => console.warn(err)
          );
        }
        return {
          success: true,
          message: `⭐ Hackathon Live Phone GPS Active! Your phone coordinates are now streaming in real time.`,
          info: found,
        };
      } else {
        // Set coordinates to this Dindi's known position
        setCoords((prev) => ({
          lat: found.lat,
          lng: found.lng,
          accuracy: 6,
          altitude: 640,
          speed: found.speedKmH / 3.6,
          speedKmH: found.speedKmH,
          heading: 135,
          timestamp: Date.now(),
        }));

        return {
          success: true,
          message: `Connected to ${found.dindiNumber} (${found.headChief})! Located at ${found.currentSector}.`,
          info: found,
        };
      }
    },
    []
  );

  // Calculate nearest waypoint among the 20 official waypoints
  useEffect(() => {
    if (!coords) return;

    let closest: NearestCheckpointInfo | null = null;
    let minDistance = Infinity;

    SANT_DNYANESHWAR_ROUTE_CONFIG.route_waypoints.forEach((wp) => {
      const d = computeDistanceKm(coords.lat, coords.lng, wp.lat, wp.lng);
      if (d < minDistance) {
        minDistance = d;
        closest = {
          shortCode: `Stage #${wp.sequence}`,
          name: wp.location,
          distanceKm: d,
          stageNumber: wp.sequence,
          type: wp.type,
        };
      }
    });

    setNearestCheckpoint(closest);
  }, [coords]);

  // Geolocation watchPosition
  useEffect(() => {
    if (!isTracking || !isSupported) return;

    let watchId: number;

    const onSuccess = (pos: GeolocationPosition) => {
      const speedMs = pos.coords.speed;
      const speedKmH = speedMs ? Math.round(speedMs * 3.6 * 10) / 10 : 3.6;

      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
        altitude: pos.coords.altitude,
        speed: speedMs,
        speedKmH: Math.max(2.8, speedKmH),
        heading: pos.coords.heading,
        timestamp: pos.timestamp,
      });
      setError(null);
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn("[GPS] Geolocation fallback used:", err.message);
      // Fallback to active Dindi coordinates or Dive Ghat Apex
      setCoords((prev) =>
        prev
          ? prev
          : {
              lat: activeDindiInfo ? activeDindiInfo.lat : 18.2145,
              lng: activeDindiInfo ? activeDindiInfo.lng : 74.1456,
              accuracy: 8,
              altitude: 680,
              speed: 0.95,
              speedKmH: activeDindiInfo ? activeDindiInfo.speedKmH : 3.4,
              heading: 142,
              timestamp: Date.now(),
            }
      );
      setError(err.message);
    };

    try {
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to start GPS");
    }

    return () => {
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, isSupported, activeDindiInfo]);

  const startTracking = useCallback(() => setIsTracking(true), []);
  const stopTracking = useCallback(() => setIsTracking(false), []);
  const toggleTracking = useCallback(() => setIsTracking((v) => !v), []);

  const simulatedAdvance = useCallback(() => {
    setCoords((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        lat: prev.lat - 0.005,
        lng: prev.lng + 0.008,
        timestamp: Date.now(),
      };
    });
  }, []);

  return (
    <LiveGpsContext.Provider
      value={{
        isTracking,
        coords,
        error,
        isSupported,
        startTracking,
        stopTracking,
        toggleTracking,
        boundDindiId,
        setBoundDindiId,
        nearestCheckpoint,
        simulatedAdvance,
        activeDindiCode,
        activeDindiInfo,
        unlockDindiByCode,
      }}
    >
      {children}
    </LiveGpsContext.Provider>
  );
};

export const useLiveGps = () => {
  const ctx = useContext(LiveGpsContext);
  if (!ctx) throw new Error("useLiveGps must be used within a LiveGpsProvider");
  return ctx;
};
