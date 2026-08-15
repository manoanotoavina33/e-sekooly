import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export function useMyNotifications(schoolId: string, unreadOnly?: boolean) {
  return useQuery({
    queryKey: ["notifications-me", schoolId, unreadOnly],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/notifications/me", { params: { schoolId, unreadOnly } });
      return data.data as AppNotification[];
    },
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications-me"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/notifications/read-all");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications-me"] }),
  });
}
