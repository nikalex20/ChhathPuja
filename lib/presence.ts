'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const HEARTBEAT_INTERVAL_MS = 22000; // 22 seconds

export function usePresence(selectedCity: string = 'Patna') {
  const [onlineCount, setOnlineCount] = useState<number>(388);
  const targetCountRef = useRef<number>(388);
  const [diyaCount, setDiyaCount] = useState<number>(627);
  const [recentPrayers, setRecentPrayers] = useState<Array<{ id: string; city: string; devoteeName?: string }>>([]);
  const [isReady, setIsReady] = useState(false);

  // Retrieve or generate anonymous sessionId
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return 'server';
    let sid = window.sessionStorage.getItem('chhath_session_id');
    if (!sid) {
      sid = 'devotee_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      window.sessionStorage.setItem('chhath_session_id', sid);
    }
    return sid;
  }, []);

  const sendHeartbeat = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const res = await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, city: selectedCity }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.onlineCount) {
          // Update target count smoothly; ticker will converge towards it without sharp jumps
          targetCountRef.current = Math.min(495, Math.max(310, data.onlineCount));
        }
      }
    } catch {
      // Disconnected: keep existing target count
    }
  }, [getSessionId, selectedCity]);

  const fetchDiyaCount = useCallback(async () => {
    try {
      const res = await fetch('/api/diya');
      if (res.ok) {
        const data = await res.json();
        if (data.diyaCount) {
          setDiyaCount((prev) => {
            const resolved = Math.max(prev, data.diyaCount);
            try {
              localStorage.setItem('chhath_diya_count', String(resolved));
            } catch {}
            return resolved;
          });
        }
        if (data.recentPrayers) setRecentPrayers(data.recentPrayers);
      }
    } catch {
      // Keep existing count
    }
  }, []);

  const lightDiya = useCallback(async (devoteeName?: string) => {
    // Real optimistic local update (+1)
    let currentNewVal = 628;
    setDiyaCount((prev) => {
      const next = prev + 1;
      currentNewVal = next;
      try {
        localStorage.setItem('chhath_diya_count', String(next));
      } catch {}
      return next;
    });

    try {
      const res = await fetch('/api/diya', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: selectedCity, name: devoteeName, clientCount: currentNewVal }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.diyaCount) {
          setDiyaCount((prev) => {
            const resolved = Math.max(prev, data.diyaCount);
            try {
              localStorage.setItem('chhath_diya_count', String(resolved));
            } catch {}
            return resolved;
          });
        }
        if (data.recentPrayers) setRecentPrayers(data.recentPrayers);
      }
    } catch {
      // Optimistic update retained
    }
  }, [selectedCity]);

  // Continuous organic live visitor engine (+1, -1, +2, -2) with randomized human intervals
  // Strictly keeps the number between 300 and 500 without sharp jumps
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleTick = () => {
      // Realistic human arrival/departure interval: 3.2s to 6.8s
      const nextDelay = 3200 + Math.random() * 3600;

      timeoutId = setTimeout(() => {
        setOnlineCount((current) => {
          const target = targetCountRef.current;
          let delta = 0;

          // If diverging from server target by 3+, smoothly nudge towards it by +/- 1
          if (target && Math.abs(target - current) >= 3) {
            delta = target > current ? (Math.random() < 0.75 ? 1 : -1) : (Math.random() < 0.75 ? -1 : 1);
          } else {
            // Natural ambient fluctuation: realistic +1 / -1 / 0
            const r = Math.random();
            if (r < 0.44) {
              delta = 1; // Devotee arrived
            } else if (r < 0.86) {
              delta = -1; // Devotee departed
            } else if (r < 0.94) {
              delta = 2; // Family / group joined
            } else {
              delta = 0; // Maintained
            }
          }

          const next = current + delta;
          // Strictly clamp within 300 - 500 (safe bounds 310 - 495, never exceeding 500)
          return Math.min(495, Math.max(310, next));
        });

        scheduleTick();
      }, nextDelay);
    };

    scheduleTick();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    setIsReady(true);

    // Hydrate real local diya count from localStorage if present
    try {
      const saved = localStorage.getItem('chhath_diya_count');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 627) {
          setDiyaCount(parsed);
        }
      }
    } catch {}

    sendHeartbeat();
    fetchDiyaCount();

    const heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    const diyaTimer = setInterval(fetchDiyaCount, 30000);

    return () => {
      clearInterval(heartbeatTimer);
      clearInterval(diyaTimer);
    };
  }, [sendHeartbeat, fetchDiyaCount]);

  return {
    onlineCount,
    diyaCount,
    recentPrayers,
    lightDiya,
    isReady,
  };
}

