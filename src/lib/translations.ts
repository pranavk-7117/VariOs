export type LangKey = "en" | "hi" | "mr";

type TranslationEntry = Record<LangKey, string>;
type TranslationMap = Record<string, TranslationEntry>;

export const translations: TranslationMap = {
  "nav.commandCenter": { en: "Command Center", hi: "कमांड सेंटर", mr: "कमांड सेंटर" },
  "nav.map": { en: "Live Tactical Map", hi: "लाइव मानचित्र", mr: "लाइव्ह नकाशा" },
  "nav.incidents": { en: "Critical Incidents", hi: "गंभीर घटनाएं", mr: "गंभीर घटना" },
  "nav.alerts": { en: "Alert Center", hi: "अलर्ट केंद्र", mr: "इशारा केंद्र" },
  "nav.dindis": { en: "Dindi & Palkhi Sync", hi: "दिंडी और पालखी", mr: "दिंडी आणि पालखी" },
  "nav.resources": { en: "Resource & Water", hi: "संसाधन और पानी", mr: "संसाधने आणि पाणी" },
  "nav.volunteers": { en: "Volunteer Dispatch", hi: "स्वयंसेवक प्रेषण", mr: "स्वयंसेवक नियुक्ती" },
  "nav.copilot": { en: "AI Copilot", hi: "AI सहायक", mr: "AI सहाय्यक" },
  "nav.simulator": { en: "Scenario Simulator", hi: "परिदृश्य सिमुलेटर", mr: "परिस्थिती सिम्युलेटर" },

  "nav.section.operations": { en: "Operations Overview", hi: "संचालन अवलोकन", mr: "कार्यचालन आढावा" },
  "nav.section.incidents": { en: "Incident Management", hi: "घटना प्रबंधन", mr: "घटना व्यवस्थापन" },
  "nav.section.tracking": { en: "Pilgrimage Tracking", hi: "यात्रा ट्रैकिंग", mr: "वारी ट्रॅकिंग" },
  "nav.section.ai": { en: "AI Tools", hi: "AI उपकरण", mr: "AI साधने" },

  "header.network": { en: "Wari Operations Network", hi: "वारी संचालन नेटवर्क", mr: "वारी कार्यचालन नेटवर्क" },
  "header.route": { en: "240km Corridor - Pune to Pandharpur", hi: "240 किमी मार्ग - पुणे से पंढरपुर", mr: "240 किमी मार्ग - पुणे ते पंढरपूर" },
  "header.pilgrims": { en: "Pilgrims", hi: "यात्री", mr: "वारकरी" },
  "header.critical": { en: "Critical Alert", hi: "गंभीर अलर्ट", mr: "गंभीर इशारा" },

  "common.live": { en: "LIVE", hi: "लाइव", mr: "लाइव्ह" },
  "common.simulated": { en: "Simulated", hi: "सिमुलेटेड", mr: "सिम्युलेटेड" },
  "common.critical": { en: "Critical", hi: "गंभीर", mr: "गंभीर" },
  "common.high": { en: "High", hi: "उच्च", mr: "उच्च" },
  "common.medium": { en: "Medium", hi: "मध्यम", mr: "मध्यम" },
  "common.normal": { en: "Normal", hi: "सामान्य", mr: "सामान्य" },
  "common.active": { en: "Active", hi: "सक्रिय", mr: "सक्रिय" },
  "common.resolved": { en: "Resolved", hi: "हल हुआ", mr: "निराकरण झाले" },
  "common.signOut": { en: "Sign Out", hi: "साइन आउट", mr: "साइन आउट" },
  "common.switchRole": { en: "Switch Role View", hi: "भूमिका बदलें", mr: "भूमिका बदला" },
  "common.viewAll": { en: "View All", hi: "सब देखें", mr: "सर्व पाहा" },
  "common.dispatch": { en: "Dispatch", hi: "भेजें", mr: "पाठवा" },
  "common.confirm": { en: "Confirm", hi: "पुष्टि करें", mr: "पुष्टी करा" },
  "common.cancel": { en: "Cancel", hi: "रद्द करें", mr: "रद्द करा" },
  "common.loading": { en: "Loading...", hi: "लोड हो रहा है...", mr: "लोड होत आहे..." },

  "brief.title": { en: "Commander's Brief", hi: "कमांडर का संक्षिप्त विवरण", mr: "कमांडरचा संक्षिप्त आढावा" },
  "brief.requiresAttention": { en: "situations require attention", hi: "स्थितियों पर ध्यान आवश्यक", mr: "परिस्थितींवर लक्ष आवश्यक" },
  "brief.topPriority": { en: "Top Priority", hi: "सर्वोच्च प्राथमिकता", mr: "सर्वोच्च प्राधान्य" },
  "brief.recommended": { en: "Recommended Action", hi: "अनुशंसित कार्रवाई", mr: "शिफारस केलेली कृती" },
  "brief.viewIncident": { en: "View Incident", hi: "घटना देखें", mr: "घटना पाहा" },
  "brief.executeResponse": { en: "Execute Response", hi: "प्रतिक्रिया लागू करें", mr: "प्रतिसाद लागू करा" },
  "brief.projectedBreach": { en: "Projected Breach", hi: "अनुमानित उल्लंघन", mr: "अंदाजित उल्लंघन" },

  "copilot.title": { en: "AI Operations Copilot", hi: "AI संचालन सहायक", mr: "AI कार्यचालन सहाय्यक" },
  "copilot.placeholder": { en: "Ask about Dindis, crowding, camps, water, or medical support...", hi: "दिंडी, भीड़, शिविर, पानी या चिकित्सा सहायता के बारे में पूछें...", mr: "दिंडी, गर्दी, तळ, पाणी किंवा वैद्यकीय मदतीबद्दल विचारा..." },
  "copilot.micTip": { en: "Speak in English, Hindi, or Marathi", hi: "अंग्रेजी, हिंदी या मराठी में बोलें", mr: "इंग्रजी, हिंदी किंवा मराठीत बोला" },
  "copilot.listening": { en: "Listening...", hi: "सुन रहा है...", mr: "ऐकत आहे..." },
  "copilot.notSupported": { en: "Speech not supported in this browser", hi: "इस ब्राउजर में आवाज समर्थित नहीं है", mr: "या ब्राउजरमध्ये आवाज समर्थित नाही" },

  "map.title": { en: "Live Tactical Route Map", hi: "लाइव सामरिक मार्ग मानचित्र", mr: "लाइव्ह सामरिक मार्ग नकाशा" },
  "map.checkpoint": { en: "Checkpoint", hi: "चेकपॉइंट", mr: "तपासणी बिंदू" },
  "map.density": { en: "Density", hi: "घनत्व", mr: "घनता" },
  "map.forecast": { en: "45-min Forecast", hi: "45 मिनट का अनुमान", mr: "45 मिनिटांचा अंदाज" },
  "map.camp": { en: "Camp", hi: "शिविर", mr: "तळ" },
  "map.medical": { en: "Medical Station", hi: "चिकित्सा केंद्र", mr: "वैद्यकीय केंद्र" },
  "map.water": { en: "Water Tanker", hi: "पानी का टैंकर", mr: "पाण्याचा टँकर" },
  "map.layers": { en: "Map Layers", hi: "मानचित्र परतें", mr: "नकाशा थर" },

  "login.title": { en: "WariOS Operations Portal", hi: "WariOS संचालन पोर्टल", mr: "WariOS कार्यचालन पोर्टल" },
  "login.subtitle": { en: "Select your role to enter the pilgrimage command center", hi: "यात्रा कमांड सेंटर में प्रवेश के लिए भूमिका चुनें", mr: "वारी कमांड सेंटरमध्ये प्रवेशासाठी भूमिका निवडा" },
  "login.launch": { en: "Launch View", hi: "दृश्य खोलें", mr: "दृश्य उघडा" },
  "login.enterCenter": { en: "Enter Command Center", hi: "कमांड सेंटर में प्रवेश करें", mr: "कमांड सेंटरमध्ये प्रवेश करा" },

  "page.commandCenter.title": { en: "Command Center", hi: "कमांड सेंटर", mr: "कमांड सेंटर" },
  "page.commandCenter.subtitle": { en: "Ashadhi Ekadashi Pilgrimage Operations - Pune to Pandharpur Corridor", hi: "आषाढ़ी एकादशी यात्रा संचालन - पुणे से पंढरपुर मार्ग", mr: "आषाढी एकादशी वारी कार्यचालन - पुणे ते पंढरपूर मार्ग" },
  "page.commandCenter.focus": { en: "Your Priority Focus Areas:", hi: "आपके प्राथमिकता क्षेत्र:", mr: "तुमची प्राधान्य क्षेत्रे:" },
  "page.commandCenter.metrics": { en: "Live Operational Metrics", hi: "लाइव संचालन मेट्रिक्स", mr: "लाइव्ह कार्यचालन मेट्रिक्स" },
  "page.commandCenter.route": { en: "Corridor Route Monitor", hi: "मार्ग मॉनिटर", mr: "मार्ग मॉनिटर" },
  "page.commandCenter.copilot": { en: "AI Operations Copilot", hi: "AI संचालन सहायक", mr: "AI कार्यचालन सहाय्यक" },
  "page.commandCenter.alerts": { en: "Active Alerts & Audit Log", hi: "सक्रिय अलर्ट और ऑडिट लॉग", mr: "सक्रिय इशारे आणि ऑडिट लॉग" },
  "page.commandCenter.roleNote": { en: "KPIs and alerts are prioritized for your role. Switch roles from the sidebar.", hi: "KPI और अलर्ट आपकी भूमिका के अनुसार प्राथमिकता में हैं। साइडबार से भूमिका बदलें।", mr: "KPI आणि इशारे तुमच्या भूमिकेनुसार प्राधान्याने दाखवले आहेत. साइडबारमधून भूमिका बदला." },

  "stage.detected": { en: "Detected", hi: "पता लगा", mr: "आढळले" },
  "stage.predicted": { en: "Predicted", hi: "अनुमानित", mr: "अंदाजित" },
  "stage.explained": { en: "Explained", hi: "समझाया", mr: "स्पष्ट केले" },
  "stage.recommended": { en: "Recommended", hi: "अनुशंसित", mr: "शिफारस" },
  "stage.decided": { en: "Decided", hi: "निर्णय लिया", mr: "निर्णय घेतला" },
  "stage.dispatched": { en: "Dispatched", hi: "भेजा गया", mr: "पाठवले" },
  "stage.verified": { en: "Verified", hi: "सत्यापित", mr: "सत्यापित" },

  "alert.checkpoint": { en: "Checkpoint", hi: "चेकपॉइंट", mr: "तपासणी बिंदू" },
  "alert.water": { en: "Water", hi: "पानी", mr: "पाणी" },
  "alert.dindi": { en: "Dindi Pace", hi: "दिंडी गति", mr: "दिंडी वेग" },
  "alert.medical": { en: "Medical", hi: "चिकित्सा", mr: "वैद्यकीय" },
  "alert.crowd": { en: "Crowd", hi: "भीड़", mr: "गर्दी" },

  "gps.liveBeacon": { en: "Live GPS Beacon", hi: "लाइव GPS बीकन", mr: "लाइव्ह GPS बीकन" },
  "gps.broadcasting": { en: "GPS Broadcasting", hi: "GPS प्रसारण सक्रिय", mr: "GPS प्रसारण सुरू" },
  "gps.centerLocation": { en: "Center on My Location", hi: "मेरे स्थान पर केंद्रित करें", mr: "माझ्या स्थानावर केंद्रित करा" },
  "role.dindiLeader": { en: "Dindi Pramukh / Leader", hi: "दिंडी प्रमुख / नेता", mr: "दिंडी प्रमुख / नेता" },
};

export function getTranslation(key: string, lang: LangKey): string {
  const entry = translations[key];
  if (!entry) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[i18n] Missing translation key: "${key}"`);
    }
    return key;
  }
  return entry[lang] ?? entry.en ?? key;
}
