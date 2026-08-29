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
  fifty: 50,
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
  दस: 10,
  पन्नास: 50,
  पचास: 50,
  शंभर: 100,
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
  shambhar: 100,
  sau: 100,
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
  const numeric = normalized.match(/\b\d{1,6}\b/);
  if (numeric) return numeric[0];

  const words = normalized.split(/\s+/);
  let total = 0;
  let current = 0;
  for (const word of words) {
    const value = NUMBER_WORDS[word];
    if (!value) continue;
    if (value === 100 || value === 1000) {
      current = Math.max(1, current) * value;
      total += current;
      current = 0;
    } else {
      current += value;
    }
  }

  return total + current > 0 ? String(total + current) : null;
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

  // 1. Leader matching in English, Marathi (Devanagari + Roman), Hindi (Devanagari + Roman)
  const leaderRegex =
    /(?:my name is|leader name is|leader is|leader name|leader|name is|मेरा नाम है|मेरा नाम|नाम है|माझे नाव आहे|माझे नाव|माझं नाव|माझ नाव|नाव आहे|नाव|mera naam hai|mera naam|mera name|maza nav aahe|maza nav|maza now aahe|maza now|mazha nav|maze nav|majhe nav|majha nav|naav)\s*[:=]?\s*([^,\.\n]+?)(?=\s+(?:mandal|dindi|count|pilgrim|people|devotees|मंडल|मंडळ|दिंडी|संख्या|लोक|वारकरी|sankhya|log|lok)|$)/i;
  
  const leaderMatch = text.match(leaderRegex);
  if (leaderMatch && leaderMatch[1]) {
    leader = leaderMatch[1].trim();
  }

  // 2. Mandal matching in English, Marathi (Devanagari + Roman), Hindi (Devanagari + Roman)
  const mandalRegex =
    /(?:mandal name is|mandal name|mandal is|mandal nav|mandal now|mandal naam|mandal|dindi name is|dindi name|dindi is|dindi nav|dindi now|dindi naam|dindi|मंडल नाम है|मंडल नाम|मंडल|मंडळ नाव आहे|मंडळ नाव|मंडळ|दिंडी नाव आहे|दिंडी नाव|दिंडी)\s*[:=]?\s*([^,\.\n]+?)(?=\s+(?:count|pilgrim|people|devotees|संख्या|गिनती|क्षमता|लोक|वारकरी|sankhya|log|lok)|\s+\d+|$)/i;

  const mandalMatch = text.match(mandalRegex);
  if (mandalMatch && mandalMatch[1]) {
    mandal = mandalMatch[1].trim();
  }

  // 3. Fallbacks if neither structured tag was matched
  if (!leader && !mandal) {
    const parts = text.split(/,| and | और | आणि | & /i);
    if (parts.length >= 2) {
      leader = parts[0].trim();
      mandal = parts[1].replace(/\b\d+\b/g, "").trim();
    } else if (parts.length === 1 && !count) {
      // If single sentence like "Pranav Sant Tukaram Dindi"
      leader = parts[0].trim();
    }
  }

  // Helper to strip copula words (aahe, ahe, hai, is, etc.) and number residue
  const cleanField = (s: string) =>
    s
      .replace(/\b(aahe|ahe|आहे|hai|है|h|is|are|a)\b/gi, "")
      .replace(/\b(count|people|devotees|pilgrims|संख्या|लोक|वारकरी|sankhya|log|lok)\b.*$/i, "")
      .replace(/\b\d+\b/g, "")
      .replace(/^[,\.\-\:\s]+|[,\.\-\:\s]+$/g, "")
      .trim();

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
