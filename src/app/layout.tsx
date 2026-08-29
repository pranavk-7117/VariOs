import type { Metadata } from "next";
import "./globals.css";
import { SimulationProvider } from "@/context/SimulationContext";
import { RoleProvider } from "@/context/RoleContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { LiveGpsProvider } from "@/context/LiveGpsContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "WariOS — Pilgrimage Operations & Command Center",
  description:
    "AI Operations Platform and Digital Twin for the Pune-to-Pandharpur Wari pilgrimage. DETECT → PREDICT → EXPLAIN → RECOMMEND → DECIDE → DISPATCH → VERIFY.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-wari-pageBg text-wari-textPrimary antialiased font-sans">
        <LanguageProvider>
          <AuthProvider>
            <LiveGpsProvider>
              <SimulationProvider>
                <RoleProvider>
                  <AppShell>{children}</AppShell>
                </RoleProvider>
              </SimulationProvider>
            </LiveGpsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
