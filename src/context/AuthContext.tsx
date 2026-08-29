"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Role } from "@/lib/types";

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  title: string;
  department: string;
  badgeNumber: string;
  avatarUrl?: string;
  jurisdiction: string;
}

export const ROLE_PROFILES: Record<Role, UserProfile> = {
  COMMANDER: {
    id: "usr-01",
    name: "Dr. Rajesh Deshmukh, IAS",
    role: "COMMANDER",
    title: "Incident Commander & District Magistrate",
    department: "District Disaster Management Authority, Pune",
    badgeNumber: "DDMA-PN-001",
    jurisdiction: "Entire 240km Corridor (Pune to Pandharpur)",
  },
  POLICE: {
    id: "usr-02",
    name: "Amitabh Gupta, IPS",
    role: "POLICE",
    title: "Superintendent of Police (Traffic & Law/Order)",
    department: "Maharashtra State Police Operations",
    badgeNumber: "MSP-TRF-402",
    jurisdiction: "Highway Checkpoints & Route Diversions",
  },
  MEDICAL: {
    id: "usr-03",
    name: "Dr. Sunita Jagtap, MD",
    role: "MEDICAL",
    title: "Chief Medical Officer (Emergency Operations)",
    department: "Directorate of Health Services, Maharashtra",
    badgeNumber: "DHS-MED-108",
    jurisdiction: "Rural Hospitals, Mobile ICUs & Trauma Posts",
  },
  VOLUNTEER: {
    id: "usr-04",
    name: "Anand Gavali",
    role: "VOLUNTEER",
    title: "Smart Seva Operations Coordinator",
    department: "Warkari Seva Mandal & Civil Volunteers Federation",
    badgeNumber: "SS-VOL-991",
    jurisdiction: "Sector Marshals, Crowd Guides & Language Teams",
  },
  LOGISTICS: {
    id: "usr-05",
    name: "Pravin Jagtap",
    role: "LOGISTICS",
    title: "Water & Essential Supplies Officer",
    department: "Pune Municipal Water Supply & Disaster Logistics",
    badgeNumber: "PMC-LOG-304",
    jurisdiction: "Water Tanker Fleets, Camp Stocks & Food Lines",
  },
  SANITATION: {
    id: "usr-06",
    name: "Sanjay Londhe",
    role: "SANITATION",
    title: "Chief Civic Sanitation Inspector",
    department: "Swachh Wari Cleanliness Mission",
    badgeNumber: "SBM-SAN-512",
    jurisdiction: "Mobile Sanitation Units & Bio-Waste Squads",
  },
  DINDI_LEADER: {
    id: "usr-07",
    name: "Bapu Maharaj Dehukar",
    role: "DINDI_LEADER",
    title: "Palkhi Chief & Dindi Pramukh (#14)",
    department: "Sant Tukaram Maharaj Sansthan, Dehu",
    badgeNumber: "PALKHI-DINDI-14",
    jurisdiction: "Dindi #14 Palkhi Cohort (38,000 Warkaris)",
  },
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginAsRole: (role: Role) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Default to COMMANDER for immediate seamless experience, but store in memory/localStorage
  const [user, setUser] = useState<UserProfile | null>(ROLE_PROFILES.COMMANDER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const loginAsRole = (role: Role) => {
    const profile = ROLE_PROFILES[role];
    setUser(profile);
    setIsAuthenticated(true);
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  const switchRole = (role: Role) => {
    const profile = ROLE_PROFILES[role];
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loginAsRole,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
