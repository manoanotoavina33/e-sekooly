import { api } from "@/lib/api";
import {
  enqueueMutation,
  getQueuedMutations,
  removeQueuedMutation,
  clearSyncQueue,
  getMeta,
  setMeta,
} from "@/lib/offlineDb";

export interface SyncOptions {
  onProgress?: (status: SyncStatus) => void;
  maxRetries?: number;
}

export type SyncStatus =
  | { phase: "idle" }
  | { phase: "pulling" }
  | { phase: "pushing"; processed: number; total: number }
  | { phase: "done"; success: boolean; message?: string }
  | { phase: "error"; message: string };

const PULL_MODELS = [
  { name: "Student", endpoint: "/students" },
  { name: "StudentAttendance", endpoint: "/attendance/students" },
  { name: "Payment", endpoint: "/finance/payments" },
  { name: "CashTransaction", endpoint: "/cashier/transactions" },
] as const;

export async function performSync(schoolId: string, deviceId: string, options: SyncOptions = {}) {
  const { onProgress, maxRetries = 3 } = options;

  try {
    const since = await getMeta("lastSyncSince");
    if (since) {
      onProgress?.({ phase: "pulling" });

      for (const model of PULL_MODELS) {
        try {
          const { data } = await api.get(model.endpoint, {
            params: { schoolId, since },
          });

          const rows = data?.data ?? [];
          if (rows.length > 0) {
            const { setCachedModel } = await import("./offlineDb");
            await setCachedModel(model.name, rows);
          }
        } catch (error) {
          console.warn(`Pull failed for ${model.name}:`, error);
        }
      }
    }

    const queued = await getQueuedMutations();
    const total = queued.length;

    for (let i = 0; i < queued.length; i++) {
      const mutation = queued[i];
      onProgress?.({
        phase: "pushing",
        processed: i + 1,
        total,
      });

      try {
        const response = await api.request({
          method: mutation.method as "POST" | "PATCH" | "PUT" | "DELETE",
          url: mutation.url,
          headers: mutation.headers,
          data: mutation.body,
        });

        if (response.status >= 200 && response.status < 300) {
          if (mutation.id) {
            await removeQueuedMutation(mutation.id);
          }
        } else {
          throw new Error(`Server responded with ${response.status}`);
        }
      } catch (error) {
        if (mutation.id && mutation.retries < maxRetries) {
          await removeQueuedMutation(mutation.id);
          await enqueueMutation({
            method: mutation.method,
            url: mutation.url,
            headers: mutation.headers,
            body: mutation.body,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    await setMeta("lastSyncSince", new Date().toISOString());

    const remaining = await getQueuedMutations();
    if (remaining.length === 0) {
      await clearSyncQueue();
    }

    onProgress?.({
      phase: "done",
      success: true,
      message: remaining.length > 0 ? `${remaining.length} élément(s) en attente` : undefined,
    });

    return { success: true, remaining: remaining.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de synchronisation";
    onProgress?.({ phase: "error", message });
    return { success: false, error: message };
  }
}

export async function getPendingCount(): Promise<number> {
  const queued = await getQueuedMutations();
  return queued.length;
}
