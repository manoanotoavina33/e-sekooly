import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface SyncLogEntry {
  id: string;
  deviceId: string;
  direction: "PUSH" | "PULL";
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  recordCount: number;
  errorMessage: string | null;
  createdAt: string;
}

export function useSyncHistory(schoolId: string) {
  return useQuery({
    queryKey: ["sync-history", schoolId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/sync/history", { params: { schoolId } });
      return data.data as SyncLogEntry[];
    },
  });
}
