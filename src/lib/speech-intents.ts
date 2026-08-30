const DIGIT_MAP: Record<string, string> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000,
  एक: 1,
  दो: 2,
  दोन: 2,
  तीन: 3,
  चार: 4,
  पाच: 5,
  पांच: 5,
  सहा: 6,
  छह: 6,
  सात: 7,
  आठ: 8,
  नऊ: 9,
  नौ: 9,
  दहा: 10,
  वीस: 20,
  तीस: 30,
  चाळीस: 40,
  पन्नास: 50,
  पचास: 50,
  साठ: 60,
  सत्तर: 70,
  ऐंशी: 80,
  नव्वद: 90,
  शंभर: 100,
  दोनशे: 200,
  तीनशे: 300,
  चारशे: 400,
  पाचशे: 500,
  सहाशे: 600,
  सातशे: 700,
  आठशे: 800,
  नऊशे: 900,
  सौ: 100,
  हजार: 1000,
  ek: 1,
  don: 2,
  do: 2,
  teen: 3,
  char: 4,
  paach: 5,
  panch: 5,
  saha: 6,
  chheh: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  daha: 10,
  das: 10,
  vees: 20,
  tees: 30,
  chalis: 40,
  pannas: 50,
  pachas: 50,
  saath: 60,
  sattar: 70,
  aishi: 80,
  navvad: 90,
  shambhar: 100,
  donse: 200,
  donshe: 200,
  teense: 300,
  teenshe: 300,
  charse: 400,
  charshe: 400,
  pachse: 500,
  pachshe: 500,
  paachshe: 500,
  sau: 100,
  sho: 100,
  show: 100,
  so: 100,
  hajar: 1000,
  hazar: 1000,
};

export type ReportIntent =
  | "Crowd Surge"
  | "Water Shortage"
  | "Medical Emergency"
  | "Road Blocked"
  | "Sanitation Full"
  | "Lost Pilgrim";

export function normalizeSpeechText(text: string): string {
  return text
    .replace(/[०-९]/g, (digit) => DIGIT_MAP[digit] ?? digit)
    .replace(/\s+/g, " ")
    .trim();
}

export function extractSpeechCount(text: string): string | null {
  const normalized = normalizeSpeechText(text).toLowerCase();
  
  // 1. Look for explicit digits first (e.g. "500", "1000", "50")
  const numeric = normalized.match(/\b\d{1,6}\b/);
  if (numeric) return numeric[0];

  // 2. Look for composite words or word mappings
  const words = normalized.split(/\s+/);
  let total = 0;
  let current = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const value = NUMBER_WORDS[word];
    if (value === undefined) continue;

    if (value === 100 || value === 1000) {
      current = (current === 0 ? 1 : current) * value;
      total += current;
      current = 0;
    } else if (value >= 100) {
      total += value;
    } else {
      current += value;
    }
  }

  const result = total + current;
  return result > 0 ? String(result) : null;
}

