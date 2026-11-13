// Real-time IST Time & Silent IP-Based Live Weather Service
// No navigator.geolocation on page load (Never prompts browser GPS permissions!)

export interface LiveWeatherData {
  temp: number;
  condition: string;
  location: string;
  city?: string;
  country?: string;
  isDay: boolean;
  weatherCode: number;
  humidity?: number;
  iconType: 'sun' | 'moon' | 'cloud' | 'partlyCloudy' | 'rain' | 'drizzle' | 'thunder' | 'snow' | 'fog';
}

export interface ISTTimeData {
  time12: string;     // e.g. "3:40 PM"
  time24: string;     // e.g. "15:40"
  dateShort: string;  // e.g. "Mon, Nov 2"
  dateFull: string;   // e.g. "Monday, 2 November 2026"
  hours: number;
  minutes: number;
}

const SESSION_CACHE_KEY = 'ps_visitor_weather_cache_v4';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes session cache

interface IpGeoResult {
  city: string;
  latitude: number;
  longitude: number;
  country?: string;
}

const DEFAULT_FALLBACK_LOCATION: IpGeoResult = {
  city: 'Thirupuram',
  latitude: 8.3512,
  longitude: 77.0815,
  country: 'India',
};

/**
 * Maps WMO weather interpretation codes to clean human labels & icon tokens
 */
export function mapWmoWeather(
  code: number,
  isDay: boolean = true
): { condition: string; iconType: LiveWeatherData['iconType'] } {
  if (code === 0) {
    return { condition: isDay ? 'Sunny' : 'Clear', iconType: isDay ? 'sun' : 'moon' };
  }
  if (code === 1 || code === 2) {
    return { condition: 'Partly Cloudy', iconType: 'partlyCloudy' };
  }
  if (code === 3) {
    return { condition: 'Overcast', iconType: 'cloud' };
  }
  if (code === 45 || code === 48) {
    return { condition: 'Misty Fog', iconType: 'fog' };
  }
  if (code >= 51 && code <= 57) {
    return { condition: 'Drizzle', iconType: 'drizzle' };
  }
  if (code >= 61 && code <= 67) {
    return { condition: code >= 65 ? 'Heavy Rain' : 'Rain', iconType: 'rain' };
  }
  if (code >= 71 && code <= 77) {
    return { condition: 'Snow', iconType: 'snow' };
  }
  if (code >= 80 && code <= 82) {
    return { condition: 'Showers', iconType: 'rain' };
  }
  if (code >= 85 && code <= 86) {
    return { condition: 'Snow Showers', iconType: 'snow' };
  }
  if (code >= 95) {
    return { condition: 'Thunderstorm', iconType: 'thunder' };
  }
  return { condition: isDay ? 'Clear' : 'Overcast', iconType: isDay ? 'sun' : 'cloud' };
}

/**
 * Returns the exact current time in Indian Standard Time (IST, Asia/Kolkata).
 */
export function getISTTime(date = new Date()): ISTTimeData {
  try {
    const time12 = date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const time24 = date.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const dateShort = date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const dateFull = date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      time12,
      time24,
      dateShort,
      dateFull,
      hours: date.getHours(),
      minutes: date.getMinutes(),
    };
  } catch {
    const offset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(date.getTime() + offset);
    const hours = ist.getUTCHours();
    const minutes = ist.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    return {
      time12: `${hours12}:${minutes} ${ampm}`,
      time24: `${hours.toString().padStart(2, '0')}:${minutes}`,
      dateShort: ist.toUTCString().slice(0, 11),
      dateFull: ist.toUTCString().slice(0, 16),
      hours,
      minutes: Number(minutes),
    };
  }
}

function getSessionCachedWeather(): LiveWeatherData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.timestamp &&
        Date.now() - parsed.timestamp < CACHE_TTL_MS &&
        parsed.data &&
        parsed.data.location &&
        parsed.data.location !== 'My Location'
      ) {
        return parsed.data as LiveWeatherData;
      }
    }
  } catch {
    // sessionStorage not available
  }
  return null;
}

