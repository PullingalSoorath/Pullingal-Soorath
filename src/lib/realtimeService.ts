// Real-time IST Time & Live Weather Service for Thirupuram, Trivandrum, Kerala

export interface LiveWeatherData {
  temp: number;
  condition: string;
  location: string;
  isDay: boolean;
  weatherCode: number;
  humidity?: number;
}

export interface ISTTimeData {
  time12: string;     // e.g. "3:40 PM"
  time24: string;     // e.g. "15:40"
  dateShort: string;  // e.g. "Mon, Nov 2"
  dateFull: string;   // e.g. "Monday, 2 November 2026"
  hours: number;
  minutes: number;
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
    // Fallback if Intl timeZone is unsupported
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

let cachedWeather: LiveWeatherData | null = null;
let lastWeatherFetchTime = 0;

/**
 * Fetches real-time weather for Thirupuram, Trivandrum, Kerala (Lat: 8.36, Long: 77.06)
 * using the Open-Meteo free public API with 10-minute caching.
 */
export async function fetchLiveWeather(): Promise<LiveWeatherData> {
  const now = Date.now();
  if (cachedWeather && now - lastWeatherFetchTime < 10 * 60 * 1000) {
    return cachedWeather;
  }

  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=8.36&longitude=77.06&current=temperature_2m,relative_humidity_2m,weather_code,is_day'
    );
    if (!res.ok) throw new Error('Failed to fetch weather from Open-Meteo');
    const data = await res.json();
    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const code = current.weather_code;
    const isDay = current.is_day === 1;
    const humidity = current.relative_humidity_2m;

    let condition = 'Sunny';
    if (code === 0) condition = isDay ? 'Sunny' : 'Clear';
    else if (code === 1 || code === 2) condition = 'Partly Cloudy';
    else if (code === 3) condition = 'Overcast';
    else if (code >= 45 && code <= 48) condition = 'Misty Fog';
    else if (code >= 51 && code <= 55) condition = 'Drizzle';
    else if (code >= 61 && code <= 65) condition = 'Rain';
    else if (code >= 80 && code <= 82) condition = 'Showers';
    else if (code >= 95) condition = 'Thunderstorm';

    cachedWeather = {
      temp,
      condition,
      location: 'Thirupuram, Trivandrum',
      isDay,
      weatherCode: code,
      humidity,
    };
    lastWeatherFetchTime = now;
    return cachedWeather;
  } catch (err) {
    console.warn('Using fallback weather:', err);
    return {
      temp: 29,
      condition: 'Sunny',
      location: 'Thirupuram, Trivandrum',
      isDay: true,
      weatherCode: 0,
      humidity: 70,
    };
  }
}
