// Open-Meteo API — free, no API key required
// Docs: https://open-meteo.com/en/docs

export interface WeatherData {
  temperatureC: number;
  windspeedKmh: number;
  weatherCode: number;
  isRaining: boolean;
  precipitationProb: number; // 0-100 %
  description: string;
  fetchedAt: string; // ISO timestamp
  isLive: boolean;
}

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Heavy showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail",
};

function describeWeather(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? "Unknown";
}

// Dive Ghat — the critical weather hotspot on the route
const DIVE_GHAT = { lat: 18.2145, lng: 74.1456 };

export async function fetchLiveWeather(
  lat = DIVE_GHAT.lat,
  lng = DIVE_GHAT.lng
): Promise<WeatherData> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current_weather=true` +
      `&hourly=precipitation_probability` +
      `&forecast_days=1` +
      `&timezone=Asia%2FKolkata`;

    const res = await fetch(url, { next: { revalidate: 600 } }); // cache 10 min
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const cw = json.current_weather;

    // Pick precipitation probability for current hour
    const hourlyTimes: string[] = json.hourly?.time ?? [];
    const hourlyPrec: number[] = json.hourly?.precipitation_probability ?? [];
    const now = new Date().toISOString().slice(0, 13); // "2024-06-15T10"
    const idx = hourlyTimes.findIndex((t: string) => t.startsWith(now));
    const precipProb = idx >= 0 ? (hourlyPrec[idx] ?? 0) : 0;

    const code: number = cw.weathercode ?? 0;
    const isRaining = [51,53,55,61,63,65,80,81,82,95,96].includes(code);

    return {
      temperatureC:    Math.round(cw.temperature ?? 32),
      windspeedKmh:    Math.round(cw.windspeed   ?? 0),
      weatherCode:     code,
      isRaining,
      precipitationProb: precipProb,
      description:     describeWeather(code),
      fetchedAt:       new Date().toISOString(),
      isLive:          true,
    };
  } catch (_err) {
    // Graceful fallback — monsoon season defaults
    return {
      temperatureC:    31,
      windspeedKmh:    18,
      weatherCode:     63,
      isRaining:       true,
      precipitationProb: 70,
      description:     "Rain (fallback)",
      fetchedAt:       new Date().toISOString(),
      isLive:          false,
    };
  }
}
