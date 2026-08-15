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
