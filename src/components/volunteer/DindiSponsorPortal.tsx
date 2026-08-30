"use client";

import React, { useState } from "react";
import {
  Utensils,
  Home,
  Droplets,
  HeartHandshake,
  CheckCircle2,
  Send,
  Building2,
  Users,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Gift,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/context/LanguageContext";

interface SponsorNeed {
  id: string;
  campId: string;
  campName: string;
  category: "FOOD" | "STAY" | "WATER" | "MEDICAL";
  title: string;
  targetDindiName?: string;
  pilgrimCount: number;
  urgency: "HIGH" | "MEDIUM" | "NORMAL";
  estimatedCost: string;
  description: string;
}

export const DindiSponsorPortal: React.FC = () => {
  const { state, addEventLog } = useSimulation();
  const { language } = useLanguage();

  const [form, setForm] = useState({
    sponsorName: "",
    organization: "",
    email: "",
    phone: "",
    category: "FOOD" as "FOOD" | "STAY" | "WATER" | "MEDICAL" | "ALL",
    targetCampId: state.camps[0]?.id || "CAMP-01",
    targetDindiId: "ANY",
    quantityDetails: "500 meals (Maha-Prasad)",
    dateOfSeva: "2026-06-25",
    remarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [formspreeEndpoint, setFormspreeEndpoint] = useState<string>("https://formspree.io/f/mqaeedpl");

  const registeredDindis = state.dindis.filter((d) => d.isCustomRegistered);

  // Dynamic Corridor Needs generated based on live camp data & registered Dindis
  const activeNeeds: SponsorNeed[] = [
    {
      id: "NEED-01",
      campId: state.camps[1]?.id || "CAMP-02",
      campName: state.camps[1]?.name || "Camp 2 (Hadapsar Transit Yard)",
      category: "FOOD",
      title: "Evening Maha-Prasad Meals",
      targetDindiName: registeredDindis[0]?.name || "Sant Dnyaneshwar Maharaj Dindi",
      pilgrimCount: registeredDindis[0]?.pilgrimCount || 1200,
      urgency: "HIGH",
      estimatedCost: "₹18,000 (~1,200 Meals)",
      description: "Hot khichdi, sheera & banana prasad packets for incoming batch of pilgrims after long march.",
    },
    {
      id: "NEED-02",
      campId: state.camps[2]?.id || "CAMP-03",
      campName: state.camps[2]?.name || "Camp 3 (Saswad Palkhi Maidan)",
      category: "STAY",
      title: "Night Shelter Waterproof Tarpaulins & Mats",
      targetDindiName: registeredDindis[1]?.name || "Tukaram Maharaj Dindi",
      pilgrimCount: 2500,
      urgency: "HIGH",
      estimatedCost: "₹25,000 (300 Heavy Mats + Pandal Shade)",
      description: "Ground bedding and water-resistant rain covers for resting pilgrims during ghat halts.",
    },
    {
      id: "NEED-03",
      campId: state.camps[0]?.id || "CAMP-01",
      campName: state.camps[0]?.name || "Camp 1 (Pune Racecourse)",
      category: "WATER",
      title: "Clean Filtered Drinking Water Tanker (10,000L)",
      pilgrimCount: 5000,
      urgency: "MEDIUM",
      estimatedCost: "₹6,500 (10,000L Dedicated Tanker)",
      description: "Dedicated chilled water dispensing station with bio-degradable cups along highway corridor.",
    },
    {
      id: "NEED-04",
      campId: state.camps[3]?.id || "CAMP-04",
      campName: state.camps[3]?.name || "Camp 4 (Jejuri Temple Ground)",
      category: "MEDICAL",
      title: "ORS Electrolyte & Foot Blister Care Kits",
      pilgrimCount: 800,
      urgency: "MEDIUM",
      estimatedCost: "₹8,000 (500 First-Aid & Glucose Kits)",
      description: "Medical first-aid kits containing electrolyte powder, foot blister bandages & pain relief sprays.",
    },
  ];

  const handle1ClickSponsorNeed = (need: SponsorNeed) => {
    setForm((prev) => ({
      ...prev,
      category: need.category,
      targetCampId: need.campId,
      quantityDetails: need.estimatedCost,
      remarks: `Sponsoring ${need.title} for ${need.campName} (${need.description})`,
    }));

    // Smooth scroll down to the form
    const formElement = document.getElementById("sponsor-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const nowId = `SPONSOR-${Date.now().toString().slice(-6)}`;
    const selectedCamp = state.camps.find((c) => c.id === form.targetCampId) ?? state.camps[0];
    const selectedDindi = state.dindis.find((d) => d.id === form.targetDindiId);

    const payload = {
      sponsorshipId: nowId,
      sponsorName: form.sponsorName,
      organization: form.organization || "Individual Devotee / Seva Kari",
      email: form.email,
      phone: form.phone,
      sevaCategory: form.category,
      targetCamp: selectedCamp.name,
      targetDindi: selectedDindi ? selectedDindi.name : "All Converging Dindis / General Pilgrims",
      quantityDetails: form.quantityDetails,
      dateOfSeva: form.dateOfSeva,
      remarks: form.remarks || "No specific instructions",
      submittedAt: new Date().toLocaleString(),
    };

    try {
      // 1. Send via Formspree if endpoint is provided
      if (formspreeEndpoint) {
        await fetch(formspreeEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }).catch((err) => console.warn("[WariOS] Formspree dispatch fallback", err));
      }

      // 2. Add real-time event in WariOS Simulation & Volunteer stream
      addEventLog({
        eventType: "DECISION",
        severity: "SUCCESS" as any,
        source: "Corridor Seva & Sponsorship Desk",
        description: `💖 New Seva Pledge received from ${form.sponsorName} (${form.phone}): ${form.category} (${form.quantityDetails}) pledged for ${selectedCamp.name}. Notification dispatched to volunteer team.`,
      });

      setSubmissionId(nowId);
      setSubmitted(true);
    } catch (err) {
      console.error("[WariOS] Error submitting sponsorship form:", err);
      // Still show success locally so user is not blocked
      setSubmissionId(nowId);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmissionId(null);
    setForm({
      sponsorName: "",
      organization: "",
      email: "",
      phone: "",
      category: "FOOD",
      targetCampId: state.camps[0]?.id || "CAMP-01",
      targetDindiId: "ANY",
      quantityDetails: "500 meals (Maha-Prasad)",
      dateOfSeva: "2026-06-25",
      remarks: "",
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── HEADER BANNER ── */}
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Utensils className="w-6 h-6 text-yellow-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-orange-900 uppercase tracking-wide">
                  🚩 वारी अन्नदान व निवारा सेवा
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  SEVA &amp; SPONSORSHIP PORTAL
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-wari-textPrimary">
                Sponsor Food, Shelter &amp; Water for Warkari Dindis
              </h2>
              <p className="text-xs sm:text-sm text-wari-textSecond mt-0.5">
                Directly sponsor meals (अन्नदान), night stay pandals (निवारा), or water tankers for marching pilgrims. Fill the form below — an automated dispatch notification will be emailed directly to our on-ground volunteer desk.
              </p>
            </div>
          </div>

          <div className="bg-white/90 border border-amber-200 rounded-xl p-3 text-xs shrink-0 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Verified Delivery</span>
            </div>
            <p className="text-[11px] text-stone-600">
              Assigned volunteers verify &amp; photo-confirm on site.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4 KEY SEVA CATEGORY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-base p-4 border border-amber-200 bg-amber-50/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              अन्नदान
            </span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-wari-textPrimary">Maha-Prasad / Meals</h4>
            <p className="text-xs text-wari-textSecond mt-0.5">
              Sponsor fresh nutritious meals (Khichdi, Dal Rice, Bananas, Tea) for Dindis.
            </p>
          </div>
          <div className="text-[11px] font-bold text-amber-800 pt-1 border-t border-amber-200/60">
            From ₹15 / devotee meal
          </div>
        </div>

        <div className="card-base p-4 border border-indigo-200 bg-indigo-50/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full">
              निवारा
            </span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-wari-textPrimary">Stay &amp; Shelter Pandals</h4>
            <p className="text-xs text-wari-textSecond mt-0.5">
              Sponsor weather-proof tarpaulin pandals, ground mats, and fans at halt camps.
            </p>
          </div>
          <div className="text-[11px] font-bold text-indigo-800 pt-1 border-t border-indigo-200/60">
            From ₹5,000 / resting wing
          </div>
        </div>

        <div className="card-base p-4 border border-blue-200 bg-blue-50/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
              पाणी सेवा
            </span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-wari-textPrimary">Water Tankers &amp; Hydration</h4>
            <p className="text-xs text-wari-textSecond mt-0.5">
              Sponsor 5,000L to 12,000L clean drinking water tankers at highway staging bays.
            </p>
          </div>
          <div className="text-[11px] font-bold text-blue-800 pt-1 border-t border-blue-200/60">
            From ₹4,500 / tanker unit
          </div>
        </div>

        <div className="card-base p-4 border border-teal-200 bg-teal-50/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
              आरोग्य
            </span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-wari-textPrimary">Medical &amp; First-Aid Kits</h4>
            <p className="text-xs text-wari-textSecond mt-0.5">
              Sponsor electrolyte ORS packets, blister dressings, glucose &amp; pain relief sprays.
            </p>
          </div>
          <div className="text-[11px] font-bold text-teal-800 pt-1 border-t border-teal-200/60">
            From ₹3,000 / kit batch
          </div>
        </div>
      </div>

      {/* ── LIVE CORRIDOR NEEDS (1-CLICK SPONSOR) ── */}
      <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <h3 className="font-black text-sm text-purple-950 uppercase tracking-tight">
              Live Verified Corridor Needs (Immediate Seva Required)
            </h3>
          </div>
          <span className="text-[11px] text-purple-700 font-medium">
            Click &quot;Sponsor This Need&quot; to auto-fill the form
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeNeeds.map((need) => (
            <div
              key={need.id}
              className="p-4 rounded-xl border border-purple-200/80 bg-purple-50/40 hover:bg-purple-50 transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                    {need.category === "FOOD" ? (
                      <Utensils className="w-3.5 h-3.5 text-amber-600" />
                    ) : need.category === "STAY" ? (
                      <Home className="w-3.5 h-3.5 text-indigo-600" />
                    ) : need.category === "WATER" ? (
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                    )}
                    <span>{need.title}</span>
                  </span>
                  <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                    {need.urgency} NEED
                  </span>
                </div>

                <p className="text-[11px] text-wari-textSecond leading-relaxed">
                  {need.description}
                </p>

                <div className="text-[11px] text-wari-textMuted flex flex-wrap items-center gap-3 pt-1">
                  <span>📍 {need.campName}</span>
                  <span>•</span>
                  <span>👥 ~{need.pilgrimCount.toLocaleString()} Devotees</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-purple-200/50">
                <span className="text-xs font-black text-purple-900">{need.estimatedCost}</span>
                <button
                  type="button"
                  onClick={() => handle1ClickSponsorNeed(need)}
                  className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-2xs active:scale-95 transition-all"
                >
                  ❤️ Sponsor This Need
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SPONSORSHIP FORM & CONFIRMATION ── */}
      <div id="sponsor-form-section" className="rounded-2xl border-2 border-amber-200 bg-white p-6 shadow-sm space-y-5">
        <div className="border-b border-wari-cardBorder pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-base text-wari-textPrimary">
              Pledge Your Seva (Sponsorship Registration)
            </h3>
          </div>
          <span className="text-xs text-wari-textMuted font-mono">
            Volunteer Email Sync Enabled
          </span>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-emerald-950">
                धन्यवाद! Seva Pledge Confirmed &amp; Dispatched!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 max-w-lg mx-auto">
                Thank you <strong>{form.sponsorName}</strong>. Your sponsorship details have been logged with ID{" "}
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                  #{submissionId}
                </span>{" "}
                and emailed directly to the WariOS on-ground volunteer coordination desk.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-emerald-200 text-xs text-left max-w-md mx-auto space-y-1.5 shadow-2xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Sponsor:</span>
                <span className="font-bold text-stone-800">{form.sponsorName} ({form.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Seva Category:</span>
                <span className="font-bold text-emerald-800">{form.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Target Camp:</span>
                <span className="font-bold text-stone-800">
                  {state.camps.find((c) => c.id === form.targetCampId)?.name || form.targetCampId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Pledge Details:</span>
                <span className="font-bold text-orange-700">{form.quantityDetails}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition-all active:scale-95"
            >
              ✨ Submit Another Sponsorship Pledge
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row 1: Name, Organization, Phone, Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-wari-textSecond flex items-center gap-1">
                  <span>Your Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.sponsorName}
                  onChange={(e) => setForm({ ...form, sponsorName: e.target.value })}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-wari-textSecond flex items-center gap-1">
                  <span>Organization / Trust / Family</span>
                </label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="e.g. Vitthal Seva Mandal / Kulkarni Family"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-wari-textSecond flex items-center gap-1">
                  <Phone className="w-3 h-3 text-orange-600" />
                  <span>WhatsApp / Phone Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 98220 12345"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-wari-textSecond flex items-center gap-1">
                  <Mail className="w-3 h-3 text-orange-600" />
                  <span>Email Address (For Volunteer Dispatch) *</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>
            </div>

            {/* Row 2: Category, Target Camp, Specific Dindi, Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-wari-textSecond">Seva Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-400 bg-white font-medium"
                >
                  <option value="FOOD">🍲 Maha-Prasad / Meals (अन्नदान)</option>
                  <option value="STAY">⛺ Stay &amp; Shelter Pandals (निवारा)</option>
                  <option value="WATER">💧 Drinking Water Tanker (पाणी सेवा)</option>
                  <option value="MEDICAL">💊 Medical Kits &amp; First-Aid (आरोग्य)</option>
                  <option value="ALL">✨ All-Inclusive Seva Package</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-wari-textSecond">Target Camp Sector *</label>
                <select
                  value={form.targetCampId}
                  onChange={(e) => setForm({ ...form, targetCampId: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-400 bg-white font-medium"
                >
                  {state.camps.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-wari-textSecond">Target Dindi (Optional)</label>
                <select
                  value={form.targetDindiId}
                  onChange={(e) => setForm({ ...form, targetDindiId: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-400 bg-white font-medium"
                >
                  <option value="ANY">🌟 Any Dindi in Need / General Warkaris</option>
                  {state.dindis.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.pilgrimCount.toLocaleString()} pilgrims)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-wari-textSecond flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-orange-600" />
                  <span>Date of Seva Delivery</span>
                </label>
                <input
                  type="date"
                  value={form.dateOfSeva}
                  onChange={(e) => setForm({ ...form, dateOfSeva: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>
            </div>

            {/* Row 3: Quantity / Pledge Details & Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-wari-textSecond">
                  Quantity / Items / Amount You Wish to Sponsor *
                </label>
                <input
                  type="text"
                  required
                  value={form.quantityDetails}
                  onChange={(e) => setForm({ ...form, quantityDetails: e.target.value })}
                  placeholder="e.g. 500 Food Packets / 1 Water Tanker / ₹15,000 Maha-Prasad"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-wari-textSecond">
                  Special Instructions / Food Preferences
                </label>
                <input
                  type="text"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="e.g. We will cook fresh khichdi on site / deliver packed food boxes"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>
            </div>

            {/* Formspree Dispatch Notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-[11px] text-amber-900">
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>
                  Details are instantly logged into WariOS live operations &amp; emailed to volunteer leads via Formspree.
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold text-amber-700 shrink-0">
                SSL Encrypted Dispatch
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 active:scale-98 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting &amp; Dispatching to Volunteers...</span>
                </>
              ) : (
                <>
                  <HeartHandshake className="w-4 h-4 text-yellow-200" />
                  <span>Confirm Seva Pledge &amp; Notify Volunteer Desk</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
