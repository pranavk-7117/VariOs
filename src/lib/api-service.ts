/**
 * WariOS API & Backend Service Layer
 * 
 * Clean abstraction supporting both simulated local state and external REST/WebSocket/Supabase backends.
 * Connect your real backend by configuring API_BASE_URL or environment variables.
 */

import { SimulationState, Alert, Checkpoint, Dindi, Volunteer, WaterTanker } from "./types";

export const API_CONFIG = {
  USE_SIMULATION: true, // Set to false when connecting to a live backend
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/telemetry",
};

export class WariOSApiService {
  /**
   * Fetch current operational twin state
   */
  static async fetchOperationalState(): Promise<Partial<SimulationState> | null> {
    if (API_CONFIG.USE_SIMULATION) {
      return null; // Uses in-memory simulation engine
    }

    try {
      const res = await fetch(`${API_CONFIG.API_BASE_URL}/state`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.warn("[WariOS API] Failed to fetch live backend state, falling back to simulated store:", error);
      return null;
    }
  }

  /**
   * Dispatch an operational mitigation action
   */
  static async dispatchAction(actionKey: string, payload?: any): Promise<boolean> {
    if (API_CONFIG.USE_SIMULATION) {
      return true;
    }

    try {
      const res = await fetch(`${API_CONFIG.API_BASE_URL}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionKey, payload }),
      });
      return res.ok;
    } catch (error) {
      console.error("[WariOS API] Dispatch failed:", error);
      return false;
    }
  }

  /**
   * Query AI Copilot with prompt and state context
   */
  static async queryCopilot(query: string, stateContext?: any): Promise<any> {
    if (API_CONFIG.USE_SIMULATION) {
      return null;
    }

    try {
      const res = await fetch(`${API_CONFIG.API_BASE_URL}/copilot/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, context: stateContext }),
      });
      return await res.json();
    } catch (error) {
      console.warn("[WariOS API] Copilot query fallback to local rule model:", error);
      return null;
    }
  }
}
