import SunCalc from 'suncalc';
import { CityLocation } from '@/config/chhath';

export interface SunTimingsData {
  city: CityLocation;
  date: Date;
  sunriseTime: string;
  sunsetTime: string;
  dawnTime: string;
  duskTime: string;
  solarNoonTime: string;
  goldenHourTime: string;
  sandhyaArghyaWindow: string;
  ushaArghyaWindow: string;
  dayLength: string;
  rawTimes: {
    sunrise: Date;
    sunset: Date;
    dawn: Date;
    dusk: Date;
    goldenHour: Date;
    solarNoon: Date;
  };
  sunPositionProgress: number; // 0 to 1 representing position from sunrise to sunset
  isDaytime: boolean;
}

/**
 * Format a Date object to readable Indian Standard Time 12-hour string (e.g. "05:08 PM")
 */
export function formatTime12h(date: Date): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Calculate precise sun timings for a given city and date using SunCalc
 */
export function calculateSunTimings(city: CityLocation, targetDate: Date = new Date()): SunTimingsData {
  // Use noon of the target date to ensure accurate solar calculation for that calendar day
  const calcDate = new Date(targetDate);
  calcDate.setHours(12, 0, 0, 0);

  const times = SunCalc.getTimes(calcDate, city.lat, city.lng);

  const sunrise = times.sunrise;
  const sunset = times.sunset;
  const dawn = times.dawn;
  const dusk = times.dusk;
  const goldenHour = times.goldenHour;
  const solarNoon = times.solarNoon;

  // Calculate day length
  const dayDurationMs = Math.max(0, sunset.getTime() - sunrise.getTime());
  const hours = Math.floor(dayDurationMs / (1000 * 60 * 60));
  const minutes = Math.floor((dayDurationMs % (1000 * 60 * 60)) / (1000 * 60));
  const dayLength = `${hours}h ${minutes}m`;

  // Sandhya Arghya auspicious window: from evening golden hour until sunset completes
  const sandhyaArghyaWindow = `${formatTime12h(goldenHour)} – ${formatTime12h(sunset)}`;

  // Usha Arghya auspicious window: from dawn (Arunodaya) until sun fully crests the horizon
  const ushaArghyaWindow = `${formatTime12h(dawn)} – ${formatTime12h(times.sunriseEnd || sunrise)}`;

  // Sun position progress for daytime arc
  const now = new Date();
  const nowMs = now.getTime();
  const sunriseMs = sunrise.getTime();
  const sunsetMs = sunset.getTime();
  const isDaytime = nowMs >= sunriseMs && nowMs <= sunsetMs;

  let sunPositionProgress = 0;
  if (isDaytime && sunsetMs > sunriseMs) {
    sunPositionProgress = Math.min(1, Math.max(0, (nowMs - sunriseMs) / (sunsetMs - sunriseMs)));
  } else if (nowMs > sunsetMs) {
    sunPositionProgress = 1;
  }

  return {
    city,
    date: targetDate,
    sunriseTime: formatTime12h(sunrise),
    sunsetTime: formatTime12h(sunset),
    dawnTime: formatTime12h(dawn),
    duskTime: formatTime12h(dusk),
    solarNoonTime: formatTime12h(solarNoon),
    goldenHourTime: formatTime12h(goldenHour),
    sandhyaArghyaWindow,
    ushaArghyaWindow,
    dayLength,
    rawTimes: {
      sunrise,
      sunset,
      dawn,
      dusk,
      goldenHour,
      solarNoon,
    },
    sunPositionProgress,
    isDaytime,
  };
}

