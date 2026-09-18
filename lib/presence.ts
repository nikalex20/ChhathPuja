'use client';

import { useState, useEffect, useCallback } from 'react';

const HEARTBEAT_INTERVAL_MS = 22000; // 22 seconds

export function usePresence(selectedCity: string = 'Patna') {
  const [onlineCount, setOnlineCount] = useState<number>(1421);
  const [diyaCount, setDiyaCount] = useState<number>(48924);
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
          setOnlineCount(data.onlineCount);
        }
      }
    } catch {
      // Fallback: subtle random jitter so offline / disconnected dev still feels live
      setOnlineCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
    }
  }, [getSessionId, selectedCity]);

  const fetchDiyaCount = useCallback(async () => {
    try {
      const res = await fetch('/api/diya');
      if (res.ok) {
        const data = await res.json();
        if (data.diyaCount) setDiyaCount(data.diyaCount);
        if (data.recentPrayers) setRecentPrayers(data.recentPrayers);
      }
    } catch {
      // Keep existing count
    }
  }, []);

  const lightDiya = useCallback(async (devoteeName?: string) => {
    // Optimistic local update
    setDiyaCount((prev) => prev + 1);

    try {
      const res = await fetch('/api/diya', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: selectedCity, name: devoteeName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.diyaCount) setDiyaCount(data.diyaCount);
        if (data.recentPrayers) setRecentPrayers(data.recentPrayers);
      }
    } catch {
      // Optimistic update retained
    }
  }, [selectedCity]);

  useEffect(() => {
    setIsReady(true);
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

