"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Role } from "@/lib/types";

interface RoleContextType {
  currentRole: Role;
  setRole: (role: Role) => void;
  roleConfig: {
    title: string;
    description: string;
    accentColor: string;
    focusAreas: string[];
    priorityKpi: string;
  };
}

export const ROLE_CONFIGS: Record<
  Role,
  {
    title: string;
    description: string;
    accentColor: string;
    focusAreas: string[];
    priorityKpi: string;
  }
> = {
  COMMANDER: {
    title: "Incident Commander",
    description: "Overall pilgrimage safety, multi-agency decisions & high-level escalation.",
    accentColor: "#E85A1C",
    focusAreas: ["Critical Incidents", "Route Chokepoints", "Multi-Agency Dispatch"],
    priorityKpi: "Active & Critical Alerts",
  },
  POLICE: {
    title: "Superintendent of Police",
    description: "Crowd control, traffic diversions, barricade management & law & order.",
    accentColor: "#3B82F6",
    focusAreas: ["Dive Ghat Apex Bottleneck", "Bypass Route B", "Dindi Pace & Inflow"],
    priorityKpi: "CP4 Density (91%)",
  },
  MEDICAL: {
    title: "Chief Medical Officer",
    description: "Trauma posts, mobile ICUs, ambulance corridors & heat stroke response.",
    accentColor: "#10B981",
    focusAreas: ["Saswad Rural Hospital", "Apex Trauma Unit", "Heat Exhaustion Kits"],
    priorityKpi: "Medical Surge Capacity (74%)",
  },
  VOLUNTEER: {
    title: "Smart Seva Coordinator",
    description: "Volunteer deployment, skill matching, battery status & sector assignments.",
    accentColor: "#8B5CF6",
    focusAreas: ["Sector 3 Volunteers", "Bypass Marshals", "Crowd Channeling"],
    priorityKpi: "Available Volunteers (32)",
  },
  LOGISTICS: {
    title: "Logistics & Water Officer",
    description: "Water tanker fleet, food/prasad supply lines & emergency shelter beds.",
    accentColor: "#F59E0B",
    focusAreas: ["Tanker T-03 Dispatch", "Camp 6 Water Reserves", "Backup Shelter B"],
    priorityKpi: "Tanker Fleet En Route (6/8)",
  },
  SANITATION: {
    title: "Civic Sanitation Head",
    description: "Mobile toilet maintenance, eco-waste management & disinfectant squads.",
    accentColor: "#14B8A6",
    focusAreas: ["Cleanup Crew #2", "Dive Ghat Mobile Toilets", "Camp Waste Disposal"],
    priorityKpi: "Sanitation Crews Active (4)",
  },
  DINDI_LEADER: {
    title: "Dindi Pramukh / Palkhi Leader",
    description: "Live GPS cohort tracking, pacing sync, route alerts & water stop coordination.",
    accentColor: "#E85A1C",
    focusAreas: ["Live GPS Location & Telemetry", "Next Halt ETA & Camps", "Bypass Route Directives"],
    priorityKpi: "Live GPS Speed & Location",
  },
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [currentRole, setRole] = useState<Role>("COMMANDER");

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setRole,
        roleConfig: ROLE_CONFIGS[currentRole],
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
