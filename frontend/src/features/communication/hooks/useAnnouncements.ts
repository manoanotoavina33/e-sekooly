import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Audience = "ALL" | "STUDENTS" | "PARENTS" | "TEACHERS" | "STAFF";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  publishedAt: string;
  author: { firstName: string; lastName: string };
}

export function useAnnouncements(schoolId: string) {
  return useQuery({
    queryKey: ["announcements", schoolId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/announcements", { params: { schoolId } });
      return data.data as Announcement[];
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { schoolId: string; title: string; body: string; audience: Audience }) => {
      const { data } = await api.post("/announcements", payload);
      return data.data as Announcement;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; title?: string; body?: string; audience?: Audience }) => {
      const { data } = await api.patch(`/announcements/${id}`, payload);
      return data.data as Announcement;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/announcements/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export async function downloadAnnouncementPdf(id: string) {
  const { data } = await api.get(`/announcements/${id}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "annonce.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
