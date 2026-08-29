"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Map, ArrowRight, ExternalLink } from "lucide-react";

const WariOSMap = dynamic(
  () => import("@/components/map/WariOSMap").then((m) => ({ default: m.WariOSMap })),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full bg-[#e8e0d5] animate-pulse flex items-center justify-center rounded-xl"
        style={{ height: "280px" }}
      >
        <div className="text-center">
          <Map className="w-6 h-6 text-wari-textMuted mx-auto mb-1" />
          <p className="text-xs text-wari-textMuted">Loading live map…</p>
        </div>
      </div>
    ),
  }
);

export const LiveRouteMapSnippet: React.FC = () => {
  return (
    <div className="card-base overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-wari-cardBorder flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-wari-orange" />
          <span className="text-sm font-bold text-wari-textPrimary">Corridor Route Monitor</span>
        </div>
        <Link
          href="/map"
          className="flex items-center gap-1 text-xs text-wari-orange hover:text-orange-600 font-semibold transition-colors"
        >
          Full Map <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Embedded real Leaflet map */}
      <div className="p-2">
        <WariOSMap height="280px" showLayerControl={false} zoom={8} />
      </div>

      {/* Attribution note */}
      <div className="px-4 py-2 border-t border-wari-cardBorder bg-wari-pageBg flex items-center justify-between text-[10px] text-wari-textMuted">
        <span>© OpenStreetMap contributors · Real geography</span>
        <span className="badge-live">OSM LIVE</span>
      </div>
    </div>
  );
};