function setSessionCachedWeather(data: LiveWeatherData) {
  try {
    if (data.location === 'My Location') return;
    sessionStorage.setItem(
      SESSION_CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // ignore
  }
}

/**
 * Free client-side reverse geocoding to resolve (lat, lon) coordinates into an exact city name.
 */
export async function reverseGeocodeCoords(lat: number, lon: number): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const place =
        data.city ||
        data.locality ||
        data.localityInfo?.administrative?.[3]?.name ||
        data.localityInfo?.administrative?.[2]?.name ||
        data.principalSubdivision;
      if (place && place !== 'My Location') {
        return place;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Silently resolves the visitor's approximate city & coordinates using free HTTPS IP endpoints.
 * Never uses navigator.geolocation on load, preventing browser permission popups.
 */
async function fetchSilentIpLocation(): Promise<IpGeoResult> {
  // 1. Primary: ipwho.is (Free, fast, HTTPS, CORS-friendly)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const city = data.city || data.region || DEFAULT_FALLBACK_LOCATION.city;
        return {
          city: city !== 'My Location' ? city : DEFAULT_FALLBACK_LOCATION.city,
          latitude: data.latitude,
          longitude: data.longitude,
          country: data.country,
        };
      }
    }
  } catch {
    // Failover
  }

  // 2. Secondary fallback: freeipapi.com
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const city = data.cityName || data.regionName || DEFAULT_FALLBACK_LOCATION.city;
        return {
          city: city !== 'My Location' ? city : DEFAULT_FALLBACK_LOCATION.city,
          latitude: data.latitude,
          longitude: data.longitude,
          country: data.countryName,
        };
      }
    }
  } catch {
    // Failover
  }

  // 3. Tertiary fallback: ipapi.co
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (!data.error && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const city = data.city || data.region || DEFAULT_FALLBACK_LOCATION.city;
        return {
          city: city !== 'My Location' ? city : DEFAULT_FALLBACK_LOCATION.city,
          latitude: data.latitude,
          longitude: data.longitude,
          country: data.country_name,
        };
      }
    }
  } catch {
    // Failover
  }

  // 4. Default fallback: Thirupuram
  return DEFAULT_FALLBACK_LOCATION;
}

/**
 * Fetches live weather for the visitor's current city silently via IP-to-weather pipeline.
 * Caches in sessionStorage for 30 minutes to prevent rate-limiting.
 */
export async function fetchLiveWeather(forceRefresh: boolean = false): Promise<LiveWeatherData> {
  if (!forceRefresh) {
    const cached = getSessionCachedWeather();
    if (cached) return cached;
  }

  try {
    const geo = await fetchSilentIpLocation();

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,is_day`;
    const res = await fetch(weatherUrl);
    if (!res.ok) throw new Error(`Open-Meteo HTTP error: ${res.status}`);

    const json = await res.json();
    const current = json.current;
    const temp = Math.round(current.temperature_2m);
    const isDay = current.is_day === 1;
    const code = current.weather_code;
    const { condition, iconType } = mapWmoWeather(code, isDay);

    const weatherData: LiveWeatherData = {
      temp,
      condition,
      location: geo.city,
      city: geo.city,
      country: geo.country,
      isDay,
      weatherCode: code,
      humidity: current.relative_humidity_2m,
      iconType,
    };

    setSessionCachedWeather(weatherData);
    return weatherData;
  } catch (err) {
    console.warn('Weather fetch error, using graceful fallback:', err);
    return {
      temp: 29,
      condition: 'Sunny',
      location: 'Thirupuram',
      city: 'Thirupuram',
      country: 'India',
      isDay: true,
      weatherCode: 0,
      humidity: 72,
      iconType: 'sun',
    };
  }
}

/**
 * Manual GPS Weather Request triggered ONLY by an explicit user button click.
 * Reverse-geocodes exact coordinates into actual town/city name so "My Location" is never displayed.
 */
export async function requestPreciseGpsWeather(): Promise<LiveWeatherData | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // 1. Fetch live weather
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,is_day`;
          const res = await fetch(weatherUrl);
          if (res.ok) {
            const json = await res.json();
            const current = json.current;
            const temp = Math.round(current.temperature_2m);
            const isDay = current.is_day === 1;
            const code = current.weather_code;
            const { condition, iconType } = mapWmoWeather(code, isDay);

            // 2. Reverse geocode coordinates to get the actual city/town name
            let actualCity = await reverseGeocodeCoords(lat, lon);
            if (!actualCity || actualCity === 'My Location') {
              const ipGeo = await fetchSilentIpLocation();
              actualCity = ipGeo.city || 'Thirupuram';
            }

            const weatherData: LiveWeatherData = {
              temp,
              condition,
              location: actualCity,
              city: actualCity,
              isDay,
              weatherCode: code,
              humidity: current.relative_humidity_2m,
              iconType,
            };
            setSessionCachedWeather(weatherData);
            resolve(weatherData);
            return;
          }
        } catch {
          // fallback
        }
        resolve(null);
      },
      () => resolve(null),
      { timeout: 6000 }
    );
  });
}
