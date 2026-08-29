export interface DindiCodeInfo {
  code: string;
  dindiNumber: string;
  name: string;
  headChief: string;
  origin: string;
  members: number;
  position: string;
  currentSector: string;
  lat: number;
  lng: number;
  speedKmH: number;
  isLivePhoneGps?: boolean;
  notes?: string;
}

export const HACKATHON_LIVE_GPS_CODE = "LIVE-GPS-2026";

export const DINDI_CODE_DATABASE: Record<string, DindiCodeInfo> = {
  // SPECIAL HACKATHON LIVE PHONE GPS CODE
  "LIVE-GPS-2026": {
    code: "LIVE-GPS-2026",
    dindiNumber: "LIVE PHONE DINDI",
    name: "Hackathon Real-Time Phone GPS Dindi",
    headChief: "Live Device Geolocation (You)",
    origin: "Real Device Satellite GPS Stream",
    members: 1200,
    position: "Live Real-Time Stream",
    currentSector: "Streaming from Your Phone / Browser",
    lat: 18.5204, // Default fallback before phone GPS fix
    lng: 73.8567,
    speedKmH: 4.8,
    isLivePhoneGps: true,
    notes: "⭐ Special Hackathon Code: Uses your phone's real-time GPS coordinates and broadcasts your live movement!",
  },
  "MY-DINDI-LIVE": {
    code: "MY-DINDI-LIVE",
    dindiNumber: "LIVE PHONE DINDI",
    name: "Hackathon Real-Time Phone GPS Dindi (Alias)",
    headChief: "Live Device Geolocation (You)",
    origin: "Real Device Satellite GPS Stream",
    members: 1200,
    position: "Live Real-Time Stream",
    currentSector: "Streaming from Your Phone / Browser",
    lat: 18.5204,
    lng: 73.8567,
    speedKmH: 4.8,
    isLivePhoneGps: true,
    notes: "⭐ Special Hackathon Code: Uses your phone's real-time GPS coordinates!",
  },

  // FRONT FORMATION DINDIS
  "DINDI-F01": {
    code: "DINDI-F01",
    dindiNumber: "Dindi #1 (Front)",
    name: "Leading Front Dindi",
    headChief: "Ha.Bha.Pa. Vishwasrao Sitole Deshmukh",
    origin: "Ankalkhop / Pune",
    members: 600,
    position: "Front (Leading Dindi)",
    currentSector: "Dive Ghat Apex ➔ Saswad",
    lat: 18.3428,
    lng: 74.0302,
    speedKmH: 4.5,
  },
  "DINDI-F02": {
    code: "DINDI-F02",
    dindiNumber: "Dindi #2 (Front)",
    name: "Uruli Kanchan Mandal Dindi",
    headChief: "Ha.Bha.Pa. Uruli Kanchan Mandal",
    origin: "Uruli Kanchan",
    members: 500,
    position: "Front Formation",
    currentSector: "Hadapsar ➔ Dive Ghat Base",
    lat: 18.4358,
    lng: 73.9875,
    speedKmH: 4.2,
  },
  "DINDI-F26": {
    code: "DINDI-F26",
    dindiNumber: "Dindi #26 (Front)",
    name: "Shitre Maharaj Dindi",
    headChief: "Ha.Bha.Pa. Shitre Maharaj",
    origin: "Pune City",
    members: 350,
    position: "Front Formation",
    currentSector: "Parnakuti ➔ Pune Bhavani Peth",
    lat: 18.5135,
    lng: 73.8694,
    speedKmH: 4.0,
  },
  "DINDI-F27": {
    code: "DINDI-F27",
    dindiNumber: "Dindi #27 (Front)",
    name: "Tambe Maharaj Dindi",
    headChief: "Ha.Bha.Pa. Tambe Maharaj",
    origin: "Alandi",
    members: 400,
    position: "Front Formation",
    currentSector: "Alandi Temple ➔ Vishrantwadi",
    lat: 18.5630,
    lng: 73.8741,
    speedKmH: 4.3,
  },

  // CENTER SANCTUARY RATH
  "RATH-MAULI": {
    code: "RATH-MAULI",
    dindiNumber: "MAIN RATH",
    name: "Sant Dnyaneshwar Maharaj Sacred Chariot",
    headChief: "Palkhi Sohala Pramukh & Trustees",
    origin: "Alandi Sansthan",
    members: 2500,
    position: "Center Sanctuary (मुख्य रथ)",
    currentSector: "Dive Ghat Incline ➔ Saswad",
    lat: 18.3900,
    lng: 74.0100,
    speedKmH: 3.8,
    notes: "Carries Sacred Paduka of Sant Dnyaneshwar Maharaj with Horse Squad (Maulitche Ashwa)",
  },

  // REAR FORMATION DINDIS
  "DINDI-R01": {
    code: "DINDI-R01",
    dindiNumber: "Dindi #1 (Rear)",
    name: "Vaikar Maharaj Dindi",
    headChief: "Ha.Bha.Pa. Vaikar Maharaj",
    origin: "Wai",
    members: 450,
    position: "Rear (First behind Rath)",
    currentSector: "Saswad ➔ Jejuri",
    lat: 18.2774,
    lng: 74.1582,
    speedKmH: 4.2,
  },
  "DINDI-R02": {
    code: "DINDI-R02",
    dindiNumber: "Dindi #2 (Rear)",
    name: "Chaphalakar Maharaj Dindi",
    headChief: "Ha.Bha.Pa. Chaphalakar Maharaj",
    origin: "Satara",
    members: 300,
    position: "Rear Formation",
    currentSector: "Jejuri ➔ Valhe",
    lat: 18.1751,
    lng: 74.1610,
    speedKmH: 4.1,
  },
  "DINDI-R03": {
    code: "DINDI-R03",
    dindiNumber: "Dindi #3 (Rear)",
    name: "Pawar Maharaj Dindi",
    headChief: "Ha.Bha.Pa. Pawar Maharaj",
    origin: "Saswad",
    members: 350,
    position: "Rear Formation",
    currentSector: "Valhe ➔ Lonand",
    lat: 18.0401,
    lng: 74.1884,
    speedKmH: 4.4,
  },
  "DINDI-R04": {
    code: "DINDI-R04",
    dindiNumber: "Dindi #4 (Rear)",
    name: "Aradkar Maharaj Dindi",
    headChief: "Ha.Bha.Pa. Aradkar Maharaj",
    origin: "Solapur",
    members: 500,
    position: "Rear Formation",
    currentSector: "Lonand ➔ Chandoba Limba (Standing Ringan)",
    lat: 18.0012,
    lng: 74.2415,
    speedKmH: 4.6,
  },
  "DINDI-R05": {
    code: "DINDI-R05",
    dindiNumber: "Dindi #5 (Rear)",
    name: "Phaltankar Maharaj Dindi",
    headChief: "Ha.Bha.Pa. Phaltankar Maharaj",
    origin: "Phaltan",
    members: 400,
    position: "Rear Formation",
    currentSector: "Taradgaon ➔ Phaltan",
    lat: 17.9868,
    lng: 74.4326,
    speedKmH: 4.3,
  },
  "DINDI-R27": {
    code: "DINDI-R27",
    dindiNumber: "Dindi #27 (Rear)",
    name: "Kurundkar Maharaj Dindi",
    headChief: "Ha.Bha.Pa. Kurundkar Maharaj",
    origin: "Kolhapur",
    members: 350,
    position: "Rear (Closing Dindi)",
    currentSector: "Phaltan ➔ Barad",
    lat: 17.8924,
    lng: 74.5501,
    speedKmH: 4.0,
  },

  // SANT TUKARAM MAHARAJ DINDI
  "DINDI-14": {
    code: "DINDI-14",
    dindiNumber: "Dindi #14",
    name: "Sant Tukaram Maharaj Dindi #14",
    headChief: "Ha.Bha.Pa. Bapu Maharaj Dehukar",
    origin: "Dehu Sansthan",
    members: 38000,
    position: "Corridor Main Body",
    currentSector: "Dive Ghat Apex (Wet Incline Sector)",
    lat: 18.2145,
    lng: 74.1456,
    speedKmH: 3.2,
    notes: "High density primary cohort undergoing Dive Ghat mountain pass navigation",
  },
};

export function lookupDindiCode(inputCode: string): DindiCodeInfo | null {
  const normalized = inputCode.trim().toUpperCase();
  if (!normalized) return null;

  // Direct match
  if (DINDI_CODE_DATABASE[normalized]) {
    return DINDI_CODE_DATABASE[normalized];
  }

  // Permissive lookup (e.g. "live", "gps", "f01", "1", "14", "rath", "sitole", "tambe")
  for (const [key, item] of Object.entries(DINDI_CODE_DATABASE)) {
    if (
      key.includes(normalized) ||
      normalized.includes(key) ||
      item.dindiNumber.toUpperCase().includes(normalized) ||
      item.headChief.toUpperCase().includes(normalized) ||
      item.name.toUpperCase().includes(normalized)
    ) {
      return item;
    }
  }

  return null;
}
