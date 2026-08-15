import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface BackupRecord {
  id: string;
  type: "MANUAL" | "AUTOMATIC";
  status: "PENDING" | "COMPLETED" | "FAILED";
  fileName: string | null;
  sizeBytes: number | null;
  modelCounts: Record<string, number> | null;
  createdAt: string;
}

export function useBackups(schoolId: string) {
  return useQuery({
    queryKey: ["backups", schoolId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/backups", { params: { schoolId } });
      return data.data as BackupRecord[];
    },
  });
}

/** Déclenche la génération d'une sauvegarde et télécharge immédiatement le fichier JSON. */
export function useCreateBackup(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/backups", { schoolId }, { responseType: "blob" });
      const disposition = response.headers["content-disposition"] as string | undefined;
      const match = disposition?.match(/filename="(.+)"/);
      const fileName = match?.[1] ?? "backup.json";

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backups", schoolId] }),
  });
}

export function useRestoreBackup(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const parsed = JSON.parse(text) as { data: Record<string, unknown[]> };
      const { data } = await api.post("/backups/restore", { schoolId, data: parsed.data });
      return data.data as Record<string, number>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backups", schoolId] }),
  });
}
