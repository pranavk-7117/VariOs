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
  hundred: 100,
  thousand: 1000,
  एक: 1,
  दो: 2,
  तीन: 3,
  चार: 4,
  पांच: 5,
  पाच: 5,
  छह: 6,
  सहा: 6,
  सात: 7,
  आठ: 8,
  नौ: 9,
  नऊ: 9,
  दस: 10,
  दहा: 10,
  सौ: 100,
  शंभर: 100,
  हजार: 1000,
};

export type ReportIntent = "Crowd Surge" | "Water Shortage" | "Medical Emergency" | "Road Blocked" | "Sanitation Full" | "Lost Pilgrim";

export function normalizeSpeechText(text: string) {
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

function afterKeyword(text: string, keywords: string[]) {
  const normalized = normalizeSpeechText(text);
  for (const keyword of keywords) {
    const index = normalized.toLowerCase().indexOf(keyword.toLowerCase());
    if (index >= 0) {
      const value = normalized
        .slice(index + keyword.length)
        .split(/,|\.| and | और | आणि | mandal | mandal name | dindi | dindi name | count | capacity | people | pilgrims | devotees | संख्या | गिनती | क्षमता | लोक | वारकरी /i)[0]
        ?.trim();
      if (value) return value;
    }
  }
  return "";
}

export function parseDindiRegistrationSpeech(text: string) {
  const normalized = normalizeSpeechText(text);
  const leader = afterKeyword(normalized, [
    "leader name",
    "leader",
    "my name is",
    "name is",
    "मेरा नाम",
    "नेता",
    "प्रमुख",
    "माझे नाव",
  ]);
  const mandal = afterKeyword(normalized, [
    "mandal name",
    "mandal",
    "dindi name",
    "दिंडी",
    "मंडल",
    "मंडळ",
  ]);
  const count = extractSpeechCount(normalized);

  return {
    leader,
    mandal,
    count,
  };
}

export function parseReportIntent(text: string): ReportIntent | null {
  const normalized = normalizeSpeechText(text).toLowerCase();
  if (/water|pani|पानी|पाणी|टँकर|टैंकर|tanker/.test(normalized)) return "Water Shortage";
  if (/medical|doctor|ambulance|hospital|चिकित्सा|वैद्यकीय|डॉक्टर|रुग्ण|अँब्युलन्स|एम्बुलेंस/.test(normalized)) return "Medical Emergency";
  if (/crowd|overcrowd|rush|भीड़|गर्दी|crowded|surge/.test(normalized)) return "Crowd Surge";
  if (/road|traffic|blocked|block|रस्ता|सड़क|ट्रॅफिक|traffic/.test(normalized)) return "Road Blocked";
  if (/toilet|sanitation|स्वच्छता|शौचालय|टॉयलेट/.test(normalized)) return "Sanitation Full";
  if (/lost|missing|खोया|हरवला|हरवली|गुम/.test(normalized)) return "Lost Pilgrim";
  return null;
}
