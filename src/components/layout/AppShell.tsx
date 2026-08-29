"use client";

import React, { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SystemHealthBar } from "./SystemHealthBar";
import { BeforeAfterImpactModal } from "@/components/incidents/BeforeAfterImpactModal";
import { useAuth } from "@/context/AuthContext";

export const AppShell: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Route guard — redirect unauthenticated users to login
  useEffect(() => {
    if (!user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [user, pathname, router]);

  // Full-screen login portal
  if (pathname === "/login") {
    return (
      <main className="min-h-screen bg-wari-pageBg text-wari-textPrimary">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-wari-pageBg text-wari-textPrimary overflow-hidden font-sans wari-app-frame">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto wari-dashboard-bg">
          <div className="max-w-7xl mx-auto px-6 py-6 sm:px-8 sm:py-8 space-y-6 pb-12">
            {children}
          </div>
        </main>

        <SystemHealthBar />
      </div>

      <BeforeAfterImpactModal />
    </div>
  );
};
