export interface DemoStep {
  step: number;
  title: string;
  category: "DETECT" | "PREDICT" | "EXPLAIN" | "RECOMMEND" | "DECIDE" | "DISPATCH" | "VERIFY";
  summary: string;
  telemetryHighlights: { label: string; value: string; color?: string }[];
  actionPrompt?: string;
  autoNavigateRoute?: string;
  stateModifier?: {
    cp4Density?: number;
    dindi14Pace?: number;
    camp6Occupancy?: number;
    decisionStage?: "DETECTED" | "PREDICTED" | "EXPLAINED" | "RECOMMENDED" | "DECIDED" | "DISPATCHED" | "VERIFIED";
    isMitigated?: boolean;
    showBeforeAfter?: boolean;
  };
}

export const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: "1. Baseline Pilgrimage Operation",
    category: "DETECT",
    summary: "WariOS monitors 1,240,000 pilgrims across the 240km Pune to Pandharpur corridor. All 12 checkpoints and 10 Dindis operating under nominal morning conditions.",
    telemetryHighlights: [
      { label: "Active Pilgrims", value: "1.24M" },
      { label: "CP4 Density", value: "72% (Nominal)" },
      { label: "Dindi #14 Pace", value: "4.2 km/h" },
    ],
    autoNavigateRoute: "/",
    stateModifier: { cp4Density: 72, dindi14Pace: 4.2, camp6Occupancy: 85, decisionStage: "DETECTED" },
  },
  {
    step: 2,
    title: "2. Sudden Precipitation at Dive Ghat",
    category: "DETECT",
    summary: "Dive Ghat weather radar detects unseasonal localized rainfall of 18mm/h on the steep 14% mountain incline.",
    telemetryHighlights: [
      { label: "Sector Radar", value: "Dive Ghat Sector" },
      { label: "Rain Intensity", value: "18 mm/h (Slippery)", color: "orange" },
      { label: "Elevation", value: "840m Apex" },
    ],
    autoNavigateRoute: "/map",
  },
  {
    step: 3,
    title: "3. Dindi #14 Pace Drops 21%",
    category: "DETECT",
    summary: "Heavy palkhi chariot carrying 38,000 devotees slows down to 3.2 km/h on wet asphalt. Backward compression wave begins forming.",
    telemetryHighlights: [
      { label: "Dindi #14 Speed", value: "3.2 km/h (-21%)", color: "orange" },
      { label: "Pilgrim Density Flow", value: "38,000 devotees" },
      { label: "Palkhi Chariot", value: "Sant Tukaram Lead" },
    ],
    autoNavigateRoute: "/dindis",
    stateModifier: { dindi14Pace: 3.2 },
  },
  {
    step: 4,
    title: "4. Checkpoint 4 Density Climbs to 91%",
    category: "DETECT",
    summary: "Pedestrian bottleneck surges at CP4 (Dive Ghat Apex). Rate of crowd inflow exceeds exit clearance by +18% per 10 minutes.",
    telemetryHighlights: [
      { label: "CP4 Density", value: "91% (CRITICAL)", color: "red" },
      { label: "Current Count", value: "9,100 / 10,000" },
      { label: "Inflow Trend", value: "+18% / 10 min", color: "red" },
    ],
    autoNavigateRoute: "/",
    stateModifier: { cp4Density: 91 },
  },
  {
    step: 5,
    title: "5. WariOS Detects Anomaly Early",
    category: "DETECT",
    summary: "WariOS automated sensing triggers early warning: Compression gradient detected between Wadki (CP3) and Dive Ghat Apex (CP4).",
    telemetryHighlights: [
      { label: "Detection Engine", value: "Active" },
      { label: "Anomaly Flag", value: "Gradient Mismatch" },
      { label: "Status", value: "PREDICTIVE CYCLE INITIATED" },
    ],
    autoNavigateRoute: "/alerts",
  },
  {
    step: 6,
    title: "6. 45-Minute Forecast Engine Predicts Breach",
    category: "PREDICT",
    summary: "Simulated Forecast Engine projects CP4 density will breach 97% capacity (10,000 threshold) in 43 minutes, risking dangerous stampede pressure.",
    telemetryHighlights: [
      { label: "Projected Breach", value: "97% in 43 min", color: "red" },
      { label: "Horizon", value: "+45 min Lookahead" },
      { label: "Confidence", value: "91% (Simulated)" },
    ],
    autoNavigateRoute: "/",
    stateModifier: { decisionStage: "PREDICTED" },
  },
  {
    step: 7,
    title: "7. Commander's Brief Alerting Leadership",
    category: "PREDICT",
    summary: "Executive Commander's Brief flashes critical alert: Immediate multi-agency coordination required before queue locks Dive Ghat pass.",
    telemetryHighlights: [
      { label: "Priority Incident", value: "CP4 Density Surge" },
      { label: "Camp 6 Water", value: "Depletion in 34 min", color: "orange" },
      { label: "Action Window", value: "< 15 minutes" },
    ],
    autoNavigateRoute: "/",
  },
  {
    step: 8,
    title: "8. Critical Incident #INC-402 Scored (92/100)",
    category: "PREDICT",
    summary: "Incident priority engine scores the event at 92/100 (Density Risk +35, Urgency +25, Population +20, Resource +12).",
    telemetryHighlights: [
      { label: "Incident Score", value: "92 / 100", color: "red" },
      { label: "Affected People", value: "38,000 Warkaris" },
      { label: "Urgency Factor", value: "CRITICAL" },
    ],
    autoNavigateRoute: "/incidents",
  },
  {
    step: 9,
    title: "9. Command Staff Opens Incident Workspace",
    category: "EXPLAIN",
    summary: "Incident Command Center loads real-time GIS map, telemetry graphs, and live asset positioning around Dive Ghat.",
    telemetryHighlights: [
      { label: "Incident ID", value: "#INC-402" },
      { label: "Assigned Units", value: "Police, Seva, Health" },
      { label: "Location", value: "Dive Ghat Apex (CP4)" },
    ],
    autoNavigateRoute: "/incidents",
    stateModifier: { decisionStage: "EXPLAINED" },
  },
  {
    step: 10,
    title: "10. AI Copilot Explains Root Causes",
    category: "EXPLAIN",
    summary: "Copilot synthesizes 3 telemetry feeds: (1) Dindi #14 pace drop 21%, (2) Incline rain slip factor, (3) Camp 6 Saswad intake compression.",
    telemetryHighlights: [
      { label: "Root Cause 1", value: "Palkhi Speed Drop (-21%)" },
      { label: "Root Cause 2", value: "Rain Gradient Slippage" },
      { label: "Root Cause 3", value: "Downstream Camp 6 Queue" },
    ],
    autoNavigateRoute: "/copilot",
  },
  {
    step: 11,
    title: "11. Officer Queries Counterfactual Outcome",
    category: "RECOMMEND",
    summary: "Officer asks: 'What happens if we take no action over the next 45 minutes?'",
    telemetryHighlights: [
      { label: "Simulation Query", value: "No Intervention Mode" },
      { label: "Projection Horizon", value: "45 Minutes" },
    ],
    autoNavigateRoute: "/simulator",
  },
  {
    step: 12,
    title: "12. Counterfactual Simulator Shows Collapse",
    category: "RECOMMEND",
    summary: "Simulation shows Without WariOS: CP4 reaches 101% catastrophic gridlock, Camp 6 reaches 134%, and water exhausts in 27 minutes.",
    telemetryHighlights: [
      { label: "CP4 Unchecked", value: "101% (Gridlock)", color: "red" },
      { label: "Camp 6 Unchecked", value: "134% (Overrun)", color: "red" },
      { label: "Water Depleted", value: "27 Minutes", color: "red" },
    ],
    autoNavigateRoute: "/simulator",
  },
  {
    step: 13,
    title: "13. Copilot Formulates 4-Point Response",
    category: "RECOMMEND",
    summary: "AI synthesizes optimal multi-agency plan: Divert Dindi #14 to Bypass B, deploy 5 volunteers, dispatch Tanker T-03, open Backup Shelter B.",
    telemetryHighlights: [
      { label: "Action 1", value: "Reroute Dindi #14" },
      { label: "Action 2", value: "Deploy 5 Volunteers" },
      { label: "Action 3", value: "Dispatch Tanker T-03" },
      { label: "Action 4", value: "Open Backup Shelter B" },
    ],
    autoNavigateRoute: "/incidents",
    stateModifier: { decisionStage: "RECOMMENDED" },
  },
  {
    step: 14,
    title: "14. Officer Accepts & Executes Response",
    category: "DECIDE",
    summary: "Incident Commander clicks [EXECUTE MULTI-AGENCY RESPONSE]. Commands are dispatched simultaneously across 4 agency channels.",
    telemetryHighlights: [
      { label: "Decision", value: "AUTHORIZED" },
      { label: "Channels", value: "Traffic, Logistics, Seva, Shelter" },
    ],
    autoNavigateRoute: "/incidents",
    stateModifier: { decisionStage: "DECIDED" },
  },
  {
    step: 15,
    title: "15. Action 1: Dindi #14 Rerouted to Bypass B",
    category: "DISPATCH",
    summary: "Police marshals open East Saswad Bypass B. Dindi #14 (38k devotees) bypasses CP4 apex, relieving 70% of oncoming choke flow.",
    telemetryHighlights: [
      { label: "Route Diverted", value: "Bypass Route B" },
      { label: "Load Diverted", value: "26,000 Warkaris" },
    ],
    autoNavigateRoute: "/map",
  },
  {
    step: 16,
    title: "16. Action 2: 5 Smart Seva Volunteers Deployed",
    category: "DISPATCH",
    summary: "5 nearby volunteers with traffic and first-aid skills arrive at CP4 within 3 minutes to guide crowd queues.",
    telemetryHighlights: [
      { label: "Volunteers Deployed", value: "5 Specialists" },
      { label: "Flow Rate Impact", value: "+34% Throughput" },
    ],
    autoNavigateRoute: "/volunteers",
  },
  {
    step: 17,
    title: "17. Action 3: Water Tanker T-03 Dispatched",
    category: "DISPATCH",
    summary: "Tanker T-03 (12,000L) departs Hub 2 (1.8km away) towards Camp 6. ETA: 6 minutes.",
    telemetryHighlights: [
      { label: "Tanker Unit", value: "T-03 (12,000 Liters)" },
      { label: "ETA to Camp 6", value: "6 Minutes" },
    ],
    autoNavigateRoute: "/resources",
  },
  {
    step: 18,
    title: "18. Action 4: Saswad Backup Shelter B Opened",
    category: "DISPATCH",
    summary: "District Collectorate authorizes opening Saswad Shelter B (Capacity 20,000), distributing crowd away from Camp 6.",
    telemetryHighlights: [
      { label: "Shelter Activated", value: "Backup Shelter B" },
      { label: "Capacity Added", value: "20,000 beds" },
    ],
    autoNavigateRoute: "/resources",
    stateModifier: { decisionStage: "DISPATCHED" },
  },
  {
    step: 19,
    title: "19. Closed-Loop Telemetry Updates",
    category: "VERIFY",
    summary: "Real-time telemetry responds: CP4 density drops immediately from 91% to 82%, flow stabilizes, and growth turns negative (-6%).",
    telemetryHighlights: [
      { label: "CP4 Density", value: "82% (Stabilized)", color: "green" },
      { label: "Trend Rate", value: "-6% (Deflating)", color: "green" },
      { label: "Camp 6 Occupancy", value: "85% (Safe)", color: "green" },
    ],
    autoNavigateRoute: "/",
    stateModifier: { cp4Density: 82, camp6Occupancy: 85, isMitigated: true },
  },
  {
    step: 20,
    title: "20. Before / After Verification Panel",
    category: "VERIFY",
    summary: "WariOS presents side-by-side verification: CP4 Density (97% -> 82%), Camp 6 (120% -> 85%), Water Buffer (34m -> 78m).",
    telemetryHighlights: [
      { label: "CP4 Density", value: "97% → 82% (↓15%)", color: "green" },
      { label: "Camp 6 Load", value: "120% → 85% (↓35%)", color: "green" },
      { label: "Water Buffer", value: "34m → 78m (+44m)", color: "green" },
    ],
    autoNavigateRoute: "/incidents",
    stateModifier: { showBeforeAfter: true, decisionStage: "VERIFIED" },
  },
  {
    step: 21,
    title: "21. Event Timeline Audit Trail Recorded",
    category: "VERIFY",
    summary: "Every timestamped detection, prediction, decision, and dispatch action is permanently recorded in the immutable operational log.",
    telemetryHighlights: [
      { label: "Logged Events", value: "10 Distinct Milestones" },
      { label: "Compliance", value: "Full Accountability" },
    ],
    autoNavigateRoute: "/incidents",
  },
  {
    step: 22,
    title: "22. Mission Complete: Closed-Loop Proven",
    category: "VERIFY",
    summary: "'WariOS didn't just detect the problem. It predicted it, explained it, coordinated the response, and verified the outcome.'",
    telemetryHighlights: [
      { label: "Lifecycle Status", value: "ALL 7 STAGES VERIFIED", color: "green" },
      { label: "Pilgrimage Safety", value: "100% SECURE", color: "green" },
    ],
    autoNavigateRoute: "/",
  },
];
