import { useEffect, useCallback, useRef } from 'react';

export function useWakeLock(shouldLock: boolean) {
  const isSupported = 'wakeLock' in navigator;
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!isSupported) return;
    try {
      if (wakeLockRef.current) return;
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null;
      });
    } catch (err) {
      console.error('Wake Lock request failed:', err);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.error('Wake Lock release failed:', err);
      }
      wakeLockRef.current = null;
    }
  }, []);

  // Request or release lock based on `shouldLock`
  useEffect(() => {
    if (shouldLock) {
      request();
    } else {
      release();
    }
  }, [shouldLock, request, release]);

  // Handle visibility changes (e.g. tab switching)
  // Wake lock is automatically released by the OS when the page is hidden,
  // so we must re-request it when the page becomes visible again.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (shouldLock && document.visibilityState === 'visible') {
        request();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldLock, request]);
}