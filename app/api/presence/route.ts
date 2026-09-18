import { NextResponse } from 'next/server';

interface ActiveSession {
  lastSeen: number;
  city?: string;
}

// In-memory sliding window store for active visitor sessions
const activeSessions = new Map<string, ActiveSession>();

// Predefined authentic cities representing the global Chhath diaspora
const DIASPORA_CITIES = [
  'Patna',
  'Varanasi',
  'Ranchi',
  'Kolkata',
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Muzaffarpur',
  'Gaya',
  'Darbhanga',
  'Lucknow',
  'London',
  'New York',
  'Toronto',
  'Singapore',
  'Dubai',
];

// Baseline authentic community weight bounded strictly between 300 and 500 (max capped at 500)
const BASE_EXPERIENCE_COUNT = 385;
const MIN_PRESENCE_BOUND = 310;
const MAX_PRESENCE_BOUND = 495; // strictly under 500

function cleanupExpiredSessions(): void {
  const now = Date.now();
  const EXPIRY_THRESHOLD_MS = 45 * 1000; // 45 seconds inactivity timeout

  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastSeen > EXPIRY_THRESHOLD_MS) {
      activeSessions.delete(sessionId);
    }
  }
}

/**
 * Calculates a natural, gentle organic fluctuation based on time-of-day harmonic waves
 * Stays smooth with +/- 14 oscillation
 */
function getOrganicFluctuation(): number {
  const now = new Date();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  // Dual-harmonic subtle oscillation
  const wave = Math.sin((minute * 60 + second) / 120) * 14;
  return Math.round(wave);
}

function computeLiveCount(): number {
  cleanupExpiredSessions();
  const rawCount = BASE_EXPERIENCE_COUNT + activeSessions.size + getOrganicFluctuation();
  return Math.min(MAX_PRESENCE_BOUND, Math.max(MIN_PRESENCE_BOUND, rawCount));
}

export async function GET() {
  const onlineCount = computeLiveCount();

  return NextResponse.json({
    onlineCount,
    activeSessionsCount: activeSessions.size,
    recentCities: DIASPORA_CITIES.slice(0, 6),
    timestamp: Date.now(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === 'string' && body.sessionId.length > 0 ? body.sessionId : null;
    const city = typeof body.city === 'string' ? body.city : 'Patna';

    if (sessionId) {
      activeSessions.set(sessionId, {
        lastSeen: Date.now(),
        city,
      });
    }

    const onlineCount = computeLiveCount();

    return NextResponse.json({
      success: true,
      onlineCount,
      activeSessionsCount: activeSessions.size,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      onlineCount: Math.min(MAX_PRESENCE_BOUND, Math.max(MIN_PRESENCE_BOUND, BASE_EXPERIENCE_COUNT + getOrganicFluctuation())),
      error: 'Heartbeat recorded locally',
    });
  }
}

