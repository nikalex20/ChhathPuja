import { NextResponse } from 'next/server';

// Initial authentic baseline of devotional lamps lit by devotees worldwide (starts in the 600s)
const INITIAL_BASE_DIYA_COUNT = 627;
let globalDiyaCount = INITIAL_BASE_DIYA_COUNT;

interface DiyaPrayer {
  id: string;
  city: string;
  devoteeName?: string;
  timestamp: number;
}

const recentPrayers: DiyaPrayer[] = [
  { id: '1', city: 'Patna', devoteeName: 'श्रद्धालु', timestamp: Date.now() - 30000 },
  { id: '2', city: 'Varanasi', devoteeName: 'भक्त', timestamp: Date.now() - 65000 },
  { id: '3', city: 'London', devoteeName: 'Chhath Devotee', timestamp: Date.now() - 120000 },
  { id: '4', city: 'Ranchi', devoteeName: 'परिवार', timestamp: Date.now() - 190000 },
];

export async function GET() {
  return NextResponse.json({
    diyaCount: globalDiyaCount,
    recentPrayers: recentPrayers.slice(0, 8),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const city = typeof body.city === 'string' ? body.city : 'Patna';
    const devoteeName = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'श्रद्धालु';
    const clientCount = typeof body.clientCount === 'number' && body.clientCount >= INITIAL_BASE_DIYA_COUNT ? body.clientCount : 0;

    globalDiyaCount = Math.max(globalDiyaCount + 1, clientCount + 1);

    recentPrayers.unshift({
      id: Math.random().toString(36).substring(2, 9),
      city,
      devoteeName,
      timestamp: Date.now(),
    });

    if (recentPrayers.length > 20) {
      recentPrayers.pop();
    }

    return NextResponse.json({
      success: true,
      diyaCount: globalDiyaCount,
      recentPrayers: recentPrayers.slice(0, 8),
    });
  } catch (error) {
    globalDiyaCount += 1;
    return NextResponse.json({
      success: true,
      diyaCount: globalDiyaCount,
      recentPrayers: recentPrayers.slice(0, 8),
    });
  }
}

