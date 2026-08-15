import { useCallback, useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { performSync, type SyncStatus } from "@/lib/syncEngine";

export interface UseOfflineSyncResult {
  syncStatus: SyncStatus;
  isOnline: boolean;
  isSyncing: boolean;
  triggerSync: (schoolId: string, deviceId: string) => Promise<{ success: boolean; remaining: number }>;
}

export function useOfflineSync(schoolId?: string, deviceId?: string): UseOfflineSyncResult {
  const isOnline = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ phase: "idle" });
  const [isSyncing, setIsSyncing] = useState(false);
  const schoolIdRef = useRef(schoolId);
  const deviceIdRef = useRef(deviceId);

  useEffect(() => {
    schoolIdRef.current = schoolId;
    deviceIdRef.current = deviceId;
  }, [schoolId, deviceId]);

  const triggerSync = useCallback(
    async (sid: string, did: string) => {
      if (isSyncing) return { success: false, remaining: 0 };
      setIsSyncing(true);
      setSyncStatus({ phase: "idle" });

      const result = await performSync(sid, did, {
        onProgress: setSyncStatus,
      });

      setIsSyncing(false);
      return { success: result.success, remaining: result.remaining ?? 0 };
    },
    [isSyncing]
  );

  useEffect(() => {
    if (!isOnline || !schoolId || !deviceId || isSyncing) return;

    const timer = setTimeout(() => {
      triggerSync(schoolId, deviceId);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isOnline, schoolId, deviceId, isSyncing, triggerSync]);

  return {
    syncStatus,
    isOnline,
    isSyncing,
    triggerSync: (sid: string, did: string) => triggerSync(sid, did),
  };
}