export function parseDindiRegistrationSpeech(rawText: string): {
  leader: string;
  mandal: string;
  count: string;
} {
  const text = normalizeSpeechText(rawText);
  let leader = "";
  let mandal = "";
  const count = extractSpeechCount(text) || "";

  // Helper to clean extracted field strings
  const cleanField = (s: string) =>
    s
      .replace(/^(majha\s+naam|maza\s+naam|maze\s+naam|majhe\s+naam|mera\s+naam|mera\s+name|my\s+name\s+is|my\s+name|leader\s+name\s+is|leader\s+name|leader\s+is|name\s+is|name|माझे\s+नाव|माझं\s+नाव|माझ\s+नाव|माझा\s+नाव|माझा\s+नाम|माझे\s+नाम|मेरा\s+नाम|नाव\s+आहे|नाव|नाम)\s*[:=]?\s*/gi, "")
      .replace(/^(mandal\s+name\s+is|mandal\s+name|mandal\s+is|mandal|mandala|dindi\s+name\s+is|dindi\s+name|dindi\s+is|dindi|मंडळ\s+नाव|मंडळ|मंडल\s+नाम|मंडल|दिंडी\s+नाव|दिंडी)\s*[:=]?\s*/gi, "")
      .replace(/\b(aahe|ahe|आहे|hai|है|h|is|are|a|show|sho|sau|so)\b/gi, " ")
      .replace(/\b(count|people|devotees|pilgrims|संख्या|लोक|वारकरी|sankhya|log|lok|varkari)\b.*$/i, "")
      .replace(/\b\d+\b/g, "")
      .replace(/^[,\.\-\:\s]+|[,\.\-\:\s]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // 1. Leader matching in English, Marathi (Devanagari + Roman), Hindi (Devanagari + Roman)
  const leaderPrefixes = [
    "my name is", "leader name is", "leader is", "leader name", "leader", "name is",
    "मेरा नाम है", "मेरा नाम", "नाम है", "नाम",
    "माझे नाव आहे", "माझे नाव", "माझं नाव", "माझ नाव", "माझा नाम", "माझे नाम", "माझ नाम", "नाव आहे", "नाव",
    "mera naam hai", "mera naam", "mera name", "mera naav",
    "majha naam", "majha name", "majha naav", "majha nav", "majha now",
    "maza naam", "maza name", "maza naav", "maza nav", "maza now",
    "maze naam", "maze naav", "maze nav", "majhe naam", "majhe naav", "majhe nav",
    "naav", "naam"
  ];

  const mandalPrefixes = [
    "mandal name is", "mandal name", "mandal is", "mandal nav", "mandal now", "mandal naam", "mandal", "mandala",
    "dindi name is", "dindi name", "dindi is", "dindi nav", "dindi now", "dindi naam", "dindi",
    "मंडल नाम है", "मंडल नाम", "मंडल",
    "मंडळ नाव आहे", "मंडळ नाव", "मंडळ",
    "दिंडी नाव आहे", "दिंडी नाव", "दिंडी"
  ];

  const countPrefixes = [
    "count is", "count", "people count", "pilgrim count", "devotees count", "pilgrims", "people", "devotees",
    "संख्या आहे", "संख्या", "गिनती", "क्षमता", "लोक", "वारकरी",
    "sankhya aahe", "sankhya", "log", "lok", "varkari"
  ];

  const leaderPattern = new RegExp(
    `(?:${leaderPrefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s*[:=]?\\s*([^,\\.\\n]+?)(?=\\s+(?:${[...mandalPrefixes, ...countPrefixes].map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})|\\s+\\d+|$)`,
    "i"
  );

  const mandalPattern = new RegExp(
    `(?:${mandalPrefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s*[:=]?\\s*([^,\\.\\n]+?)(?=\\s+(?:${countPrefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})|\\s+\\d+|$)`,
    "i"
  );

  const leaderMatch = text.match(leaderPattern);
  if (leaderMatch && leaderMatch[1]) {
    leader = cleanField(leaderMatch[1]);
  }

  const mandalMatch = text.match(mandalPattern);
  if (mandalMatch && mandalMatch[1]) {
    mandal = cleanField(mandalMatch[1]);
  }

  // 3. Fallbacks if one or both tags were omitted
  if (!leader || !mandal) {
    const parts = text.split(/,| and | और | आणि | & /i);
    if (parts.length >= 2) {
      if (!leader) leader = cleanField(parts[0]);
      if (!mandal) mandal = cleanField(parts[1]);
    } else if (parts.length === 1 && !count) {
      if (!leader) leader = cleanField(parts[0]);
    }
  }

  leader = cleanField(leader);
  mandal = cleanField(mandal);

  return {
    leader,
    mandal,
    count,
  };
}

export function parseReportIntent(text: string): ReportIntent | null {
  const normalized = normalizeSpeechText(text).toLowerCase();

  // Water
  if (/water|pani|पानी|पाणी|टँकर|टैंकर|tanker|जल|तहान|drinking water/.test(normalized)) {
    return "Water Shortage";
  }
  // Medical
  if (/medical|doctor|ambulance|hospital|चिकित्सा|वैद्यकीय|डॉक्टर|रुग्ण|अँब्युलन्स|एम्बुलेंस|बीमार|आजारी|हार्ट|चक्कर|faint|injury|accident/.test(normalized)) {
    return "Medical Emergency";
  }
  // Crowd
  if (/crowd|overcrowd|rush|भीड़|गर्दी|crowded|surge|चेंगराचेंगरी|दबाव|jam|stampede/.test(normalized)) {
    return "Crowd Surge";
  }
  // Road Block
  if (/road|traffic|blocked|block|रस्ता|सड़क|ट्रॅफिक|जाम|बैरिकेड|मार्ग बंद|मार्ग/.test(normalized)) {
    return "Road Blocked";
  }
  // Sanitation
  if (/toilet|sanitation|स्वच्छता|शौचालय|टॉयलेट|कचरा|दुर्गंधी|washroom/.test(normalized)) {
    return "Sanitation Full";
  }
  // Lost Pilgrim
  if (/lost|missing|haravla|bhul gaya|हरवला|हरवले|गयाब|गायब|child|pilgrim missing/.test(normalized)) {
    return "Lost Pilgrim";
  }

  return null;
}
