import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useDeviceId } from "@/hooks/useDeviceId";
import { getPendingCount } from "@/lib/syncEngine";
import {
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export function SyncStatus() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";
  const deviceId = useDeviceId();
  const { syncStatus, isOnline, isSyncing, triggerSync } = useOfflineSync(schoolId, deviceId ?? undefined);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getPendingCount().then(setPendingCount);
  }, [syncStatus]);

  const handleManualSync = () => {
    if (schoolId && deviceId) {
      triggerSync(schoolId, deviceId);
    }
  };

  if (!schoolId) return null;

  const statusConfig = (() => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        label: "Hors ligne",
        className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      };
    }

    if (isSyncing) {
      return {
        icon: Loader2,
        label: "Synchronisation…",
        className: "bg-sky-50 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300",
      };
    }

    if (syncStatus.phase === "error") {
      return {
        icon: AlertCircle,
        label: "Erreur sync",
        className: "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300",
      };
    }

    if (syncStatus.phase === "done" && syncStatus.success) {
      return {
        icon: CheckCircle2,
        label: pendingCount > 0 ? `${pendingCount} en attente` : "Synchronisé",
        className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
      };
    }

    return {
      icon: Wifi,
      label: "En ligne",
      className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
  })();

  const Icon = statusConfig.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {pendingCount > 0 && isOnline && !isSyncing && (
        <Button
          size="sm"
          variant="secondary"
          onClick={handleManualSync}
          className="shadow-lg"
        >
          <RefreshCw className="h-4 w-4" />
          {pendingCount}
        </Button>
      )}

      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg ${statusConfig.className}`}
      >
        <Icon className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
        <span>{statusConfig.label}</span>
      </div>
    </div>
  );
}
